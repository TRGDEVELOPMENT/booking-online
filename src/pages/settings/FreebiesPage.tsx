import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Freebie {
  id: string;
  no: number;
  description: string;
  price: number;
  status: string;
  company_id: string;
}

export default function FreebiesPage() {
  const [freebies, setFreebies] = useState<Freebie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Freebie | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    price: '',
    status: 'active',
  });

  useEffect(() => {
    fetchFreebies();
  }, []);

  const fetchFreebies = async () => {
    try {
      const { data, error } = await supabase
        .from('freebies')
        .select('*')
        .order('no', { ascending: true });

      if (error) throw error;
      setFreebies(data || []);
    } catch (error) {
      console.error('Error fetching freebies:', error);
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = freebies.filter(item =>
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ description: '', price: '', status: 'active' });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Freebie) => {
    setEditingItem(item);
    setFormData({
      description: item.description,
      price: item.price.toString(),
      status: item.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) return;

    try {
      const { error } = await supabase.from('freebies').delete().eq('id', id);
      if (error) throw error;
      toast.success('ลบข้อมูลสำเร็จ');
      fetchFreebies();
    } catch (error) {
      console.error('Error deleting freebie:', error);
      toast.error('ไม่สามารถลบข้อมูลได้');
    }
  };

  const handleSubmit = async () => {
    if (!formData.description.trim()) {
      toast.error('กรุณากรอกรายละเอียด');
      return;
    }

    try {
      // Get user's company_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('กรุณาเข้าสู่ระบบ');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.company_id) {
        toast.error('ไม่พบข้อมูล Company');
        return;
      }

      const priceValue = parseFloat(formData.price) || 0;

      if (editingItem) {
        const { error } = await supabase
          .from('freebies')
          .update({
            description: formData.description,
            price: priceValue,
            status: formData.status,
          })
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('แก้ไขข้อมูลสำเร็จ');
      } else {
        const { error } = await supabase.from('freebies').insert({
          description: formData.description,
          price: priceValue,
          status: formData.status,
          company_id: profile.company_id,
        });

        if (error) throw error;
        toast.success('เพิ่มข้อมูลสำเร็จ');
      }

      setIsDialogOpen(false);
      fetchFreebies();
    } catch (error) {
      console.error('Error saving freebie:', error);
      toast.error('ไม่สามารถบันทึกข้อมูลได้');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gift className="h-6 w-6" />
            ของแถม
          </h1>
          <p className="text-muted-foreground">จัดการข้อมูลของแถมพิเศษ</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มของแถม
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหา..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">No.</TableHead>
              <TableHead>รายละเอียด</TableHead>
              <TableHead className="text-right">ราคา (ไม่รวม VAT)</TableHead>
              <TableHead className="w-[100px]">สถานะ</TableHead>
              <TableHead className="w-[120px] text-center">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.no}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{formatPrice(item.price)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        item.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {item.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'แก้ไขของแถม' : 'เพิ่มของแถมใหม่'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">รายละเอียด</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="กรอกรายละเอียดของแถม"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">ราคา (ไม่รวม VAT)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="0.00"
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
                    Active
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inactive" id="inactive" />
                  <Label htmlFor="inactive" className="cursor-pointer">
                    Inactive
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleSubmit}>
              {editingItem ? 'บันทึก' : 'เพิ่ม'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
