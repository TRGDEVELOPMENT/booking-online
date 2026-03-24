

## แผนการออกแบบ: ระบบมอบหมายผู้รับผิดชอบและปรับสถานะใบจอง (ปรับปรุง RLS)

### สรุป

สร้างระบบให้ User Admin มอบหมายผู้รับผิดชอบแต่ละขั้นตอนของใบจอง และปรับสถานะได้ โดย RLS จะกรองตาม **company_id + branch_id** เพราะแต่ละสาขามีชุดผู้ดำเนินการแยกกัน

---

### 1. ตารางใหม่: `reservation_assignments`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| reservation_id | uuid NOT NULL | FK → reservations |
| stage | text NOT NULL | `cashier`, `review`, `approval` |
| assigned_user_id | uuid NOT NULL | ผู้ถูกมอบหมาย |
| assigned_by | uuid | User Admin ที่มอบหมาย |
| assigned_at | timestamptz | default now() |
| company_id | text NOT NULL | สำหรับ RLS |
| branch_id | text | สำหรับ RLS — กรองตามสาขา |

- **Unique constraint**: `(reservation_id, stage)` — 1 คนต่อ 1 ขั้นตอน
- **RLS**: กรองตาม `company_id = get_user_company_id(auth.uid())` **AND** `branch_id` ตรงกับ branch ของ user (หรือ null สำหรับ user ที่เห็นได้ทุกสาขา)

#### RLS Policies

```sql
-- SELECT: เห็นเฉพาะ company + branch ตัวเอง
CREATE POLICY "View assignments by company and branch"
ON reservation_assignments FOR SELECT USING (
  company_id = get_user_company_id(auth.uid())
  AND (
    branch_id IS NULL 
    OR branch_id = (SELECT branch_id FROM profiles WHERE user_id = auth.uid())
    OR (SELECT branch_id FROM profiles WHERE user_id = auth.uid()) IS NULL
  )
);

-- INSERT/UPDATE/DELETE: เฉพาะ user_admin หรือ it
CREATE POLICY "Admin can manage assignments"
ON reservation_assignments FOR ALL USING (
  company_id = get_user_company_id(auth.uid())
  AND (has_role(auth.uid(), 'user_admin') OR has_role(auth.uid(), 'it'))
);
```

> หมายเหตุ: ถ้า profile ของ user มี `branch_id = NULL` หมายถึงเห็นได้ทุกสาขา (เช่น Manager ระดับบริษัท)

---

### 2. เพิ่มคอลัมน์ในตาราง `reservations`

- `cashier_user_id` (uuid) — ผู้ตรวจสอบการชำระเงินจริง
- `cashier_user_name` (text) — ชื่อผู้ตรวจสอบ

(reviewer/approver มีคอลัมน์ `reviewed_by`, `approved_by` อยู่แล้ว)

---

### 3. RLS สำหรับ profiles — เพิ่ม policy ให้ query ผู้ใช้ในสาขาเดียวกัน

ปัจจุบัน profiles มี RLS ให้เห็นเฉพาะตัวเอง ต้องเพิ่ม policy ให้ user_admin/it เห็น profiles ของ user ใน company เดียวกัน เพื่อเลือกมอบหมายได้:

```sql
CREATE POLICY "Admin can view company profiles"
ON profiles FOR SELECT USING (
  company_id = get_user_company_id(auth.uid())
  AND (has_role(auth.uid(), 'user_admin') OR has_role(auth.uid(), 'it'))
);
```

เพิ่ม policy บน `user_roles` ให้ admin อ่านได้ เพื่อกรอง user ตาม role:

```sql
CREATE POLICY "Admin can view company user roles"
ON user_roles FOR SELECT USING (
  has_role(auth.uid(), 'user_admin') OR has_role(auth.uid(), 'it')
);
```

---

### 4. UI Changes

#### 4.1 Admin Panel ในหน้า ReservationEdit (เฉพาะ user_admin/it)

- แสดงกล่อง "มอบหมายผู้รับผิดชอบ" มี 3 dropdown:
  - ตรวจสอบชำระเงิน → เลือกจาก users ที่มี role `cashier` + **สาขาเดียวกับใบจอง**
  - ตรวจสอบใบจอง → เลือกจาก users ที่มี role `sale_supervisor` + **สาขาเดียวกัน**
  - อนุมัติ → เลือกจาก users ที่มี role `sale_manager` + **สาขาเดียวกัน**
- ปุ่มปรับสถานะ + ช่องหมายเหตุ

#### 4.2 WorkflowSteps — แสดงชื่อผู้รับผิดชอบใต้แต่ละ step

#### 4.3 ReservationList — ตัวกรอง "ผู้รับผิดชอบ" (optional, phase 2)

---

### 5. Flow การทำงาน

```text
Sale (สาขา A) สร้างใบจอง → branch_id = A
         ↓
User Admin เปิดใบจอง → เห็น Admin Panel
         ↓
Query users WHERE company_id = X AND branch_id = A AND role = 'cashier'
         ↓
มอบหมาย Cashier สาขา A, Supervisor สาขา A, Manager สาขา A
         ↓
แต่ละคนเข้าระบบ → เห็นเฉพาะใบจองของสาขาตัวเอง
```

---

### 6. ไฟล์ที่ต้องแก้ไข

1. **Migration SQL** — สร้างตาราง `reservation_assignments` + RLS, เพิ่มคอลัมน์ใน reservations, เพิ่ม RLS บน profiles/user_roles
2. **`src/pages/ReservationEdit.tsx`** — เพิ่ม Admin Panel section
3. **`src/components/reservations/WorkflowSteps.tsx`** — แสดงชื่อผู้รับผิดชอบ
4. **`src/types/database-reservation.ts`** — เพิ่ม fields ใหม่
5. **Hook ใหม่** `src/hooks/useReservationAssignments.ts` — CRUD assignments

