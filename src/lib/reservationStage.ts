import type { DatabaseReservation } from '@/types/database-reservation';

export type StageRole = 'sale' | 'cashier' | 'sale_supervisor' | 'sale_manager' | 'done' | 'cancelled';

/**
 * Determine which role is responsible for the current workflow stage of a reservation.
 *
 * Workflow:
 * 1. สร้างสัญญาจอง        -> sale
 * 2. ยืนยันสัญญาจอง       -> sale
 * 3. ตรวจสอบการชำระเงิน  -> cashier
 * 4. ตรวจสอบรายละเอียด    -> sale_supervisor
 * 5. อนุมัติ               -> sale_manager
 * 6. พิมพ์เอกสาร (เสร็จ)  -> sale (done)
 */
export function getCurrentStageRole(r: DatabaseReservation): StageRole {
  if (r.status === 'cancelled' || r.cancel_approval_status === 'approved') return 'cancelled';

  // Approved -> ready for sale to print
  if (r.approval_status === 'approved') return 'done';

  // Reviewed by supervisor, awaiting manager approval
  if (r.review_status === 'reviewed') return 'sale_manager';

  // Cashier verified payment (status pending or cashier_user_id set), awaiting supervisor review
  if (r.status === 'pending' || (r as any).cashier_user_id) return 'sale_supervisor';

  // Customer confirmed, awaiting cashier verification
  if (r.confirmation_status === 'confirmed') return 'cashier';

  // Draft / pending confirmation -> sale
  return 'sale';
}

/**
 * Map a stage role to the user-facing role(s) that should see the actionable icon.
 */
export function isActionableForRole(stageRole: StageRole, userRole: string): boolean {
  if (stageRole === 'cancelled') return false;
  if (stageRole === 'done') return userRole === 'sale'; // print step
  return stageRole === userRole;
}
