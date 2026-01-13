import { useState, useEffect } from 'react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface EngineSize {
  id: string;
  no: number;
  description: string;
  status: string;
}

export default function EngineSizesPage() {
  const { profile } = useAuth();
  const [data, setData] = useState<EngineSize[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EngineSize | null>(null);
  const [deletingItem, setDeletingItem] = useState<EngineSize | null>(null);
  const [formData, setFormData] = useState({ description: '', status: 'active' });

  const fetchData = async () => {
    try {
      const { data: engineSizes, error } = await supabase
        .from('engine_sizes')
        .select('*')
        .order('no', { ascending: true });

      if (error) throw error;
      setData(engineSizes || []);
    } catch (error) {
      console.error('Error fetching engine sizes:', error);
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ description: '', status: 'active' });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: EngineSize) => {
    setEditingItem(item);
    setFormData({ description: item.description, status: item.status });
    setIsDialogOpen(true);
  };

  const handleDelete = (item: EngineSize) => {
    setDeletingItem(item);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;
    
    try {
      const { error } = await supabase
        .from('engine_sizes')
        .delete()
        .eq('id', deletingItem.id);

      if (error) throw error;
      
      toast.success('ลบข้อมูลสำเร็จ');
      fetchData();
    } catch (error) {
      console.error('Error deleting engine size:', error);
      toast.error('ไม่สามารถลบข้อมูลได้');
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingItem(null);
    }
  };

  const handleSave = async () => {
    if (!formData.description.trim()) {
      toast.error('กรุณากรอกขนาดเครื่องยนต์');
      return;
    }

    if (!profile?.company_id) {
      toast.error('ไม่พบข้อมูล Company');
      return;
    }

    try {
      if (editingItem) {
        const { error } = await supabase
          .from('engine_sizes')
          .update({
            description: formData.description,
            status: formData.status,
          })
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('แก้ไขข้อมูลสำเร็จ');
      } else {
        const { error } = await supabase
          .from('engine_sizes')
          .insert({
            description: formData.description,
            status: formData.status,
            company_id: profile.company_id,
          });

        if (error) throw error;
        toast.success('เพิ่มข้อมูลสำเร็จ');
      }

      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving engine size:', error);
      toast.error('ไม่สามารถบันทึกข้อมูลได้');
    }
  };

  if (loading) {
    return <div className="p-6">กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ขนาด/กำลังเครื่องยนต์</h1>
          <p className="text-muted-foreground">จัดการข้อมูลขนาดและกำลังเครื่องยนต์</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มข้อมูล
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">No.</TableHead>
              <TableHead>ขนาดเครื่องยนต์</TableHead>
              <TableHead className="w-32">สถานะ</TableHead>
              <TableHead className="w-32 text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.no}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item)}>
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
              {editingItem ? 'แก้ไขขนาดเครื่องยนต์' : 'เพิ่มขนาดเครื่องยนต์'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">ขนาดเครื่องยนต์</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="เช่น 1.5 ลิตร"
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
                  <Label htmlFor="active" className="font-normal">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inactive" id="inactive" />
                  <Label htmlFor="inactive" className="font-normal">Inactive</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleSave}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบ "{deletingItem?.description}" หรือไม่? การกระทำนี้ไม่สามารถเลิกทำได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>ลบ</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
