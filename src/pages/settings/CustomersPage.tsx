import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Search, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

interface Surname {
  id: string;
  description: string;
}

interface Customer {
  id: string;
  no: number;
  customer_id: string;
  surname_id: string | null;
  first_name: string;
  last_name: string;
  telephone: string | null;
  mobile_phone: string | null;
  email: string | null;
  tax_id: string;
  address1: string | null;
  address2: string | null;
  district: string | null;
  province: string | null;
  postal_code: string | null;
  customer_type: string;
  status: string;
  company_id: string;
  surnames?: Surname;
}

type SearchStatus = 'idle' | 'found' | 'not_found';

export default function CustomersPage() {
  const { user } = useAuth();
  const { selectedCompany } = useOutletContext<{ selectedCompany: string }>();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [surnames, setSurnames] = useState<Surname[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Customer | null>(null);
  
  // Tax ID Search States
  const [isSearchingTaxId, setIsSearchingTaxId] = useState(false);
  const [searchResult, setSearchResult] = useState<Customer | null>(null);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>('idle');
  const [isFormEnabled, setIsFormEnabled] = useState(false);
  
  const [formData, setFormData] = useState({
    surname_id: '',
    first_name: '',
    last_name: '',
    telephone: '',
    mobile_phone: '',
    email: '',
    tax_id: '',
    address1: '',
    address2: '',
    district: '',
    province: '',
    postal_code: '',
    customer_type: 'individual',
    status: 'active',
  });

  const companyId = selectedCompany;

  useEffect(() => {
    fetchData();
  }, [selectedCompany]);

  const fetchData = async () => {
    try {
      const [customersResponse, surnamesResponse] = await Promise.all([
        supabase
          .from('customers')
          .select('*, surnames(id, description)')
          .order('no', { ascending: true }),
        supabase
          .from('surnames')
          .select('id, description')
          .eq('status', 'active')
          .order('no', { ascending: true }),
      ]);

      if (customersResponse.error) throw customersResponse.error;
      if (surnamesResponse.error) throw surnamesResponse.error;

      setCustomers(customersResponse.data || []);
      setSurnames(surnamesResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const resetSearchState = () => {
    setSearchResult(null);
    setSearchStatus('idle');
    setIsFormEnabled(false);
  };

  const handleAdd = () => {
    setEditingItem(null);
    resetSearchState();
    setFormData({
      surname_id: '',
      first_name: '',
      last_name: '',
      telephone: '',
      mobile_phone: '',
      email: '',
      tax_id: '',
      address1: '',
      address2: '',
      district: '',
      province: '',
      postal_code: '',
      customer_type: 'individual',
      status: 'active',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Customer) => {
    setEditingItem(item);
    resetSearchState();
    setIsFormEnabled(true); // Edit mode - form is enabled
    setFormData({
      surname_id: item.surname_id || '',
      first_name: item.first_name,
      last_name: item.last_name,
      telephone: item.telephone || '',
      mobile_phone: item.mobile_phone || '',
      email: item.email || '',
      tax_id: item.tax_id || '',
      address1: item.address1 || '',
      address2: item.address2 || '',
      district: item.district || '',
      province: item.province || '',
      postal_code: item.postal_code || '',
      customer_type: item.customer_type || 'individual',
      status: item.status,
    });
    setIsDialogOpen(true);
  };

  // Function to search Tax ID
  const handleSearchTaxId = async () => {
    const taxId = formData.tax_id.trim();
    if (!taxId) {
      toast.error('กรุณากรอกเลขประจำตัวผู้เสียภาษี/เลขบัตรประชาชน');
      return;
    }

    setIsSearchingTaxId(true);
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*, surnames(id, description)')
        .eq('company_id', companyId)
        .eq('tax_id', taxId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSearchResult(data as Customer);
        setSearchStatus('found');
        setIsFormEnabled(false);
      } else {
        setSearchResult(null);
        setSearchStatus('not_found');
        setIsFormEnabled(true); // Enable form for new data entry
      }
    } catch (error) {
      console.error('Error searching tax ID:', error);
      toast.error('เกิดข้อผิดพลาดในการค้นหา');
    } finally {
      setIsSearchingTaxId(false);
    }
  };

  // Use existing customer data
  const handleUseExistingCustomer = () => {
    if (searchResult) {
      setEditingItem(searchResult);
      setFormData({
        surname_id: searchResult.surname_id || '',
        first_name: searchResult.first_name,
        last_name: searchResult.last_name,
        telephone: searchResult.telephone || '',
        mobile_phone: searchResult.mobile_phone || '',
        email: searchResult.email || '',
        tax_id: searchResult.tax_id || '',
        address1: searchResult.address1 || '',
        address2: searchResult.address2 || '',
        district: searchResult.district || '',
        province: searchResult.province || '',
        postal_code: searchResult.postal_code || '',
        customer_type: searchResult.customer_type || 'individual',
        status: searchResult.status,
      });
      setIsFormEnabled(true);
      setSearchStatus('idle');
      setSearchResult(null);
    }
  };

  // Create new customer with same Tax ID (different company scenario won't happen due to unique constraint)
  const handleCreateNewCustomer = () => {
    setSearchStatus('not_found');
    setIsFormEnabled(true);
    setSearchResult(null);
  };

  // Reset search
  const handleResetSearch = () => {
    resetSearchState();
    setFormData(prev => ({ ...prev, tax_id: '' }));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ต้องการลบข้อมูลนี้หรือไม่?')) return;

    try {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) throw error;
      toast.success('ลบข้อมูลสำเร็จ');
      fetchData();
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('ไม่สามารถลบข้อมูลได้');
    }
  };

  const handleSubmit = async () => {
    if (!formData.tax_id.trim()) {
      toast.error('กรุณากรอกเลขประจำตัวผู้เสียภาษี/เลขบัตรประชาชน');
      return;
    }
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast.error('กรุณากรอกชื่อและนามสกุล');
      return;
    }

    try {
      if (editingItem) {
        const { error } = await supabase
          .from('customers')
          .update({
            surname_id: formData.surname_id || null,
            first_name: formData.first_name,
            last_name: formData.last_name,
            telephone: formData.telephone || null,
            mobile_phone: formData.mobile_phone || null,
            email: formData.email || null,
            tax_id: formData.tax_id,
            address1: formData.address1 || null,
            address2: formData.address2 || null,
            district: formData.district || null,
            province: formData.province || null,
            postal_code: formData.postal_code || null,
            customer_type: formData.customer_type,
            status: formData.status,
          })
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('แก้ไขข้อมูลสำเร็จ');
      } else {
        const insertData = {
          company_id: companyId,
          surname_id: formData.surname_id || null,
          first_name: formData.first_name,
          last_name: formData.last_name,
          telephone: formData.telephone || null,
          mobile_phone: formData.mobile_phone || null,
          email: formData.email || null,
          tax_id: formData.tax_id,
          address1: formData.address1 || null,
          address2: formData.address2 || null,
          district: formData.district || null,
          province: formData.province || null,
          postal_code: formData.postal_code || null,
          customer_type: formData.customer_type,
          status: formData.status,
        } as TablesInsert<'customers'>;
        const { error } = await supabase.from('customers').insert(insertData);

        if (error) throw error;
        toast.success('เพิ่มข้อมูลสำเร็จ');
      }

      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error('ไม่สามารถบันทึกข้อมูลได้');
    }
  };

  const filteredCustomers = customers.filter(
    (item) =>
      item.customer_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.mobile_phone?.includes(searchTerm)
  );

  const getSurnameName = (surnameId: string | null) => {
    if (!surnameId) return '-';
    const surname = surnames.find((s) => s.id === surnameId);
    return surname?.description || '-';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ข้อมูลลูกค้า</h1>
          <p className="text-muted-foreground">จัดการข้อมูลลูกค้า</p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          เพิ่มลูกค้า
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="ค้นหาชื่อ, นามสกุล, อีเมล, เบอร์โทร..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ลำดับ</TableHead>
                <TableHead className="w-36">รหัสลูกค้า</TableHead>
                <TableHead className="w-24">คำนำหน้า</TableHead>
                <TableHead>ชื่อ</TableHead>
                <TableHead>นามสกุล</TableHead>
                <TableHead>เบอร์มือถือ</TableHead>
                <TableHead>อีเมล</TableHead>
                <TableHead className="w-28">สถานะ</TableHead>
                <TableHead className="w-24 text-center">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    ไม่พบข้อมูล
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.no}</TableCell>
                    <TableCell className="font-mono text-sm">{item.customer_id}</TableCell>
                    <TableCell>
                      {item.surnames?.description || getSurnameName(item.surname_id)}
                    </TableCell>
                    <TableCell>{item.first_name}</TableCell>
                    <TableCell>{item.last_name}</TableCell>
                    <TableCell>{item.mobile_phone || '-'}</TableCell>
                    <TableCell>{item.email || '-'}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}
                      >
                        {item.status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มข้อมูลลูกค้า'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 overflow-y-auto flex-1">
            {/* เลขประจำตัวผู้เสียภาษี/เลขบัตรประชาชน - Search Section */}
            <div className="space-y-2">
              <Label htmlFor="tax_id">
                เลขประจำตัวผู้เสียภาษี/เลขบัตรประชาชน <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="tax_id"
                  value={formData.tax_id}
                  onChange={(e) =>
                    setFormData({ ...formData, tax_id: e.target.value })
                  }
                  placeholder="กรอกเลขประจำตัว 13 หลัก"
                  maxLength={13}
                  className="max-w-xs"
                  disabled={editingItem !== null || searchStatus === 'found'}
                />
                {!editingItem && searchStatus !== 'found' && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleSearchTaxId}
                    disabled={isSearchingTaxId || !formData.tax_id.trim()}
                    className="gap-2"
                  >
                    {isSearchingTaxId ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    ค้นหา
                  </Button>
                )}
                {!editingItem && (searchStatus === 'found' || searchStatus === 'not_found') && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResetSearch}
                    className="gap-2"
                  >
                    ค้นหาใหม่
                  </Button>
                )}
              </div>
            </div>

            {/* Search Result - Found */}
            {!editingItem && searchStatus === 'found' && searchResult && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <div className="font-medium text-green-700 dark:text-green-400 mb-3">
                    พบข้อมูลลูกค้าในระบบ
                  </div>
                  <Card className="bg-background">
                    <CardContent className="pt-4 space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-muted-foreground">รหัสลูกค้า:</span>{' '}
                          <span className="font-mono font-medium">{searchResult.customer_id}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">สถานะ:</span>{' '}
                          <span className={searchResult.status === 'active' ? 'text-green-600' : 'text-gray-500'}>
                            {searchResult.status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ชื่อ:</span>{' '}
                        <span className="font-medium">
                          {searchResult.surnames?.description || getSurnameName(searchResult.surname_id)}{' '}
                          {searchResult.first_name} {searchResult.last_name}
                        </span>
                      </div>
                      {searchResult.mobile_phone && (
                        <div>
                          <span className="text-muted-foreground">เบอร์มือถือ:</span>{' '}
                          {searchResult.mobile_phone}
                        </div>
                      )}
                      {searchResult.email && (
                        <div>
                          <span className="text-muted-foreground">อีเมล:</span>{' '}
                          {searchResult.email}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" onClick={handleUseExistingCustomer}>
                      ใช้ข้อมูลนี้
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Search Result - Not Found */}
            {!editingItem && searchStatus === 'not_found' && (
              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700 dark:text-amber-400">
                  ไม่พบข้อมูลในระบบ กรุณากรอกข้อมูลลูกค้าใหม่ด้านล่าง
                </AlertDescription>
              </Alert>
            )}

            {/* Form Fields - Only show when form is enabled or in edit mode */}
            {(isFormEnabled || editingItem) && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>ประเภทลูกค้า</Label>
                    <RadioGroup
                      value={formData.customer_type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, customer_type: value })
                      }
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="individual" id="individual" />
                        <Label htmlFor="individual" className="cursor-pointer font-normal">
                          บุคคลธรรมดา
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="corporate" id="corporate" />
                        <Label htmlFor="corporate" className="cursor-pointer font-normal">
                          นิติบุคคล
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="surname_id">คำนำหน้าชื่อ</Label>
                    <Select
                      value={formData.surname_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, surname_id: value })
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="เลือก" />
                      </SelectTrigger>
                      <SelectContent>
                        {surnames.map((surname) => (
                          <SelectItem key={surname.id} value={surname.id}>
                            {surname.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">
                      ชื่อ <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name: e.target.value })
                      }
                      placeholder="ชื่อ"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">
                      นามสกุล <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                      placeholder="นามสกุล"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telephone">เบอร์โทร</Label>
                    <Input
                      id="telephone"
                      value={formData.telephone}
                      onChange={(e) =>
                        setFormData({ ...formData, telephone: e.target.value })
                      }
                      placeholder="เบอร์โทร"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile_phone">เบอร์มือถือ</Label>
                    <Input
                      id="mobile_phone"
                      value={formData.mobile_phone}
                      onChange={(e) =>
                        setFormData({ ...formData, mobile_phone: e.target.value })
                      }
                      placeholder="เบอร์มือถือ"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">อีเมล</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="อีเมล"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address1">ที่อยู่ 1</Label>
                  <Input
                    id="address1"
                    value={formData.address1}
                    onChange={(e) =>
                      setFormData({ ...formData, address1: e.target.value })
                    }
                    placeholder="ที่อยู่ 1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address2">ที่อยู่ 2</Label>
                  <Input
                    id="address2"
                    value={formData.address2}
                    onChange={(e) =>
                      setFormData({ ...formData, address2: e.target.value })
                    }
                    placeholder="ที่อยู่ 2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="district">เขต/อำเภอ</Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) =>
                        setFormData({ ...formData, district: e.target.value })
                      }
                      placeholder="เขต/อำเภอ"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="province">จังหวัด</Label>
                    <Input
                      id="province"
                      value={formData.province}
                      onChange={(e) =>
                        setFormData({ ...formData, province: e.target.value })
                      }
                      placeholder="จังหวัด"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_code">รหัสไปรษณีย์</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={(e) =>
                      setFormData({ ...formData, postal_code: e.target.value })
                    }
                    placeholder="รหัสไปรษณีย์"
                  />
                </div>

                <div className="space-y-2">
                  <Label>สถานะ</Label>
                  <RadioGroup
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="active" id="active" />
                      <Label htmlFor="active" className="cursor-pointer">
                        ใช้งาน
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="inactive" id="inactive" />
                      <Label htmlFor="inactive" className="cursor-pointer">
                        ไม่ใช้งาน
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleSubmit}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
