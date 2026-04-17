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
            <p className="text-sm text-muted-foreground">วันที่จัดทำ: 27 มีนาคม 2569</p>
            <p className="text-sm text-muted-foreground">เวอร์ชัน: 3.0</p>
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
            <li>7. เอกสารประกอบโครงการ</li>
          </ul>
        </div>

        {/* Section 1: Screen Summary */}
        <section className="mb-12 print:page-break-after">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">1. สรุปจำนวน Screen ทั้งหมด</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatBox title="Authentication" count={1} color="bg-blue-100 text-blue-800" />
            <StatBox title="Dashboard" count={1} color="bg-green-100 text-green-800" />
            <StatBox title="ใบจองรถยนต์" count={10} color="bg-purple-100 text-purple-800" />
            <StatBox title="รายงาน" count={3} color="bg-orange-100 text-orange-800" />
            <StatBox title="ตั้งค่าระบบ" count={12} color="bg-pink-100 text-pink-800" />
            <StatBox title="จัดการผู้ใช้งาน" count={6} color="bg-indigo-100 text-indigo-800" />
            <StatBox title="เอกสาร/เครื่องมือ" count={6} color="bg-cyan-100 text-cyan-800" />
            <StatBox title="Error Page" count={1} color="bg-gray-100 text-gray-800" />
          </div>

          <div className="bg-primary/10 rounded-lg p-6 text-center">
            <p className="text-3xl font-bold text-primary">40 Screens</p>
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
                
                {/* ใบจอง */}
                <tr><td className="border p-2">3</td><td className="border p-2" rowSpan={10}>ใบจองรถยนต์</td><td className="border p-2">รายการใบจอง</td><td className="border p-2 font-mono text-xs">/reservations</td></tr>
                <tr><td className="border p-2">4</td><td className="border p-2">สร้างใบจองใหม่</td><td className="border p-2 font-mono text-xs">/reservations/create</td></tr>
                <tr><td className="border p-2">5</td><td className="border p-2">แก้ไขใบจอง</td><td className="border p-2 font-mono text-xs">/reservations/:id/edit</td></tr>
                <tr><td className="border p-2">6</td><td className="border p-2">พิมพ์ใบจอง</td><td className="border p-2 font-mono text-xs">/reservations/:id/print</td></tr>
                <tr><td className="border p-2">7</td><td className="border p-2">ยกเลิกใบจอง</td><td className="border p-2 font-mono text-xs">/reservations/cancel</td></tr>
                <tr><td className="border p-2">8</td><td className="border p-2">รายละเอียดยกเลิก</td><td className="border p-2 font-mono text-xs">/reservations/:id/cancel-detail</td></tr>
                <tr><td className="border p-2">9</td><td className="border p-2">พิมพ์ใบยกเลิก</td><td className="border p-2 font-mono text-xs">/reservations/:id/cancel-print</td></tr>
                <tr><td className="border p-2">10</td><td className="border p-2">รอรับชำระเงิน</td><td className="border p-2 font-mono text-xs">/reservations/pending-payment</td></tr>
                <tr><td className="border p-2">11</td><td className="border p-2">เปลี่ยนสายอนุมัติใบจอง</td><td className="border p-2 font-mono text-xs">/reservations/approval-chain</td></tr>
                <tr><td className="border p-2">12</td><td className="border p-2">เปลี่ยนสายอนุมัติยกเลิก</td><td className="border p-2 font-mono text-xs">/reservations/cancel-approval-chain</td></tr>

                {/* รายงาน */}
                <tr><td className="border p-2">13</td><td className="border p-2" rowSpan={3}>รายงาน</td><td className="border p-2">รายงานประจำเดือน</td><td className="border p-2 font-mono text-xs">/reports/monthly</td></tr>
                <tr><td className="border p-2">14</td><td className="border p-2">รอการอนุมัติ</td><td className="border p-2 font-mono text-xs">/reports/pending-approval</td></tr>
                <tr><td className="border p-2">15</td><td className="border p-2">ใบจองที่ยกเลิก</td><td className="border p-2 font-mono text-xs">/reports/cancelled</td></tr>

                {/* ตั้งค่า */}
                <tr><td className="border p-2">16</td><td className="border p-2" rowSpan={12}>ตั้งค่าระบบ</td><td className="border p-2">หน้าหลักตั้งค่า</td><td className="border p-2 font-mono text-xs">/settings</td></tr>
                <tr><td className="border p-2">17</td><td className="border p-2">ชนิดรถยนต์</td><td className="border p-2 font-mono text-xs">/settings/vehicle-types</td></tr>
                <tr><td className="border p-2">18</td><td className="border p-2">รุ่น (Model)</td><td className="border p-2 font-mono text-xs">/settings/models</td></tr>
                <tr><td className="border p-2">19</td><td className="border p-2">รุ่นย่อย (Sub Model)</td><td className="border p-2 font-mono text-xs">/settings/submodels</td></tr>
                <tr><td className="border p-2">20</td><td className="border p-2">สี</td><td className="border p-2 font-mono text-xs">/settings/colors</td></tr>
                <tr><td className="border p-2">21</td><td className="border p-2">ขนาดเครื่องยนต์</td><td className="border p-2 font-mono text-xs">/settings/engine-sizes</td></tr>
                <tr><td className="border p-2">22</td><td className="border p-2">ประเภทเชื้อเพลิง</td><td className="border p-2 font-mono text-xs">/settings/fuel-types</td></tr>
                <tr><td className="border p-2">23</td><td className="border p-2">ราคามาตรฐาน</td><td className="border p-2 font-mono text-xs">/settings/standard-prices</td></tr>
                <tr><td className="border p-2">24</td><td className="border p-2">ของแถม</td><td className="border p-2 font-mono text-xs">/settings/freebies</td></tr>
                <tr><td className="border p-2">25</td><td className="border p-2">อุปกรณ์ตกแต่ง</td><td className="border p-2 font-mono text-xs">/settings/accessories</td></tr>
                <tr><td className="border p-2">26</td><td className="border p-2">สิทธิประโยชน์</td><td className="border p-2 font-mono text-xs">/settings/benefits</td></tr>
                <tr><td className="border p-2">27</td><td className="border p-2">คำนำหน้าชื่อ / สาขา</td><td className="border p-2 font-mono text-xs">/settings/surnames, /settings/branches</td></tr>

                {/* จัดการผู้ใช้งาน */}
                <tr><td className="border p-2">28</td><td className="border p-2" rowSpan={6}>จัดการผู้ใช้งาน</td><td className="border p-2">ผู้ใช้งาน</td><td className="border p-2 font-mono text-xs">/settings/users</td></tr>
                <tr><td className="border p-2">29</td><td className="border p-2">กลุ่มผู้ใช้งาน</td><td className="border p-2 font-mono text-xs">/settings/user-groups</td></tr>
                <tr><td className="border p-2">30</td><td className="border p-2">กำหนดสิทธิ์ผู้ใช้งาน</td><td className="border p-2 font-mono text-xs">/settings/user-permissions</td></tr>
                <tr><td className="border p-2">31</td><td className="border p-2">ปรับปรุงสายอนุมัติใบจอง</td><td className="border p-2 font-mono text-xs">/settings/approval-chain</td></tr>
                <tr><td className="border p-2">32</td><td className="border p-2">ปรับปรุงสายอนุมัติยกเลิก</td><td className="border p-2 font-mono text-xs">/settings/cancel-approval-chain</td></tr>
                <tr><td className="border p-2">33</td><td className="border p-2">ปรับปรุงทีมขาย</td><td className="border p-2 font-mono text-xs">/settings/sales-teams</td></tr>

                {/* เอกสาร */}
                <tr><td className="border p-2">34</td><td className="border p-2" rowSpan={6}>เอกสาร/เครื่องมือ</td><td className="border p-2">เอกสารโครงการ</td><td className="border p-2 font-mono text-xs">/docs</td></tr>
                <tr><td className="border p-2">35</td><td className="border p-2">Requirement Spec</td><td className="border p-2 font-mono text-xs">/requirement-spec</td></tr>
                <tr><td className="border p-2">36</td><td className="border p-2">Design Document</td><td className="border p-2 font-mono text-xs">/design-doc</td></tr>
                <tr><td className="border p-2">37</td><td className="border p-2">API Specification</td><td className="border p-2 font-mono text-xs">/api-spec</td></tr>
                <tr><td className="border p-2">38</td><td className="border p-2">ภาพรวมฟังก์ชัน</td><td className="border p-2 font-mono text-xs">/function-overview</td></tr>
                <tr><td className="border p-2">39</td><td className="border p-2">Test Cases</td><td className="border p-2 font-mono text-xs">/test-cases</td></tr>

                <tr><td className="border p-2">40</td><td className="border p-2">Error</td><td className="border p-2">404 Not Found</td><td className="border p-2 font-mono text-xs">*</td></tr>
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
                    ┌─────────────────┬─────────────┼──────────────┬────────────────┐
                    │                 │             │              │                │
                    ▼                 ▼             ▼              ▼                ▼
          ┌──────────────┐  ┌──────────────┐ ┌──────────┐ ┌──────────────┐ ┌──────────────┐
          │ ใบจองรถยนต์   │  │   รายงาน     │ │ ตั้งค่า   │ │ จัดการผู้ใช้   │ │   เอกสาร    │
          │ (10 หน้า)     │  │  (3 หน้า)    │ │ (12 หน้า) │ │  (6 หน้า)    │ │  (6 หน้า)   │
          └──────────────┘  └──────────────┘ └──────────┘ └──────────────┘ └──────────────┘
