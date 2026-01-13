import { useState, useEffect } from 'react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface StandardPrice {
  id: string;
  no: number;
  model_id: string;
  sub_model_id: string;
  price: number;
  status: string;
  company_id: string;
}

interface Model {
  id: string;
  description: string;
}

interface SubModel {
  id: string;
  description: string;
  model_id: string;
}

export default function StandardPricesPage() {
  const { profile } = useAuth();
  const [prices, setPrices] = useState<StandardPrice[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [subModels, setSubModels] = useState<SubModel[]>([]);
  const [filteredSubModels, setFilteredSubModels] = useState<SubModel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StandardPrice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({ 
    model_id: '', 
    sub_model_id: '', 
    price: 0,
    status: 'active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.model_id) {
      const filtered = subModels.filter(sm => sm.model_id === formData.model_id);
      setFilteredSubModels(filtered);
      // Reset sub_model_id if it's not in the filtered list
      if (!filtered.find(sm => sm.id === formData.sub_model_id)) {
        setFormData(prev => ({ ...prev, sub_model_id: '' }));
      }
    } else {
      setFilteredSubModels([]);
    }
  }, [formData.model_id, subModels]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [pricesRes, modelsRes, subModelsRes] = await Promise.all([
        supabase.from('standard_prices').select('*').order('no', { ascending: true }),
        supabase.from('models').select('id, description').eq('status', 'active').order('no', { ascending: true }),
        supabase.from('sub_models').select('id, description, model_id').eq('status', 'active').order('no', { ascending: true })
      ]);

      if (pricesRes.error) throw pricesRes.error;
      if (modelsRes.error) throw modelsRes.error;
      if (subModelsRes.error) throw subModelsRes.error;

      setPrices(pricesRes.data || []);
      setModels(modelsRes.data || []);
      setSubModels(subModelsRes.data || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  const getModelName = (modelId: string) => {
    return models.find(m => m.id === modelId)?.description || '-';
  };

  const getSubModelName = (subModelId: string) => {
    return subModels.find(sm => sm.id === subModelId)?.description || '-';
  };

  const filteredItems = prices.filter(item => {
    const modelName = getModelName(item.model_id).toLowerCase();
    const subModelName = getSubModelName(item.sub_model_id).toLowerCase();
    const search = searchTerm.toLowerCase();
    return modelName.includes(search) || subModelName.includes(search);
  });

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ model_id: '', sub_model_id: '', price: 0, status: 'active' });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: StandardPrice) => {
    setEditingItem(item);
    setFormData({ 
      model_id: item.model_id, 
      sub_model_id: item.sub_model_id, 
      price: item.price,
      status: item.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('คุณต้องการลบรายการนี้หรือไม่?')) {
      try {
        const { error } = await supabase.from('standard_prices').delete().eq('id', id);
        if (error) throw error;
        setPrices(prev => prev.filter(item => item.id !== id));
        toast.success('ลบข้อมูลเรียบร้อยแล้ว');
      } catch (error: any) {
        console.error('Error deleting:', error);
        toast.error('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.model_id || !formData.sub_model_id || !formData.price) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    try {
      if (editingItem) {
        const { error } = await supabase
          .from('standard_prices')
          .update({
            model_id: formData.model_id,
            sub_model_id: formData.sub_model_id,
            price: formData.price,
            status: formData.status
          })
          .eq('id', editingItem.id);

        if (error) throw error;
        
        setPrices(prev =>
          prev.map(item =>
            item.id === editingItem.id
              ? { ...item, ...formData }
              : item
          )
        );
        toast.success('แก้ไขข้อมูลเรียบร้อยแล้ว');
      } else {
        const { data, error } = await supabase
          .from('standard_prices')
          .insert({
            model_id: formData.model_id,
            sub_model_id: formData.sub_model_id,
            price: formData.price,
            status: formData.status,
            company_id: profile?.company_id
          })
          .select()
          .single();

        if (error) throw error;
        
        setPrices(prev => [...prev, data]);
        toast.success('เพิ่มข้อมูลเรียบร้อยแล้ว');
      }

      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Error saving:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH').format(price);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">กำลังโหลด...</div>
      </div>
    );
  }

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
              <TableHead className="w-[80px]">No.</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Sub Model</TableHead>
              <TableHead className="text-right">Price (บาท)</TableHead>
              <TableHead className="w-[100px] text-center">สถานะ</TableHead>
              <TableHead className="w-[100px] text-center">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.no}</TableCell>
                  <TableCell className="font-medium">{getModelName(item.model_id)}</TableCell>
                  <TableCell>{getSubModelName(item.sub_model_id)}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatPrice(item.price)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
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
              <Label>Model</Label>
              <Select
                value={formData.model_id}
                onValueChange={(value) => setFormData({ ...formData, model_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือก Model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map(model => (
                    <SelectItem key={model.id} value={model.id}>{model.description}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sub Model</Label>
              <Select
                value={formData.sub_model_id}
                onValueChange={(value) => setFormData({ ...formData, sub_model_id: value })}
                disabled={!formData.model_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.model_id ? "เลือก Sub Model" : "กรุณาเลือก Model ก่อน"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubModels.map(subModel => (
                    <SelectItem key={subModel.id} value={subModel.id}>{subModel.description}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (บาท)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                placeholder="0"
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
                  <RadioGroupItem value="active" id="status-active" />
                  <Label htmlFor="status-active" className="font-normal cursor-pointer">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inactive" id="status-inactive" />
                  <Label htmlFor="status-inactive" className="font-normal cursor-pointer">Inactive</Label>
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
