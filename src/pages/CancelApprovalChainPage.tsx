import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Loader2, Search } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/input';
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
import { Badge } from '@/components/ui/badge';

interface ReservationRow {
  id: string;
  document_number: string;
  customer_name: string;
  branch_id: string | null;
  cancel_request_status: string | null;
  cancel_review_status: string | null;
  cancel_approval_status: string | null;
  cancel_reason: string | null;
  cancel_requested_at: string | null;
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

const stageConfig = [
  { stage: 'cancel_review', label: 'ผู้ตรวจสอบยกเลิก', role: 'sale_supervisor' },
  { stage: 'cancel_approval', label: 'ผู้อนุมัติยกเลิก', role: 'sale_manager' },
];

export default function CancelApprovalChainPage() {
  const { selectedCompany } = useOutletContext<{ selectedCompany: string }>();
  const { hasRole } = useAuth();
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [branches, setBranches] = useState<{ branch_id: string; branch_name: string }[]>([]);
  const [savingCell, setSavingCell] = useState<string | null>(null);

  const isAdmin = hasRole('user_admin') || hasRole('it');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch reservations with cancel_request_status = 'requested' and not yet fully approved
        const { data: resData, error: resError } = await supabase
          .from('reservations')
          .select('id, document_number, customer_name, branch_id, cancel_request_status, cancel_review_status, cancel_approval_status, cancel_reason, cancel_requested_at')
          .eq('company_id', selectedCompany)
          .eq('cancel_request_status', 'requested')
          .or('cancel_approval_status.is.null,cancel_approval_status.neq.approved')
          .order('cancel_requested_at', { ascending: false });

        if (resError) throw resError;
        setReservations(resData || []);

        // Fetch existing cancel assignments
        const { data: assignData, error: assignError } = await supabase
          .from('reservation_assignments')
          .select('*')
          .in('stage', ['cancel_review', 'cancel_approval']);

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
        const { data: rolesData } = await supabase.from('user_roles').select('user_id, role');
        const { data: profilesData } = await supabase.from('profiles').select('user_id, full_name, branch_id').eq('company_id', selectedCompany);

        if (rolesData && profilesData) {
          const profileMap = new Map(profilesData.map(p => [p.user_id, p]));
          const userList: UserOption[] = [];
          for (const r of rolesData) {
            const profile = profileMap.get(r.user_id);
            if (profile) {
              userList.push({ user_id: r.user_id, full_name: profile.full_name, branch_id: profile.branch_id, role: r.role });
            }
          }
          setUsers(userList);
        }

        // Fetch branches
        const { data: branchData } = await supabase.from('branches').select('branch_id, branch_name').eq('company_id', selectedCompany).eq('status', 'active');
        setBranches(branchData || []);
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

  const getUsersForRole = (role: string, branchId: string | null) => {
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

  const getCancelStatusBadge = (res: ReservationRow) => {
    if (res.cancel_approval_status === 'approved') return <Badge variant="destructive" className="text-xs">ยกเลิกแล้ว</Badge>;
    if (res.cancel_review_status === 'reviewed') return <Badge variant="secondary" className="text-xs">รอผู้จัดการอนุมัติ</Badge>;
    return <Badge variant="outline" className="text-xs">รอตรวจสอบ</Badge>;
  };

  const filtered = reservations.filter(r => {
    if (!searchTerm) return true;
    return r.document_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (!isAdmin) {
    return (
      <>
        <Header title="เปลี่ยนสายอนุมัติยกเลิกใบจอง" subtitle="ไม่มีสิทธิ์เข้าถึง" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="เปลี่ยนสายอนุมัติยกเลิกใบจอง"
        subtitle="ปรับปรุงผู้ตรวจสอบและอนุมัติการยกเลิกใบจองแต่ละรายการ (เฉพาะใบจองที่อยู่ระหว่างขอยกเลิก)"
      />

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาเลขที่เอกสาร หรือชื่อลูกค้า..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

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
                    <TableHead className="w-[120px]">สถานะยกเลิก</TableHead>
                    <TableHead className="w-[150px]">เหตุผล</TableHead>
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
                      <TableCell colSpan={5 + stageConfig.length} className="text-center py-8 text-muted-foreground">
                        ไม่พบรายการใบจองที่ขอยกเลิก
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
                          <TableCell>{getCancelStatusBadge(res)}</TableCell>
                          <TableCell className="text-xs truncate max-w-[150px]">{res.cancel_reason || '-'}</TableCell>
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
            แสดง {filtered.length} รายการ จากทั้งหมด {reservations.length} รายการ (เฉพาะใบจองที่อยู่ระหว่างขอยกเลิก)
          </p>
        </div>
      </div>
    </>
  );
}
