import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ActivityLog {
  id: string;
  reservation_id: string;
  action: string;
  action_label: string | null;
  details: Record<string, unknown> | null;
  performed_by: string;
  performed_by_name: string | null;
  company_id: string;
  branch_id: string | null;
  created_at: string;
}

// Action label map (Thai)
const ACTION_LABELS: Record<string, string> = {
  created: 'สร้างใบจอง',
  updated: 'แก้ไขใบจอง',
  confirmed: 'ยืนยันสัญญาจอง',
  otp_sent: 'ส่ง OTP ยืนยัน',
  link_sent: 'ส่ง Link ยืนยัน',
  cashier_verified: 'ตรวจสอบการชำระเงิน',
  reviewed: 'ตรวจสอบรายละเอียด',
  review_returned: 'ส่งกลับแก้ไข',
  approved: 'อนุมัติ',
  rejected: 'ไม่อนุมัติ',
  submitted_for_approval: 'ส่งขออนุมัติ',
  printed: 'พิมพ์เอกสาร',
  cancel_requested: 'ขอยกเลิกใบจอง',
  cancel_reviewed: 'ตรวจสอบการยกเลิก',
  cancel_approved: 'อนุมัติการยกเลิก',
  cancel_rejected: 'ไม่อนุมัติการยกเลิก',
  assignment_changed: 'เปลี่ยนสายอนุมัติ',
  attachment_uploaded: 'อัปโหลดเอกสาร',
  attachment_deleted: 'ลบเอกสาร',
};

export function useReservationActivityLog(reservationId: string | undefined) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile } = useAuth();

  const fetchLogs = useCallback(async () => {
    if (!reservationId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('reservation_activity_logs')
        .select('*')
        .eq('reservation_id', reservationId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setLogs(data as ActivityLog[]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [reservationId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const logActivity = useCallback(async (params: {
    reservationId: string;
    action: string;
    actionLabel?: string;
    details?: Record<string, unknown>;
    companyId: string;
    branchId?: string | null;
  }) => {
    if (!user) return;

    const label = params.actionLabel || ACTION_LABELS[params.action] || params.action;

    try {
      await supabase
        .from('reservation_activity_logs')
        .insert({
          reservation_id: params.reservationId,
          action: params.action,
          action_label: label,
          details: params.details || {},
          performed_by: user.id,
          performed_by_name: profile?.full_name || user.email || '',
          company_id: params.companyId,
          branch_id: params.branchId || null,
        });

      // Refresh logs if we're watching the same reservation
      if (params.reservationId === reservationId) {
        fetchLogs();
      }
    } catch (err) {
      console.error('Error logging activity:', err);
    }
  }, [user, profile, reservationId, fetchLogs]);

  return { logs, isLoading, logActivity, refetch: fetchLogs };
}
