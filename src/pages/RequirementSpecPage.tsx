import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Shield, Database, Users, GitBranch, Activity, Palette, BarChart3 } from 'lucide-react';

const RequirementSpecPage = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Requirement Specification</h1>
        <p className="text-lg text-muted-foreground">เอกสารข้อกำหนดความต้องการระบบ — ระบบจองรถยนต์ v2.0</p>
        <p className="text-sm text-muted-foreground">วันที่: 27 มีนาคม 2569</p>
      </div>

      {/* 1. Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> 1. บทนำ (Introduction)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">เอกสารฉบับนี้เป็นข้อกำหนดความต้องการระบบ (Requirement Specification) ของระบบจองรถยนต์ (Car Reservation System) ซึ่งเป็นระบบสำหรับบริหารจัดการกระบวนการจองรถยนต์ตั้งแต่การสร้างใบจอง การยืนยันสัญญา การตรวจสอบการชำระเงิน จนถึงการอนุมัติและการยกเลิก</p>

          <div>
            <h3 className="font-semibold mb-2">1.1 วัตถุประสงค์ (Objectives)</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>เพื่อจัดการกระบวนการจองรถยนต์แบบครบวงจร (End-to-End Workflow)</li>
              <li>เพื่อรองรับการทำงานแบบ Multi-Company และ Multi-Branch</li>
              <li>เพื่อควบคุมสิทธิ์การเข้าถึงตามตำแหน่ง (Role-Based Access Control)</li>
              <li>เพื่อสร้างระบบสายอนุมัติที่ยืดหยุ่นและปรับแต่งได้ตามทีมขายและสาขา</li>
              <li>เพื่อเก็บประวัติการดำเนินการ (Audit Trail) ทุกขั้นตอน</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">1.2 ขอบเขตระบบ (Scope)</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>ระบบจัดการใบจองรถยนต์ — สร้าง แก้ไข ยืนยัน อนุมัติ ยกเลิก พิมพ์</li>
              <li>ระบบจัดการข้อมูลหลัก (Master Data) — รุ่นรถ สี ราคา ของแถม อุปกรณ์เสริม</li>
              <li>ระบบจัดการลูกค้า — ข้อมูลส่วนบุคคลและนิติบุคคล</li>
              <li>ระบบรายงาน — รายงานประจำเดือน รอการอนุมัติ ใบจองที่ยกเลิก</li>
              <li>ระบบจัดการผู้ใช้งาน — ตำแหน่ง สิทธิ์ ทีมขาย สายอนุมัติ</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">1.3 บริษัทที่รองรับ (Supported Companies)</h3>
            <Table>
              <TableHeader><TableRow><TableHead className="w-20">รหัส</TableHead><TableHead>ชื่อบริษัท</TableHead><TableHead>หมายเหตุ</TableHead></TableRow></TableHeader>
              <TableBody>
                {[['BPK','BIZPK','แบรนด์หลัก'],['LAC','LAC','บริษัทในเครือ'],['ICCK','ICCK','บริษัทในเครือ'],['VPA','VPA','บริษัทในเครือ']].map(([c,n,r])=>(
                  <TableRow key={c}><TableCell className="font-mono">{c}</TableCell><TableCell>{n}</TableCell><TableCell className="text-muted-foreground">{r}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 2. Functional Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> 2. Functional Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 2.1 Auth */}
          <div>
            <h3 className="font-semibold mb-2">2.1 Authentication & Authorization (6 Roles)</h3>
            <Table>
              <TableHeader><TableRow><TableHead className="w-32">Role</TableHead><TableHead className="w-40">ชื่อภาษาไทย</TableHead><TableHead>สิทธิ์การใช้งาน</TableHead></TableRow></TableHeader>
              <TableBody>
                {[
                  ['it','IT Admin','เข้าถึงทุกฟังก์ชัน ทุกบริษัท ทุกสาขา รวมถึงลบข้อมูล'],
                  ['user_admin','ผู้ดูแลระบบ','จัดการผู้ใช้ ตั้งค่าระบบ เฉพาะบริษัท/สาขาที่ได้รับมอบหมาย'],
                  ['sale_manager','ผู้จัดการฝ่ายขาย','อนุมัติ/ปฏิเสธใบจอง ดูรายงาน'],
                  ['sale_supervisor','หัวหน้าทีมขาย','ตรวจสอบรายละเอียดใบจอง ดูรายงาน'],
                  ['sale','ที่ปรึกษาการขาย','สร้าง/แก้ไขใบจอง ยืนยันลูกค้า อัพโหลดเอกสาร'],
                  ['cashier','พนักงานการเงิน','รับชำระเงินมัดจำ ตรวจสอบการชำระเงิน'],
                ].map(([r,n,p])=>(
                  <TableRow key={r}><TableCell className="font-mono">{r}</TableCell><TableCell>{n}</TableCell><TableCell className="text-muted-foreground">{p}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator />

          {/* 2.2 Workflow */}
          <div>
            <h3 className="font-semibold mb-2">2.2 Workflow การจองรถยนต์ (6 ขั้นตอน)</h3>
            <Table>
              <TableHeader><TableRow><TableHead className="w-14">ลำดับ</TableHead><TableHead className="w-44">ขั้นตอน</TableHead><TableHead className="w-36">ผู้รับผิดชอบ</TableHead><TableHead>รายละเอียด</TableHead></TableRow></TableHeader>
              <TableBody>
                {[
                  ['1','สร้างสัญญาจอง','Sale','กรอกข้อมูลลูกค้า รถ ราคา ของแถม อุปกรณ์เสริม สิทธิประโยชน์'],
                  ['2','ยืนยันสัญญาจอง','ลูกค้า','ลูกค้ายืนยันผ่าน OTP หรือ Link'],
                  ['3','ตรวจสอบการชำระเงิน','Cashier','รับชำระเงินมัดจำ บันทึกรายละเอียดการชำระ'],
                  ['4','ตรวจสอบรายละเอียด','Sale Supervisor','ตรวจสอบความถูกต้องของใบจอง อนุมัติ/ปฏิเสธ'],
                  ['5','อนุมัติ','Sale Manager','อนุมัติขั้นสุดท้าย อนุมัติ/ปฏิเสธพร้อมหมายเหตุ'],
                  ['6','พิมพ์/ลงนาม','Sale','พิมพ์ใบจองฉบับสมบูรณ์ ลงนามโดยผู้เกี่ยวข้อง'],
                ].map(([n,s,r,d])=>(
                  <TableRow key={n}><TableCell className="text-center">{n}</TableCell><TableCell className="font-medium">{s}</TableCell><TableCell>{r}</TableCell><TableCell className="text-muted-foreground">{d}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator />

          {/* 2.3 Cancel Workflow */}
          <div>
            <h3 className="font-semibold mb-2">2.3 Workflow การยกเลิกใบจอง (3 ขั้นตอน)</h3>
            <Table>
              <TableHeader><TableRow><TableHead className="w-14">ลำดับ</TableHead><TableHead className="w-44">ขั้นตอน</TableHead><TableHead className="w-36">ผู้รับผิดชอบ</TableHead><TableHead>รายละเอียด</TableHead></TableRow></TableHeader>
              <TableBody>
                {[
                  ['1','บันทึกขอยกเลิก','Sale','บันทึกเหตุผลการยกเลิก ส่งคำขอ'],
                  ['2','ตรวจสอบการขอยกเลิก','Sale Supervisor','ตรวจสอบเหตุผลและรายละเอียด อนุมัติ/ปฏิเสธ'],
                  ['3','อนุมัติยกเลิก','Sale Manager','อนุมัติขั้นสุดท้าย เปลี่ยนสถานะเป็นยกเลิก'],
                ].map(([n,s,r,d])=>(
                  <TableRow key={n}><TableCell className="text-center">{n}</TableCell><TableCell className="font-medium">{s}</TableCell><TableCell>{r}</TableCell><TableCell className="text-muted-foreground">{d}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator />

          {/* 2.4 Approval Chain */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2"><GitBranch className="h-4 w-4" /> 2.4 ระบบสายอนุมัติ (Approval Chain)</h3>
            <div className="space-y-2 text-muted-foreground">
              <p><strong className="text-foreground">ระบบรองรับการตั้งค่าสายอนุมัติ 2 ระดับ:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>ระดับเทมเพลตทีม (Team Template)</strong> — ตั้งค่าผู้รับผิดชอบเริ่มต้นในแต่ละทีมขาย ใช้อัตโนมัติเมื่อสร้างใบจองใหม่</li>
                <li><strong>ระดับรายการใบจอง (Individual Override)</strong> — ปรับเปลี่ยนผู้รับผิดชอบเป็นรายกรณี สำหรับใบจองที่ยังไม่ได้รับอนุมัติ</li>
              </ul>
              <p className="font-semibold text-foreground">ทั้งสองระดับมีการบังคับใช้ branch_id ในการกรองรายชื่อผู้ใช้งานและควบคุมสิทธิ์</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2.5 Screen List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" /> 2.5 รายการหน้าจอทั้งหมด (31 Screens)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { title: 'Authentication & Dashboard', items: [['1','Login','/login','เลือกบริษัท + Login'],['2','Dashboard','/','KPI Cards + Charts']] },
            { title: 'ใบจองรถยนต์ (8 Screens)', items: [
              ['3','รายการใบจอง','/reservations','รายการ + Filter + สีสถานะ'],
              ['4','สร้างใบจองใหม่','/reservations/create','ฟอร์มสร้าง + Auto Doc No.'],
              ['5','แก้ไขใบจอง','/reservations/:id/edit','Workflow 6 ขั้นตอน + Activity Log'],
              ['6','พิมพ์ใบจอง','/reservations/:id/print','Print Preview'],
              ['7','ยกเลิกใบจอง','/reservations/cancel','ค้นหา + ยกเลิก + เหตุผล'],
              ['8','รายละเอียดยกเลิก','/reservations/:id/cancel-detail','Read-only'],
              ['9','พิมพ์ใบยกเลิก','/reservations/:id/cancel-print','Print Preview'],
              ['10','รอรับชำระเงิน','/reservations/pending-payment','Cashier Mode'],
            ]},
            { title: 'สายอนุมัติ (4 Screens)', items: [
              ['11','เปลี่ยนสายอนุมัติใบจอง','/reservations/approval-chain','ระดับรายใบจอง'],
              ['12','เปลี่ยนสายอนุมัติยกเลิก','/reservations/cancel-approval-chain','ระดับรายใบจอง'],
              ['13','ตั้งค่าสายอนุมัติ (Template)','/settings/approval-chain','ระดับทีม'],
              ['14','ตั้งค่าสายอนุมัติยกเลิก','/settings/cancel-approval-chain','ระดับทีม'],
            ]},
            { title: 'รายงาน (3 Screens)', items: [
              ['15','รายงานประจำเดือน','/reports/monthly','Filter เดือน/ปี'],
              ['16','รอการอนุมัติ','/reports/pending-approval','Approve/Reject'],
              ['17','ใบจองที่ยกเลิก','/reports/cancelled','รายงานยกเลิก'],
            ]},
          ].map(section => (
            <div key={section.title}>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">{section.title}</h4>
              <Table>
                <TableHeader><TableRow><TableHead className="w-10">#</TableHead><TableHead>Screen</TableHead><TableHead>Path</TableHead><TableHead>หมายเหตุ</TableHead></TableRow></TableHeader>
                <TableBody>
                  {section.items.map(([n,s,p,h]) => (
                    <TableRow key={n}><TableCell className="text-center">{n}</TableCell><TableCell className="font-medium">{s}</TableCell><TableCell className="font-mono text-xs">{p}</TableCell><TableCell className="text-muted-foreground">{h}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 3. Data Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" /> 3. Data Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="font-semibold">3.1 Database Schema (23 ตาราง)</h3>
          <Table>
            <TableHeader><TableRow><TableHead className="w-10">#</TableHead><TableHead>Table</TableHead><TableHead>Description</TableHead><TableHead>Multi-Tenant</TableHead></TableRow></TableHeader>
            <TableBody>
              {[
                ['1','reservations','ข้อมูลใบจอง (หลัก)','company_id'],
                ['2','reservation_attachments','ไฟล์แนบใบจอง','company_id'],
                ['3','reservation_activity_logs','ประวัติการดำเนินการ (Audit)','company_id'],
                ['4','reservation_assignments','สายอนุมัติรายใบจอง','company_id + branch_id'],
                ['5','customers','ข้อมูลลูกค้า','company_id'],
                ['6','profiles','ข้อมูลผู้ใช้','company_id'],
                ['7','user_roles','ตำแหน่งผู้ใช้','—'],
                ['8','models','รุ่นรถ','company_id'],
                ['9','sub_models','รุ่นย่อย','company_id'],
                ['10','vehicle_types','ชนิดรถ','company_id'],
                ['11','colors','สีรถ + Hex Color','company_id'],
                ['12','engine_sizes','ขนาดเครื่องยนต์','company_id'],
                ['13','standard_prices','ราคามาตรฐาน','company_id'],
                ['14','freebies','ของแถม','company_id'],
                ['15','accessories','อุปกรณ์เพิ่มเติม','company_id'],
                ['16','benefits','สิทธิ์ประโยชน์','company_id'],
                ['17','surnames','คำนำหน้าชื่อ','—'],
                ['18','branches','สาขา + Doc Prefix','company_id'],
                ['19','sales_teams','ทีมขาย','company_id'],
                ['20','sales_team_members','สมาชิกทีมขาย','ผ่าน team_id'],
                ['21','team_approval_templates','เทมเพลตสายอนุมัติ','company_id'],
                ['22','team_cancel_approval_templates','เทมเพลตสายอนุมัติยกเลิก','company_id + branch_id'],
                ['23','document_sequences','ลำดับเลขเอกสาร','prefix'],
              ].map(([n,t,d,m]) => (
                <TableRow key={n}><TableCell className="text-center">{n}</TableCell><TableCell className="font-mono text-xs">{t}</TableCell><TableCell className="text-muted-foreground">{d}</TableCell><TableCell><Badge variant="outline">{m}</Badge></TableCell></TableRow>
              ))}
            </TableBody>
          </Table>

          <Separator />

          <h3 className="font-semibold">3.2 Database Functions</h3>
          <Table>
            <TableHeader><TableRow><TableHead>Function</TableHead><TableHead>Description</TableHead></TableRow></TableHeader>
            <TableBody>
              {[
                ['generate_customer_id(p_company_id)','สร้างรหัสลูกค้าอัตโนมัติ เช่น BPK-C0001'],
                ['generate_document_number(p_branch_id, p_company_id)','สร้างเลขเอกสารอัตโนมัติ'],
                ['get_next_customer_no(p_company_id)','ลำดับถัดไปของลูกค้า'],
                ['get_user_company_id(_user_id)','ดึง company_id ของผู้ใช้'],
                ['has_role(_user_id, _role)','ตรวจสอบตำแหน่งผู้ใช้ (Security Definer)'],
              ].map(([f,d]) => (
                <TableRow key={f}><TableCell className="font-mono text-xs">{f}</TableCell><TableCell className="text-muted-foreground">{d}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 4. Non-Functional Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> 4. Non-Functional Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">4.1 Security</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Row Level Security (RLS) บังคับใช้ทุกตาราง — ข้อมูลแยกตาม company_id</li>
              <li>ตำแหน่งผู้ใช้เก็บในตาราง user_roles แยกจาก profiles เพื่อป้องกัน Privilege Escalation</li>
              <li>ฟังก์ชัน has_role() เป็น Security Definer หลีกเลี่ยง RLS Recursive</li>
              <li>Activity Log เป็น Append-only ไม่สามารถลบหรือแก้ไขได้</li>
              <li>การยืนยันสัญญาจองผ่าน OTP หรือ Link พร้อมวันหมดอายุ</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">4.2 Multi-Tenancy</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>ข้อมูลทุกตารางแยกตาม company_id ผ่าน RLS Policy</li>
              <li>สายอนุมัติควบคุมเพิ่มเติมด้วย branch_id</li>
              <li>IT Admin สามารถเข้าถึงข้อมูลทุกบริษัทได้</li>
              <li>User Admin จำกัดเฉพาะบริษัท/สาขาที่ได้รับมอบหมาย</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2"><Activity className="h-4 w-4" /> 4.3 Audit Trail</h3>
            <p className="text-muted-foreground mb-2">ตาราง reservation_activity_logs บันทึกทุกการกระทำ:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><code className="text-xs bg-muted px-1 rounded">action</code> — รหัสการกระทำ (created, updated, confirmed ฯลฯ)</li>
              <li><code className="text-xs bg-muted px-1 rounded">action_label</code> — ชื่อการกระทำภาษาไทย</li>
              <li><code className="text-xs bg-muted px-1 rounded">performed_by</code> / <code className="text-xs bg-muted px-1 rounded">performed_by_name</code> — ผู้ดำเนินการ</li>
              <li><code className="text-xs bg-muted px-1 rounded">details</code> — รายละเอียดเพิ่มเติมในรูปแบบ JSONB</li>
              <li>แสดงผลในรูปแบบ Timeline ในหน้าแก้ไขใบจอง</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 5. Status Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" /> 5. การแสดงสถานะใบจอง</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>สถานะ</TableHead><TableHead>สี</TableHead><TableHead>ตัวอย่าง</TableHead></TableRow></TableHeader>
            <TableBody>
              <TableRow><TableCell>สร้างสัญญาจอง</TableCell><TableCell>ดำ</TableCell><TableCell><span className="font-medium">สร้างสัญญาจอง</span></TableCell></TableRow>
              <TableRow><TableCell>ยืนยันสัญญาจอง</TableCell><TableCell>#2349bb</TableCell><TableCell><span className="font-medium" style={{color:'#2349bb'}}>ยืนยันสัญญาจอง</span></TableCell></TableRow>
              <TableRow><TableCell>ตรวจสอบการชำระเงิน</TableCell><TableCell>ส้ม</TableCell><TableCell><span className="font-medium text-orange-600">ตรวจสอบการชำระเงิน</span></TableCell></TableRow>
              <TableRow><TableCell>ตรวจสอบรายละเอียด</TableCell><TableCell>#2b93d4</TableCell><TableCell><span className="font-medium" style={{color:'#2b93d4'}}>ตรวจสอบรายละเอียด</span></TableCell></TableRow>
              <TableRow><TableCell>อนุมัติแล้ว</TableCell><TableCell>#02681f</TableCell><TableCell><span className="font-medium" style={{color:'#02681f'}}>อนุมัติแล้ว</span></TableCell></TableRow>
              <TableRow><TableCell>ยกเลิกแล้ว</TableCell><TableCell>#b51f19</TableCell><TableCell><span className="font-medium" style={{color:'#b51f19'}}>ยกเลิกแล้ว</span></TableCell></TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 6. Man-Days */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> 6. ประเมิน Man-Days</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>ส่วนงาน</TableHead><TableHead className="text-center">Man-Days</TableHead><TableHead className="text-center">%</TableHead></TableRow></TableHeader>
            <TableBody>
              <TableRow><TableCell className="font-medium">Frontend (Lovable AI)</TableCell><TableCell className="text-center">10.0 วัน</TableCell><TableCell className="text-center">34%</TableCell></TableRow>
              <TableRow><TableCell className="font-medium">Backend (Dev + Cursor AI)</TableCell><TableCell className="text-center">14.0 วัน</TableCell><TableCell className="text-center">47%</TableCell></TableRow>
              <TableRow><TableCell className="font-medium">Integration & Testing</TableCell><TableCell className="text-center">5.5 วัน</TableCell><TableCell className="text-center">19%</TableCell></TableRow>
              <TableRow className="bg-muted/50 font-bold"><TableCell className="font-bold">รวมทั้งหมด</TableCell><TableCell className="text-center font-bold">29.5 วัน</TableCell><TableCell className="text-center font-bold">100%</TableCell></TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground pb-8">— สร้างโดย Lovable AI — ระบบจองรถยนต์ v2.0 —</p>
    </div>
  );
};

export default RequirementSpecPage;