`}
              </pre>
            </div>
          </div>

          <div className="bg-muted rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-4">2.2 Reservation Workflow (6 ขั้นตอน)</h3>
            <div className="bg-background rounded p-4 overflow-x-auto">
              <pre className="text-xs leading-relaxed whitespace-pre">
{`
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│                              Reservation Workflow (6 ขั้นตอน)                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────┘

  Step 1                Step 2                Step 3               Step 4             Step 5              Step 6
┌───────────┐         ┌───────────┐         ┌───────────┐        ┌───────────┐      ┌───────────┐       ┌───────────┐
│ สร้างสัญญา │────────▶│ ยืนยันสัญญา │────────▶│ รับชำระเงิน │───────▶│ ตรวจสอบ    │─────▶│ อนุมัติ    │──────▶│ อนุมัติแล้ว │
│   จอง     │         │   จอง     │         │  มัดจำ     │        │ รายละเอียด │      │ ใบจอง     │       │           │
│ (Sale)    │         │ (Sale)    │         │ (Cashier)  │        │ (Supv.)   │      │ (Manager) │       │           │
└───────────┘         └───────────┘         └───────────┘        └───────────┘      └───────────┘       └───────────┘
     │                      │                     │                    │                  │
     ▼                      ▼                     ▼                    ▼                  ▼
 ┌────────┐            ┌─────────┐           ┌────────┐          ┌─────────┐         ┌──────────┐
 │สีดำ    │            │สีน้ำเงิน  │           │สีฟ้า    │          │สีฟ้า     │         │สีเขียว    │
 │ #000   │            │ #2349bb │           │ #2b93d4│          │ #2b93d4 │         │ #02681f  │
 └────────┘            └─────────┘           └────────┘          └─────────┘         └──────────┘

                                              ┌─────────────────────────────────────────────────────┐
                                              │  ❌ สามารถยกเลิกได้ทุกขั้นตอน (ต้องระบุเหตุผล)          │
                                              │  ยกเลิกแล้ว แสดงสีแดง #b51f19                         │
                                              └─────────────────────────────────────────────────────┘
