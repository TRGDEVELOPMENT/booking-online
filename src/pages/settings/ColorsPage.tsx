import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, Search, Download, Upload } from 'lucide-react';
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

interface Model {
  id: string;
  description: string;
}

interface SubModel {
  id: string;
  model_id: string;
  description: string;
}

interface ColorItem {
  id: string;
  no: number;
  description: string;
  hex_color: string;
  status: string;
  company_id: string;
  model_id: string | null;
  sub_model_id: string | null;
  model?: { description: string } | null;
  sub_model?: { description: string } | null;
}

export default function ColorsPage() {
  const { profile } = useAuth();
  const [colors, setColors] = useState<ColorItem[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [subModels, setSubModels] = useState<SubModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ColorItem | null>(null);
  
  // Filter states
  const [filterModelId, setFilterModelId] = useState<string>('');
  const [filterSubModelId, setFilterSubModelId] = useState<string>('');
  const [filteredSubModelsForFilter, setFilteredSubModelsForFilter] = useState<SubModel[]>([]);
  
  // Form states
  const [formData, setFormData] = useState({ 
    description: '', 
    hex_color: '',
    status: 'active',
    model_id: '',
    sub_model_id: '',
  });
  const [filteredSubModelsForForm, setFilteredSubModelsForForm] = useState<SubModel[]>([]);
  
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchModels = async () => {
    try {
      const { data, error } = await supabase
        .from('models')
        .select('id, description')
        .eq('status', 'active')
        .order('description');
      
      if (error) throw error;
      setModels(data || []);
    } catch (error: any) {
      toast.error('เกิดข้อผิดพลาดในการโหลด Models: ' + error.message);
    }
  };

  const fetchSubModels = async () => {
    try {
      const { data, error } = await supabase
        .from('sub_models')
        .select('id, model_id, description')
        .eq('status', 'active')
        .order('description');
      
      if (error) throw error;
      setSubModels(data || []);
    } catch (error: any) {
      toast.error('เกิดข้อผิดพลาดในการโหลด Sub Models: ' + error.message);
    }
  };

  const fetchColors = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('colors')
        .select(`
          *,
          model:models(description),
          sub_model:sub_models(description)
        `)
        .order('no', { ascending: true });

      // Apply filters
      if (filterModelId) {
        query = query.eq('model_id', filterModelId);
      }
      if (filterSubModelId) {
        query = query.eq('sub_model_id', filterSubModelId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setColors(data || []);
    } catch (error: any) {
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
    fetchSubModels();
  }, []);

  useEffect(() => {
    fetchColors();
  }, [filterModelId, filterSubModelId]);

  // Update filtered sub models for filter dropdown
  useEffect(() => {
    if (filterModelId) {
      const filtered = subModels.filter(sm => sm.model_id === filterModelId);
      setFilteredSubModelsForFilter(filtered);
    } else {
      setFilteredSubModelsForFilter([]);
    }
    setFilterSubModelId('');
  }, [filterModelId, subModels]);

  // Update filtered sub models for form dropdown
  useEffect(() => {
    if (formData.model_id) {
      const filtered = subModels.filter(sm => sm.model_id === formData.model_id);
      setFilteredSubModelsForForm(filtered);
    } else {
      setFilteredSubModelsForForm([]);
    }
  }, [formData.model_id, subModels]);

  const filteredItems = colors.filter(
    item => item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ 
      description: '', 
      hex_color: '#000000', 
      status: 'active',
      model_id: filterModelId || '',
      sub_model_id: filterSubModelId || '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: ColorItem) => {
    setEditingItem(item);
    setFormData({ 
      description: item.description, 
      hex_color: item.hex_color,
      status: item.status,
      model_id: item.model_id || '',
      sub_model_id: item.sub_model_id || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('คุณต้องการลบรายการนี้หรือไม่?')) {
      try {
        const { error } = await supabase
          .from('colors')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        toast.success('ลบข้อมูลเรียบร้อยแล้ว');
        fetchColors();
      } catch (error: any) {
        toast.error('เกิดข้อผิดพลาด: ' + error.message);
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.model_id || !formData.sub_model_id || !formData.description) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน (Model, Sub Model และ สี)');
      return;
    }

    try {
      if (editingItem) {
        const { error } = await supabase
          .from('colors')
          .update({
            model_id: formData.model_id,
            sub_model_id: formData.sub_model_id,
            description: formData.description,
            hex_color: formData.hex_color,
            status: formData.status,
          })
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('แก้ไขข้อมูลเรียบร้อยแล้ว');
      } else {
        const { error } = await supabase
          .from('colors')
          .insert({
            model_id: formData.model_id,
            sub_model_id: formData.sub_model_id,
            description: formData.description,
            hex_color: formData.hex_color,
            status: formData.status,
            company_id: profile?.company_id || '',
          });

        if (error) {
          if (error.code === '23505') {
            toast.error('สีนี้มีอยู่แล้วในรุ่นย่อยนี้');
            return;
          }
          throw error;
        }
        toast.success('เพิ่มข้อมูลเรียบร้อยแล้ว');
      }

      setIsDialogOpen(false);
      fetchColors();
    } catch (error: any) {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    }
  };

  const getModelDescription = (modelId: string | null) => {
    if (!modelId) return '-';
    const model = models.find(m => m.id === modelId);
    return model?.description || '-';
  };

  const getSubModelDescription = (subModelId: string | null) => {
    if (!subModelId) return '-';
    const subModel = subModels.find(sm => sm.id === subModelId);
    return subModel?.description || '-';
  };

  const handleExport = () => {
    if (colors.length === 0) {
      toast.error('ไม่มีข้อมูลสำหรับ Export');
      return;
    }

    const headers = ['No', 'Model', 'Sub Model', 'Description', 'Hex Color', 'Status'];
    const csvContent = [
      headers.join(','),
      ...colors.map(item => 
        [
          item.no, 
          `"${item.model?.description || ''}"`,
          `"${item.sub_model?.description || ''}"`,
          `"${item.description}"`, 
          item.hex_color, 
          item.status
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `colors_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success('Export ข้อมูลสำเร็จ');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('กรุณาเลือกไฟล์ CSV');
      return;
    }

    setImporting(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          toast.error('ไฟล์ไม่มีข้อมูล');
          setImporting(false);
          return;
        }

        // Skip header row
        const dataRows = lines.slice(1);
        let successCount = 0;
        let errorCount = 0;

        for (const row of dataRows) {
          // Parse CSV row (handle quoted values)
          const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
          if (!matches || matches.length < 6) continue;

          const modelName = matches[1]?.replace(/^"|"$/g, '').trim();
          const subModelName = matches[2]?.replace(/^"|"$/g, '').trim();
          const description = matches[3]?.replace(/^"|"$/g, '').trim();
          const hexColor = matches[4]?.trim() || '#000000';
          const status = matches[5]?.trim().toLowerCase() === 'active' ? 'active' : 'inactive';

          if (!modelName || !subModelName || !description) continue;

          // Find model and sub_model by name
          const model = models.find(m => m.description === modelName);
          const subModel = subModels.find(sm => sm.description === subModelName);

          if (!model || !subModel) {
            errorCount++;
            continue;
          }

          const { error } = await supabase
            .from('colors')
            .insert({
              model_id: model.id,
              sub_model_id: subModel.id,
              description,
              hex_color: hexColor,
              status,
              company_id: profile?.company_id || '',
            });

          if (error) {
            errorCount++;
          } else {
            successCount++;
          }
        }

        if (successCount > 0) {
          toast.success(`Import สำเร็จ ${successCount} รายการ`);
          fetchColors();
        }
        if (errorCount > 0) {
          toast.error(`Import ไม่สำเร็จ ${errorCount} รายการ (อาจไม่พบ Model/SubModel หรือสีซ้ำ)`);
        }
      } catch (error: any) {
        toast.error('เกิดข้อผิดพลาดในการ Import: ' + error.message);
      } finally {
        setImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.readAsText(file);
  };

  const handleClearFilters = () => {
    setFilterModelId('');
    setFilterSubModelId('');
    setSearchTerm('');
  };

  if (loading && colors.length === 0) {
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
          <h1 className="text-2xl font-bold text-foreground">ตั้งค่าสี</h1>
          <p className="text-muted-foreground">จัดการข้อมูลสีรถยนต์ตาม Model และ Sub Model</p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".csv"
            className="hidden"
          />
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleImportClick} disabled={importing}>
            <Upload className="w-4 h-4 mr-2" />
            {importing ? 'กำลัง Import...' : 'Import'}
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มสี
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border">
        {/* Filter Section */}
        <div className="p-4 border-b border-border space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="w-48">
              <Label className="text-sm text-muted-foreground mb-1 block">Model</Label>
              <Select value={filterModelId} onValueChange={setFilterModelId}>
                <SelectTrigger>
                  <SelectValue placeholder="ทั้งหมด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Label className="text-sm text-muted-foreground mb-1 block">Sub Model</Label>
              <Select 
                value={filterSubModelId} 
                onValueChange={setFilterSubModelId}
                disabled={!filterModelId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={filterModelId ? "ทั้งหมด" : "เลือก Model ก่อน"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  {filteredSubModelsForFilter.map((subModel) => (
                    <SelectItem key={subModel.id} value={subModel.id}>
                      {subModel.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Label className="text-sm text-muted-foreground mb-1 block">ค้นหา</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาชื่อสี..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {(filterModelId || filterSubModelId || searchTerm) && (
              <div className="flex items-end">
                <Button variant="ghost" onClick={handleClearFilters} size="sm">
                  ล้าง Filter
                </Button>
              </div>
            )}
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">No.</TableHead>
              <TableHead className="w-[150px]">Model</TableHead>
              <TableHead className="w-[150px]">Sub Model</TableHead>
              <TableHead>สี</TableHead>
              <TableHead className="w-[150px]">Code สี</TableHead>
              <TableHead className="w-[100px]">สถานะ</TableHead>
              <TableHead className="w-[100px] text-center">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono">{item.no}</TableCell>
                  <TableCell>{item.model?.description || getModelDescription(item.model_id)}</TableCell>
                  <TableCell>{item.sub_model?.description || getSubModelDescription(item.sub_model_id)}</TableCell>
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.hex_color || '-'}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
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
              {editingItem ? 'แก้ไขสี' : 'เพิ่มสี'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Model <span className="text-destructive">*</span></Label>
              <Select 
                value={formData.model_id} 
                onValueChange={(value) => setFormData({ ...formData, model_id: value, sub_model_id: '' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือก Model" />
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
              <Label>Sub Model <span className="text-destructive">*</span></Label>
              <Select 
                value={formData.sub_model_id} 
                onValueChange={(value) => setFormData({ ...formData, sub_model_id: value })}
                disabled={!formData.model_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.model_id ? "เลือก Sub Model" : "กรุณาเลือก Model ก่อน"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubModelsForForm.map((subModel) => (
                    <SelectItem key={subModel.id} value={subModel.id}>
                      {subModel.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">สี <span className="text-destructive">*</span></Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="เช่น ขาวมุก, ดำเมทัลลิก"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hex_color">Code สี</Label>
              <Input
                id="hex_color"
                value={formData.hex_color}
                onChange={(e) => setFormData({ ...formData, hex_color: e.target.value })}
                placeholder="เช่น ขาวมุก, เทาเข้ม"
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
