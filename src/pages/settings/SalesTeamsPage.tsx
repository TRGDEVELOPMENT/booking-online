import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Users, UserPlus, X } from 'lucide-react';
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

interface SalesTeamMember {
  id: string;
  team_id: string;
  member_user_id: string;
  created_at: string;
}

export default function SalesTeamsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState<SalesTeam[]>([]);
  const [members, setMembers] = useState<Record<string, SalesTeamMember[]>>({});
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
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
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
      .order('created_at', { ascending: false });

    if (teamsData) {
      setTeams(teamsData);
      // Fetch members for all teams
      const memberMap: Record<string, SalesTeamMember[]> = {};
      for (const team of teamsData) {
        const { data: membersData } = await supabase
          .from('sales_team_members')
          .select('*')
          .eq('team_id', team.id);
        memberMap[team.id] = membersData || [];
      }
      setMembers(memberMap);
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
    // Get all profiles for this company
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, full_name, branch_id, status')
      .eq('company_id', companyId)
      .eq('status', 'active');

    if (!profiles) return;

    // Get roles for these users
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

  const getSales = (branchId: string) => {
    return allUsers.filter(u => u.role === 'sale' && u.branch_id === branchId);
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
    setSelectedMembers([]);
    setDialogOpen(true);
  };

  const openEditDialog = (team: SalesTeam) => {
    setEditingTeam(team);
    setFormData({
      team_name: team.team_name,
      branch_id: team.branch_id,
      supervisor_id: team.supervisor_id,
    });
    setSelectedMembers(members[team.id]?.map(m => m.member_user_id) || []);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.team_name || !formData.branch_id || !formData.supervisor_id) {
      toast({ title: 'กรุณากรอกข้อมูลให้ครบถ้วน', variant: 'destructive' });
      return;
    }

    if (editingTeam) {
      // Update team
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

      // Delete old members and insert new
      await supabase.from('sales_team_members').delete().eq('team_id', editingTeam.id);
      if (selectedMembers.length > 0) {
        await supabase.from('sales_team_members').insert(
          selectedMembers.map(uid => ({ team_id: editingTeam.id, member_user_id: uid }))
        );
      }

      toast({ title: 'อัปเดตทีมขายสำเร็จ' });
    } else {
      // Create team
      const { data: newTeam, error } = await supabase
        .from('sales_teams')
        .insert({
          team_name: formData.team_name,
          branch_id: formData.branch_id,
          supervisor_id: formData.supervisor_id,
          company_id: companyId,
        })
        .select()
        .single();

      if (error || !newTeam) {
        toast({ title: 'เกิดข้อผิดพลาด', description: error?.message, variant: 'destructive' });
        return;
      }

      // Insert members
      if (selectedMembers.length > 0) {
        await supabase.from('sales_team_members').insert(
          selectedMembers.map(uid => ({ team_id: newTeam.id, member_user_id: uid }))
        );
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

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ปรับปรุงทีมขาย</h1>
          <p className="text-muted-foreground mt-1">จัดการทีมขายโดยกำหนดหัวหน้าทีมขายและที่ปรึกษาการขาย</p>
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
                <TableHead>ที่ปรึกษาการขาย</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="w-24 text-center">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">กำลังโหลด...</TableCell>
                </TableRow>
              ) : teams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">ยังไม่มีทีมขาย</TableCell>
                </TableRow>
              ) : (
                teams.map((team, idx) => (
                  <TableRow key={team.id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="font-medium">{team.team_name}</TableCell>
                    <TableCell>{getBranchName(team.branch_id)}</TableCell>
                    <TableCell>{getUserName(team.supervisor_id)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(members[team.id] || []).map(m => (
                          <Badge key={m.id} variant="secondary" className="text-xs">
                            {getUserName(m.member_user_id)}
                          </Badge>
                        ))}
                        {(!members[team.id] || members[team.id].length === 0) && (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </div>
                    </TableCell>
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
                onValueChange={v => setFormData(p => ({ ...p, branch_id: v, supervisor_id: '', }))}
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

            <div>
              <Label>ที่ปรึกษาการขาย (Sale)</Label>
              {!formData.branch_id ? (
                <p className="text-sm text-muted-foreground mt-1">กรุณาเลือกสาขาก่อน</p>
              ) : (
                <div className="mt-2 border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                  {getSales(formData.branch_id).length === 0 ? (
                    <p className="text-sm text-muted-foreground">ไม่พบที่ปรึกษาการขายในสาขานี้</p>
                  ) : (
                    getSales(formData.branch_id).map(u => (
                      <label key={u.user_id} className="flex items-center gap-2 cursor-pointer hover:bg-muted p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(u.user_id)}
                          onChange={() => toggleMember(u.user_id)}
                          className="rounded"
                        />
                        <span className="text-sm">{u.full_name}</span>
                      </label>
                    ))
                  )}
                </div>
              )}
              {selectedMembers.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedMembers.map(uid => (
                    <Badge key={uid} variant="secondary" className="text-xs gap-1">
                      {getUserName(uid)}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => toggleMember(uid)} />
                    </Badge>
                  ))}
                </div>
              )}
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
