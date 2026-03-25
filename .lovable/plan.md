

## สรุปความต้องการ

แยกหน้า "ปรับปรุงสายอนุมัติใบจอง" ออกเป็น 2 หน้าที่มีจุดประสงค์ต่างกัน:

1. **เมนูจัดการผู้ใช้งาน > ปรับปรุงสายอนุมัติใบจอง** (`/settings/approval-chain`)
   - ตั้งค่า **เทมเพลตสายอนุมัติ** ระดับทีมขาย (ไม่ใช่ระดับใบจอง)
   - เมื่อสร้างใบจองใหม่ในอนาคต ระบบจะดึงค่าจากเทมเพลตนี้ไปใช้อัตโนมัติ
   - UI: เลือกทีมขาย → กำหนดผู้รับผิดชอบ 3 ขั้นตอน (แคชเชียร์, หัวหน้าทีมขาย, ผู้จัดการฝ่ายขาย) ให้ทั้งทีม

2. **เมนูใบจองรถยนต์ > ปรับปรุงสายอนุมัติ** (`/reservations/approval-chain`)
   - แก้ไขสายอนุมัติ **เฉพาะใบจองที่มีอยู่แล้ว** และยังไม่ได้รับการอนุมัติขั้นสุดท้าย
   - UI: ตารางรายการใบจอง (เหมือนเดิม) พร้อม dropdown เลือกผู้รับผิดชอบแต่ละใบ

---

## แผนการดำเนินงาน

### 1. สร้างตาราง `team_approval_templates` (Database Migration)

ตารางใหม่เก็บเทมเพลตสายอนุมัติระดับทีมขาย:

```text
team_approval_templates
├── id (uuid, PK)
├── team_id (uuid, NOT NULL) — อ้างอิง sales_teams
├── stage (text, NOT NULL) — 'cashier' / 'review' / 'approval'
├── assigned_user_id (uuid, NOT NULL)
├── company_id (text, NOT NULL)
├── created_at / updated_at
└── UNIQUE(team_id, stage)
```

RLS: เหมือน `reservation_assignments` (admin/it สามารถ CRUD, authenticated สามารถ SELECT)

### 2. สร้างหน้า Settings Approval Chain ใหม่ (`/settings/approval-chain`)

แก้ไขไฟล์ `src/pages/settings/SettingsApprovalChainPage.tsx` ให้เป็นหน้าจัดการเทมเพลต:

- **UI**: เลือกทีมขาย → แสดง 3 ขั้นตอน (แคชเชียร์, หัวหน้าทีมขาย, ผู้จัดการฝ่ายขาย)
- แต่ละขั้นตอนมี dropdown เลือกผู้ใช้งานที่มี role ตรงกัน (กรองตามสาขาของทีม)
- บันทึกลง `team_approval_templates`
- แสดงข้อมูลทีม (สาขา, หัวหน้าทีม, จำนวนสมาชิก)
- ไม่แสดงรายการใบจอง (เพราะเป็นการตั้งค่าระดับทีม ไม่ใช่ระดับใบจอง)

### 3. ปรับหน้า Reservation Approval Chain (`/reservations/approval-chain`)

แก้ไข `src/pages/ApprovalChainPage.tsx`:

- **กรองเฉพาะใบจองที่ยังไม่อนุมัติ**: เพิ่มเงื่อนไข `approval_status != 'approved'`
- ลบ Sales Team selector ออก (ไม่จำเป็น เพราะหน้านี้ทำงานระดับใบจองแต่ละใบ)
- เปลี่ยน subtitle เป็น "ปรับปรุงผู้ตรวจสอบและอนุมัติใบจองแต่ละรายการ"
- ยังคง dropdown เลือกผู้รับผิดชอบแต่ละใบจอง (upsert ลง `reservation_assignments` เหมือนเดิม)

### 4. (อนาคต) Auto-assign เมื่อสร้างใบจองใหม่

เมื่อสร้างใบจอง ระบบจะตรวจสอบว่าผู้สร้างอยู่ทีมขายใด → ดึงเทมเพลตจาก `team_approval_templates` → สร้าง `reservation_assignments` อัตโนมัติ (จะดำเนินการในขั้นตอนถัดไป)

---

## รายละเอียดทางเทคนิค

**ไฟล์ที่ต้องแก้ไข/สร้าง:**
- `supabase/migrations/` — สร้างตาราง `team_approval_templates`
- `src/pages/settings/SettingsApprovalChainPage.tsx` — เขียนใหม่เป็นหน้าจัดการเทมเพลตระดับทีม
- `src/pages/ApprovalChainPage.tsx` — ลบ Sales Team filter, กรองเฉพาะใบจองที่ยังไม่อนุมัติ

