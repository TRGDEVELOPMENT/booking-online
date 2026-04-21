import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Trash2, Printer, FileSignature, Wallet, ClipboardCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { DatabaseReservation } from '@/types/database-reservation';
import { DatabaseStatusLabels } from '@/types/database-reservation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { getCurrentStageRole, isActionableForRole } from '@/lib/reservationStage';

const workflowStages = [
  { label: 'สร้างสัญญาจอง', color: 'text-foreground' },
  { label: 'ยืนยันสัญญาจอง', color: '' },
  { label: 'ตรวจสอบการชำระเงิน', color: 'text-orange-600' },
  { label: 'ตรวจสอบรายละเอียด', color: '' },
  { label: 'รออนุมัติ', color: '' },
  { label: 'อนุมัติ', color: '' },
];

function getWorkflowIndex(r: DatabaseReservation): number {
  if (r.status === 'cancelled') return -2; // cancelled
  if (r.cancel_approval_status === 'approved') return -3; // cancel approved
  if (r.approval_status === 'approved') return 5;
  // Returned for revision -> back to "สร้าง/แก้ไขใบจอง"
  if ((r.review_status === 'returned' || (r as any).approval_status === 'rejected') && r.status === 'draft') return 0;
  if (r.review_status === 'reviewed') return 4;
  // Cashier verified payment -> stage moves to "ตรวจสอบรายละเอียด" (supervisor)
  if ((r as any).cashier_user_id) return 3;
  // Customer confirmed but cashier hasn't verified yet -> "ตรวจสอบการชำระเงิน"
  if (r.confirmation_status === 'confirmed') return 2;
  if (r.status === 'draft' && !r.confirmation_status) return 0;
  if (r.confirmation_status === 'pending') return 1;
  return 0;
}

interface ReservationTableProps {
  reservations: DatabaseReservation[];
  selectedIds: string[];
  onSelectChange: (ids: string[]) => void;
  pageSize?: number;
  branchMap?: Record<string, string>;
}

const statusStyles: Record<string, string> = {
  draft: 'status-draft',
  final: 'status-complete',
  cancelled: 'status-cancelled',
};

