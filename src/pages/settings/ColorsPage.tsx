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
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ColorItem {
  id: string;
  no: number;
  description: string;
  hex_color: string;
  status: string;
  company_id: string;
}

export default function ColorsPage() {
  const { profile } = useAuth();
  const [colors, setColors] = useState<ColorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ColorItem | null>(null);
  const [formData, setFormData] = useState({ 
    description: '', 
    hex_color: '#000000',
    status: 'active'
  });
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchColors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('colors')
        .select('*')
        .order('no', { ascending: true });

      if (error) throw error;
      setColors(data || []);
    } catch (error: any) {
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  const filteredItems = colors.filter(
    item => item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ description: '', hex_color: '#000000', status: 'active' });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: ColorItem) => {
    setEditingItem(item);
    setFormData({ 
      description: item.description, 
      hex_color: item.hex_color,
      status: item.status
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
    if (!formData.description) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    try {
      if (editingItem) {
        const { error } = await supabase
          .from('colors')
          .update({
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
            description: formData.description,
            hex_color: formData.hex_color,
            status: formData.status,
            company_id: profile?.company_id || '',
          });

        if (error) throw error;
        toast.success('เพิ่มข้อมูลเรียบร้อยแล้ว');
      }

      setIsDialogOpen(false);
      fetchColors();
    } catch (error: any) {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    }
  };

  const handleExport = () => {
    if (colors.length === 0) {
      toast.error('ไม่มีข้อมูลสำหรับ Export');
      return;
    }

    const headers = ['No', 'Description', 'Hex Color', 'Status'];
    const csvContent = [
      headers.join(','),
      ...colors.map(item => 
        [item.no, `"${item.description}"`, item.hex_color, item.status].join(',')
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
          if (!matches || matches.length < 4) continue;

          const description = matches[1]?.replace(/^"|"$/g, '').trim();
          const hexColor = matches[2]?.trim() || '#000000';
          const status = matches[3]?.trim().toLowerCase() === 'active' ? 'active' : 'inactive';

          if (!description) continue;

          const { error } = await supabase
            .from('colors')
            .insert({
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
          toast.error(`Import ไม่สำเร็จ ${errorCount} รายการ`);
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

  if (loading) {
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
          <h1 className="text-2xl font-bold text-foreground">สี</h1>
          <p className="text-muted-foreground">จัดการข้อมูลสีรถยนต์</p>
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
              <TableHead className="w-[80px]">No.</TableHead>
              <TableHead>สี</TableHead>
              <TableHead className="w-[150px]">ตัวอย่างสี</TableHead>
              <TableHead className="w-[120px]">สถานะ</TableHead>
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
                  <TableCell className="font-mono">{item.no}</TableCell>
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-lg border border-border shadow-sm"
                        style={{ backgroundColor: item.hex_color }}
                      />
                      <span className="text-muted-foreground text-sm font-mono">
                        {item.hex_color}
                      </span>
                    </div>
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
              <Label htmlFor="description">สี</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="เช่น ขาวมุก, ดำเมทัลลิก"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hex_color">ตัวอย่างสี</Label>
              <div className="flex gap-2">
                <Input
                  id="hex_color"
                  type="color"
                  value={formData.hex_color}
                  onChange={(e) => setFormData({ ...formData, hex_color: e.target.value })}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={formData.hex_color}
                  onChange={(e) => setFormData({ ...formData, hex_color: e.target.value })}
                  placeholder="#000000"
                  className="font-mono"
                />
              </div>
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
