import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface Surname {
  id: string;
  description: string;
}

interface Customer {
  id: string;
  no: number;
  surname_id: string | null;
  first_name: string;
  last_name: string;
  telephone: string | null;
  mobile_phone: string | null;
  email: string | null;
  tax_id: string | null;
  status: string;
  company_id: string;
  surnames?: Surname;
}

export default function CustomersPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [surnames, setSurnames] = useState<Surname[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    surname_id: '',
    first_name: '',
    last_name: '',
    telephone: '',
    mobile_phone: '',
    email: '',
    tax_id: '',
    status: 'active',
  });

  const companyId = localStorage.getItem('selectedCompany') || '';

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      surname_id: '',
      first_name: '',
      last_name: '',
      telephone: '',
      mobile_phone: '',
      email: '',
      tax_id: '',
      status: 'active',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Customer) => {
    setEditingItem(item);
    setFormData({
      surname_id: item.surname_id || '',
      first_name: item.first_name,
      last_name: item.last_name,
      telephone: item.telephone || '',
      mobile_phone: item.mobile_phone || '',
      email: item.email || '',
      tax_id: item.tax_id || '',
      status: item.status,
    });
    setIsDialogOpen(true);
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
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast.error('กรุณากรอกชื่อและนามสกุล');
      return;
    }

    try {
      const dataToSave = {
        surname_id: formData.surname_id || null,
        first_name: formData.first_name,
        last_name: formData.last_name,
        telephone: formData.telephone || null,
        mobile_phone: formData.mobile_phone || null,
        email: formData.email || null,
        tax_id: formData.tax_id || null,
        status: formData.status,
        updated_at: new Date().toISOString(),
      };

      if (editingItem) {
        const { error } = await supabase
          .from('customers')
          .update(dataToSave)
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('แก้ไขข้อมูลสำเร็จ');
      } else {
        const { error } = await supabase.from('customers').insert({
          ...dataToSave,
          company_id: companyId,
        });

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
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    ไม่พบข้อมูล
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.no}</TableCell>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มข้อมูลลูกค้า'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="surname_id">คำนำหน้าชื่อ</Label>
              <Select
                value={formData.surname_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, surname_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกคำนำหน้าชื่อ" />
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
              <Label htmlFor="tax_id">TAX ID</Label>
              <Input
                id="tax_id"
                value={formData.tax_id}
                onChange={(e) =>
                  setFormData({ ...formData, tax_id: e.target.value })
                }
                placeholder="หมายเลขประจำตัวผู้เสียภาษี"
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
