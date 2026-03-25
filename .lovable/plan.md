

## ออกแบบระบบ Reservation Activity Log (ประวัติการดำเนินการใบจอง)

### แนวคิด

สร้างตาราง `reservation_activity_logs` เพื่อบันทึกทุกการกระทำที่เกิดขึ้นกับใบจองแต่ละรายการ แบบ append-only (เพิ่มเรื่อยๆ ไม่ลบ/แก้ไข) เหมือนระบบ Audit Trail

### 1. โครงสร้างตาราง

```text
reservation_activity_logs
├── id (uuid, PK)
├── reservation_id (uuid, NOT NULL) — อ้างอิงใบจอง
├── action (text, NOT NULL) — ประเภทการกระทำ เช่น:
│     'created', 'updated', 'confirmed',
│     'cashier_verified', 'reviewed', 'approved',
│     'submitted_for_approval', 'printed',
│     'cancel_requested', 'cancel_reviewed', 'cancel_approved',
│     'assignment_changed', 'attachment_uploaded', 'attachment_deleted'
├── action_label (text) — คำอธิบายภาษาไทย เช่น "สร้างใบจอง", "อนุมัติ"
├── details (jsonb) — รายละเอียดเพิ่มเติม เช่น field ที่เปลี่ยน, ค่าเดิม/ค่าใหม่, หมายเหตุ
├── performed_by (uuid, NOT NULL) — user_id ผู้ดำเนินการ
├── performed_by_name (text) — ชื่อผู้ดำเนินการ (denormalized เพื่อความเร็ว)
├── company_id (text, NOT NULL)
├── branch_id (text)
├── created_at (timestamptz, DEFAULT now())
```

### 2. RLS Policy

- SELECT: กรองตาม `company_id` (ทุก authenticated user ในบริษัทเดียวกันดูได้)
- INSERT: กรองตาม `company_id` (user ในบริษัทเดียวกันเพิ่มได้)
- UPDATE/DELETE: ไม่อนุญาต (append-only)

### 3. การบันทึก Log ในโค้ด

สร้าง helper function `logReservationActivity()` เรียกใช้ทุกครั้งที่มีการกระทำสำคัญ:

```text
logReservationActivity({
  reservationId, action, actionLabel, details, companyId, branchId
})
```

เรียกใช้ในจุดต่างๆ ของ `ReservationEdit.tsx` และ `ReservationCreate.tsx`:
- บันทึกร่าง / อัปเดต
- ยืนยันสัญญา (OTP/Link)
- ตรวจสอบการชำระเงิน
- ตรวจสอบรายละเอียด (review)
- อนุมัติ / ไม่อนุมัติ
- ส่งขออนุมัติ
- ขอยกเลิก / ตรวจสอบยกเลิก / อนุมัติยกเลิก
- อัปโหลด/ลบไฟล์แนบ
- เปลี่ยนสายอนุมัติ

### 4. แสดงผล Activity Log ในหน้า ReservationEdit

เพิ่มส่วน "ประวัติการดำเนินการ" ที่ด้านล่างหน้าแก้ไขใบจอง:
- แสดงเป็น Timeline (เรียงจากใหม่ไปเก่า)
- แต่ละรายการแสดง: วันเวลา, ผู้ดำเนินการ, การกระทำ, รายละเอียด

### ไฟล์ที่ต้องสร้าง/แก้ไข

| ไฟล์ | การดำเนินการ |
|---|---|
| `supabase/migrations/` | สร้างตาราง `reservation_activity_logs` + RLS |
| `src/hooks/useReservationActivityLog.ts` | สร้างใหม่ — hook สำหรับบันทึกและดึง log |
| `src/components/reservations/ActivityTimeline.tsx` | สร้างใหม่ — component แสดง timeline |
| `src/pages/ReservationEdit.tsx` | เพิ่มการเรียก log ในทุกจุดที่มี action + แสดง timeline |
| `src/pages/ReservationCreate.tsx` | เพิ่มการเรียก log ตอนสร้างใบจอง |

