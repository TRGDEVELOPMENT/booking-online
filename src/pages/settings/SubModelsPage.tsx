import { useState, useEffect } from 'react';
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
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SubModel {
  id: string;
  no: number;
  model_id: string;
  description: string;
  status: string;
  company_id: string;
}

interface Model {
  id: string;
  description: string;
}

export default function SubModelsPage() {
  const { profile } = useAuth();
  const [subModels, setSubModels] = useState<SubModel[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SubModel | null>(null);
  const [formData, setFormData] = useState({
    model_id: '',
    description: '',
    status: 'active',
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchSubModels = async () => {
    try {
      const { data, error } = await supabase
        .from('sub_models')
        .select('*')
        .order('no', { ascending: true });

      if (error) throw error;
      setSubModels(data || []);
    } catch (error) {
      console.error('Error fetching sub_models:', error);
      toast.error('ไม่สามารถโหลดข้อมูลรุ่นย่อยได้');
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async () => {
    try {
      const { data, error } = await supabase
        .from('models')
        .select('id, description')
        .eq('status', 'active')
        .order('description', { ascending: true });

      if (error) throw error;
      setModels(data || []);
    } catch (error) {
      console.error('Error fetching models:', error);
      toast.error('ไม่สามารถโหลดข้อมูลรุ่นได้');
    }
  };

  useEffect(() => {
    fetchSubModels();
    fetchModels();
  }, []);

  const filteredItems = subModels.filter(
    (item) =>
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      models.find((m) => m.id === item.model_id)?.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getModelDescription = (modelId: string) => {
    return models.find((m) => m.id === modelId)?.description || '-';
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ model_id: '', description: '', status: 'active' });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: SubModel) => {
    setEditingItem(item);
    setFormData({
      model_id: item.model_id,
      description: item.description,
      status: item.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: SubModel) => {
    if (!confirm(`ต้องการลบรุ่นย่อย "${item.description}" หรือไม่?`)) return;

    try {
      const { error } = await supabase
        .from('sub_models')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      toast.success('ลบข้อมูลสำเร็จ');
      fetchSubModels();
    } catch (error) {
      console.error('Error deleting sub_model:', error);
      toast.error('ไม่สามารถลบข้อมูลได้');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.model_id || !formData.description) {
      toast.error('กรุณากรอกข้อมูลให้ครบ');
      return;
    }

    setIsSaving(true);

    try {
      if (editingItem) {
        // Update existing
        const { error } = await supabase
          .from('sub_models')
          .update({
            model_id: formData.model_id,
            description: formData.description,
            status: formData.status,
          })
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('อัปเดตข้อมูลสำเร็จ');
      } else {
        // Create new
        const companyId = profile?.company_id;
        if (!companyId) {
          toast.error('ไม่พบข้อมูล Company');
          return;
        }

        const { error } = await supabase.from('sub_models').insert({
          model_id: formData.model_id,
          description: formData.description,
          status: formData.status,
          company_id: companyId,
        });

        if (error) throw error;
        toast.success('เพิ่มข้อมูลสำเร็จ');
      }

      setIsDialogOpen(false);
      fetchSubModels();
    } catch (error) {
      console.error('Error saving sub_model:', error);
      toast.error('ไม่สามารถบันทึกข้อมูลได้');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">รุ่นย่อย (Sub Model)</h1>
        <p className="text-muted-foreground mt-1">จัดการข้อมูลรุ่นย่อยรถยนต์</p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหา..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มรุ่นย่อย
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">No.</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-28 text-right">Actions</TableHead>
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
                  <TableCell>{item.no}</TableCell>
                  <TableCell>{getModelDescription(item.model_id)}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {item.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
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
                        onClick={() => handleDelete(item)}
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
              {editingItem ? 'แก้ไขรุ่นย่อย' : 'เพิ่มรุ่นย่อย'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select
                value={formData.model_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, model_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกรุ่น" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="กรอกชื่อรุ่นย่อย"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <RadioGroup
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="active" />
                  <Label htmlFor="active" className="font-normal">
                    Active
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inactive" id="inactive" />
                  <Label htmlFor="inactive" className="font-normal">
                    Inactive
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                บันทึก
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
