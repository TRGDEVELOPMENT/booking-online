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

interface ColorItem {
  id: string;
  code: string;
  name: string;
  hexColor: string;
}

const mockColors: ColorItem[] = [
  { id: '1', code: 'WHITE', name: 'ขาวมุก', hexColor: '#FFFFFF' },
  { id: '2', code: 'BLACK', name: 'ดำมุก', hexColor: '#1a1a1a' },
  { id: '3', code: 'SILVER', name: 'เงิน', hexColor: '#C0C0C0' },
  { id: '4', code: 'RED', name: 'แดง', hexColor: '#DC2626' },
  { id: '5', code: 'BLUE', name: 'น้ำเงิน', hexColor: '#2563EB' },
  { id: '6', code: 'GRAY', name: 'เทา', hexColor: '#6B7280' },
  { id: '7', code: 'ORANGE', name: 'ส้ม', hexColor: '#EA580C' },
];

export default function ColorsPage() {
  const [colors, setColors] = useState<ColorItem[]>(mockColors);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ColorItem | null>(null);
  const [formData, setFormData] = useState({ code: '', name: '', hexColor: '#000000' });

  const filteredItems = colors.filter(
    item => item.name.includes(searchTerm) || item.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ code: '', name: '', hexColor: '#000000' });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: ColorItem) => {
    setEditingItem(item);
    setFormData({ code: item.code, name: item.name, hexColor: item.hexColor });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('คุณต้องการลบรายการนี้หรือไม่?')) {
      setColors(prev => prev.filter(item => item.id !== id));
      toast.success('ลบข้อมูลเรียบร้อยแล้ว');
    }
  };

  const handleSubmit = () => {
    if (!formData.code || !formData.name) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    if (editingItem) {
      setColors(prev =>
        prev.map(item =>
          item.id === editingItem.id
            ? { ...item, ...formData }
            : item
        )
      );
      toast.success('แก้ไขข้อมูลเรียบร้อยแล้ว');
    } else {
      const newItem: ColorItem = {
        id: Date.now().toString(),
        ...formData,
      };
      setColors(prev => [...prev, newItem]);
      toast.success('เพิ่มข้อมูลเรียบร้อยแล้ว');
    }

    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">สี</h1>
          <p className="text-muted-foreground">จัดการข้อมูลสีรถยนต์</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มสี
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
              <TableHead>ชื่อสี</TableHead>
              <TableHead className="w-[150px]">ตัวอย่างสี</TableHead>
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
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-lg border border-border shadow-sm"
                        style={{ backgroundColor: item.hexColor }}
                      />
                      <span className="text-muted-foreground text-sm font-mono">
                        {item.hexColor}
                      </span>
                    </div>
                  </TableCell>
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
              {editingItem ? 'แก้ไขสี' : 'เพิ่มสี'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">รหัส</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="เช่น WHITE, BLACK"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อสี</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="เช่น ขาวมุก, ดำมุก"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hexColor">สี</Label>
              <div className="flex gap-2">
                <Input
                  id="hexColor"
                  type="color"
                  value={formData.hexColor}
                  onChange={(e) => setFormData({ ...formData, hexColor: e.target.value })}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={formData.hexColor}
                  onChange={(e) => setFormData({ ...formData, hexColor: e.target.value })}
                  placeholder="#000000"
                  className="font-mono"
                />
              </div>
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
