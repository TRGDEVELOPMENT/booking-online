import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Loader2, Search, Filter, Users } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ReservationRow {
  id: string;
  document_number: string;
  customer_name: string;
  branch_id: string | null;
  status: string;
  confirmation_status: string | null;
  review_status: string | null;
  approval_status: string | null;
  created_at: string;
  created_by: string | null;
}

interface Assignment {
  reservation_id: string;
  stage: string;
  assigned_user_id: string;
  assigned_user_name?: string;
}

interface UserOption {
  user_id: string;
  full_name: string;
  branch_id: string | null;
  role: string;
}

interface SalesTeam {
  id: string;
  team_name: string;
  supervisor_id: string;
  branch_id: string;
  status: string;
}

interface SalesTeamMember {
  team_id: string;
  member_user_id: string;
}

const stageConfig = [
  { stage: 'cashier', label: 'แคชเชียร์', role: 'cashier' },
  { stage: 'review', label: 'หัวหน้าทีมขาย', role: 'sale_supervisor' },
  { stage: 'approval', label: 'ผู้จัดการฝ่ายขาย', role: 'sale_manager' },
];

export default function ApprovalChainPage() {
  const { selectedCompany } = useOutletContext<{ selectedCompany: string }>();
  const { hasRole } = useAuth();
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [branches, setBranches] = useState<{ branch_id: string; branch_name: string }[]>([]);
  const [savingCell, setSavingCell] = useState<string | null>(null);

  // Sales team states
  const [salesTeams, setSalesTeams] = useState<SalesTeam[]>([]);
  const [teamMembers, setTeamMembers] = useState<SalesTeamMember[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('all');

  const isAdmin = hasRole('user_admin') || hasRole('it');

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch reservations (non-cancelled)
        const { data: resData, error: resError } = await supabase
          .from('reservations')
          .select('id, document_number, customer_name, branch_id, status, confirmation_status, review_status, approval_status, created_at, created_by')
          .eq('company_id', selectedCompany)
          .neq('status', 'cancelled')
          .order('created_at', { ascending: false });

        if (resError) throw resError;
        setReservations(resData || []);

        // Fetch existing assignments
        const { data: assignData, error: assignError } = await supabase
          .from('reservation_assignments')
          .select('*');

        if (assignError) throw assignError;

        if (assignData && assignData.length > 0) {
          const userIds = [...new Set(assignData.map(a => a.assigned_user_id))];
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, full_name')
            .in('user_id', userIds);

          const nameMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);
          setAssignments(assignData.map(a => ({
            reservation_id: a.reservation_id,
            stage: a.stage,
            assigned_user_id: a.assigned_user_id,
            assigned_user_name: nameMap.get(a.assigned_user_id) || '',
          })));
        } else {
          setAssignments([]);
        }

        // Fetch users with roles
        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('user_id, role');

        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, full_name, branch_id')
          .eq('company_id', selectedCompany);

        if (rolesData && profilesData) {
          const profileMap = new Map(profilesData.map(p => [p.user_id, p]));
          const userList: UserOption[] = [];
          for (const r of rolesData) {
            const profile = profileMap.get(r.user_id);
            if (profile) {
              userList.push({
                user_id: r.user_id,
                full_name: profile.full_name,
                branch_id: profile.branch_id,
                role: r.role,
              });
            }
          }
          setUsers(userList);
        }

        // Fetch branches
        const { data: branchData } = await supabase
          .from('branches')
          .select('branch_id, branch_name')
          .eq('company_id', selectedCompany)
          .eq('status', 'active');

        setBranches(branchData || []);

        // Fetch sales teams
        const { data: teamsData } = await supabase
          .from('sales_teams')
          .select('id, team_name, supervisor_id, branch_id, status')
          .eq('company_id', selectedCompany)
          .eq('status', 'active');

        setSalesTeams(teamsData || []);

        // Fetch all team members
        if (teamsData && teamsData.length > 0) {
          const teamIds = teamsData.map(t => t.id);
          const { data: membersData } = await supabase
            .from('sales_team_members')
            .select('team_id, member_user_id')
            .in('team_id', teamIds);

          setTeamMembers(membersData || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('ไม่สามารถโหลดข้อมูลได้');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedCompany]);

  const getAssignment = (reservationId: string, stage: string) => {
    return assignments.find(a => a.reservation_id === reservationId && a.stage === stage);
  };

  const selectedTeam = salesTeams.find(t => t.id === selectedTeamId);

  const getUsersForRole = (role: string, branchId: string | null) => {
    // If a team is selected, filter users based on team context
    if (selectedTeam) {
      if (role === 'sale_supervisor') {
        // Only show the team's supervisor
        return users.filter(u => u.role === role && u.user_id === selectedTeam.supervisor_id);
      }
      // For other roles, filter by team's branch
      return users.filter(u =>
        u.role === role &&
        (!selectedTeam.branch_id || !u.branch_id || u.branch_id === selectedTeam.branch_id)
      );
    }
    // No team selected - filter by reservation branch
    return users.filter(u =>
      u.role === role &&
      (!branchId || !u.branch_id || u.branch_id === branchId)
    );
  };

  const handleAssign = async (reservationId: string, stage: string, userId: string, branchId: string | null) => {
    const cellKey = `${reservationId}-${stage}`;
    setSavingCell(cellKey);
    try {
      const { error } = await supabase
        .from('reservation_assignments')
        .upsert({
          reservation_id: reservationId,
          stage,
          assigned_user_id: userId,
          assigned_by: (await supabase.auth.getUser()).data.user?.id,
          company_id: selectedCompany,
          branch_id: branchId,
        }, { onConflict: 'reservation_id,stage' });

      if (error) throw error;

      const user = users.find(u => u.user_id === userId);
      setAssignments(prev => {
        const filtered = prev.filter(a => !(a.reservation_id === reservationId && a.stage === stage));
        return [...filtered, {
          reservation_id: reservationId,
          stage,
          assigned_user_id: userId,
          assigned_user_name: user?.full_name || '',
        }];
      });

      toast.success('มอบหมายสำเร็จ');
    } catch (err: any) {
      console.error('Error:', err);
      toast.error('เกิดข้อผิดพลาด: ' + (err.message || ''));
    } finally {
      setSavingCell(null);
    }
  };

  const getStatusBadge = (res: ReservationRow) => {
    if (res.approval_status === 'approved') return <Badge className="bg-green-100 text-green-700 text-[10px]">อนุมัติแล้ว</Badge>;
    if (res.review_status === 'reviewed') return <Badge className="bg-blue-100 text-blue-700 text-[10px]">รอนุมัติ</Badge>;
    if (res.confirmation_status === 'confirmed') return <Badge className="bg-amber-100 text-amber-700 text-[10px]">รอตรวจสอบ</Badge>;
    if (res.confirmation_status === 'otp_sent' || res.confirmation_status === 'link_sent') return <Badge className="bg-purple-100 text-purple-700 text-[10px]">รอยืนยัน</Badge>;
    return <Badge variant="secondary" className="text-[10px]">ร่าง</Badge>;
  };

  // Get member user IDs for the selected team
  const selectedTeamMemberIds = selectedTeamId !== 'all' && selectedTeam
    ? [
        selectedTeam.supervisor_id,
        ...teamMembers.filter(m => m.team_id === selectedTeamId).map(m => m.member_user_id),
      ]
    : null;

  // Filter reservations
  const filtered = reservations.filter(r => {
    const matchSearch = !searchTerm ||
      r.document_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customer_name.toLowerCase().includes(searchTerm.toLowerCase());

    // If a team is selected, filter by team's branch and creator
    let matchTeam = true;
    if (selectedTeamMemberIds) {
      // Show reservations created by team members OR in same branch
      matchTeam = (r.created_by && selectedTeamMemberIds.includes(r.created_by)) ||
        r.branch_id === selectedTeam!.branch_id;
    }

    return matchSearch && matchTeam;
  });

  if (!isAdmin) {
    return (
      <>
        <Header title="ปรับปรุงสายอนุมัติใบจอง" subtitle="ไม่มีสิทธิ์เข้าถึง" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="ปรับปรุงสายอนุมัติใบจอง"
        subtitle="มอบหมายผู้รับผิดชอบในแต่ละขั้นตอนของใบจอง ตามทีมขาย"
      />

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Sales Team Selector */}
            <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
              <SelectTrigger className="w-[260px]">
                <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="เลือกทีมขาย" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <span className="text-muted-foreground">ทุกทีมขาย</span>
                </SelectItem>
                {salesTeams.map(t => {
                  const branchName = branches.find(b => b.branch_id === t.branch_id)?.branch_name || t.branch_id;
                  const supervisorName = users.find(u => u.user_id === t.supervisor_id)?.full_name || '';
                  return (
                    <SelectItem key={t.id} value={t.id}>
                      {t.team_name} ({branchName})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาเลขที่เอกสาร หรือชื่อลูกค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Selected team info */}
          {selectedTeam && (
            <div className="rounded-lg border border-border bg-muted/30 p-3 flex flex-wrap items-center gap-3 text-sm">
              <span className="font-medium">ทีม: {selectedTeam.team_name}</span>
              <Badge variant="outline" className="text-xs">
                สาขา: {branches.find(b => b.branch_id === selectedTeam.branch_id)?.branch_name || selectedTeam.branch_id}
              </Badge>
              <Badge variant="outline" className="text-xs">
                หัวหน้าทีม: {users.find(u => u.user_id === selectedTeam.supervisor_id)?.full_name || '-'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                สมาชิก: {teamMembers.filter(m => m.team_id === selectedTeamId).length} คน
              </Badge>
            </div>
          )}

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card shadow-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">เลขที่เอกสาร</TableHead>
                    <TableHead className="w-[160px]">ชื่อลูกค้า</TableHead>
                    <TableHead className="w-[100px]">สาขา</TableHead>
                    <TableHead className="w-[90px]">สถานะ</TableHead>
                    {stageConfig.map(s => (
                      <TableHead key={s.stage} className="w-[180px] text-center">
                        {s.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        ไม่พบรายการใบจอง
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((res) => {
                      const branchName = branches.find(b => b.branch_id === res.branch_id)?.branch_name || res.branch_id || '-';
                      return (
                        <TableRow key={res.id}>
                          <TableCell className="font-mono text-xs">{res.document_number}</TableCell>
                          <TableCell className="text-sm truncate max-w-[160px]">{res.customer_name}</TableCell>
                          <TableCell className="text-xs">{branchName}</TableCell>
                          <TableCell>{getStatusBadge(res)}</TableCell>
                          {stageConfig.map(({ stage, role }) => {
                            const assignment = getAssignment(res.id, stage);
                            const availableUsers = getUsersForRole(role, res.branch_id);
                            const cellKey = `${res.id}-${stage}`;
                            const isSaving = savingCell === cellKey;

                            return (
                              <TableCell key={stage} className="p-1">
                                <div className="relative">
                                  {isSaving && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10 rounded">
                                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                    </div>
                                  )}
                                  <Select
                                    value={assignment?.assigned_user_id || ''}
                                    onValueChange={(val) => handleAssign(res.id, stage, val, res.branch_id)}
                                  >
                                    <SelectTrigger className={cn(
                                      "h-8 text-xs",
                                      assignment ? "border-green-300 bg-green-50/50 dark:bg-green-950/20" : ""
                                    )}>
                                      <SelectValue placeholder="— เลือก —" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableUsers.length === 0 ? (
                                        <div className="px-3 py-2 text-xs text-muted-foreground">ไม่พบผู้ใช้</div>
                                      ) : (
                                        availableUsers.map(u => (
                                          <SelectItem key={u.user_id} value={u.user_id} className="text-xs">
                                            {u.full_name}
                                          </SelectItem>
                                        ))
                                      )}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            แสดง {filtered.length} รายการ จากทั้งหมด {reservations.length} รายการ
          </p>
        </div>
      </div>
    </>
  );
}
