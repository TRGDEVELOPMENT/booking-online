import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  FileText,
  GitBranch,
  ShieldCheck,
  Users,
  Database,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

interface Section {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  items: string[];
  accent: string;
}

const sections: Section[] = [
  {
    icon: Building2,
    title: 'ระบบหลักและสถาปัตยกรรม',
    subtitle: 'Core Architecture',
    accent: 'text-slate-700',
    items: [
      'Multi-tenancy แยกข้อมูลตาม Company (BPK, LAC, ICCK, VPA)',
      'เลขที่ใบจองรันแยกตามสาขา รูปแบบ {PREFIX}-{YYMM}{5-digit}',
      'Row-Level Security (RLS) เข้มงวดทุกตาราง + IT Admin bypass',
      'Username = รหัสพนักงาน (Employee ID) ใช้ Login แทน Email',
      'Company Session Sync: บริษัทที่เลือกซิงค์เข้า profile เพื่อบังคับ RLS',
    ],
  },
  {
    icon: FileText,
    title: 'การจัดการใบจองรถยนต์',
    subtitle: 'Reservation Management',
    accent: 'text-[#2349bb]',
    items: [
      'สร้าง / แก้ไข / พิมพ์ใบจอง (A4, ฟอนต์ TH Sarabun New)',
      'เลือกรถแบบไดนามิก: Model → Sub Model → Color → Standard Price',
      'ค้นหาลูกค้าด้วย Tax ID เพื่อป้องกันข้อมูลซ้ำ (Search & Verify)',
      'แนบไฟล์เอกสาร (รูป/PDF) ใน bucket แยกตาม company_id',
      'Activity Log / Audit Trail แบบ JSONB (append-only)',
      'ลายน้ำ "ยกเลิก" สีแดง -35° บนใบจองที่ถูกยกเลิก',
    ],
  },
  {
    icon: GitBranch,
    title: 'Workflow & Approval',
    subtitle: '6 ขั้นตอนหลัก',
    accent: 'text-[#02681f]',
    items: [
      'ขั้นตอน: Draft → Confirmed → Payment → Review → Approval → Final',
      'Customer Confirmation: ยืนยันด้วย OTP หรือ Link (จำลองในระบบ)',
      'Approval Chain: Global Templates เทียบกับ Per-Reservation Override',
      'Cancellation Workflow: Sale → Supervisor → Manager',
      'Cashier ตรวจสอบการชำระเงิน, Supervisor ตรวจสอบ, Manager อนุมัติ',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Role-Based Access (RBAC)',
    subtitle: '6 บทบาทหลักในระบบ',
    accent: 'text-[#b51f19]',
    items: [
      'Sale: สร้าง/แก้ไขใบจอง, ซ่อนส่วน Finance/Review/Approval',
      'Sale Supervisor: ตรวจสอบ Section 11, อนุมัติ → Pending, ปฏิเสธ → Draft',
      'Sale Manager: อนุมัติ Section 12 เท่านั้น',
      'Cashier: แก้ไขเฉพาะ Section 10 (รายละเอียดการชำระเงิน)',
      'User Admin: จัดการผู้ใช้ภายใน Company/Branch ที่กำหนด',
      'IT Admin: ข้าม RLS, เข้าได้ทุกบริษัท, ลบ/แก้ไม่ได้',
    ],
  },
  {
    icon: Users,
    title: 'การจัดการผู้ใช้งาน',
    subtitle: 'User Management',
    accent: 'text-slate-700',
    items: [
      'ผู้ใช้งาน: เรียงตามสาขา → ชื่อ-สกุล, Position ดึงจากกลุ่มผู้ใช้งาน',
      'กลุ่มผู้ใช้งาน (User Groups): แสดงเป็น Table List',
      'กำหนดสิทธิ์ผู้ใช้งาน (Permission Matrix) แบบแก้ไขได้',
      'ทีมขาย (Sales Teams) + หัวหน้าทีม (Supervisor)',
      'สายอนุมัติใบจอง / สายอนุมัติการยกเลิก (รวมศูนย์)',
      'รหัสพนักงาน unique ต่อ Company และห้ามแก้ไขในโหมด Edit',
    ],
  },
  {
    icon: Database,
    title: 'ข้อมูลพื้นฐานและตั้งค่าระบบ',
    subtitle: 'Master Data & Settings',
    accent: 'text-slate-700',
    items: [
      'รถยนต์: Vehicle Types, Models, Sub Models, Colors (CSV Import/Export)',
      'เครื่องยนต์ / น้ำมันเชื้อเพลิง / ราคามาตรฐาน',
      'ของแถม (Freebies), อุปกรณ์ตกแต่ง (Accessories), สิทธิประโยชน์ (Benefits)',
      'นามสกุล (Surnames) เป็น Global ใช้ร่วมทุกบริษัท',
      'ลูกค้า (Customers), สาขา (Branches), งวดผ่อนชำระ',
      'สถานะใช้ Radio Group (Active/Inactive) แทน Dropdown',
    ],
  },
  {
    icon: BarChart3,
    title: 'รายงานและแดชบอร์ด',
    subtitle: 'Reports & Dashboard',
    accent: 'text-[#2349bb]',
    items: [
      'Dashboard สไตล์ Blue-Grey แสดง KPI Cards เป็นภาษาอังกฤษ',
      'รายงานการจองประจำเดือน (Monthly Reservations) — ค่าเริ่มต้น',
      'รายงานรอการอนุมัติ (Pending Approval)',
      'รายงานใบจองที่ถูกยกเลิก (Cancelled Reservations)',
      'มุมมอง "ใบจองรอยืนยันรับเงิน" สำหรับ Cashier',
    ],
  },
];

const workflowColors = [
  { label: 'Draft', color: '#000000' },
  { label: 'Confirmed', color: '#2349bb' },
  { label: 'Review', color: '#2b93d4' },
  { label: 'Approved', color: '#02681f' },
  { label: 'Cancelled', color: '#b51f19' },
];

export default function FunctionOverviewPage() {
  return (
    <>
      <Header title="ภาพรวมฟังก์ชันของระบบ" />
      <div className="container mx-auto py-8 px-4 max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">ภาพรวมฟังก์ชันของระบบ</h1>
              <p className="text-sm text-muted-foreground">Function Overview — Vehicle Reservation Management System</p>
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed max-w-4xl">
            ระบบจัดการใบจองรถยนต์แบบ Multi-tenant รองรับหลายบริษัท หลายสาขา
            ครอบคลุมตั้งแต่การสร้างใบจอง การยืนยันจากลูกค้า การตรวจสอบการชำระเงิน
            ไปจนถึงการอนุมัติและการยกเลิก พร้อมระบบสิทธิ์ตามบทบาท (RBAC) และการตรวจสอบย้อนหลัง (Audit Trail)
          </p>

          {/* Tech stack */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">React 18</Badge>
            <Badge variant="secondary">Vite 5</Badge>
            <Badge variant="secondary">TypeScript 5</Badge>
            <Badge variant="secondary">Tailwind CSS</Badge>
            <Badge variant="secondary">shadcn/ui</Badge>
            <Badge variant="secondary">Lovable Cloud</Badge>
          </div>

          {/* Workflow color legend */}
          <Card className="bg-muted/30">
            <CardContent className="py-4">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground">มาตรฐานสีสถานะ Workflow:</span>
                {workflowColors.map((w) => (
                  <div key={w.label} className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full border border-border"
                      style={{ backgroundColor: w.color }}
                    />
                    <span className="text-sm font-semibold" style={{ color: w.color }}>
                      {w.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sections grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.title} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Icon className={`w-5 h-5 ${section.accent}`} />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base leading-snug">{section.title}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">{section.subtitle}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.items.map((item, idx) => (
                      <li key={idx} className="flex gap-2 text-sm leading-relaxed">
                        <span className="block w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        <span className="text-foreground/90">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer note */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-5">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">หมายเหตุ:</span>{' '}
              หน้านี้เป็นเอกสารสรุปฟังก์ชันการทำงานภายในระบบ สำหรับใช้สื่อสารกับทีมพัฒนาและผู้ใช้งาน
              ฟีเจอร์ทั้งหมดที่แสดงได้ถูกพัฒนาและใช้งานจริงในระบบ Production แล้ว
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
