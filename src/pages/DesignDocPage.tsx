import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Palette, Server, Database, Shield, GitBranch, Activity, Layers, FileText } from 'lucide-react';

const DesignDocPage = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">System Design Document</h1>
        <p className="text-lg text-muted-foreground">เอกสารสรุปการออกแบบระบบ — ระบบจองรถยนต์ v2.0</p>
        <p className="text-sm text-muted-foreground">วันที่: 27 มีนาคม 2569</p>
      </div>

      {/* 1. UI/UX Design */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" /> 1. UI/UX Design</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">1.1 Design System — Color Palette</h3>
            <Table>
              <TableHeader><TableRow><TableHead>Token</TableHead><TableHead>HSL</TableHead><TableHead>สี</TableHead><TableHead>การใช้งาน</TableHead></TableRow></TableHeader>
              <TableBody>
                {[
                  ['Primary','224° 76% 33%','Navy Blue','ปุ่มหลัก, Header, สีหลัก'],
                  ['Secondary','214° 95% 93%','Light Blue','พื้นหลังรอง, Hover'],
                  ['Accent','217° 91% 60%','Blue Vivid','ลิงก์, ไอคอน, เน้นสำคัญ'],
                  ['Destructive','0° 84% 60%','Red','ปุ่มลบ, สถานะยกเลิก'],
                  ['Success','142° 76% 36%','Green','สถานะสำเร็จ, อนุมัติแล้ว'],
                  ['Warning','38° 92% 50%','Orange','แจ้งเตือน, สถานะรอ'],
                  ['Muted','210° 40% 96%','Light Gray','พื้นหลัง, ข้อความรอง'],
                  ['Background','210° 40% 98%','Off White','พื้นหลังหลัก'],
                ].map(([t,h,co,u]) => (
                  <TableRow key={t}><TableCell className="font-medium">{t}</TableCell><TableCell className="font-mono text-xs">{h}</TableCell><TableCell>{co}</TableCell><TableCell className="text-muted-foreground">{u}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">1.2 Typography</h3>
            <Table>
              <TableHeader><TableRow><TableHead>Element</TableHead><TableHead>Font</TableHead><TableHead>Size</TableHead><TableHead>หมายเหตุ</TableHead></TableRow></TableHeader>
              <TableBody>
                {[
                  ['Heading (App)','Poppins','18-24px','Bold, Navy Blue'],
                  ['Body Text','System Default','14-16px','Regular'],
                  ['Table Data','System Default','14px','Regular'],
                  ['Label/Caption','System Default','12px','Medium, Muted'],
                  ['พิมพ์ใบจอง','TH Sarabun New','14-16pt','ฟอร์มทางการ'],
                ].map(([e,f,s,n]) => (
                  <TableRow key={e}><TableCell className="font-medium">{e}</TableCell><TableCell>{f}</TableCell><TableCell className="text-center">{s}</TableCell><TableCell className="text-muted-foreground">{n}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">1.3 Layout Structure</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><strong>MainLayout</strong> — Sidebar (ซ้าย) + Header (บน) + Content Area (กลาง)</li>
              <li><strong>Sidebar</strong> — Collapsible พร้อมเมนูย่อย พับ/ขยายได้ + Responsive</li>
              <li><strong>SettingsLayout</strong> — Layout เฉพาะหน้าตั้งค่าพร้อมเมนูการ์ด</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">1.4 Component Library (shadcn/ui)</h3>
            <Table>
              <TableHeader><TableRow><TableHead>หมวดหมู่</TableHead><TableHead>Components</TableHead><TableHead>การใช้งาน</TableHead></TableRow></TableHeader>
              <TableBody>
                {[
                  ['Form','Input, Select, Checkbox, Switch, DatePicker','ฟอร์มกรอกข้อมูล'],
                  ['Data Display','Table, Card, Badge, Avatar','แสดงข้อมูล'],
                  ['Feedback','Toast, Alert, Dialog, Progress','แจ้งเตือน'],
                  ['Navigation','Sidebar, Tabs, Breadcrumb, Dropdown','เมนูนำทาง'],
                  ['Overlay','Dialog, Sheet, Popover, Tooltip','หน้าต่างซ้อน'],
                  ['Charts','Recharts (Bar, Pie, Line)','กราฟ Dashboard'],
                ].map(([g,co,u]) => (
                  <TableRow key={g}><TableCell className="font-medium">{g}</TableCell><TableCell>{co}</TableCell><TableCell className="text-muted-foreground">{u}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">1.5 สีสถานะใบจอง</h3>
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
          </div>
        </CardContent>
      </Card>

      {/* 2. System Architecture */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Server className="h-5 w-5" /> 2. System Architecture</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">2.1 Technology Stack</h3>
            <Table>
              <TableHeader><TableRow><TableHead>Layer</TableHead><TableHead>เทคโนโลยี</TableHead><TableHead>หมายเหตุ</TableHead></TableRow></TableHeader>
              <TableBody>
                {[
                  ['Frontend','React 18 + TypeScript + Vite','SPA'],
                  ['UI Library','Tailwind CSS + shadcn/ui','Utility-first CSS'],
                  ['State','TanStack React Query','Server state + caching'],
                  ['Routing','React Router DOM v6','Client-side routing'],
                  ['Charts','Recharts','Bar, Pie, Line'],
                  ['Database','PostgreSQL (Lovable Cloud)','Managed database'],
                  ['Auth','Lovable Cloud Authentication','Email/Password + JWT'],
                  ['Storage','Lovable Cloud Storage','ไฟล์แนบใบจอง'],
                  ['Functions','Edge Functions (Deno)','Business Logic'],
                  ['Export','XLSX library','ส่งออก Excel'],
                ].map(([l,t,n]) => (
                  <TableRow key={l}><TableCell className="font-medium">{l}</TableCell><TableCell>{t}</TableCell><TableCell className="text-muted-foreground">{n}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">2.2 Multi-Tenancy Architecture</h3>
            <p className="text-muted-foreground mb-2">Shared Database, Shared Schema (Single-Tenant per Row) — ใช้ company_id แบ่งข้อมูล:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>ทุกตารางธุรกิจมีคอลัมน์ <code className="text-xs bg-muted px-1 rounded">company_id</code></li>
              <li>RLS Policy: <code className="text-xs bg-muted px-1 rounded">company_id = get_user_company_id(auth.uid())</code></li>
              <li>IT Admin ได้รับการยกเว้น — เข้าถึงข้อมูลทุกบริษัท</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2"><Shield className="h-4 w-4" /> 2.3 Authentication & RBAC</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>บทบาทเก็บในตาราง <code className="text-xs bg-muted px-1 rounded">user_roles</code> แยกจาก profiles (ป้องกัน Privilege Escalation)</li>
              <li>ฟังก์ชัน <code className="text-xs bg-muted px-1 rounded">has_role()</code> เป็น Security Definer</li>
              <li>6 บทบาท: it, user_admin, sale_manager, sale_supervisor, sale, cashier</li>
              <li>Sidebar เมนูแสดง/ซ่อนตามบทบาท</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2"><Layers className="h-4 w-4" /> 2.4 Workflow Engine (State Machine)</h3>
            <Table>
              <TableHeader><TableRow><TableHead>Field</TableHead><TableHead>ค่าที่เป็นไปได้</TableHead><TableHead>ขั้นตอน</TableHead><TableHead>Role</TableHead></TableRow></TableHeader>
              <TableBody>
                {[
                  ['confirmation_status','pending → confirmed','ยืนยันสัญญา','ลูกค้า'],
                  ['cashier_user_id','null → uuid','ตรวจสอบชำระเงิน','Cashier'],
                  ['review_status','pending → approved/rejected','ตรวจสอบรายละเอียด','Supervisor'],
                  ['approval_status','pending → approved/rejected','อนุมัติ','Manager'],
                  ['cancel_request_status','null → requested','ขอยกเลิก','Sale'],
                  ['cancel_review_status','null → approved/rejected','ตรวจสอบยกเลิก','Supervisor'],
                  ['cancel_approval_status','null → approved/rejected','อนุมัติยกเลิก','Manager'],
                ].map(([f,v,s,r]) => (
                  <TableRow key={f}><TableCell className="font-mono text-xs">{f}</TableCell><TableCell className="text-xs">{v}</TableCell><TableCell>{s}</TableCell><TableCell>{r}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2"><GitBranch className="h-4 w-4" /> 2.5 Approval Chain Design</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><strong>Template Level</strong> — team_approval_templates / team_cancel_approval_templates กำหนดค่าเริ่มต้นตามทีมขาย</li>
              <li><strong>Instance Level</strong> — reservation_assignments เก็บผู้รับผิดชอบจริงในแต่ละใบจอง</li>
              <li>ทั้งสองระดับกรองตาม <code className="text-xs bg-muted px-1 rounded">branch_id</code></li>
              <li>Stages: cashier, review, approval / cancel_review, cancel_approval</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 3. Database Design */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" /> 3. Database Design</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">3.1 Entity Relationships</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground font-mono text-sm">
              <li>reservations → reservation_attachments (1:N)</li>
              <li>reservations → reservation_activity_logs (1:N)</li>
              <li>reservations → reservation_assignments (1:N, แต่ละ stage)</li>
              <li>sales_teams → sales_team_members (1:N)</li>
              <li>sales_teams → team_approval_templates (1:N)</li>
              <li>sales_teams → team_cancel_approval_templates (1:N)</li>
              <li>models → sub_models (1:N)</li>
              <li>models/sub_models → standard_prices (1:N)</li>
              <li>surnames → customers (1:N optional)</li>
              <li>profiles ← user_roles (1:1 ผ่าน user_id)</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">3.2 ตาราง reservations — Column Groups</h3>
            <Table>
              <TableHeader><TableRow><TableHead>กลุ่ม</TableHead><TableHead>คอลัมน์</TableHead><TableHead>หมายเหตุ</TableHead></TableRow></TableHeader>
              <TableBody>
                {[
                  ['Identity','id, document_number, company_id, branch_id','UUID + เลขเอกสาร + Multi-tenant'],
                  ['สถานะ','status, confirmation_status, review_status, approval_status','State Machine fields'],
                  ['ลูกค้า','customer_name, customer_type, customer_id_card, customer_phone','ข้อมูลผู้จอง'],
                  ['ผู้ซื้อ','buyer_name, buyer_id_card, buyer_phone, buyer_address','กรณีผู้ซื้อ ≠ ผู้จอง'],
                  ['รถ','vehicle_type, model, submodel, color, fuel_type','ข้อมูลรถที่จอง'],
                  ['ราคา','list_price, discount, net_price, deposit_amount','ราคาและเงินมัดจำ'],
                  ['Items (JSONB)','freebies, accessories, benefits','ของแถม/อุปกรณ์/สิทธิ์'],
                  ['ยกเลิก','cancel_reason, cancel_request_status, cancel_review_*, cancel_approval_*','3 ขั้นตอนยกเลิก'],
                ].map(([g,cols,n]) => (
                  <TableRow key={g}><TableCell className="font-medium">{g}</TableCell><TableCell className="font-mono text-xs">{cols}</TableCell><TableCell className="text-muted-foreground">{n}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2"><Shield className="h-4 w-4" /> 3.3 Row Level Security (RLS) Patterns</h3>
            <Table>
              <TableHeader><TableRow><TableHead>รูปแบบ</TableHead><TableHead>เงื่อนไข</TableHead><TableHead>ตารางที่ใช้</TableHead></TableRow></TableHeader>
              <TableBody>
                {[
                  ['Company-based','company_id = get_user_company_id(auth.uid())','Master data, reservations, customers'],
                  ['Admin-only Write','has_role(uid, \'user_admin\') OR has_role(uid, \'it\')','sales_teams, assignments, templates'],
                  ['Self + Admin Read','user_id = auth.uid() OR has_role(...)','profiles, user_roles'],
                  ['Append-only','INSERT only (no UPDATE/DELETE)','reservation_activity_logs'],
                  ['Branch-filtered','branch_id = profile.branch_id OR NULL','reservation_assignments (SELECT)'],
                ].map(([p,cond,t]) => (
                  <TableRow key={p}><TableCell className="font-medium">{p}</TableCell><TableCell className="font-mono text-xs">{cond}</TableCell><TableCell className="text-muted-foreground">{t}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">3.4 Document Number Generation</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>รูปแบบ: <code className="text-xs bg-muted px-1 rounded">{'{doc_prefix}-{YYMM}-{running_number}'}</code></li>
              <li>ใช้ตาราง <code className="text-xs bg-muted px-1 rounded">document_sequences</code> เก็บ running number ตาม prefix + year_month</li>
              <li>ใช้ UPSERT + RETURNING เพื่อป้องกัน Race Condition</li>
              <li>doc_prefix ดึงจากตาราง branches ตาม branch_id</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 4. Key Design Patterns */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> 4. Key Design Patterns</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">4.1 State Management</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><strong>TanStack React Query</strong> — Server State (fetch, cache, refetch)</li>
              <li><strong>React Hook Form + Zod</strong> — Form State + Validation</li>
              <li><strong>useAuth() Hook</strong> — Auth State (user, profile, roles, signOut)</li>
              <li><strong>URL State</strong> — React Router params สำหรับ reservation ID</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2"><Activity className="h-4 w-4" /> 4.2 Audit Trail Pattern</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>ตาราง <code className="text-xs bg-muted px-1 rounded">reservation_activity_logs</code> — Append-only</li>
              <li>Hook <code className="text-xs bg-muted px-1 rounded">useReservationActivityLog</code> — logActivity() + fetchLogs()</li>
              <li>Component <code className="text-xs bg-muted px-1 rounded">ActivityTimeline</code> — แสดง Log เป็น Timeline</li>
              <li>Actions: created, updated, confirmed, payment_verified, reviewed, approved ฯลฯ</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">4.3 File Upload Pattern</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Lovable Cloud Storage — Bucket 'reservation-attachments'</li>
              <li>Path: <code className="text-xs bg-muted px-1 rounded">{'{company_id}/{reservation_id}/{filename}'}</code></li>
              <li>Metadata เก็บในตาราง reservation_attachments</li>
              <li>Hook useReservationAttachments — upload, list, delete</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">4.4 Multi-Company Selection</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Login Page — เลือกบริษัทก่อน Login</li>
              <li>Sidebar — Dropdown เปลี่ยนบริษัท (IT Admin)</li>
              <li>company_id เก็บใน React State → ส่งผ่าน Props → กรอง Query</li>
              <li>บัญชีทดสอบ: มี profile ในทุก company สำหรับ Demo/Review</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground pb-8">— สร้างโดย Lovable AI — ระบบจองรถยนต์ v2.0 —</p>
    </div>
  );
};

export default DesignDocPage;
