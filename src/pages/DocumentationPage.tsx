import { Button } from "@/components/ui/button";
import { FileDown, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DocumentationPage() {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Print Controls - Hidden when printing */}
      <div className="print:hidden sticky top-0 z-50 bg-background border-b border-border p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับ
          </Button>
          <Button onClick={handlePrint}>
            <FileDown className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Document Content */}
      <div className="max-w-5xl mx-auto p-8 print:p-0">
        {/* Cover Page */}
        <div className="text-center mb-16 print:mb-8 print:page-break-after">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            📋 สรุปโครงการระบบจองรถยนต์
          </h1>
          <h2 className="text-2xl text-muted-foreground mb-8">
            Car Reservation System
          </h2>
          <div className="inline-block bg-muted rounded-lg p-6 text-left">
            <p className="text-sm text-muted-foreground">วันที่จัดทำ: 23 มกราคม 2569</p>
            <p className="text-sm text-muted-foreground">เวอร์ชัน: 1.0</p>
            <p className="text-sm text-muted-foreground">สร้างโดย: Lovable AI</p>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="mb-12 print:page-break-after">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">📑 สารบัญ</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>1. สรุปจำนวน Screen ทั้งหมด</li>
            <li>2. User Flow Diagram</li>
            <li>3. Database Schema Diagram</li>
            <li>4. ประเมิน Man-Days</li>
            <li>5. Technology Stack</li>
            <li>6. User Roles & Permissions</li>
          </ul>
        </div>

        {/* Section 1: Screen Summary */}
        <section className="mb-12 print:page-break-after">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">1. สรุปจำนวน Screen ทั้งหมด</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <StatBox title="Authentication" count={1} color="bg-blue-100 text-blue-800" />
            <StatBox title="Dashboard" count={1} color="bg-green-100 text-green-800" />
            <StatBox title="ใบจองรถยนต์" count={6} color="bg-purple-100 text-purple-800" />
            <StatBox title="รายงาน" count={4} color="bg-orange-100 text-orange-800" />
            <StatBox title="ตั้งค่าระบบ" count={13} color="bg-pink-100 text-pink-800" />
            <StatBox title="Error Page" count={1} color="bg-gray-100 text-gray-800" />
          </div>

          <div className="bg-primary/10 rounded-lg p-6 text-center">
            <p className="text-3xl font-bold text-primary">26 Screens</p>
            <p className="text-muted-foreground">จำนวน Screen ทั้งหมด</p>
          </div>

          {/* Screen List Table */}
          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-2 text-left">#</th>
                  <th className="border p-2 text-left">หมวดหมู่</th>
                  <th className="border p-2 text-left">Screen</th>
                  <th className="border p-2 text-left">Path</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border p-2">1</td><td className="border p-2">Auth</td><td className="border p-2">Login</td><td className="border p-2 font-mono text-xs">/login</td></tr>
                <tr><td className="border p-2">2</td><td className="border p-2">Dashboard</td><td className="border p-2">Dashboard</td><td className="border p-2 font-mono text-xs">/</td></tr>
                <tr><td className="border p-2">3</td><td className="border p-2" rowSpan={6}>ใบจอง</td><td className="border p-2">รายการใบจอง</td><td className="border p-2 font-mono text-xs">/reservations</td></tr>
                <tr><td className="border p-2">4</td><td className="border p-2">สร้างใบจองใหม่</td><td className="border p-2 font-mono text-xs">/reservations/create</td></tr>
                <tr><td className="border p-2">5</td><td className="border p-2">แก้ไขใบจอง</td><td className="border p-2 font-mono text-xs">/reservations/:id/edit</td></tr>
                <tr><td className="border p-2">6</td><td className="border p-2">พิมพ์ใบจอง</td><td className="border p-2 font-mono text-xs">/reservations/:id/print</td></tr>
                <tr><td className="border p-2">7</td><td className="border p-2">ยกเลิกใบจอง</td><td className="border p-2 font-mono text-xs">/reservations/cancel</td></tr>
                <tr><td className="border p-2">8</td><td className="border p-2">รอรับชำระเงิน</td><td className="border p-2 font-mono text-xs">/reservations/pending-payment</td></tr>
                <tr><td className="border p-2">9</td><td className="border p-2" rowSpan={4}>รายงาน</td><td className="border p-2">รายงานประจำเดือน</td><td className="border p-2 font-mono text-xs">/reports/monthly</td></tr>
                <tr><td className="border p-2">10</td><td className="border p-2">รอการอนุมัติ</td><td className="border p-2 font-mono text-xs">/reports/pending-approval</td></tr>
                <tr><td className="border p-2">11</td><td className="border p-2">ใบจองที่ยกเลิก</td><td className="border p-2 font-mono text-xs">/reports/cancelled</td></tr>
                <tr><td className="border p-2">12</td><td className="border p-2">Default Report</td><td className="border p-2 font-mono text-xs">/reports</td></tr>
                <tr><td className="border p-2">13-25</td><td className="border p-2">ตั้งค่า</td><td className="border p-2">Master Data (13 หน้า)</td><td className="border p-2 font-mono text-xs">/settings/*</td></tr>
                <tr><td className="border p-2">26</td><td className="border p-2">Error</td><td className="border p-2">404 Not Found</td><td className="border p-2 font-mono text-xs">*</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: User Flow Diagram */}
        <section className="mb-12 print:page-break-after">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">2. User Flow Diagram</h2>
          
          <div className="bg-muted rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-4">2.1 Main Application Flow</h3>
            <div className="bg-background rounded p-4 overflow-x-auto">
              <pre className="text-xs leading-relaxed whitespace-pre">
{`
┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐
│   Login     │────▶│  Dashboard  │────▶│  Main Navigation    │
│  (เลือกบริษัท) │     │  (สรุปภาพรวม)  │     │                     │
└─────────────┘     └─────────────┘     └──────────┬──────────┘
                                                   │
                    ┌──────────────────────────────┼──────────────────────────────┐
                    │                              │                              │
                    ▼                              ▼                              ▼
          ┌─────────────────┐            ┌─────────────────┐            ┌─────────────────┐
          │  ใบจองรถยนต์      │            │     รายงาน       │            │   ตั้งค่าระบบ     │
          │  (6 หน้า)        │            │    (4 หน้า)      │            │   (13 หน้า)      │
          └────────┬────────┘            └────────┬────────┘            └────────┬────────┘
                   │                              │                              │
     ┌─────────────┼─────────────┐      ┌────────┴────────┐         ┌──────────┴──────────┐
     │             │             │      │                 │         │                     │
     ▼             ▼             ▼      ▼                 ▼         ▼                     ▼
 ┌───────┐   ┌─────────┐   ┌────────┐ ┌──────┐     ┌──────────┐  ┌────────┐         ┌────────┐
 │รายการ  │   │สร้างใหม่ │   │ยกเลิก   │ │ประจำเดือน│     │รอการอนุมัติ│  │รุ่นรถ    │         │ลูกค้า   │
 │ใบจอง   │   │แก้ไข/พิมพ์│   │รอชำระเงิน│ │ที่ยกเลิก │     │         │  │สี/ราคา  │         │ของแถม  │
 └───────┘   └─────────┘   └────────┘ └──────┘     └──────────┘  └────────┘         └────────┘
`}
              </pre>
            </div>
          </div>

          <div className="bg-muted rounded-lg p-6">
            <h3 className="font-semibold mb-4">2.2 Reservation Workflow (7 Steps)</h3>
            <div className="bg-background rounded p-4 overflow-x-auto">
              <pre className="text-xs leading-relaxed whitespace-pre">
{`
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│                              Reservation Workflow (7 ขั้นตอน)                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────┘

  Step 1          Step 2          Step 3          Step 4          Step 5          Step 6          Step 7
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ ข้อมูล   │────▶│ ข้อมูล   │────▶│ ราคา/   │────▶│ ยืนยัน   │────▶│ รับชำระ  │────▶│ Review  │────▶│ Approve │
│ รถยนต์   │     │ ลูกค้า   │     │ ของแถม  │     │ OTP/Link │     │ เงินมัดจำ │     │ หัวหน้า  │     │ ผู้จัดการ │
│ (Sale)  │     │ (Sale)  │     │ (Sale)  │     │ (Sale)  │     │(Cashier)│     │(Supv.)  │     │(Manager)│
└─────────┘     └─────────┘     └─────────┘     └─────────┘     └─────────┘     └─────────┘     └─────────┘
     │               │               │               │               │               │               │
     ▼               ▼               ▼               ▼               ▼               ▼               ▼
 ┌───────┐      ┌───────┐      ┌───────┐      ┌───────┐      ┌───────┐      ┌───────┐      ┌───────┐
 │ Draft │      │Pending│      │Pending│      │Confirm│      │ Paid  │      │Reviewed│     │Approved│
 │       │      │       │      │       │      │  ed   │      │       │      │        │     │        │
 └───────┘      └───────┘      └───────┘      └───────┘      └───────┘      └───────┘      └───────┘

                                              ┌─────────────────────────────────────────────────────┐
                                              │  ❌ สามารถยกเลิกได้ทุกขั้นตอน (ต้องระบุเหตุผล)          │
                                              │     - ไม่ผ่านสินเชื่อ                                   │
                                              │     - ลูกค้าไม่รับรถ                                    │
                                              │     - ลูกค้าเปลี่ยนใจ                                   │
                                              │     - ลูกค้ายกเลิกจอง                                  │
                                              └─────────────────────────────────────────────────────┘
`}
              </pre>
            </div>
          </div>
        </section>

        {/* Section 3: Database Schema */}
        <section className="mb-12 print:page-break-after">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">3. Database Schema Diagram</h2>
          
          <div className="bg-muted rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-4">3.1 Entity Relationship Diagram</h3>
            <div className="bg-background rounded p-4 overflow-x-auto">
              <pre className="text-xs leading-relaxed whitespace-pre">
{`
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    DATABASE SCHEMA (15 Tables)                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

                                          ┌──────────────┐
                                          │   profiles   │
                                          ├──────────────┤
                                          │ id (PK)      │
                                          │ user_id (FK) │◄─────────────┐
                                          │ company_id   │              │
                                          │ branch_id    │              │
                                          │ full_name    │              │
                                          └──────────────┘              │
                                                 │                      │
                                                 │                      │
                                          ┌──────────────┐       ┌──────────────┐
                                          │  user_roles  │       │  auth.users  │
                                          ├──────────────┤       │  (Supabase)  │
                                          │ id (PK)      │       └──────────────┘
                                          │ user_id (FK) │───────────────┘
                                          │ role (enum)  │
                                          └──────────────┘
                                                 │
                                                 │ role: sale | cashier | sale_supervisor | sale_manager | it
                                                 ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                         RESERVATIONS                                                      │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────┐                    ┌────────────────────────────────────┐
│   reservations     │                    │     reservation_attachments        │
├────────────────────┤                    ├────────────────────────────────────┤
│ id (PK)            │◄───────────────────│ reservation_id (FK)                │
│ document_number    │                    │ id (PK)                            │
│ company_id         │                    │ file_name, file_path               │
│ branch_id          │                    │ file_type, file_size               │
│ status             │                    │ uploaded_by                        │
│ customer_*         │                    └────────────────────────────────────┘
│ buyer_*            │
│ vehicle_type       │                    ┌────────────────────────────────────┐
│ model, submodel    │                    │         customers                  │
│ color, fuel_type   │                    ├────────────────────────────────────┤
│ list_price         │                    │ id (PK)                            │
│ discount, net_price│                    │ customer_id                        │
│ deposit_amount     │                    │ company_id                         │
│ freebies (JSONB)   │                    │ surname_id (FK) ──────────────────┐│
│ accessories (JSONB)│                    │ first_name, last_name             ││
│ benefits (JSONB)   │                    │ tax_id                            ││
│ confirmation_*     │                    │ address, phone, email             ││
│ review_*, approval_*│                   └────────────────────────────────────┘│
│ created_by         │                                                         │
└────────────────────┘                    ┌────────────────────────────────────┐│
                                          │         surnames                   ││
                                          ├────────────────────────────────────┤│
                                          │ id (PK)                            │◄┘
                                          │ description (นาย, นาง, นางสาว)      │
                                          │ status                             │
                                          └────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                         MASTER DATA                                                       │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  vehicle_types  │      │     models      │◄─────│   sub_models    │
├─────────────────┤      ├─────────────────┤      ├─────────────────┤
│ id (PK)         │      │ id (PK)         │      │ id (PK)         │
│ company_id      │      │ company_id      │      │ model_id (FK)   │
│ description     │      │ description     │      │ company_id      │
│ status          │      │ status          │      │ description     │
└─────────────────┘      └────────┬────────┘      │ status          │
                                  │               └─────────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│     colors      │      │ standard_prices │      │  engine_sizes   │
├─────────────────┤      ├─────────────────┤      ├─────────────────┤
│ id (PK)         │      │ id (PK)         │      │ id (PK)         │
│ model_id (FK)   │      │ model_id (FK)   │      │ company_id      │
│ sub_model_id(FK)│      │ sub_model_id(FK)│      │ description     │
│ company_id      │      │ company_id      │      │ status          │
│ description     │      │ price           │      └─────────────────┘
│ hex_color       │      │ status          │
│ status          │      └─────────────────┘
└─────────────────┘

┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│    freebies     │      │   accessories   │      │    benefits     │
├─────────────────┤      ├─────────────────┤      ├─────────────────┤
│ id (PK)         │      │ id (PK)         │      │ id (PK)         │
│ company_id      │      │ company_id      │      │ company_id      │
│ description     │      │ description     │      │ description     │
│ price           │      │ price           │      │ price           │
│ status          │      │ status          │      │ status          │
└─────────────────┘      └─────────────────┘      └─────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  All master data tables include company_id for Multi-Tenancy support                                     │
│  RLS Policies: Users can only access data from their own company using get_user_company_id(auth.uid())  │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
`}
              </pre>
            </div>
          </div>

          <div className="overflow-x-auto">
            <h3 className="font-semibold mb-4">3.2 Table Summary</h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-2 text-left">#</th>
                  <th className="border p-2 text-left">Table</th>
                  <th className="border p-2 text-left">Description</th>
                  <th className="border p-2 text-left">Multi-Tenant</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border p-2">1</td><td className="border p-2 font-mono">reservations</td><td className="border p-2">ข้อมูลใบจอง</td><td className="border p-2 text-center">✅</td></tr>
                <tr><td className="border p-2">2</td><td className="border p-2 font-mono">reservation_attachments</td><td className="border p-2">ไฟล์แนบใบจอง</td><td className="border p-2 text-center">✅</td></tr>
                <tr><td className="border p-2">3</td><td className="border p-2 font-mono">customers</td><td className="border p-2">ข้อมูลลูกค้า</td><td className="border p-2 text-center">✅</td></tr>
                <tr><td className="border p-2">4</td><td className="border p-2 font-mono">profiles</td><td className="border p-2">ข้อมูลผู้ใช้</td><td className="border p-2 text-center">✅</td></tr>
                <tr><td className="border p-2">5</td><td className="border p-2 font-mono">user_roles</td><td className="border p-2">บทบาทผู้ใช้</td><td className="border p-2 text-center">-</td></tr>
                <tr><td className="border p-2">6</td><td className="border p-2 font-mono">models</td><td className="border p-2">รุ่นรถ</td><td className="border p-2 text-center">✅</td></tr>
                <tr><td className="border p-2">7</td><td className="border p-2 font-mono">sub_models</td><td className="border p-2">รุ่นย่อย</td><td className="border p-2 text-center">✅</td></tr>
                <tr><td className="border p-2">8</td><td className="border p-2 font-mono">vehicle_types</td><td className="border p-2">ชนิดรถ</td><td className="border p-2 text-center">✅</td></tr>
                <tr><td className="border p-2">9</td><td className="border p-2 font-mono">colors</td><td className="border p-2">สี</td><td className="border p-2 text-center">✅</td></tr>
                <tr><td className="border p-2">10</td><td className="border p-2 font-mono">engine_sizes</td><td className="border p-2">ขนาดเครื่องยนต์</td><td className="border p-2 text-center">✅</td></tr>
                <tr><td className="border p-2">11</td><td className="border p-2 font-mono">standard_prices</td><td className="border p-2">ราคามาตรฐาน</td><td className="border p-2 text-center">✅</td></tr>
                <tr><td className="border p-2">12</td><td className="border p-2 font-mono">freebies</td><td className="border p-2">ของแถม</td><td className="border p-2 text-center">✅</td></tr>
                <tr><td className="border p-2">13</td><td className="border p-2 font-mono">accessories</td><td className="border p-2">อุปกรณ์เพิ่มเติม</td><td className="border p-2 text-center">✅</td></tr>
                <tr><td className="border p-2">14</td><td className="border p-2 font-mono">benefits</td><td className="border p-2">สิทธิ์ประโยชน์</td><td className="border p-2 text-center">✅</td></tr>
                <tr><td className="border p-2">15</td><td className="border p-2 font-mono">surnames</td><td className="border p-2">คำนำหน้าชื่อ</td><td className="border p-2 text-center">-</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: Man-Days Estimation */}
        <section className="mb-12 print:page-break-after">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">4. ประเมิน Man-Days</h2>
          
          <div className="bg-primary/5 rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-2">แนวทางพัฒนา</h3>
            <p className="text-muted-foreground">Lovable AI (Frontend) + Developer + Cursor AI (Backend)</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <h4 className="font-semibold text-blue-800 mb-2">🎨 Frontend</h4>
              <p className="text-3xl font-bold text-blue-600">4.75 วัน</p>
              <p className="text-sm text-blue-600">Lovable AI</p>
            </div>
            <div className="bg-green-50 rounded-lg p-6">
              <h4 className="font-semibold text-green-800 mb-2">⚙️ Backend</h4>
              <p className="text-3xl font-bold text-green-600">9.0 วัน</p>
              <p className="text-sm text-green-600">Dev + Cursor AI</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-6">
              <h4 className="font-semibold text-purple-800 mb-2">🔗 Integration</h4>
              <p className="text-3xl font-bold text-purple-600">2.5 วัน</p>
              <p className="text-sm text-purple-600">Testing & Bug Fix</p>
            </div>
          </div>

          <div className="bg-accent rounded-lg p-8 text-center mb-8">
            <p className="text-4xl font-bold text-accent-foreground">16.25 Man-Days</p>
            <p className="text-accent-foreground/70">รวมทั้งหมด (~3.5 สัปดาห์)</p>
          </div>

          <div className="overflow-x-auto">
            <h3 className="font-semibold mb-4">เปรียบเทียบกับการพัฒนาแบบดั้งเดิม</h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-2 text-left">วิธีการ</th>
                  <th className="border p-2 text-right">Man-Days</th>
                  <th className="border p-2 text-right">ระยะเวลา</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">เขียน Code เองทั้งหมด</td>
                  <td className="border p-2 text-right">~50 วัน</td>
                  <td className="border p-2 text-right">~2.5 เดือน</td>
                </tr>
                <tr className="bg-green-50 font-semibold">
                  <td className="border p-2">Lovable + Cursor AI</td>
                  <td className="border p-2 text-right">~16 วัน</td>
                  <td className="border p-2 text-right">~3.5 สัปดาห์</td>
                </tr>
                <tr className="bg-primary/10">
                  <td className="border p-2 font-semibold">ประหยัดได้</td>
                  <td className="border p-2 text-right font-semibold">~34 วัน</td>
                  <td className="border p-2 text-right font-semibold text-primary">68%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 5: Technology Stack */}
        <section className="mb-12 print:page-break-after">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">5. Technology Stack</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-muted rounded-lg p-6">
              <h3 className="font-semibold mb-4">🎨 Frontend</h3>
              <ul className="space-y-2 text-sm">
                <li>• React 18 + TypeScript</li>
                <li>• Vite (Build Tool)</li>
                <li>• Tailwind CSS + shadcn/ui</li>
                <li>• React Router DOM v6</li>
                <li>• React Query (TanStack)</li>
                <li>• Recharts (Charts)</li>
                <li>• Lucide React (Icons)</li>
              </ul>
            </div>
            <div className="bg-muted rounded-lg p-6">
              <h3 className="font-semibold mb-4">⚙️ Backend (Lovable Cloud)</h3>
              <ul className="space-y-2 text-sm">
                <li>• PostgreSQL Database</li>
                <li>• Row Level Security (RLS)</li>
                <li>• Edge Functions</li>
                <li>• Storage (File Upload)</li>
                <li>• Authentication (Email)</li>
                <li>• Real-time Subscriptions</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 6: User Roles */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">6. User Roles & Permissions</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-2 text-left">Role</th>
                  <th className="border p-2 text-left">ชื่อไทย</th>
                  <th className="border p-2 text-left">Permissions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2 font-mono">sale</td>
                  <td className="border p-2">พนักงานขาย</td>
                  <td className="border p-2">สร้าง/แก้ไขใบจอง, ยืนยันลูกค้า, อัพโหลดเอกสาร</td>
                </tr>
                <tr>
                  <td className="border p-2 font-mono">cashier</td>
                  <td className="border p-2">พนักงานการเงิน</td>
                  <td className="border p-2">รับชำระเงินมัดจำ, ดูรายการรอชำระ</td>
                </tr>
                <tr>
                  <td className="border p-2 font-mono">sale_supervisor</td>
                  <td className="border p-2">หัวหน้าฝ่ายขาย</td>
                  <td className="border p-2">Review ใบจอง, ดูรายงาน</td>
                </tr>
                <tr>
                  <td className="border p-2 font-mono">sale_manager</td>
                  <td className="border p-2">ผู้จัดการฝ่ายขาย</td>
                  <td className="border p-2">Approve/Reject ใบจอง, ดูรายงาน</td>
                </tr>
                <tr>
                  <td className="border p-2 font-mono">it</td>
                  <td className="border p-2">ผู้ดูแลระบบ</td>
                  <td className="border p-2">เข้าถึงทุกฟังก์ชัน, จัดการ Master Data</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground border-t pt-6 mt-12">
          <p>สร้างโดย Lovable AI - ระบบจองรถยนต์</p>
          <p>© 2569 Car Reservation System</p>
        </footer>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:page-break-after { page-break-after: always; }
          .print\\:mb-8 { margin-bottom: 2rem; }
          .print\\:p-0 { padding: 0; }
          @page { margin: 1.5cm; size: A4; }
        }
      `}</style>
    </div>
  );
}

function StatBox({ title, count, color }: { title: string; count: number; color: string }) {
  return (
    <div className={`rounded-lg p-4 ${color}`}>
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-sm">{title}</p>
    </div>
  );
}