`}
              </pre>
            </div>
          </div>

          <div className="bg-muted rounded-lg p-6">
            <h3 className="font-semibold mb-4">2.3 Cancellation Workflow (3 ขั้นตอน)</h3>
            <div className="bg-background rounded p-4 overflow-x-auto">
              <pre className="text-xs leading-relaxed whitespace-pre">
{`
  Step 1                Step 2                Step 3
┌───────────┐         ┌───────────┐         ┌───────────┐
│ ขอยกเลิก   │────────▶│ ตรวจสอบ    │────────▶│ อนุมัติ    │
│ (Sale)    │         │ (Supv.)   │         │ (Manager) │
└───────────┘         └───────────┘         └───────────┘
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
│                                    DATABASE SCHEMA (23 Tables)                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

                                          ┌──────────────┐
                                          │   profiles   │
                                          ├──────────────┤
                                          │ id (PK)      │
                                          │ user_id (FK) │◄─────────────┐
                                          │ company_id   │              │
                                          │ branch_id    │              │
                                          │ full_name    │              │
                                          │ supervisor_id│              │
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
                                                 │ role: sale | cashier | sale_supervisor | sale_manager | it | user_admin
                                                 ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                         RESERVATIONS                                                      │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────┐       ┌──────────────────────────┐       ┌────────────────────────────┐
