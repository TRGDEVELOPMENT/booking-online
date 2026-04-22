import { useState, useEffect } from 'react';
import { Search, UserPlus, Loader2, Pencil, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface UserWithRole {
  user_id: string;
  full_name: string;
  company_id: string;
  branch_id: string | null;
  supervisor_id: string | null;
  team_id: string | null;
  status: string;
  username: string | null;
  email: string | null;
  roles: string[];
}

interface SalesTeamOption {
  id: string;
  team_name: string;
  branch_id: string;
  supervisor_id: string;
}

const roleLabels: Record<string, string> = {
  sale: 'พนักงานขาย',
  cashier: 'แคชเชียร์',
  sale_supervisor: 'หัวหน้าทีมขาย',
  sale_manager: 'ผู้จัดการฝ่ายขาย',
  user_admin: 'ผู้ดูแลระบบ',
  it: 'IT Admin',
};

interface RoleOption {
  value: string;
  label: string;
  status: string;
}

const DEFAULT_ROLE_OPTIONS: RoleOption[] = [
  { value: 'sale', label: 'พนักงานขาย (Sale)', status: 'active' },
  { value: 'cashier', label: 'แคชเชียร์ (Cashier)', status: 'active' },
  { value: 'sale_supervisor', label: 'หัวหน้าทีมขาย (Sale Supervisor)', status: 'active' },
  { value: 'sale_manager', label: 'ผู้จัดการฝ่ายขาย (Sale Manager)', status: 'active' },
  { value: 'user_admin', label: 'ผู้ดูแลระบบ (User Admin)', status: 'active' },
  { value: 'it', label: 'IT Admin', status: 'active' },
];

type DialogMode = 'create' | 'edit';

export default function UsersPage() {
  const { profile, hasRole } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<{ branch_id: string; branch_name: string; company_id?: string }[]>([]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>('create');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    password: 'Test1234!',
    branch_id: '',
    role: '',
    supervisor_id: '',
    team_id: '',
    status: 'active',
  });
  const [roleWarningOpen, setRoleWarningOpen] = useState(false);

  const isAdmin = hasRole('user_admin') || hasRole('it');
  const isIT = hasRole('it');

  const [salesTeams, setSalesTeams] = useState<SalesTeamOption[]>([]);
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>(DEFAULT_ROLE_OPTIONS);
  const [companyFilter, setCompanyFilter] = useState<string>('all');

  const COMPANY_OPTIONS = [
    { id: 'BPK', name: 'บริษัท บิซ พีเค จำกัด' },
    { id: 'LAC', name: 'บริษัท เลกซัส ออโต้ ซิตี้ จำกัด' },
    { id: 'ICCK', name: 'บริษัท อีซูซุชัยเจริญกิจมอเตอร์ส จำกัด' },
    { id: 'VPA', name: 'บริษัท วี.พี. ออโต้ เอ็นเตอร์ไพรส์ จำกัด' },
  ];

  useEffect(() => {
    if (!profile?.company_id) return;
    fetchUsers();
    fetchBranches();
    fetchSalesTeams();
    fetchRoleOptions();
  }, [profile?.company_id, isIT]);

  const fetchUsers = async () => {
    setLoading(true);
    if (!profile?.company_id) {
      setUsers([]);
      setLoading(false);
      return;
    }
    // IT Admin sees ALL companies; everyone else only sees their own company
    let query = supabase
      .from('profiles')
      .select('user_id, full_name, company_id, branch_id, supervisor_id, status, username, email, team_id, created_at')
      .order('company_id', { ascending: true })
      .order('created_at', { ascending: true });

    if (!isIT) {
      query = query.eq('company_id', profile.company_id);
    }

    const { data: profiles } = await query;

    if (profiles) {
      const usersWithRoles: UserWithRole[] = await Promise.all(
        profiles.map(async (p) => {
          const { data: rolesData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', p.user_id);
          return {
            ...p,
            supervisor_id: (p as any).supervisor_id || null,
            team_id: (p as any).team_id || null,
            status: (p as any).status || 'active',
            roles: rolesData?.map(r => r.role) || [],
          };
        })
      );
      setUsers(usersWithRoles);
    }
    setLoading(false);
  };

  const fetchBranches = async () => {
    // IT sees branches across all companies
    let query = supabase
      .from('branches')
      .select('branch_id, branch_name, company_id')
      .eq('status', 'active');
    if (!isIT) {
      query = query.eq('company_id', profile?.company_id || '');
    }
    const { data } = await query;
    setBranches(data as any || []);
  };

  const fetchSalesTeams = async () => {
    const { data } = await supabase
      .from('sales_teams')
      .select('id, team_name, branch_id, supervisor_id')
      .eq('company_id', profile?.company_id || '')
      .eq('status', 'active')
      .order('branch_id')
      .order('team_name');
    setSalesTeams((data || []) as SalesTeamOption[]);
  };

  const fetchRoleOptions = async () => {
    const { data, error } = await supabase
      .from('user_groups')
      .select('role_id, name, status')
      .eq('company_id', profile?.company_id || '');

    if (error || !data || data.length === 0) {
      // Fallback to defaults if user_groups not yet seeded
      setRoleOptions(DEFAULT_ROLE_OPTIONS);
      return;
    }

    // Map to RoleOption preserving DEFAULT order; include any custom rows at the end
    const byRole = new Map(data.map((g: any) => [g.role_id, g]));
    const ordered: RoleOption[] = DEFAULT_ROLE_OPTIONS.map(d => {
      const found = byRole.get(d.value) as any;
      return found
        ? { value: d.value, label: found.name || d.label, status: found.status || 'active' }
        : d;
    });
    // Append any extra roles not in defaults
    data.forEach((g: any) => {
      if (!DEFAULT_ROLE_OPTIONS.some(d => d.value === g.role_id)) {
        ordered.push({ value: g.role_id, label: g.name, status: g.status || 'active' });
      }
    });
    setRoleOptions(ordered);
  };

  const supervisors = users.filter(u => u.roles.includes('sale_supervisor') && u.status === 'active');

  const openCreateDialog = () => {
    setDialogMode('create');
    setEditingUserId(null);
    setFormData({
      full_name: '',
      username: '',
      email: '',
      password: 'Test1234!',
      branch_id: '',
      role: '',
      supervisor_id: '',
      team_id: '',
      status: 'active',
    });
    setDialogOpen(true);
  };

  const openEditDialog = (user: UserWithRole) => {
    setDialogMode('edit');
    setEditingUserId(user.user_id);
    setFormData({
      full_name: user.full_name,
      username: user.username || '',
      email: user.email || '',
      password: '',
      branch_id: user.branch_id || '',
      role: user.roles[0] || '',
      supervisor_id: user.supervisor_id || '',
      team_id: user.team_id || '',
      status: user.status || 'active',
    });
    setDialogOpen(true);
  };

  const handleCreateUser = async () => {
    if (!formData.full_name || !formData.username || !formData.role) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    if ((formData.role === 'sale' || formData.role === 'sale_supervisor') && !formData.team_id) {
      toast.error('กรุณาเลือกทีมขาย');
      return;
    }

    // Derive supervisor_id from selected team for Sale role
    const selectedTeam = salesTeams.find(t => t.id === formData.team_id);
    const supervisorId = formData.role === 'sale' ? (selectedTeam?.supervisor_id || null) : null;

    setIsSubmitting(true);
    try {
      const response = await supabase.functions.invoke('create-user', {
        body: {
          username: formData.username,
          password: formData.password,
          full_name: formData.full_name,
          company_id: profile?.company_id,
          branch_id: formData.branch_id || null,
          role: formData.role,
          supervisor_id: supervisorId,
          email: formData.email || null,
        },
      });

      if (response.error) throw new Error(response.error.message || 'เกิดข้อผิดพลาด');
      const resData = response.data as any;
      if (resData?.error) {
        throw new Error(resData.error);
      }

      // Persist team_id and add team membership for Sale role
      if (formData.role === 'sale' && resData?.user_id && formData.team_id) {
        await supabase.from('profiles').update({ team_id: formData.team_id } as any).eq('user_id', resData.user_id);
        await supabase.from('sales_team_members').insert({
          team_id: formData.team_id,
          member_user_id: resData.user_id,
        });
      }

      // Persist team_id for Supervisor role (no team membership row needed; supervisor is on sales_teams.supervisor_id)
      if (formData.role === 'sale_supervisor' && resData?.user_id && formData.team_id) {
        await supabase.from('profiles').update({ team_id: formData.team_id } as any).eq('user_id', resData.user_id);
      }

      toast.success('สร้างผู้ใช้งานสำเร็จ');
      setDialogOpen(false);
      await fetchUsers();
    } catch (err: any) {
      console.error('Error creating user:', err);
      toast.error('เกิดข้อผิดพลาด: ' + (err.message || ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    if (!editingUserId || !formData.full_name || !formData.role) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    if ((formData.role === 'sale' || formData.role === 'sale_supervisor') && !formData.team_id) {
      toast.error('กรุณาเลือกทีมขาย');
      return;
    }

    // Check if role is changing
    const currentUser = users.find(u => u.user_id === editingUserId);
    const isRoleChanging = currentUser && currentUser.roles[0] !== formData.role;

    if (isRoleChanging) {
      // Check if user is referenced in reservation assignments
      const { data: assignments } = await supabase
        .from('reservation_assignments')
        .select('id')
        .eq('assigned_user_id', editingUserId)
        .limit(1);

      if (assignments && assignments.length > 0) {
        setRoleWarningOpen(true);
        return;
      }
    }

    await executeEditUser();
  };

  const executeEditUser = async () => {
    if (!editingUserId) return;
    setRoleWarningOpen(false);
    setIsSubmitting(true);
    try {
      // Derive supervisor_id from selected team for Sale role
      const selectedTeam = salesTeams.find(t => t.id === formData.team_id);
      const supervisorId = formData.role === 'sale' ? (selectedTeam?.supervisor_id || null) : null;
      const teamId = (formData.role === 'sale' || formData.role === 'sale_supervisor') ? (formData.team_id || null) : null;

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          branch_id: formData.role === 'it' ? null : (formData.branch_id || null),
          supervisor_id: supervisorId,
          team_id: teamId,
          status: formData.status,
          email: formData.email || null,
        } as any)
        .eq('user_id', editingUserId);

      if (error) throw error;

      // Sync sales_team_members for Sale role
      const currentUser = users.find(u => u.user_id === editingUserId);
      if (formData.role === 'sale') {
        // Remove from old team if changed
        if (currentUser?.team_id && currentUser.team_id !== teamId) {
          await supabase.from('sales_team_members')
            .delete()
            .eq('member_user_id', editingUserId)
            .eq('team_id', currentUser.team_id);
        }
        // Add to new team if not already a member
        if (teamId) {
          const { data: existing } = await supabase
            .from('sales_team_members')
            .select('id')
            .eq('member_user_id', editingUserId)
            .eq('team_id', teamId)
            .maybeSingle();
          if (!existing) {
            await supabase.from('sales_team_members').insert({
              team_id: teamId,
              member_user_id: editingUserId,
            });
          }
        }
      } else if (currentUser?.team_id) {
        // Role changed away from sale -> remove team membership
        await supabase.from('sales_team_members')
          .delete()
          .eq('member_user_id', editingUserId)
          .eq('team_id', currentUser.team_id);
      }

      // Update role via edge function
      if (currentUser && currentUser.roles[0] !== formData.role) {
        const response = await supabase.functions.invoke('create-user', {
          body: {
            action: 'update_role',
            user_id: editingUserId,
            role: formData.role,
          },
        });
        if (response.error) {
          console.error('Role update error:', response.error);
          toast.warning('บันทึกข้อมูลแล้ว แต่ไม่สามารถเปลี่ยนตำแหน่งได้');
        }
      }

      toast.success('บันทึกข้อมูลสำเร็จ');
      setDialogOpen(false);
      await fetchUsers();
    } catch (err: any) {
      console.error('Error updating user:', err);
      toast.error('เกิดข้อผิดพลาด: ' + (err.message || ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSupervisorName = (supervisorId: string | null) => {
    if (!supervisorId) return '-';
    const sup = users.find(u => u.user_id === supervisorId);
    return sup?.full_name || '-';
  };

  const [branchFilter, setBranchFilter] = useState<string>('all');

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch =
      branchFilter === 'all' ||
      (branchFilter === '__all_branches__'
        ? (u.roles.includes('it') || u.branch_id === 'all' || !u.branch_id)
        : u.branch_id === branchFilter);
    return matchesSearch && matchesBranch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ผู้ใช้งาน</h1>
          <p className="text-muted-foreground">จัดการข้อมูลผู้ใช้งานในระบบ</p>
        </div>
        {isAdmin && (
          <Button onClick={openCreateDialog}>
            <UserPlus className="w-4 h-4 mr-2" />
            เพิ่มผู้ใช้งาน
          </Button>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาชื่อผู้ใช้งาน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-full sm:w-auto sm:min-w-[240px]">
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger>
                <SelectValue placeholder="กรองตามสาขา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสาขา (แสดงทั้งหมด)</SelectItem>
                <SelectItem value="__all_branches__">สิทธิ์ทุกสาขา / IT Admin</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b.branch_id} value={b.branch_id}>
                    {b.branch_id} - {b.branch_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">ลำดับ</TableHead>
              <TableHead>รหัสพนักงาน</TableHead>
              <TableHead>ชื่อ-สกุล</TableHead>
              <TableHead>สาขา</TableHead>
              <TableHead>ตำแหน่ง</TableHead>
              <TableHead>ทีมขาย</TableHead>
              <TableHead className="w-[100px]">สถานะ</TableHead>
              {isAdmin && <TableHead className="w-[80px]">จัดการ</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 8 : 7} className="text-center text-muted-foreground py-8">
                  กำลังโหลด...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 8 : 7} className="text-center text-muted-foreground py-8">
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user, index) => (
                <TableRow key={user.user_id} className={user.status === 'inactive' ? 'opacity-50' : ''}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-mono text-xs">{user.username || '-'}</TableCell>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>
                    {user.roles.includes('it') || user.branch_id === 'all'
                      ? <span className="text-sm text-muted-foreground">ทุกสาขา</span>
                      : branches.find(b => b.branch_id === user.branch_id)?.branch_name || user.branch_id || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map(role => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {roleLabels[role] || role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.roles.includes('sale')
                      ? (() => {
                          const t = salesTeams.find(st => st.id === user.team_id);
                          if (!t) return '-';
                          const supName = users.find(u2 => u2.user_id === t.supervisor_id)?.full_name;
                          return supName ? `${t.team_name} (${supName})` : t.team_name;
                        })()
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'default' : 'outline'} className="text-xs">
                      {user.status === 'active' ? 'ใช้งาน' : 'ปิดใช้งาน'}
                    </Badge>
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)} title="แก้ไข">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'create' ? 'เพิ่มผู้ใช้งานใหม่' : 'แก้ไขข้อมูลผู้ใช้งาน'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>ชื่อ-สกุล <span className="text-destructive">*</span></Label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData(p => ({ ...p, full_name: e.target.value }))}
                placeholder="ชื่อ นามสกุล"
              />
            </div>

            <div className="space-y-2">
              <Label>รหัสพนักงาน <span className="text-destructive">*</span></Label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData(p => ({ ...p, username: e.target.value.trim() }))}
                placeholder="เช่น EMP001, somchai"
                disabled={dialogMode === 'edit'}
                className={dialogMode === 'edit' ? 'bg-muted' : ''}
              />
            </div>

            {dialogMode === 'create' && (
              <div className="space-y-2">
                <Label>รหัสผ่าน</Label>
                <Input
                  value={formData.password}
                  onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                  placeholder="รหัสผ่าน"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>อีเมล (ไม่บังคับ)</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label>ตำแหน่ง (Role) <span className="text-destructive">*</span></Label>
              <Select
                value={formData.role}
                onValueChange={(v) => setFormData(p => ({ ...p, role: v, supervisor_id: '', team_id: '', branch_id: (v === 'it' || v === 'user_admin') ? '' : p.branch_id }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกตำแหน่ง" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions
                    .filter(r => r.status === 'active' || r.value === formData.role)
                    .map(r => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                        {r.status !== 'active' && (
                          <span className="text-muted-foreground"> (ปิดใช้งาน)</span>
                        )}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>สาขา {!['it'].includes(formData.role) && <span className="text-destructive">*</span>}</Label>
              {formData.role === 'it' ? (
                <div className="p-3 rounded-lg bg-muted border border-border">
                  <p className="text-sm font-medium">ทุกสาขา (All Branches)</p>
                  <p className="text-[11px] text-muted-foreground mt-1">IT Admin สามารถทำรายการได้ทุกสาขา</p>
                </div>
              ) : (
                <Select value={formData.branch_id} onValueChange={(v) => setFormData(p => ({ ...p, branch_id: v, team_id: '' }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกสาขา" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.role === 'user_admin' && (
                      <SelectItem value="all">ทุกสาขา</SelectItem>
                    )}
                    {branches.map(b => (
                      <SelectItem key={b.branch_id} value={b.branch_id}>{b.branch_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Team selection - for Sale and Sale Supervisor roles */}
            {(formData.role === 'sale' || formData.role === 'sale_supervisor') && (() => {
              const isSupervisor = formData.role === 'sale_supervisor';
              const branchTeams = salesTeams.filter(t => {
                if (formData.branch_id && t.branch_id !== formData.branch_id) return false;
                // For supervisor: show only teams where they are the supervisor (in edit mode)
                if (isSupervisor && dialogMode === 'edit' && editingUserId) {
                  return t.supervisor_id === editingUserId;
                }
                return true;
              });
              const helpText = isSupervisor
                ? 'เลือกทีมขายที่หัวหน้าทีมนี้ดูแล'
                : 'เลือกทีมขายที่พนักงานนี้สังกัด — หัวหน้าทีมจะถูกกำหนดเป็นค่าเริ่มต้นในสายอนุมัติรายการจอง';
              return (
                <div className="space-y-2 p-3 rounded-lg bg-accent/40 border border-border">
                  <Label>
                    ทีมขาย (Sales Team) <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-[11px] text-muted-foreground">{helpText}</p>
                  <Select
                    value={formData.team_id}
                    onValueChange={(v) => setFormData(p => ({ ...p, team_id: v }))}
                    disabled={!formData.branch_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.branch_id ? 'เลือกทีมขาย' : 'กรุณาเลือกสาขาก่อน'} />
                    </SelectTrigger>
                    <SelectContent>
                      {branchTeams.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          {isSupervisor ? 'ยังไม่มีทีมขายที่ผู้ใช้นี้เป็นหัวหน้า' : 'ไม่พบทีมขายในสาขานี้'}
                        </div>
                      ) : (
                        branchTeams.map(t => {
                          const supName = users.find(u => u.user_id === t.supervisor_id)?.full_name || '-';
                          return (
                            <SelectItem key={t.id} value={t.id}>
                              {t.team_name}
                              {!isSupervisor && (
                                <span className="text-muted-foreground"> — หัวหน้า: {supName}</span>
                              )}
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                </div>
              );
            })()}

            {/* Status - Radio Group */}
            <div className="space-y-2">
              <Label>สถานะ</Label>
              <RadioGroup
                value={formData.status}
                onValueChange={(v) => setFormData(p => ({ ...p, status: v }))}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="status-active" />
                  <Label htmlFor="status-active" className="cursor-pointer">ใช้งาน (Active)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inactive" id="status-inactive" />
                  <Label htmlFor="status-inactive" className="cursor-pointer">ปิดใช้งาน (Inactive)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
              ยกเลิก
            </Button>
            <Button
              onClick={dialogMode === 'create' ? handleCreateUser : handleEditUser}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : dialogMode === 'create' ? <UserPlus className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
              {dialogMode === 'create' ? 'สร้างผู้ใช้งาน' : 'บันทึก'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Change Warning Dialog */}
      <AlertDialog open={roleWarningOpen} onOpenChange={setRoleWarningOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              ยืนยันการเปลี่ยน Role
            </AlertDialogTitle>
            <AlertDialogDescription>
              ผู้ใช้งานนี้ มีบันทึกไว้ในสายอนุมัติใบจอง ยืนยันการแก้ไข Role ผู้ใช้งานหรือไม่
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={executeEditUser}>ยืนยัน</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
