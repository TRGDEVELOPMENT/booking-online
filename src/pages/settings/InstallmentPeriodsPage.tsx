import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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

interface InstallmentPeriod {
  id: string;
  no: number;
  description: string;
  status: string;
  company_id: string;
}

export default function InstallmentPeriodsPage() {
  const { profile } = useAuth();
  const [items, setItems] = useState<InstallmentPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InstallmentPeriod | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    status: 'active',
  });

  useEffect(() => {
    if (profile?.company_id) fetchItems();
  }, [profile?.company_id]);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('installment_periods')
        .select('*')
        .order('no', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching installment periods:', error);
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ description: '', status: 'active' });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: InstallmentPeriod) => {
    setEditingItem(item);
    setFormData({ description: item.description, status: item.status });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ต้องการลบข้อมูลนี้หรือไม่?')) return;
    try {
      const { error } = await supabase.from('installment_periods').delete().eq('id', id);
      if (error) throw error;
      toast.success('ลบข้อมูลสำเร็จ');
      fetchItems();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('ไม่สามารถลบข้อมูลได้');
    }
  };

  const handleSubmit = async () => {
    if (!formData.description.trim()) {
      toast.error('กรุณากรอกระยะเวลาผ่อน');
      return;
    }
    if (!profile?.company_id) {
      toast.error('ไม่พบข้อมูลบริษัท');
      return;
    }

    try {
      if (editingItem) {
        const { error } = await supabase
          .from('installment_periods')
          .update({
            description: formData.description,
            status: formData.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('แก้ไขข้อมูลสำเร็จ');
      } else {
        const { error } = await supabase.from('installment_periods').insert({
          description: formData.description,
          status: formData.status,
          company_id: profile.company_id,
          no: 0, // trigger will auto-assign
        });
        if (error) throw error;
        toast.success('เพิ่มข้อมูลสำเร็จ');
      }

      setIsDialogOpen(false);
      fetchItems();
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('ไม่สามารถบันทึกข้อมูลได้');
    }
  };

  const filtered = items.filter((item) =>
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-foreground">ระยะเวลาผ่อน</h1>
          <p className="text-muted-foreground">จัดการข้อมูลระยะเวลาผ่อนชำระ</p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          เพิ่มระยะเวลาผ่อน
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="ค้นหา..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">ลำดับ</TableHead>
              <TableHead>ระยะเวลาผ่อน</TableHead>
              <TableHead className="w-32">สถานะ</TableHead>
              <TableHead className="w-24 text-center">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.no}</TableCell>
                  <TableCell>{item.description}</TableCell>
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
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'แก้ไขระยะเวลาผ่อน' : 'เพิ่มระยะเวลาผ่อน'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">ระยะเวลาผ่อน</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="เช่น 12 เดือน, 24 เดือน, 48 เดือน"
              />
            </div>
            <div className="space-y-2">
              <Label>สถานะ</Label>
              <RadioGroup
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="active" />
                  <Label htmlFor="active" className="cursor-pointer">ใช้งาน</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inactive" id="inactive" />
                  <Label htmlFor="inactive" className="cursor-pointer">ไม่ใช้งาน</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleSubmit}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
