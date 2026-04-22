

## Update Function Overview Page

ปรับปรุงหน้า Function Overview (`/function-overview`) ให้สะท้อนฟีเจอร์ปัจจุบันของระบบทั้งหมดที่พัฒนาเพิ่มเติมไปแล้ว เช่น Multi-tenancy, Role-based workflow, Approval Chain, Cancellation flow, Sales Team, IT Admin protections ฯลฯ

### สิ่งที่จะอัปเดต

หน้า `src/pages/FunctionOverviewPage.tsx` จะถูกจัดกลุ่มเนื้อหาใหม่เป็น 7 หมวดหลัก พร้อมไอคอนและคำอธิบายภาษาไทย:

1. **ระบบหลักและสถาปัตยกรรม (Core Architecture)**
   - Multi-tenancy แยกข้อมูลตาม Company (BPK, LAC, ICCK, VPA)
   - Branch-specific document numbering `{PREFIX}-{YYMM}{5-digit}`
   - RLS เข้มงวดทุกตาราง + IT Admin bypass
   - Username = Employee ID (login ด้วยรหัสพนักงาน)

2. **การจัดการใบจองรถยนต์ (Reservation Management)**
   - สร้าง/แก้ไข/พิมพ์ใบจอง (A4, TH Sarabun)
   - Dynamic Vehicle Selection: Model → Sub Model → Color → Price
   - Customer Search & Verify (ป้องกันลูกค้าซ้ำด้วย Tax ID)
   - Attachment system (ไฟล์แนบใน bucket แยก company)
   - Activity Log / Audit Trail (JSONB append-only)

3. **Workflow & Approval (6 ขั้นตอน)**
   - Draft → Confirmed → Payment → Review → Approval → Final
   - Customer Confirmation: OTP / Link
   - Approval Chain (Global Templates vs Per-Reservation Override)
   - Cancellation Workflow: Sale → Supervisor → Manager (พร้อม watermark)

4. **Role-Based Access (8 บทบาท)**
   - Sale, Sale Supervisor, Sale Manager, Cashier, User Admin, IT Admin
   - แสดงตารางสิทธิ์ของแต่ละบทบาทในแต่ละ Section ของใบจอง
   - IT Admin ลบ/แก้ไม่ได้ + เข้าได้ทุก company/branch

5. **การจัดการผู้ใช้งาน (User Management)**
   - Users, User Groups (table view), Permission Matrix
   - Sales Teams, Approval Chain, Cancel Approval Chain
   - Branch filter + เรียงตาม Branch → Full Name
   - Position column ดึงจาก User Groups

6. **Master Data & Settings**
   - Vehicle Types, Models, Sub Models, Colors (CSV Import/Export)
   - Engine Sizes, Fuel Types, Standard Prices
   - Freebies, Accessories, Benefits, Surnames (global)
   - Customers, Branches, Installment Periods

7. **รายงานและแดชบอร์ด (Reports & Dashboard)**
   - Dashboard Blue-Grey แสดง KPI cards
   - รายงาน: Monthly / Pending Approval / Cancelled
   - Cashier Pending Payments view

### รูปแบบการแสดงผล

- ใช้ Card grid (3 คอลัมน์ใน desktop, 1 คอลัมน์ใน mobile)
- แต่ละหมวดเป็น Card พร้อม Lucide icon + bullet list ของฟีเจอร์
- เพิ่ม Section บนสุด: หัวข้อ + คำอธิบายโครงการ + Tech Stack badges (React, Vite, Tailwind, Lovable Cloud)
- ใช้สีตาม Workflow standards: Draft (black), Confirmed (#2349bb), Approved (#02681f), Cancelled (#b51f19)
- ใช้ Poppins font ตาม design system

### ไฟล์ที่จะแก้ไข

- `src/pages/FunctionOverviewPage.tsx` — เขียนใหม่ทั้งหน้าให้สะท้อนสถานะปัจจุบันของระบบ

ไม่มีการแก้ไข database, edge functions หรือไฟล์อื่น ๆ — เป็นการอัปเดตเอกสารภายในแอปเท่านั้น

