import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Profile {
  user_id: string;
  full_name: string;
  branch_id: string | null;
  status: string;
}

interface UserWithRole extends Profile {
  role: string;
}

interface SalesTeam {
  id: string;
  no: number;
  team_name: string;
  supervisor_id: string;
  branch_id: string;
  company_id: string;
  status: string;
  created_at: string;
}

export default function SalesTeamsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState<SalesTeam[]>([]);
  const [branches, setBranches] = useState<{ branch_id: string; branch_name: string }[]>([]);
  const [allUsers, setAllUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<SalesTeam | null>(null);
  const [formData, setFormData] = useState({
    team_name: '',
    branch_id: '',
    supervisor_id: '',
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);

  const companyId = profile?.company_id || '';

  useEffect(() => {
    if (companyId) {
      fetchData();
    }
  }, [companyId]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchTeams(), fetchBranches(), fetchUsers()]);
    setLoading(false);
  };

  const fetchTeams = async () => {
    const { data: teamsData } = await supabase
      .from('sales_teams')
      .select('*')
      .eq('company_id', companyId)
      .order('branch_id', { ascending: true })
      .order('no', { ascending: true });

    if (teamsData) {
      setTeams(teamsData);
    }
  };

  const fetchBranches = async () => {
    const { data } = await supabase
      .from('branches')
      .select('branch_id, branch_name')
      .eq('company_id', companyId)
      .eq('status', 'active');
    setBranches(data || []);
  };

  const fetchUsers = async () => {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, full_name, branch_id, status')
      .eq('company_id', companyId)
      .eq('status', 'active');

    if (!profiles) return;

    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('user_id', profiles.map(p => p.user_id));

    const usersWithRoles: UserWithRole[] = profiles.map(p => ({
      ...p,
      role: roles?.find(r => r.user_id === p.user_id)?.role || 'sale',
    }));

    setAllUsers(usersWithRoles);
  };

  const getSupervisors = (branchId: string) => {
    return allUsers.filter(u => u.role === 'sale_supervisor' && u.branch_id === branchId);
  };

  const getUserName = (userId: string) => {
    return allUsers.find(u => u.user_id === userId)?.full_name || '-';
  };

  const getBranchName = (branchId: string) => {
    return branches.find(b => b.branch_id === branchId)?.branch_name || branchId;
  };

  const openCreateDialog = () => {
    setEditingTeam(null);
    setFormData({ team_name: '', branch_id: '', supervisor_id: '' });
    setDialogOpen(true);
  };

  const openEditDialog = (team: SalesTeam) => {
    setEditingTeam(team);
    setFormData({
      team_name: team.team_name,
      branch_id: team.branch_id,
      supervisor_id: team.supervisor_id,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.team_name || !formData.branch_id || !formData.supervisor_id) {
      toast({ title: 'กรุณากรอกข้อมูลให้ครบถ้วน', variant: 'destructive' });
      return;
    }

    if (editingTeam) {
      const { error } = await supabase
        .from('sales_teams')
        .update({
          team_name: formData.team_name,
          branch_id: formData.branch_id,
          supervisor_id: formData.supervisor_id,
        })
        .eq('id', editingTeam.id);

      if (error) {
        toast({ title: 'เกิดข้อผิดพลาด', description: error.message, variant: 'destructive' });
        return;
      }

      toast({ title: 'อัปเดตทีมขายสำเร็จ' });
    } else {
      const { error } = await supabase
        .from('sales_teams')
        .insert({
          team_name: formData.team_name,
          branch_id: formData.branch_id,
          supervisor_id: formData.supervisor_id,
          company_id: companyId,
        });

      if (error) {
        toast({ title: 'เกิดข้อผิดพลาด', description: error.message, variant: 'destructive' });
        return;
      }

      toast({ title: 'สร้างทีมขายสำเร็จ' });
    }

    setDialogOpen(false);
    fetchTeams();
  };

  const handleDelete = async () => {
    if (!deletingTeamId) return;
    const { error } = await supabase.from('sales_teams').delete().eq('id', deletingTeamId);
    if (error) {
      toast({ title: 'เกิดข้อผิดพลาด', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'ลบทีมขายสำเร็จ' });
      fetchTeams();
    }
    setDeleteConfirmOpen(false);
    setDeletingTeamId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ปรับปรุงทีมขาย</h1>
          <p className="text-muted-foreground mt-1">จัดการทีมขายโดยกำหนดชื่อทีม สาขา และหัวหน้าทีมขาย</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          สร้างทีมขายใหม่
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">ลำดับ</TableHead>
                <TableHead>ชื่อทีม</TableHead>
                <TableHead>สาขา</TableHead>
                <TableHead>หัวหน้าทีมขาย</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="w-24 text-center">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">กำลังโหลด...</TableCell>
                </TableRow>
              ) : teams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">ยังไม่มีทีมขาย</TableCell>
                </TableRow>
              ) : (
                teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">{team.no}</TableCell>
                    <TableCell className="font-medium">{team.team_name}</TableCell>
                    <TableCell>{getBranchName(team.branch_id)}</TableCell>
                    <TableCell>{getUserName(team.supervisor_id)}</TableCell>
                    <TableCell>
                      <Badge variant={team.status === 'active' ? 'default' : 'secondary'}>
                        {team.status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(team)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setDeletingTeamId(team.id); setDeleteConfirmOpen(true); }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTeam ? 'แก้ไขทีมขาย' : 'สร้างทีมขายใหม่'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>ชื่อทีม <span className="text-destructive">*</span></Label>
              <Input
                value={formData.team_name}
                onChange={e => setFormData(p => ({ ...p, team_name: e.target.value }))}
                placeholder="เช่น ทีมขาย A"
              />
            </div>

            <div>
              <Label>สาขา <span className="text-destructive">*</span></Label>
              <Select
                value={formData.branch_id}
                onValueChange={v => setFormData(p => ({ ...p, branch_id: v, supervisor_id: '' }))}
              >
                <SelectTrigger><SelectValue placeholder="เลือกสาขา" /></SelectTrigger>
                <SelectContent>
                  {branches.map(b => (
                    <SelectItem key={b.branch_id} value={b.branch_id}>{b.branch_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>หัวหน้าทีมขาย (Sale Supervisor) <span className="text-destructive">*</span></Label>
              <Select
                value={formData.supervisor_id}
                onValueChange={v => setFormData(p => ({ ...p, supervisor_id: v }))}
                disabled={!formData.branch_id}
              >
                <SelectTrigger><SelectValue placeholder={formData.branch_id ? "เลือกหัวหน้าทีมขาย" : "กรุณาเลือกสาขาก่อน"} /></SelectTrigger>
                <SelectContent>
                  {getSupervisors(formData.branch_id).map(u => (
                    <SelectItem key={u.user_id} value={u.user_id}>{u.full_name}</SelectItem>
                  ))}
                  {formData.branch_id && getSupervisors(formData.branch_id).length === 0 && (
                    <div className="px-3 py-2 text-sm text-muted-foreground">ไม่พบหัวหน้าทีมขายในสาขานี้</div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleSave}>{editingTeam ? 'บันทึก' : 'สร้างทีม'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบทีมขาย</AlertDialogTitle>
            <AlertDialogDescription>คุณต้องการลบทีมขายนี้หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">ลบ</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
