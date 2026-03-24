import { useState, useEffect } from 'react';
import { Search, UserPlus, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
  roles: string[];
}

const roleLabels: Record<string, string> = {
  sale: 'พนักงานขาย',
  cashier: 'แคชเชียร์',
  sale_supervisor: 'หัวหน้าทีมขาย',
  sale_manager: 'ผู้จัดการฝ่ายขาย',
  user_admin: 'ผู้ดูแลระบบ',
  it: 'IT Admin',
};

const roleOptions = [
  { value: 'sale', label: 'พนักงานขาย (Sale)' },
  { value: 'cashier', label: 'แคชเชียร์ (Cashier)' },
  { value: 'sale_supervisor', label: 'หัวหน้าทีมขาย (Sale Supervisor)' },
  { value: 'sale_manager', label: 'ผู้จัดการฝ่ายขาย (Sale Manager)' },
  { value: 'user_admin', label: 'ผู้ดูแลระบบ (User Admin)' },
  { value: 'it', label: 'IT Admin' },
];

export default function UsersPage() {
  const { profile, hasRole } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<{ branch_id: string; branch_name: string }[]>([]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: 'Test1234!',
    branch_id: '',
    role: '',
    supervisor_id: '',
  });

  const isAdmin = hasRole('user_admin') || hasRole('it');

  useEffect(() => {
    if (!profile?.company_id) return;
    fetchUsers();
    fetchBranches();
  }, [profile?.company_id]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, full_name, company_id, branch_id, supervisor_id')
      .eq('company_id', profile?.company_id || '');

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
            roles: rolesData?.map(r => r.role) || [],
          };
        })
      );
      setUsers(usersWithRoles);
    }
    setLoading(false);
  };

  const fetchBranches = async () => {
    const { data } = await supabase
      .from('branches')
      .select('branch_id, branch_name')
      .eq('company_id', profile?.company_id || '')
      .eq('status', 'active');
    setBranches(data || []);
  };

  // Get supervisors (users with sale_supervisor role)
  const supervisors = users.filter(u => u.roles.includes('sale_supervisor'));

  const handleCreateUser = async () => {
    if (!formData.full_name || !formData.email || !formData.role) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    if (formData.role === 'sale' && !formData.supervisor_id) {
      toast.error('กรุณาเลือกหัวหน้าทีมขาย');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('create-user', {
        body: {
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          company_id: profile?.company_id,
          branch_id: formData.branch_id || null,
          role: formData.role,
          supervisor_id: formData.role === 'sale' ? formData.supervisor_id : null,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'เกิดข้อผิดพลาด');
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast.success('สร้างผู้ใช้งานสำเร็จ');
      setDialogOpen(false);
      setFormData({ full_name: '', email: '', password: 'Test1234!', branch_id: '', role: '', supervisor_id: '' });
      await fetchUsers();
    } catch (err: any) {
      console.error('Error creating user:', err);
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

  const filteredUsers = users.filter(u =>
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ผู้ใช้งาน</h1>
          <p className="text-muted-foreground">จัดการข้อมูลผู้ใช้งานในระบบ</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setDialogOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            เพิ่มผู้ใช้งาน
          </Button>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาชื่อผู้ใช้งาน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">ลำดับ</TableHead>
              <TableHead>ชื่อ-สกุล</TableHead>
              <TableHead>บริษัท</TableHead>
              <TableHead>สาขา</TableHead>
              <TableHead>บทบาท</TableHead>
              <TableHead>หัวหน้าทีมขาย</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  กำลังโหลด...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user, index) => (
                <TableRow key={user.user_id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.company_id}</TableCell>
                  <TableCell>
                    {branches.find(b => b.branch_id === user.branch_id)?.branch_name || user.branch_id || '-'}
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
                    {user.roles.includes('sale') ? getSupervisorName(user.supervisor_id) : '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>เพิ่มผู้ใช้งานใหม่</DialogTitle>
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
              <Label>อีเมล <span className="text-destructive">*</span></Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>รหัสผ่าน</Label>
              <Input
                value={formData.password}
                onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                placeholder="รหัสผ่าน"
              />
            </div>
            <div className="space-y-2">
              <Label>สาขา</Label>
              <Select value={formData.branch_id} onValueChange={(v) => setFormData(p => ({ ...p, branch_id: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสาขา" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map(b => (
                    <SelectItem key={b.branch_id} value={b.branch_id}>{b.branch_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>บทบาท (Role) <span className="text-destructive">*</span></Label>
              <Select value={formData.role} onValueChange={(v) => setFormData(p => ({ ...p, role: v, supervisor_id: '' }))}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกบทบาท" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Supervisor selection - only for Sale role */}
            {formData.role === 'sale' && (
              <div className="space-y-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <Label className="text-amber-800 dark:text-amber-200">
                  หัวหน้าทีมขาย (Sale Supervisor) <span className="text-destructive">*</span>
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  ใช้เป็นค่าเริ่มต้นในสายอนุมัติรายการจอง
                </p>
                <Select value={formData.supervisor_id} onValueChange={(v) => setFormData(p => ({ ...p, supervisor_id: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกหัวหน้าทีมขาย" />
                  </SelectTrigger>
                  <SelectContent>
                    {supervisors.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">ไม่พบหัวหน้าทีมขาย ในบริษัทนี้</div>
                    ) : (
                      supervisors.map(s => (
                        <SelectItem key={s.user_id} value={s.user_id}>
                          {s.full_name}
                          {s.branch_id ? ` (${branches.find(b => b.branch_id === s.branch_id)?.branch_name || s.branch_id})` : ''}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
              ยกเลิก
            </Button>
            <Button onClick={handleCreateUser} disabled={isSubmitting} className="gap-2">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              สร้างผู้ใช้งาน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
