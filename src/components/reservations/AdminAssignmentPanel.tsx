import { useState } from 'react';
import { UserCheck, ShieldCheck, ClipboardCheck, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useReservationAssignments, type AssignmentStage } from '@/hooks/useReservationAssignments';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminAssignmentPanelProps {
  reservationId: string;
  companyId: string;
  branchId: string | null;
  currentStatus: string;
  confirmationStatus: string;
  reviewStatus: string;
  approvalStatus: string;
  onStatusChange?: () => void;
}

const stageConfig: { stage: AssignmentStage; label: string; icon: React.ElementType; role: string; roleLabel: string }[] = [
  { stage: 'cashier', label: 'ตรวจสอบการชำระเงิน', icon: CreditCard, role: 'cashier', roleLabel: 'แคชเชียร์' },
  { stage: 'review', label: 'ตรวจสอบใบจอง', icon: ClipboardCheck, role: 'sale_supervisor', roleLabel: 'หัวหน้าทีมขาย' },
  { stage: 'approval', label: 'อนุมัติใบจอง', icon: ShieldCheck, role: 'sale_manager', roleLabel: 'ผู้จัดการฝ่ายขาย' },
];

type StatusOverride = 'draft' | 'confirmed' | 'cashier_verified' | 'reviewed' | 'approved' | 'cancelled';

const statusOptions: { value: StatusOverride; label: string }[] = [
  { value: 'draft', label: 'ร่าง (Draft)' },
  { value: 'confirmed', label: 'ยืนยันแล้ว (Confirmed)' },
  { value: 'cashier_verified', label: 'ตรวจสอบเงินแล้ว (Cashier Verified)' },
  { value: 'reviewed', label: 'ตรวจสอบแล้ว (Reviewed)' },
  { value: 'approved', label: 'อนุมัติแล้ว (Approved)' },
  { value: 'cancelled', label: 'ยกเลิก (Cancelled)' },
];

export function AdminAssignmentPanel({
  reservationId,
  companyId,
  branchId,
  currentStatus,
  confirmationStatus,
  reviewStatus,
  approvalStatus,
  onStatusChange,
}: AdminAssignmentPanelProps) {
  const { assignments, usersByRole, isLoading, assignUser, getAssignment } = useReservationAssignments({
    reservationId,
    companyId,
    branchId,
  });

  const [selectedStatus, setSelectedStatus] = useState<StatusOverride | ''>('');
  const [statusRemark, setStatusRemark] = useState('');
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  const handleOverrideStatus = async () => {
    if (!selectedStatus) {
      toast.error('กรุณาเลือกสถานะ');
      return;
    }

    setIsSavingStatus(true);
    try {
      const updateData: Record<string, any> = {};

      switch (selectedStatus) {
        case 'draft':
          updateData.status = 'draft';
          updateData.confirmation_status = 'pending';
          updateData.review_status = 'pending';
          updateData.approval_status = 'pending';
          break;
        case 'confirmed':
          updateData.confirmation_status = 'confirmed';
          updateData.confirmed_at = new Date().toISOString();
          break;
        case 'cashier_verified':
          updateData.confirmation_status = 'confirmed';
          break;
        case 'reviewed':
          updateData.confirmation_status = 'confirmed';
          updateData.review_status = 'reviewed';
          updateData.reviewed_at = new Date().toISOString();
          if (statusRemark) updateData.review_remark = statusRemark;
          break;
        case 'approved':
          updateData.confirmation_status = 'confirmed';
          updateData.review_status = 'reviewed';
          updateData.approval_status = 'approved';
          updateData.approved_at = new Date().toISOString();
          if (statusRemark) updateData.approval_remark = statusRemark;
          break;
        case 'cancelled':
          updateData.status = 'cancelled';
          break;
      }

      const { error } = await supabase
        .from('reservations')
        .update(updateData)
        .eq('id', reservationId);

      if (error) throw error;

      toast.success('ปรับสถานะสำเร็จ');
      setSelectedStatus('');
      setStatusRemark('');
      onStatusChange?.();
    } catch (err: any) {
      console.error('Error overriding status:', err);
      toast.error('เกิดข้อผิดพลาด: ' + (err.message || ''));
    } finally {
      setIsSavingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="form-section">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="form-section border-2 border-amber-200 bg-amber-50/50 dark:bg-amber-950/10 dark:border-amber-800">
      <div className="form-section-header flex items-center gap-2 text-amber-800 dark:text-amber-200">
        <UserCheck className="w-5 h-5" />
        แผงควบคุมผู้ดูแลระบบ (Admin Panel)
      </div>

      {/* Assignment Section */}
      <div className="space-y-4 mb-6">
        <h4 className="font-semibold text-sm text-foreground">มอบหมายผู้รับผิดชอบ</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stageConfig.map(({ stage, label, icon: Icon, role, roleLabel }) => {
            const assignment = getAssignment(stage);
            const users = usersByRole[role] || [];

            return (
              <div key={stage} className="space-y-2 p-3 rounded-lg bg-background border border-border">
                <Label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Label>
                <p className="text-[10px] text-muted-foreground">เลือกจากกลุ่ม: {roleLabel}</p>
                <Select
                  value={assignment?.assigned_user_id || ''}
                  onValueChange={(val) => assignUser(stage, val)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="เลือกผู้รับผิดชอบ" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        ไม่พบผู้ใช้ในกลุ่มนี้
                      </div>
                    ) : (
                      users.map((u) => (
                        <SelectItem key={u.user_id} value={u.user_id}>
                          {u.full_name}
                          {u.branch_id ? ` (${u.branch_id})` : ' (ทุกสาขา)'}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {assignment && (
                  <p className="text-[10px] text-green-600">
                    ✓ มอบหมายแล้ว: {assignment.assigned_user_name}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Override Section */}
      <div className="space-y-3 pt-4 border-t border-amber-200 dark:border-amber-800">
        <h4 className="font-semibold text-sm text-foreground">ปรับสถานะใบจอง</h4>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 space-y-2">
            <Label className="text-xs">สถานะที่ต้องการ</Label>
            <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as StatusOverride)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="เลือกสถานะ" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-2">
            <Label className="text-xs">หมายเหตุ (ถ้ามี)</Label>
            <Textarea
              value={statusRemark}
              onChange={(e) => setStatusRemark(e.target.value)}
              placeholder="ระบุเหตุผลในการปรับสถานะ..."
              className="h-9 min-h-[36px] text-sm resize-none"
            />
          </div>
        </div>
        <Button
          onClick={handleOverrideStatus}
          disabled={!selectedStatus || isSavingStatus}
          className="gap-2"
          variant="outline"
          size="sm"
        >
          {isSavingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          ยืนยันปรับสถานะ
        </Button>
      </div>
    </div>
  );
}