│   reservations     │       │ reservation_attachments   │       │ reservation_activity_logs   │
├────────────────────┤       ├──────────────────────────┤       ├────────────────────────────┤
│ id (PK)            │◄──────│ reservation_id (FK)       │       │ reservation_id (FK)         │
│ document_number    │       │ file_name, file_path      │       │ action, action_label        │
│ company_id         │◄──────────────────────────────────────────│ performed_by                │
│ branch_id          │       └──────────────────────────┘       │ performed_by_name           │
│ status             │                                          │ details (JSONB)             │
│ customer_*         │       ┌──────────────────────────┐       └────────────────────────────┘
│ buyer_*            │       │ reservation_assignments   │
│ vehicle info       │◄──────│ reservation_id (FK)       │
│ pricing            │       │ assigned_user_id          │
│ confirmation_*     │       │ stage                     │
│ review/approval_*  │       │ assigned_by               │
│ cancel_*           │       └──────────────────────────┘
│ cashier_*          │
└────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    SALES TEAMS & APPROVAL                                                │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐      ┌──────────────────────┐      ┌──────────────────────────────┐
│   sales_teams   │◄─────│  sales_team_members   │      │  team_approval_templates      │
├─────────────────┤      ├──────────────────────┤      ├──────────────────────────────┤
│ id (PK)         │      │ team_id (FK)          │      │ team_id (FK)                  │
│ company_id      │◄──────────────────────────────────│ assigned_user_id              │
│ branch_id       │      │ member_user_id        │      │ stage                         │
│ team_name       │      └──────────────────────┘      └──────────────────────────────┘
│ supervisor_id   │
│ status          │      ┌──────────────────────────────────┐
└─────────────────┘      │  team_cancel_approval_templates   │
                         ├──────────────────────────────────┤
                         │ team_id (FK)                      │
                         │ assigned_user_id                  │
                         │ stage, branch_id                  │
                         └──────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                         MASTER DATA                                                       │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  vehicle_types  │      │     models      │◄─────│   sub_models    │
├─────────────────┤      ├─────────────────┤      ├─────────────────┤
│ id, company_id  │      │ id, company_id  │      │ id, model_id(FK)│
│ description     │      │ description     │      │ company_id      │
└─────────────────┘      └────────┬────────┘      │ description     │
                                  │               └─────────────────┘
                   ┌──────────────┼──────────────┐
                   ▼              ▼              ▼
          ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
          │   colors     │ │standard_price│ │ engine_sizes │
          └──────────────┘ └──────────────┘ └──────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  freebies    │  │ accessories  │  │  benefits    │  │  surnames    │  │  branches    │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘

┌──────────────────┐  ┌────────────────────┐
│   customers      │  │ document_sequences │
├──────────────────┤  ├────────────────────┤
│ surname_id (FK)  │  │ prefix, year_month │
│ company_id       │  │ last_number        │
│ tax_id           │  └────────────────────┘
└──────────────────┘

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
                <tr><td className="border p-2">3</td><td className="border p-2 font-mono">reservation_activity_logs</td><td className="border p-2">ประวัติการดำเนินการใบจอง (Audit Trail)</td><td className="border p-2 text-center">✅</td></tr>
                <tr><td className="border p-2">4</td><td className="border p-2 font-mono">reservation_assignments</td><td className="border p-2">ผู้รับผิดชอบแต่ละขั้นตอน</td><td className="border p-2 text-center">✅</td></tr>
                <tr><td className="border p-2">5</td><td className="border p-2 font-mono">customers</td><td className="border p-2">ข้อมูลลูกค้า</td><td className="border p-2 text-center">✅</td></tr>
                <tr><td className="border p-2">6</td><td className="border p-2 font-mono">profiles</td><td className="border p-2">ข้อมูลผู้ใช้</td><td className="border p-2 text-center">✅</td></tr>
                <tr><td className="border p-2">7</td><td className="border p-2 font-mono">user_roles</td><td className="border p-2">ตำแหน่งผู้ใช้</td><td className="border p-2 text-center">-</td></tr>
                <tr><td className="border p-2">8</td><td className="border p-2 font-mono">branches</td><td className="border p-2">สาขา</td><td className="border p-2 text-center">✅</td></tr>
                <tr><td className="border p-2">9</td><td className="border p-2 font-mono">sales_teams</td><td className="border p-2">ทีมขาย</td><td className="border p-2 text-center">✅</td></tr>
                <tr><td className="border p-2">10</td><td className="border p-2 font-mono">sales_team_members</td><td className="border p-2">สมาชิกทีมขาย</td><td className="border p-2 text-center">-</td></tr>
                <tr><td className="border p-2">11</td><td className="border p-2 font-mono">team_approval_templates</td><td className="border p-2">เทมเพลตสายอนุมัติใบจอง</td><td className="border p-2 text-center">✅</td></tr>
                <tr><td className="border p-2">12</td><td className="border p-2 font-mono">team_cancel_approval_templates</td><td className="border p-2">เทมเพลตสายอนุมัติยกเลิก</td><td className="border p-2 text-center">✅</td></tr>
                <tr><td className="border p-2">13</td><td className="border p-2 font-mono">models</td><td className="border p-2">รุ่นรถ</td><td className="border p-2 text-center">✅</td></tr>
                <tr><td className="border p-2">14</td><td className="border p-2 font-mono">sub_models</td><td className="border p-2">รุ่นย่อย</td><td className="border p-2 text-center">✅</td></tr>
                <tr><td className="border p-2">15</td><td className="border p-2 font-mono">vehicle_types</td><td className="border p-2">ชนิดรถ</td><td className="border p-2 text-center">✅</td></tr>
                <tr><td className="border p-2">16</td><td className="border p-2 font-mono">colors</td><td className="border p-2">สี</td><td className="border p-2 text-center">✅</td></tr>
                <tr><td className="border p-2">17</td><td className="border p-2 font-mono">engine_sizes</td><td className="border p-2">ขนาดเครื่องยนต์</td><td className="border p-2 text-center">✅</td></tr>
                <tr><td className="border p-2">18</td><td className="border p-2 font-mono">standard_prices</td><td className="border p-2">ราคามาตรฐาน</td><td className="border p-2 text-center">✅</td></tr>
                <tr><td className="border p-2">19</td><td className="border p-2 font-mono">freebies</td><td className="border p-2">ของแถม</td><td className="border p-2 text-center">✅</td></tr>
                <tr><td className="border p-2">20</td><td className="border p-2 font-mono">accessories</td><td className="border p-2">อุปกรณ์เพิ่มเติม</td><td className="border p-2 text-center">✅</td></tr>
                <tr><td className="border p-2">21</td><td className="border p-2 font-mono">benefits</td><td className="border p-2">สิทธิ์ประโยชน์</td><td className="border p-2 text-center">✅</td></tr>
                <tr><td className="border p-2">22</td><td className="border p-2 font-mono">surnames</td><td className="border p-2">คำนำหน้าชื่อ</td><td className="border p-2 text-center">-</td></tr>
                <tr><td className="border p-2">23</td><td className="border p-2 font-mono">document_sequences</td><td className="border p-2">ลำดับเลขเอกสาร</td><td className="border p-2 text-center">-</td></tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 overflow-x-auto">
            <h3 className="font-semibold mb-4">3.3 Database Functions</h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-2 text-left">Function</th>
                  <th className="border p-2 text-left">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border p-2 font-mono">generate_customer_id(p_company_id)</td><td className="border p-2">สร้างรหัสลูกค้าอัตโนมัติ</td></tr>
                <tr><td className="border p-2 font-mono">generate_document_number(p_branch_id, p_company_id)</td><td className="border p-2">สร้างเลขที่เอกสารอัตโนมัติ</td></tr>
                <tr><td className="border p-2 font-mono">get_next_customer_no(p_company_id)</td><td className="border p-2">ลำดับถัดไปของลูกค้า</td></tr>
                <tr><td className="border p-2 font-mono">get_user_company_id(_user_id)</td><td className="border p-2">ดึง company_id ของผู้ใช้</td></tr>
                <tr><td className="border p-2 font-mono">has_role(_user_id, _role)</td><td className="border p-2">ตรวจสอบตำแหน่งผู้ใช้ (Security Definer)</td></tr>
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
              <p className="text-3xl font-bold text-blue-600">10.0 วัน</p>
              <p className="text-sm text-blue-600">Lovable AI</p>
            </div>
            <div className="bg-green-50 rounded-lg p-6">
              <h4 className="font-semibold text-green-800 mb-2">⚙️ Backend</h4>
              <p className="text-3xl font-bold text-green-600">14.0 วัน</p>
              <p className="text-sm text-green-600">Dev + Cursor AI</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-6">
              <h4 className="font-semibold text-purple-800 mb-2">🔗 Integration</h4>
              <p className="text-3xl font-bold text-purple-600">5.5 วัน</p>
              <p className="text-sm text-purple-600">Testing & Bug Fix</p>
            </div>
          </div>

          <div className="bg-accent rounded-lg p-8 text-center mb-8">
            <p className="text-4xl font-bold text-accent-foreground">29.5 Man-Days</p>
            <p className="text-accent-foreground/70">รวมทั้งหมด (~6 สัปดาห์) — ประเมินจาก 25 ฟังก์ชัน</p>
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
                  <td className="border p-2 text-right">~75 วัน</td>
                  <td className="border p-2 text-right">~3.5 เดือน</td>
                </tr>
                <tr className="bg-green-50 font-semibold">
                  <td className="border p-2">Lovable + Cursor AI</td>
                  <td className="border p-2 text-right">~29.5 วัน</td>
                  <td className="border p-2 text-right">~6 สัปดาห์</td>
                </tr>
                <tr className="bg-primary/10">
                  <td className="border p-2 font-semibold">ประหยัดได้</td>
                  <td className="border p-2 text-right font-semibold">~45.5 วัน</td>
                  <td className="border p-2 text-right font-semibold text-primary">61%</td>
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
                <li>• XLSX (Export Excel)</li>
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
        <section className="mb-12 print:page-break-after">
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
                  <td className="border p-2">Review/ตรวจสอบใบจอง, ดูรายงาน</td>
                </tr>
                <tr>
                  <td className="border p-2 font-mono">sale_manager</td>
                  <td className="border p-2">ผู้จัดการฝ่ายขาย</td>
                  <td className="border p-2">Approve/Reject ใบจอง, ดูรายงาน</td>
                </tr>
                <tr>
                  <td className="border p-2 font-mono">user_admin</td>
                  <td className="border p-2">ผู้ดูแลผู้ใช้งาน</td>
                  <td className="border p-2">จัดการผู้ใช้งาน, กลุ่มผู้ใช้, สิทธิ์, สายอนุมัติ, ทีมขาย</td>
                </tr>
                <tr>
                  <td className="border p-2 font-mono">it</td>
                  <td className="border p-2">ผู้ดูแลระบบ</td>
                  <td className="border p-2">เข้าถึงทุกฟังก์ชัน, จัดการ Master Data, จัดการผู้ใช้งาน</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 7: Project Documents */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">7. เอกสารประกอบโครงการ</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-2 text-left">เอกสาร</th>
                  <th className="border p-2 text-left">Path</th>
                  <th className="border p-2 text-left">รูปแบบ</th>
                  <th className="border p-2 text-left">รายละเอียด</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">เอกสารโครงการ</td>
                  <td className="border p-2 font-mono text-xs">/docs</td>
                  <td className="border p-2">หน้าเว็บ + PDF</td>
                  <td className="border p-2">สรุปภาพรวมโครงการ, Schema, Man-Days</td>
                </tr>
                <tr>
                  <td className="border p-2">Requirement Spec</td>
                  <td className="border p-2 font-mono text-xs">/requirement-spec</td>
                  <td className="border p-2">หน้าเว็บ + DOCX</td>
                  <td className="border p-2">ข้อกำหนดระบบ, Workflow, Functional Req</td>
                </tr>
                <tr>
                  <td className="border p-2">Design Document</td>
                  <td className="border p-2 font-mono text-xs">/design-doc</td>
                  <td className="border p-2">หน้าเว็บ + DOCX</td>
                  <td className="border p-2">UI/UX, Architecture, Database Design</td>
                </tr>
                <tr>
                  <td className="border p-2">API Specification</td>
                  <td className="border p-2 font-mono text-xs">/api-spec</td>
                  <td className="border p-2">หน้าเว็บ</td>
                  <td className="border p-2">คู่มือ API Endpoints, Data Model</td>
                </tr>
                <tr>
                  <td className="border p-2">Function Overview</td>
                  <td className="border p-2 font-mono text-xs">/function-overview</td>
                  <td className="border p-2">หน้าเว็บ + Excel</td>
                  <td className="border p-2">ประเมิน 25 ฟังก์ชัน, Score Map</td>
                </tr>
                <tr>
                  <td className="border p-2">Test Cases</td>
                  <td className="border p-2 font-mono text-xs">/test-cases</td>
                  <td className="border p-2">หน้าเว็บ</td>
                  <td className="border p-2">ชุดทดสอบระบบ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground border-t pt-6 mt-12">
          <p>สร้างโดย Lovable AI - ระบบจองรถยนต์</p>
          <p>© 2569 Car Reservation System v3.0</p>
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