export function ReservationTable({ reservations, selectedIds, onSelectChange, pageSize = 15, branchMap = {} }: ReservationTableProps) {
  const { user, roles, hasRole } = useAuth();
  const currentRole = roles[0]?.role || '';
  const isAdminViewer = hasRole('it') || hasRole('user_admin');
  const isItAdmin = hasRole('it');
  const currentUserId = user?.id;

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบใบจองนี้?')) return;
    const { supabase } = await import('@/integrations/supabase/client');
    const { toast } = await import('sonner');
    const { error } = await supabase.from('reservations').delete().eq('id', id);
    if (error) {
      toast.error('เกิดข้อผิดพลาดในการลบข้อมูล');
      return;
    }
    toast.success('ลบใบจองสำเร็จ');
  };
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(reservations.length / pageSize));
  const startIdx = (currentPage - 1) * pageSize;
  const paginatedReservations = reservations.slice(startIdx, startIdx + pageSize);

  const allSelected = paginatedReservations.length > 0 && paginatedReservations.every(r => selectedIds.includes(r.id));

  const toggleAll = () => {
    if (allSelected) {
      onSelectChange(selectedIds.filter(id => !paginatedReservations.some(r => r.id === id)));
    } else {
      const newIds = new Set([...selectedIds, ...paginatedReservations.map(r => r.id)]);
      onSelectChange(Array.from(newIds));
    }
  };

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectChange(selectedIds.filter(i => i !== id));
    } else {
      onSelectChange([...selectedIds, id]);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getBranchName = (branchId: string | null) => {
    if (!branchId) return '-';
    return branchMap[branchId] || branchId;
  };

  if (reservations.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border/50 p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📋</span>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">ไม่พบข้อมูลใบจอง</h3>
        <p className="text-muted-foreground mb-4">ลองปรับตัวกรองหรือสร้างใบจองใหม่</p>
        <Link to="/reservations/create">
          <Button className="btn-primary-gradient">
            สร้างใบจองใหม่
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="w-10 px-3 py-2">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              </th>
              <th className="text-left px-3 py-2 font-semibold">เลขที่เอกสาร</th>
              <th className="text-left px-3 py-2 font-semibold">สถานะใบจอง</th>
              <th className="text-left px-3 py-2 font-semibold">ผู้จอง</th>
              <th className="text-left px-3 py-2 font-semibold">รุ่นรถ / สี</th>
              <th className="text-right px-3 py-2 font-semibold">ราคาสุทธิ</th>
              <th className="text-right px-3 py-2 font-semibold">เงินจอง</th>
              <th className="text-left px-3 py-2 font-semibold">สาขา</th>
              <th className="text-left px-3 py-2 font-semibold">วันที่สร้าง</th>
              <th className="text-center px-3 py-2 font-semibold">ดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            {paginatedReservations.map((reservation) => (
              <tr 
                key={reservation.id}
                className={cn(
                  "border-b border-border/50 hover:bg-muted/30 transition-colors",
                  selectedIds.includes(reservation.id) && "bg-primary/5"
                )}
              >
                <td className="px-3 py-1.5">
                  <Checkbox 
                    checked={selectedIds.includes(reservation.id)} 
                    onCheckedChange={() => toggleOne(reservation.id)} 
                  />
                </td>
                <td className="px-3 py-1.5">
                  <Link 
                    to={`/reservations/${reservation.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {reservation.document_number}
                  </Link>
                </td>
                <td className="px-3 py-1.5 text-sm">
                  {(() => {
                    const idx = getWorkflowIndex(reservation);
                    if (idx === -3) {
                      return <span className="font-medium" style={{ color: '#b51f19' }}>ยกเลิกแล้ว</span>;
                    }
                    if (idx === -2) {
                      return <span className="font-medium" style={{ color: '#b51f19' }}>ยกเลิก</span>;
                    }
                    // Returned for revision -> show "ส่งกลับเพื่อแก้ไข" in amber
                    const r: any = reservation;
                    const isReturned = r.status === 'draft' && (
                      r.review_status === 'returned' ||
                      r.approval_status === 'rejected' ||
                      (r.cashier_user_id && r.confirmation_status === 'confirmed' && r.review_status !== 'reviewed' && (r.review_remark || '').includes('[DEPOSIT_RETURN]'))
                    );
                    if (isReturned) {
                      return (
                        <span className="font-medium" style={{ color: '#d97706' }}>
                          ส่งกลับเพื่อแก้ไข
                        </span>
                      );
                    }
                    const stage = workflowStages[idx] || workflowStages[0];
                    const colorStyle = idx === 1 ? { color: '#2349bb' }
                      : idx === 3 ? { color: '#2b93d4' }
                      : idx === 4 ? { color: '#2349bb' }
                      : idx === 5 ? { color: '#02681f' }
                      : undefined;
                    return (
                      <span className={cn('font-medium', stage.color)} style={colorStyle}>
                        {stage.label}
                      </span>
                    );
                  })()}
                </td>
                <td className="px-3 py-1.5">
                  <p className="font-medium text-foreground leading-tight">
                    {reservation.customer_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {reservation.customer_phone || '-'}
                  </p>
                </td>
                <td className="px-3 py-1.5">
                  <p className="font-medium text-foreground leading-tight">
                    {reservation.model || '-'} {reservation.submodel || ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {reservation.color || '-'} {reservation.fuel_type ? `• ${reservation.fuel_type}` : ''}
                  </p>
                </td>
                <td className="px-3 py-1.5 text-right font-semibold text-foreground">
                  {reservation.net_price ? `฿${reservation.net_price.toLocaleString()}` : '-'}
                </td>
                <td className="px-3 py-1.5 text-right font-semibold text-foreground">
                  {reservation.deposit_amount ? `฿${reservation.deposit_amount.toLocaleString()}` : '-'}
                </td>
                <td className="px-3 py-1.5 text-muted-foreground">
                  {getBranchName(reservation.branch_id)}
                </td>
                <td className="px-3 py-1.5 text-muted-foreground">
                  {formatDate(reservation.created_at)}
                </td>
                <td className="px-3 py-1.5">
                  <div className="flex justify-center gap-0.5">
                    {(() => {
                      const stageRole = getCurrentStageRole(reservation);
                      const idx = getWorkflowIndex(reservation);
                      const r: any = reservation;
                      const isReturned = r.status === 'draft' && (
                        r.review_status === 'returned' ||
                        r.approval_status === 'rejected' ||
                        (r.cashier_user_id && r.confirmation_status === 'confirmed' && r.review_status !== 'reviewed' && (r.review_remark || '').includes('[DEPOSIT_RETURN]'))
                      );
                      // Early stages: สร้าง (0), ยืนยันสัญญาจอง (1), or ส่งกลับเพื่อแก้ไข
                      const isEarlyStage = idx === 0 || idx === 1 || isReturned;
                      const isCreator = !!currentUserId && reservation.created_by === currentUserId;

                      // Case 1: Early stage + (creator OR IT Admin) → View, Print, Delete
                      if (isEarlyStage && (isCreator || isItAdmin)) {
                        return (
                          <>
                            <Link to={`/reservations/${reservation.id}`}>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" title="ดูรายละเอียด">
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                            <Link to={`/reservations/${reservation.id}/print`}>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" title="พิมพ์เอกสาร">
                                <Printer className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:bg-destructive/10"
                              title="ลบ"
                              onClick={() => handleDelete(reservation.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        );
                      }

                      // user_admin (non-IT) viewers → view-only
                      if (isAdminViewer && !isItAdmin) {
                        return (
                          <Link to={`/reservations/${reservation.id}`}>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" title="ดูรายละเอียด">
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        );
                      }

                      const actionable = isActionableForRole(stageRole, currentRole);

                      // Case 2: Other stages + user is NOT actionable role → View only
                      if (!actionable) {
                        return (
                          <Link to={`/reservations/${reservation.id}`}>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" title="ดูรายละเอียด">
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        );
                      }

                      // Stage = done (approved) → show View + Print icons (consistent ghost style)
                      if (stageRole === 'done') {
                        return (
                          <>
                            <Link to={`/reservations/${reservation.id}`}>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" title="ดูรายละเอียด">
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                            <Link to={`/reservations/${reservation.id}/print`}>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" title="พิมพ์เอกสาร">
                                <Printer className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                          </>
                        );
                      }

                      // Actionable for current role — show role-specific action icon
                      const actionMeta: Record<string, { Icon: typeof Eye; label: string; bg: string; ring: string }> = {
                        sale: { Icon: FileSignature, label: 'ดำเนินการสัญญาจอง', bg: 'bg-blue-500 hover:bg-blue-600 text-white', ring: 'ring-blue-300' },
                        cashier: { Icon: Wallet, label: 'ตรวจสอบการชำระเงิน', bg: 'bg-orange-500 hover:bg-orange-600 text-white', ring: 'ring-orange-300' },
                        sale_supervisor: { Icon: ClipboardCheck, label: 'ตรวจสอบรายละเอียด', bg: 'bg-sky-500 hover:bg-sky-600 text-white', ring: 'ring-sky-300' },
                        sale_manager: { Icon: CheckCircle2, label: 'อนุมัติใบจอง', bg: 'bg-emerald-500 hover:bg-emerald-600 text-white', ring: 'ring-emerald-300' },
                      };
                      const meta = actionMeta[currentRole] || actionMeta.sale;
                      const ActionIcon = meta.Icon;
                      const targetPath = `/reservations/${reservation.id}/edit`;
                      return (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link to={targetPath}>
                                <Button
                                  size="icon"
                                  className={cn(
                                    'h-8 w-8 relative shadow-sm ring-2 ring-offset-1',
                                    meta.bg,
                                    meta.ring,
                                  )}
                                >
                                  <ActionIcon className="w-4 h-4" />
                                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
                                </Button>
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent>⚡ {meta.label}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-3 py-2 border-t border-border flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          แสดง {startIdx + 1}-{Math.min(startIdx + pageSize, reservations.length)} จาก {reservations.length} รายการ
        </p>
        <div className="flex items-center gap-1">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 text-xs"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            ก่อนหน้า
          </Button>
          <span className="text-xs text-muted-foreground px-2">
            {currentPage} / {totalPages}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 text-xs"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            ถัดไป
          </Button>
        </div>
      </div>
    </div>
  );
}
