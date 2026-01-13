import { useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
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
import { toast } from 'sonner';

interface VehicleType {
  id: string;
  code: string;
  name: string;
  description?: string;
}

// Mock data - will be replaced with Supabase
const mockVehicleTypes: VehicleType[] = [
  { id: '1', code: 'SEDAN', name: 'รถเก๋ง', description: 'รถยนต์นั่งส่วนบุคคล 4 ประตู' },
  { id: '2', code: 'SUV', name: 'รถ SUV', description: 'รถอเนกประสงค์' },
  { id: '3', code: 'PICKUP', name: 'รถกระบะ', description: 'รถบรรทุกขนาดเล็ก' },
  { id: '4', code: 'HATCHBACK', name: 'รถแฮทช์แบ็ก', description: 'รถเก๋งท้ายตัด' },
  { id: '5', code: 'MPV', name: 'รถ MPV', description: 'รถอเนกประสงค์สำหรับครอบครัว' },
];

export default function VehicleTypesPage() {
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>(mockVehicleTypes);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VehicleType | null>(null);
  const [formData, setFormData] = useState({ code: '', name: '', description: '' });

  const filteredItems = vehicleTypes.filter(
    item => item.name.includes(searchTerm) || item.code.includes(searchTerm.toUpperCase())
  );

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ code: '', name: '', description: '' });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: VehicleType) => {
    setEditingItem(item);
    setFormData({ code: item.code, name: item.name, description: item.description || '' });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('คุณต้องการลบรายการนี้หรือไม่?')) {
      setVehicleTypes(prev => prev.filter(item => item.id !== id));
      toast.success('ลบข้อมูลเรียบร้อยแล้ว');
    }
  };

  const handleSubmit = () => {
    if (!formData.code || !formData.name) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    if (editingItem) {
      setVehicleTypes(prev =>
        prev.map(item =>
          item.id === editingItem.id
            ? { ...item, ...formData }
            : item
        )
      );
      toast.success('แก้ไขข้อมูลเรียบร้อยแล้ว');
    } else {
      const newItem: VehicleType = {
        id: Date.now().toString(),
        ...formData,
      };
      setVehicleTypes(prev => [...prev, newItem]);
      toast.success('เพิ่มข้อมูลเรียบร้อยแล้ว');
    }

    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ชนิดรถยนต์</h1>
          <p className="text-muted-foreground">จัดการข้อมูลชนิดรถยนต์</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มชนิดรถยนต์
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">รหัส</TableHead>
              <TableHead>ชื่อชนิดรถยนต์</TableHead>
              <TableHead>คำอธิบาย</TableHead>
              <TableHead className="w-[100px] text-center">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono">{item.code}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">{item.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'แก้ไขชนิดรถยนต์' : 'เพิ่มชนิดรถยนต์'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">รหัส</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="เช่น SEDAN, SUV"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อชนิดรถยนต์</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="เช่น รถเก๋ง, รถ SUV"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">คำอธิบาย</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="คำอธิบายเพิ่มเติม"
              />
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
