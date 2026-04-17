import { useEffect, useState } from 'react';
import { Pencil, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const DEFAULT_GROUPS: Array<{ role_id: string; name: string; description: string }> = [
  { role_id: 'sale', name: 'พนักงานขาย (Sale)', description: 'สร้างและจัดการใบจอง' },
  { role_id: 'cashier', name: 'แคชเชียร์ (Cashier)', description: 'ยืนยันการรับชำระเงิน' },
  { role_id: 'sale_supervisor', name: 'หัวหน้าทีมขาย (Sale Supervisor)', description: 'ตรวจสอบใบจองจากทีมขาย' },
  { role_id: 'sale_manager', name: 'ผู้จัดการฝ่ายขาย (Sale Manager)', description: 'อนุมัติใบจอง' },
  { role_id: 'user_admin', name: 'ผู้ดูแลระบบ (User Admin)', description: 'สร้างและจัดการผู้ใช้งานในระบบ' },
  { role_id: 'it', name: 'IT Admin', description: 'จัดการระบบและตั้งค่าทั้งหมด' },
];

interface UserGroup {
  id: string;
  role_id: string;
  name: string;
  description: string | null;
  status: string;
}

export default function UserGroupsPage() {
  const { profile, hasRole } = useAuth();
  const canEdit = hasRole('user_admin') || hasRole('it');
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<UserGroup | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  const loadGroups = async () => {
    if (!profile?.company_id) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('user_groups')
      .select('*')
      .eq('company_id', profile.company_id);

    if (error) {
      toast.error('ไม่สามารถโหลดข้อมูลกลุ่มผู้ใช้งาน');
      setLoading(false);
      return;
    }

    // Merge with defaults: ensure every default role exists; insert missing ones
    const existingByRole = new Map<string, UserGroup>((data || []).map((g) => [g.role_id, g as UserGroup]));
    const missing = DEFAULT_GROUPS.filter((d) => !existingByRole.has(d.role_id));

    if (missing.length > 0 && canEdit) {
      const toInsert = missing.map((m) => ({
        role_id: m.role_id,
        company_id: profile.company_id,
        name: m.name,
        description: m.description,
        status: 'active',
      }));
      const { data: inserted } = await supabase
        .from('user_groups')
        .insert(toInsert)
        .select();
      (inserted || []).forEach((g: any) => existingByRole.set(g.role_id, g as UserGroup));
    }

    // Build ordered list following DEFAULT_GROUPS order
    const ordered: UserGroup[] = DEFAULT_GROUPS.map((d) => {
      const found = existingByRole.get(d.role_id);
      if (found) return found as UserGroup;
      // Fallback (read-only users without rows yet): synthesize a virtual entry
      return {
        id: `virtual-${d.role_id}`,
        role_id: d.role_id,
        name: d.name,
        description: d.description,
        status: 'active',
      };
    });

    setGroups(ordered);
    setLoading(false);
  };

  useEffect(() => {
    loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.company_id]);

  const openEdit = (group: UserGroup) => {
    setEditing(group);
    setForm({ name: group.name, description: group.description || '' });
  };

  const handleSave = async () => {
    if (!editing || !profile?.company_id) return;
    if (!form.name.trim()) {
      toast.error('กรุณาระบุชื่อกลุ่ม');
      return;
    }
    setSaving(true);

    const { error } = await supabase
      .from('user_groups')
      .update({ name: form.name.trim(), description: form.description.trim() })
      .eq('company_id', profile.company_id)
      .eq('role_id', editing.role_id);

    setSaving(false);
    if (error) {
      toast.error('บันทึกไม่สำเร็จ: ' + error.message);
      return;
    }
    toast.success('บันทึกข้อมูลเรียบร้อย');
    setEditing(null);
    loadGroups();
  };

  const handleToggleStatus = async (group: UserGroup, checked: boolean) => {
    if (!profile?.company_id) return;
    const newStatus = checked ? 'active' : 'inactive';

    // Optimistic update
    setGroups((prev) =>
      prev.map((g) => (g.role_id === group.role_id ? { ...g, status: newStatus } : g)),
    );

    const { error } = await supabase
      .from('user_groups')
      .update({ status: newStatus })
      .eq('company_id', profile.company_id)
      .eq('role_id', group.role_id);

    if (error) {
      toast.error('ปรับสถานะไม่สำเร็จ: ' + error.message);
      // revert
      setGroups((prev) =>
        prev.map((g) => (g.role_id === group.role_id ? { ...g, status: group.status } : g)),
      );
      return;
    }
    toast.success(`ปรับสถานะเป็น ${newStatus === 'active' ? 'Active' : 'Inactive'}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">กลุ่มผู้ใช้งาน</h1>
        <p className="text-muted-foreground">แสดงและจัดการกลุ่มผู้ใช้งาน (Roles) ที่กำหนดในระบบ</p>
      </div>

      <div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left px-4 py-2 font-semibold w-12">ลำดับ</th>
                <th className="text-left px-4 py-2 font-semibold">ชื่อกลุ่ม</th>
                <th className="text-left px-4 py-2 font-semibold">Role ID</th>
                <th className="text-left px-4 py-2 font-semibold">คำอธิบาย</th>
                <th className="text-center px-4 py-2 font-semibold w-32">สถานะ</th>
                <th className="text-center px-4 py-2 font-semibold w-24">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group, index) => {
                const isActive = group.status === 'active';
                return (
                  <tr
                    key={group.role_id}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-2 text-muted-foreground">{index + 1}</td>
                    <td className="px-4 py-2 font-medium text-foreground">{group.name}</td>
                    <td className="px-4 py-2">
                      <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                        {group.role_id}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{group.description}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={isActive}
                          disabled={!canEdit || group.id.startsWith('virtual-')}
                          onCheckedChange={(checked) => handleToggleStatus(group, checked)}
                        />
                        <Badge variant={isActive ? 'default' : 'secondary'} className="text-xs">
                          {isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={!canEdit || group.id.startsWith('virtual-')}
                        onClick={() => openEdit(group)}
                        title="แก้ไข"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {!canEdit && (
        <p className="text-xs text-muted-foreground">
          * เฉพาะผู้ดูแลระบบ (User Admin / IT) เท่านั้นที่สามารถแก้ไขข้อมูลกลุ่มผู้ใช้งานได้
        </p>
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>แก้ไขกลุ่มผู้ใช้งาน</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Role ID</Label>
              <div className="mt-1">
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                  {editing?.role_id}
                </span>
              </div>
            </div>
            <div>
              <Label htmlFor="group-name">ชื่อกลุ่ม *</Label>
              <Input
                id="group-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="เช่น พนักงานขาย (Sale)"
              />
            </div>
            <div>
              <Label htmlFor="group-desc">คำอธิบาย</Label>
              <Textarea
                id="group-desc"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="คำอธิบายสั้นๆ เกี่ยวกับบทบาทนี้"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>
              ยกเลิก
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
