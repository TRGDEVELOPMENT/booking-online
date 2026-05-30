import { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, Pencil, Trash2, Search, Download, Upload, X } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
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

interface ColorRow {
  id: string;
  no: number;
  description: string;
  hex_color: string;
  status: string;
  company_id: string;
  model_id: string | null;
  sub_model_id: string | null;
}

interface ColorGroup {
  key: string; // description|hex_color
  description: string;
  hex_color: string;
  status: string;
  minNo: number;
  rows: ColorRow[];
  isGlobal: boolean;
  modelIds: Set<string>;
}

interface MappingRow {
  model_id: string;
  sub_model_id: string; // can be '__ALL__'
}

const ALL_SUBS = '__ALL__';

export default function ColorsPage() {
  const { profile } = useAuth();
  const [rows, setRows] = useState<ColorRow[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [subModels, setSubModels] = useState<SubModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModelId, setFilterModelId] = useState<string>('');
  const [filterSubModelId, setFilterSubModelId] = useState<string>('');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ColorGroup | null>(null);

  // Form
  const [formData, setFormData] = useState({
    description: '',
    hex_color: '#000000',
    status: 'active',
    isGlobal: false,
  });
  const [mappings, setMappings] = useState<MappingRow[]>([]);

  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [m, sm, c] = await Promise.all([
        supabase.from('models').select('id, description').eq('status', 'active').order('description'),
        supabase.from('sub_models').select('id, model_id, description').eq('status', 'active').order('description'),
        supabase.from('colors').select('*').order('no', { ascending: true }),
      ]);
      if (m.error) throw m.error;
      if (sm.error) throw sm.error;
      if (c.error) throw c.error;
      setModels(m.data || []);
      setSubModels(sm.data || []);
      setRows((c.data || []) as ColorRow[]);
    } catch (error: any) {
      toast.error('โหลดข้อมูลไม่สำเร็จ: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const filteredSubModelsForFilter = useMemo(
    () => filterModelId ? subModels.filter(s => s.model_id === filterModelId) : [],
    [filterModelId, subModels]
  );

  // Build groups
  const groups: ColorGroup[] = useMemo(() => {
    const map = new Map<string, ColorGroup>();
    for (const r of rows) {
      const key = `${r.description}|${r.hex_color}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          description: r.description,
          hex_color: r.hex_color,
          status: r.status,
          minNo: r.no,
          rows: [],
          isGlobal: false,
          modelIds: new Set(),
        });
      }
      const g = map.get(key)!;
      g.rows.push(r);
      if (r.no < g.minNo) g.minNo = r.no;
      if (r.model_id === null && r.sub_model_id === null) g.isGlobal = true;
      if (r.model_id) g.modelIds.add(r.model_id);
    }
    return Array.from(map.values()).sort((a, b) => a.minNo - b.minNo);
  }, [rows]);

  // Apply filters
  const visibleGroups = useMemo(() => {
    return groups.filter(g => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        if (!g.description.toLowerCase().includes(q) && !g.hex_color.toLowerCase().includes(q)) return false;
      }
      if (filterModelId) {
        const hasMatch = g.isGlobal || g.rows.some(r => {
          if (r.model_id !== filterModelId) return false;
          if (filterSubModelId && r.sub_model_id !== filterSubModelId) return false;
          return true;
        });
        if (!hasMatch) return false;
      }
      return true;
    });
  }, [groups, searchTerm, filterModelId, filterSubModelId]);

  const getModelName = (id: string | null) => models.find(m => m.id === id)?.description || '-';
  const getSubModelName = (id: string | null) => subModels.find(s => s.id === id)?.description || '-';

  const usedByLabel = (g: ColorGroup): string => {
    if (g.isGlobal) return 'ทุกรุ่น';
    const count = g.modelIds.size;
    return count > 0 ? `${count} รุ่น` : '-';
  };

  const usedByTooltip = (g: ColorGroup): string => {
    if (g.isGlobal) return 'ใช้ได้กับทุกรุ่น';
    const parts: string[] = [];
    for (const mid of g.modelIds) {
      const subsOfModel = subModels.filter(s => s.model_id === mid).map(s => s.id);
      const groupSubsForModel = g.rows.filter(r => r.model_id === mid).map(r => r.sub_model_id);
      const isAll = subsOfModel.length > 0 && subsOfModel.every(sid => groupSubsForModel.includes(sid));
      const mName = getModelName(mid);
      if (isAll) {
        parts.push(`${mName} (ทุก Sub Model)`);
      } else {
        const subNames = groupSubsForModel.map(sid => getSubModelName(sid)).join(', ');
        parts.push(`${mName}: ${subNames}`);
      }
    }
    return parts.join('\n');
  };

  const handleAdd = () => {
    setEditingGroup(null);
    setFormData({ description: '', hex_color: '#000000', status: 'active', isGlobal: false });
    setMappings([{ model_id: '', sub_model_id: '' }]);
    setIsDialogOpen(true);
  };

  const handleEdit = (g: ColorGroup) => {
    setEditingGroup(g);
    setFormData({
      description: g.description,
      hex_color: g.hex_color,
      status: g.status,
      isGlobal: g.isGlobal,
    });
    if (g.isGlobal) {
      setMappings([{ model_id: '', sub_model_id: '' }]);
    } else {
      const ms: MappingRow[] = [];
      for (const mid of g.modelIds) {
        const subsOfModel = subModels.filter(s => s.model_id === mid).map(s => s.id);
        const groupSubsForModel = g.rows.filter(r => r.model_id === mid).map(r => r.sub_model_id as string);
        const isAll = subsOfModel.length > 0 && subsOfModel.every(sid => groupSubsForModel.includes(sid));
        if (isAll) {
          ms.push({ model_id: mid, sub_model_id: ALL_SUBS });
        } else {
          for (const sid of groupSubsForModel) ms.push({ model_id: mid, sub_model_id: sid });
        }
      }
      setMappings(ms.length ? ms : [{ model_id: '', sub_model_id: '' }]);
    }
    setIsDialogOpen(true);
  };

  const handleDelete = async (g: ColorGroup) => {
    if (!confirm(`ลบสี "${g.description}" ออกจาก ${g.rows.length} รายการใช่หรือไม่?`)) return;
    try {
      const ids = g.rows.map(r => r.id);
      const { error } = await supabase.from('colors').delete().in('id', ids);
      if (error) throw error;
      toast.success('ลบข้อมูลเรียบร้อยแล้ว');
      fetchAll();
    } catch (error: any) {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    }
  };

  // Compute target rows (model_id|sub_model_id) from form
  const computeTargetKeys = (): string[] => {
    if (formData.isGlobal) return ['NULL|NULL'];
    const set = new Set<string>();
    for (const mp of mappings) {
      if (!mp.model_id || !mp.sub_model_id) continue;
      if (mp.sub_model_id === ALL_SUBS) {
        const subs = subModels.filter(s => s.model_id === mp.model_id);
        for (const s of subs) set.add(`${mp.model_id}|${s.id}`);
      } else {
        set.add(`${mp.model_id}|${mp.sub_model_id}`);
      }
    }
    return Array.from(set);
  };

  const handleSubmit = async () => {
    if (!formData.description.trim()) {
      toast.error('กรุณากรอกชื่อสี');
      return;
    }
    const targetKeys = computeTargetKeys();
    if (targetKeys.length === 0) {
      toast.error('กรุณาเลือก Model/Sub Model อย่างน้อย 1 รายการ หรือเลือก "ใช้กับทุกรุ่น"');
      return;
    }

    try {
      const companyId = profile?.company_id || '';
      if (editingGroup) {
        const currentMap = new Map<string, ColorRow>();
        for (const r of editingGroup.rows) {
          const k = `${r.model_id ?? 'NULL'}|${r.sub_model_id ?? 'NULL'}`;
          currentMap.set(k, r);
        }
        const targetSet = new Set(targetKeys);

        const toDelete = Array.from(currentMap.entries())
          .filter(([k]) => !targetSet.has(k))
          .map(([, r]) => r.id);
        const toInsert = targetKeys.filter(k => !currentMap.has(k));
        const toUpdate = targetKeys.filter(k => currentMap.has(k));

        if (toDelete.length) {
          const { error } = await supabase.from('colors').delete().in('id', toDelete);
          if (error) throw error;
        }
        if (toUpdate.length) {
          const ids = toUpdate.map(k => currentMap.get(k)!.id);
          const { error } = await supabase
            .from('colors')
            .update({
              description: formData.description,
              hex_color: formData.hex_color,
              status: formData.status,
            })
            .in('id', ids);
          if (error) throw error;
        }
        if (toInsert.length) {
          const inserts = toInsert.map(k => {
            const [m, s] = k.split('|');
            return {
              no: 0,
              model_id: m === 'NULL' ? null : m,
              sub_model_id: s === 'NULL' ? null : s,
              description: formData.description,
              hex_color: formData.hex_color,
              status: formData.status,
              company_id: companyId,
            };
          });
          const { error } = await supabase.from('colors').insert(inserts);
          if (error) throw error;
        }
        toast.success('บันทึกข้อมูลเรียบร้อยแล้ว');
      } else {
        const inserts = targetKeys.map(k => {
          const [m, s] = k.split('|');
          return {
            no: 0,
            model_id: m === 'NULL' ? null : m,
            sub_model_id: s === 'NULL' ? null : s,
            description: formData.description,
            hex_color: formData.hex_color,
            status: formData.status,
            company_id: companyId,
          };
        });
        const { error } = await supabase.from('colors').insert(inserts);
        if (error) throw error;
        toast.success(`เพิ่มสีเรียบร้อย (${inserts.length} รายการ)`);
      }
      setIsDialogOpen(false);
      fetchAll();
    } catch (error: any) {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    }
  };

  const updateMapping = (idx: number, patch: Partial<MappingRow>) => {
    setMappings(prev => prev.map((m, i) => {
      if (i !== idx) return m;
      const next = { ...m, ...patch };
      if (patch.model_id !== undefined) next.sub_model_id = '';
      return next;
    }));
  };
  const addMapping = () => setMappings(prev => [...prev, { model_id: '', sub_model_id: '' }]);
  const removeMapping = (idx: number) => setMappings(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);

  // Export / Import (keep row-level CSV format unchanged)
  const handleExport = () => {
    if (rows.length === 0) { toast.error('ไม่มีข้อมูลสำหรับ Export'); return; }
    const headers = ['No', 'Model', 'Sub Model', 'Description', 'Hex Color', 'Status'];
    const csvContent = [
      headers.join(','),
      ...rows.map(r => [
        r.no,
        `"${getModelName(r.model_id)}"`,
        `"${getSubModelName(r.sub_model_id)}"`,
        `"${r.description}"`,
        r.hex_color,
        r.status,
      ].join(','))
    ].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `colors_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success('Export ข้อมูลสำเร็จ');
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) { toast.error('กรุณาเลือกไฟล์ CSV'); return; }
    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) { toast.error('ไฟล์ไม่มีข้อมูล'); setImporting(false); return; }
        let successCount = 0, errorCount = 0;
        for (const row of lines.slice(1)) {
          const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
          if (!matches || matches.length < 6) continue;
          const modelName = matches[1]?.replace(/^"|"$/g, '').trim();
          const subModelName = matches[2]?.replace(/^"|"$/g, '').trim();
          const description = matches[3]?.replace(/^"|"$/g, '').trim();
          const hexColor = matches[4]?.trim() || '#000000';
          const status = matches[5]?.trim().toLowerCase() === 'active' ? 'active' : 'inactive';
          if (!description) continue;
          const model = modelName ? models.find(m => m.description === modelName) : null;
          const subModel = subModelName ? subModels.find(s => s.description === subModelName) : null;
          const { error } = await supabase.from('colors').insert({
            no: 0,
            model_id: model?.id || null,
            sub_model_id: subModel?.id || null,
            description,
            hex_color: hexColor,
            status,
            company_id: profile?.company_id || '',
          });
          if (error) errorCount++; else successCount++;
        }
        if (successCount > 0) { toast.success(`Import สำเร็จ ${successCount} รายการ`); fetchAll(); }
        if (errorCount > 0) toast.error(`Import ไม่สำเร็จ ${errorCount} รายการ`);
      } catch (error: any) {
        toast.error('เกิดข้อผิดพลาด: ' + error.message);
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleClearFilters = () => { setFilterModelId(''); setFilterSubModelId(''); setSearchTerm(''); };

  if (loading && rows.length === 0) {
    return <div className="flex items-center justify-center h-64"><div className="text-muted-foreground">กำลังโหลด...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ตั้งค่าสี</h1>
          <p className="text-muted-foreground">จัดการข้อมูลสี — 1 สีใช้ได้กับหลายรุ่น</p>
        </div>
        <div className="flex gap-2">
          <input type="file" ref={fileInputRef} onChange={handleImport} accept=".csv" className="hidden" />
          <Button variant="outline" onClick={handleExport}><Download className="w-4 h-4 mr-2" />Export</Button>
          <Button variant="outline" onClick={handleImportClick} disabled={importing}>
            <Upload className="w-4 h-4 mr-2" />{importing ? 'กำลัง Import...' : 'Import'}
          </Button>
          <Button onClick={handleAdd}><Plus className="w-4 h-4 mr-2" />เพิ่มสี</Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <div className="flex flex-wrap gap-4">
            <div className="w-48">
              <Label className="text-sm text-muted-foreground mb-1 block">Model</Label>
              <Select value={filterModelId || 'all'} onValueChange={(v) => { setFilterModelId(v === 'all' ? '' : v); setFilterSubModelId(''); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  {models.map(m => <SelectItem key={m.id} value={m.id}>{m.description}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Label className="text-sm text-muted-foreground mb-1 block">Sub Model</Label>
              <Select value={filterSubModelId || 'all'} onValueChange={(v) => setFilterSubModelId(v === 'all' ? '' : v)} disabled={!filterModelId}>
                <SelectTrigger><SelectValue placeholder={filterModelId ? 'ทั้งหมด' : 'เลือก Model ก่อน'} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  {filteredSubModelsForFilter.map(s => <SelectItem key={s.id} value={s.id}>{s.description}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Label className="text-sm text-muted-foreground mb-1 block">ค้นหา</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="ค้นหาชื่อสีหรือ hex..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </div>
            {(filterModelId || filterSubModelId || searchTerm) && (
              <div className="flex items-end">
                <Button variant="ghost" onClick={handleClearFilters} size="sm">ล้าง Filter</Button>
              </div>
            )}
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">No.</TableHead>
              <TableHead>ชื่อสี</TableHead>
              <TableHead className="w-[140px]">Hex</TableHead>
              <TableHead className="w-[200px]">ใช้กับ</TableHead>
              <TableHead className="w-[100px]">สถานะ</TableHead>
              <TableHead className="w-[100px] text-center">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleGroups.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">ไม่พบข้อมูล</TableCell></TableRow>
            ) : visibleGroups.map((g) => (
              <TableRow key={g.key}>
                <TableCell className="font-mono">{g.minNo}</TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 rounded border border-border" style={{ backgroundColor: g.hex_color }} />
                    {g.description}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground font-mono text-xs">{g.hex_color}</TableCell>
                <TableCell>
                  <Badge variant={g.isGlobal ? 'default' : 'secondary'} title={usedByTooltip(g)} className="cursor-help">
                    {usedByLabel(g)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${g.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                    {g.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(g)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(g)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingGroup ? 'แก้ไขสี' : 'เพิ่มสี'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ชื่อสี <span className="text-destructive">*</span></Label>
                <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="เช่น ขาวมุก" />
              </div>
              <div className="space-y-2">
                <Label>Code สี / Hex</Label>
                <div className="flex gap-2 items-center">
                  <Input value={formData.hex_color} onChange={(e) => setFormData({ ...formData, hex_color: e.target.value })} placeholder="#FFFFFF" />
                  <span className="inline-block w-9 h-9 rounded border border-border shrink-0" style={{ backgroundColor: formData.hex_color }} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>สถานะ</Label>
              <RadioGroup value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })} className="flex gap-4">
                <div className="flex items-center space-x-2"><RadioGroupItem value="active" id="sa" /><Label htmlFor="sa" className="font-normal cursor-pointer">Active</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="inactive" id="si" /><Label htmlFor="si" className="font-normal cursor-pointer">Inactive</Label></div>
              </RadioGroup>
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <Label className="text-base font-semibold">ใช้กับรุ่น</Label>

              <div className="flex items-center gap-2">
                <Checkbox id="global" checked={formData.isGlobal} onCheckedChange={(v) => setFormData({ ...formData, isGlobal: !!v })} />
                <Label htmlFor="global" className="font-normal cursor-pointer">ใช้กับทุกรุ่น (Global)</Label>
              </div>

              {!formData.isGlobal && (
                <div className="space-y-2">
                  {mappings.map((mp, idx) => {
                    const subs = mp.model_id ? subModels.filter(s => s.model_id === mp.model_id) : [];
                    return (
                      <div key={idx} className="flex gap-2 items-end">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs text-muted-foreground">Model</Label>
                          <Select value={mp.model_id} onValueChange={(v) => updateMapping(idx, { model_id: v })}>
                            <SelectTrigger><SelectValue placeholder="เลือก Model" /></SelectTrigger>
                            <SelectContent>
                              {models.map(m => <SelectItem key={m.id} value={m.id}>{m.description}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs text-muted-foreground">Sub Model</Label>
                          <Select value={mp.sub_model_id} onValueChange={(v) => updateMapping(idx, { sub_model_id: v })} disabled={!mp.model_id}>
                            <SelectTrigger><SelectValue placeholder={mp.model_id ? 'เลือก Sub Model' : 'เลือก Model ก่อน'} /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value={ALL_SUBS}>— ทุก Sub Model —</SelectItem>
                              {subs.map(s => <SelectItem key={s.id} value={s.id}>{s.description}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeMapping(idx)} disabled={mappings.length === 1} className="text-destructive">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                  <Button type="button" variant="outline" size="sm" onClick={addMapping}>
                    <Plus className="w-4 h-4 mr-1" />เพิ่มการใช้งาน
                  </Button>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleSubmit}>{editingGroup ? 'บันทึก' : 'เพิ่ม'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
