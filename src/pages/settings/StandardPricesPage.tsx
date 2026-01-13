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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface PriceItem {
  id: string;
  model: string;
  subModel: string;
  fuelType: string;
  price: number;
}

const mockPrices: PriceItem[] = [
  { id: '1', model: 'Nissan Kicks', subModel: 'e-POWER E', fuelType: 'e-POWER', price: 899000 },
  { id: '2', model: 'Nissan Kicks', subModel: 'e-POWER V', fuelType: 'e-POWER', price: 989000 },
  { id: '3', model: 'Nissan Kicks', subModel: 'e-POWER VL', fuelType: 'e-POWER', price: 1089000 },
  { id: '4', model: 'Nissan Almera', subModel: 'E', fuelType: 'เบนซิน', price: 549000 },
  { id: '5', model: 'Nissan Almera', subModel: 'EL', fuelType: 'เบนซิน', price: 619000 },
  { id: '6', model: 'Nissan Almera', subModel: 'VL', fuelType: 'เบนซิน', price: 689000 },
];

const models = ['Nissan Kicks', 'Nissan Almera', 'Nissan Navara', 'Isuzu D-Max', 'Isuzu MU-X'];
const fuelTypes = ['e-POWER', 'เบนซิน', 'ดีเซล', 'ไฮบริด', 'EV'];

export default function StandardPricesPage() {
  const [prices, setPrices] = useState<PriceItem[]>(mockPrices);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PriceItem | null>(null);
  const [formData, setFormData] = useState({ model: '', subModel: '', fuelType: '', price: 0 });

  const filteredItems = prices.filter(
    item => 
      item.model.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.subModel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ model: '', subModel: '', fuelType: '', price: 0 });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: PriceItem) => {
    setEditingItem(item);
    setFormData({ 
      model: item.model, 
      subModel: item.subModel, 
      fuelType: item.fuelType, 
      price: item.price 
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('คุณต้องการลบรายการนี้หรือไม่?')) {
      setPrices(prev => prev.filter(item => item.id !== id));
      toast.success('ลบข้อมูลเรียบร้อยแล้ว');
    }
  };

  const handleSubmit = () => {
    if (!formData.model || !formData.subModel || !formData.price) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    if (editingItem) {
      setPrices(prev =>
        prev.map(item =>
          item.id === editingItem.id
            ? { ...item, ...formData }
            : item
        )
      );
      toast.success('แก้ไขข้อมูลเรียบร้อยแล้ว');
    } else {
      const newItem: PriceItem = {
        id: Date.now().toString(),
        ...formData,
      };
      setPrices(prev => [...prev, newItem]);
      toast.success('เพิ่มข้อมูลเรียบร้อยแล้ว');
    }

    setIsDialogOpen(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH').format(price);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ราคามาตรฐานตามรุ่นรถ</h1>
          <p className="text-muted-foreground">จัดการราคามาตรฐานของรถยนต์แต่ละรุ่น</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มราคา
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาตามรุ่น..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รุ่น</TableHead>
              <TableHead>รุ่นย่อย</TableHead>
              <TableHead>ประเภทเชื้อเพลิง</TableHead>
              <TableHead className="text-right">ราคา (บาท)</TableHead>
              <TableHead className="w-[100px] text-center">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.model}</TableCell>
                  <TableCell>{item.subModel}</TableCell>
                  <TableCell>{item.fuelType}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatPrice(item.price)}
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
              {editingItem ? 'แก้ไขราคา' : 'เพิ่มราคา'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>รุ่น</Label>
              <Select
                value={formData.model}
                onValueChange={(value) => setFormData({ ...formData, model: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกรุ่น" />
                </SelectTrigger>
                <SelectContent>
                  {models.map(model => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subModel">รุ่นย่อย</Label>
              <Input
                id="subModel"
                value={formData.subModel}
                onChange={(e) => setFormData({ ...formData, subModel: e.target.value })}
                placeholder="เช่น e-POWER V, EL"
              />
            </div>
            <div className="space-y-2">
              <Label>ประเภทเชื้อเพลิง</Label>
              <Select
                value={formData.fuelType}
                onValueChange={(value) => setFormData({ ...formData, fuelType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภทเชื้อเพลิง" />
                </SelectTrigger>
                <SelectContent>
                  {fuelTypes.map(fuel => (
                    <SelectItem key={fuel} value={fuel}>{fuel}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">ราคา (บาท)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                placeholder="0"
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
