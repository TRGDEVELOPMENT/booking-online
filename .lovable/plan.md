

## ปรับปรุง Flow การยกเลิกใบจอง — เพิ่ม branch_id ควบคุมสายอนุมัติ

### แผนการดำเนินงาน

#### 1. สร้างตาราง `team_cancel_approval_templates` (Database Migration)

```text
team_cancel_approval_templates
├── id (uuid, PK)
├── team_id (uuid, NOT NULL) — อ้างอิง sales_teams
├── stage (text, NOT NULL) — 'cancel_review' / 'cancel_approval'
├── assigned_user_id (uuid, NOT NULL)
├── company_id (text, NOT NULL)
├── branch_id (text, NOT NULL) — ดึงจาก sales_teams.branch_id เพื่อกรองตามสาขา
├── created_at / updated_at
└── UNIQUE(team_id, stage)
```

RLS: เหมือน `team_approval_templates` (admin/it สามารถ CRUD, authenticated สามารถ SELECT) โดยกรอง `company_id`

#### 2. ปรับหน้า Settings > ปรับปรุงสายอนุมัติยกเลิกใบจอง (`SettingsCancelApprovalChainPage.tsx`)

เขียนใหม่ให้เหมือน `SettingsApprovalChainPage.tsx`:
- เลือกทีมขาย → แสดงข้อมูลทีม (สาขา, หัวหน้าทีม, สมาชิก)
- กำหนดผู้รับผิดชอบ 2 ขั้นตอน:
  - ตรวจสอบการยกเลิก (`cancel_review`) — role: `sale_supervisor`
  - อนุมัติยกเลิก (`cancel_approval`) — role: `sale_manager`
- **กรอง dropdown ผู้ใช้งานตาม branch_id ของทีมขาย**
- บันทึกลง `team_cancel_approval_templates` พร้อม `branch_id` จากทีมที่เลือก

#### 3. สร้างหน้า ใบจองรถยนต์ > เปลี่ยนสายอนุมัติยกเลิกใบจอง (`CancelApprovalChainPage.tsx`)

สร้างหน้าใหม่ (เหมือน `ApprovalChainPage.tsx`):
- แสดงเฉพาะใบจองที่ `cancel_request_status = 'requested'` และ `cancel_approval_status != 'approved'`
- ตาราง: เลขที่เอกสาร, ชื่อลูกค้า, สาขา, เหตุผลยกเลิก, สถานะ
- 2 คอลัมน์ dropdown: ผู้ตรวจสอบ, ผู้อนุมัติ
- **บันทึกลง `reservation_assignments` ด้วย stage `cancel_review` / `cancel_approval` พร้อม `branch_id` จากใบจอง**

#### 4. เพิ่มเมนูและ Route

- เพิ่มเมนู "เปลี่ยนสายอนุมัติยกเลิกใบจอง" ในกลุ่มใบจองรถยนต์ (Sidebar)
- เพิ่ม Route `/reservations/cancel-approval-chain` → `CancelApprovalChainPage`

---

### รายละเอียดทางเทคนิค

**ไฟล์ที่ต้องแก้ไข/สร้าง:**

| ไฟล์ | การดำเนินการ |
|---|---|
| `supabase/migrations/` | สร้างตาราง `team_cancel_approval_templates` (มี `branch_id`) + RLS |
| `src/pages/settings/SettingsCancelApprovalChainPage.tsx` | เขียนใหม่ — เทมเพลตระดับทีม พร้อม branch_id |
| `src/pages/CancelApprovalChainPage.tsx` | สร้างใหม่ — เปลี่ยนสายอนุมัติรายใบจอง พร้อม branch_id |
| `src/components/layout/Sidebar.tsx` | เพิ่มเมนู "เปลี่ยนสายอนุมัติยกเลิกใบจอง" |
| `src/App.tsx` | เพิ่ม Route `/reservations/cancel-approval-chain` |

**หลักการใช้ branch_id:**
- ตาราง `team_cancel_approval_templates`: เก็บ `branch_id` จาก `sales_teams.branch_id` ตอนบันทึกเทมเพลต
- ตาราง `reservation_assignments` (stage: `cancel_review`/`cancel_approval`): เก็บ `branch_id` จาก `reservations.branch_id` ตอนมอบหมายรายใบจอง
- กรอง dropdown ผู้ใช้งานตาม `branch_id` เพื่อให้แสดงเฉพาะคนในสาขาเดียวกัน

