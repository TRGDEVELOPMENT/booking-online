import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  AlertTriangle,
  CheckCircle2,
  FileText,
  CreditCard,
  UserCheck,
  ClipboardCheck,
  Stamp,
  Printer,
  Ban,
  Gavel,
  FolderArchive,
  Database,
  BarChart3,
  FileOutput,
} from 'lucide-react';

type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

interface FunctionItem {
  no: number;
  name: string;
  category: string;
  responsible: string;
  description: string;
  riskLevel: RiskLevel;
  riskScore: number;
  riskReason: string;
  icon: React.ElementType;
}

const riskConfig: Record<RiskLevel, { label: string; color: string; bgColor: string; borderColor: string }> = {
  critical: { label: 'สูงมาก', color: 'text-red-700', bgColor: 'bg-red-100', borderColor: 'border-red-300' },
  high: { label: 'สูง', color: 'text-orange-700', bgColor: 'bg-orange-100', borderColor: 'border-orange-300' },
  medium: { label: 'ปานกลาง', color: 'text-yellow-700', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-300' },
  low: { label: 'ต่ำ', color: 'text-green-700', bgColor: 'bg-green-100', borderColor: 'border-green-300' },
};

const functions: FunctionItem[] = [
  // Workflow หลัก
  { no: 1, name: 'สร้างสัญญาจอง', category: 'Workflow หลัก', responsible: 'ที่ปรึกษาการขาย', description: 'เลือกสาขา/BU, กรอกข้อมูลลูกค้า, เลือกรถ/สี/ของแถม, สถานะ Draft', riskLevel: 'medium', riskScore: 3, riskReason: 'ข้อมูลผิดพลาดแก้ไขได้ก่อนยืนยัน', icon: FileText },
  { no: 2, name: 'ยืนยันสัญญาจอง (OTP/Link)', category: 'Workflow หลัก', responsible: 'ลูกค้า / ที่ปรึกษาการขาย', description: 'ส่ง OTP หรือ Link ให้ลูกค้ายืนยัน, ระบบ Stamp เวลา', riskLevel: 'high', riskScore: 4, riskReason: 'ผูกมัดทางกฎหมาย — ต้องมีหลักฐานยืนยันตัวตน', icon: UserCheck },
  { no: 3, name: 'ตรวจสอบการชำระเงิน', category: 'Workflow หลัก', responsible: 'แคชเชียร์', description: 'แนบ Slip, บันทึกช่องทางชำระ, ยืนยันรับเงินจอง, Stamp วันที่+เวลา', riskLevel: 'critical', riskScore: 5, riskReason: 'เกี่ยวข้องกับเงินโดยตรง — ผิดพลาดสูญเสียรายได้', icon: CreditCard },
  { no: 4, name: 'ตรวจสอบรายละเอียดใบจอง', category: 'Workflow หลัก', responsible: 'หัวหน้าทีมขาย', description: 'ตรวจสอบความถูกต้องรายละเอียดทั้งหมด, Lock Fields สำคัญ', riskLevel: 'medium', riskScore: 3, riskReason: 'จุดตรวจสอบก่อนอนุมัติ แก้ไขได้', icon: ClipboardCheck },
  { no: 5, name: 'พิจารณาอนุมัติ', category: 'Workflow หลัก', responsible: 'ผู้จัดการฝ่ายขาย', description: 'อนุมัติใบจอง หรือ ปฏิเสธ + Comment', riskLevel: 'high', riskScore: 4, riskReason: 'การตัดสินใจผูกมัดบริษัท ส่งผลต่อรายได้/margin', icon: Stamp },
  { no: 6, name: 'พิมพ์/ลงนาม/ส่งลูกค้า', category: 'Workflow หลัก', responsible: 'ที่ปรึกษาการขาย', description: 'Generate PDF, ลงนามบนกระดาษ/e-Sign', riskLevel: 'low', riskScore: 2, riskReason: 'เป็นขั้นตอนท้าย ข้อมูลผ่านการยืนยันแล้ว', icon: Printer },

  // Workflow ยกเลิก
  { no: 7, name: 'บันทึกขอยกเลิก/บอกเลิก', category: 'Workflow ยกเลิก', responsible: 'ที่ปรึกษาการขาย', description: 'ทำคำร้องขอยกเลิก แนบหนังสือ/ไฟล์ เลือกเลขที่ใบจอง', riskLevel: 'high', riskScore: 4, riskReason: 'เกี่ยวข้องกับการคืนเงินและข้อพิพาททางกฎหมาย', icon: Ban },
  { no: 8, name: 'อนุมัติยกเลิกใบจอง', category: 'Workflow ยกเลิก', responsible: 'ผู้จัดการฝ่ายขาย', description: 'พิจารณาอนุมัติยกเลิก', riskLevel: 'critical', riskScore: 5, riskReason: 'สูญเสียรายได้ทันที + อาจเกิดข้อพิพาทกับลูกค้า', icon: Gavel },
  { no: 9, name: 'ชุดเอกสารการยกเลิกจอง', category: 'Workflow ยกเลิก', responsible: 'แคชเชียร์', description: 'ออกชุดเอกสารยกเลิก + Attach Files', riskLevel: 'medium', riskScore: 3, riskReason: 'เอกสารต้องถูกต้องตามกฎหมาย', icon: FolderArchive },

  // Master Data
  { no: 10, name: 'จัดการ Master ยี่ห้อ', category: 'Master Data', responsible: 'IT / Admin', description: 'CRUD ยี่ห้อรถ', riskLevel: 'low', riskScore: 1, riskReason: 'ข้อมูลพื้นฐาน แก้ไขง่าย', icon: Database },
  { no: 11, name: 'จัดการ Master รุ่น (Model)', category: 'Master Data', responsible: 'IT / Admin', description: 'CRUD รุ่นรถ', riskLevel: 'medium', riskScore: 2, riskReason: 'ส่งผลต่อการเลือกรถในใบจอง', icon: Database },
  { no: 12, name: 'จัดการ Master รุ่นย่อย', category: 'Master Data', responsible: 'IT / Admin', description: 'CRUD รุ่นย่อย + ผูก Model', riskLevel: 'medium', riskScore: 2, riskReason: 'ส่งผลต่อราคาและสเปค', icon: Database },
  { no: 13, name: 'จัดการ Master สี', category: 'Master Data', responsible: 'IT / Admin', description: 'CRUD สี + ผูก Model/Sub Model', riskLevel: 'low', riskScore: 1, riskReason: 'ข้อมูลพื้นฐาน', icon: Database },
  { no: 14, name: 'จัดการ Master ขนาดเครื่องยนต์', category: 'Master Data', responsible: 'IT / Admin', description: 'CRUD ขนาดเครื่อง', riskLevel: 'low', riskScore: 1, riskReason: 'ข้อมูลพื้นฐาน', icon: Database },
  { no: 15, name: 'จัดการ Master ประเภทเชื้อเพลิง', category: 'Master Data', responsible: 'IT / Admin', description: 'CRUD ประเภทเชื้อเพลิง', riskLevel: 'low', riskScore: 1, riskReason: 'ข้อมูลพื้นฐาน', icon: Database },
  { no: 16, name: 'จัดการ Master ราคาตั้ง', category: 'Master Data', responsible: 'IT / Admin', description: 'CRUD ราคามาตรฐาน ผูก Model+Sub Model', riskLevel: 'high', riskScore: 4, riskReason: 'ส่งผลต่อราคาขายและ margin โดยตรง', icon: Database },
  { no: 17, name: 'จัดการ Master ของแถม', category: 'Master Data', responsible: 'IT / Admin', description: 'CRUD ของแถม + มูลค่า', riskLevel: 'medium', riskScore: 2, riskReason: 'ส่งผลต่อต้นทุนทางอ้อม', icon: Database },
  { no: 18, name: 'จัดการ Master อุปกรณ์เสริม', category: 'Master Data', responsible: 'IT / Admin', description: 'CRUD อุปกรณ์เสริม + มูลค่า', riskLevel: 'medium', riskScore: 2, riskReason: 'ส่งผลต่อต้นทุนทางอ้อม', icon: Database },
  { no: 19, name: 'จัดการ Master สิทธิประโยชน์', category: 'Master Data', responsible: 'IT / Admin', description: 'CRUD สิทธิประโยชน์ + มูลค่า', riskLevel: 'medium', riskScore: 2, riskReason: 'ส่งผลต่อต้นทุนทางอ้อม', icon: Database },
  { no: 20, name: 'จัดการ Master คำนำหน้า', category: 'Master Data', responsible: 'IT / Admin', description: 'CRUD คำนำหน้าชื่อ', riskLevel: 'low', riskScore: 1, riskReason: 'ข้อมูลพื้นฐาน', icon: Database },

  // Reports
  { no: 21, name: 'รายงานใบจองประจำเดือน', category: 'Reports', responsible: 'ทุกบทบาท', description: 'สรุปใบจองตาม period, สถานะ, ยอดเงิน', riskLevel: 'medium', riskScore: 3, riskReason: 'ใช้ประกอบการตัดสินใจทางธุรกิจ', icon: BarChart3 },
  { no: 22, name: 'รายงานใบจองที่ยังไม่อนุมัติ', category: 'Reports', responsible: 'ผู้จัดการฝ่ายขาย', description: 'แสดงรายการค้างอนุมัติ เพื่อ follow up', riskLevel: 'medium', riskScore: 3, riskReason: 'ถ้าไม่ follow up อาจสูญเสียการขาย', icon: BarChart3 },
  { no: 23, name: 'รายงานยกเลิกใบจอง', category: 'Reports', responsible: 'ผู้จัดการฝ่ายขาย', description: 'สรุปรายการที่ถูกยกเลิก + เหตุผล', riskLevel: 'medium', riskScore: 3, riskReason: 'ใช้วิเคราะห์สาเหตุการยกเลิก', icon: BarChart3 },

  // Forms
  { no: 24, name: 'พิมพ์สัญญาจอง', category: 'เอกสาร/ฟอร์ม', responsible: 'ที่ปรึกษาการขาย', description: 'Generate PDF สัญญาจองตามแบบฟอร์มบริษัท', riskLevel: 'medium', riskScore: 3, riskReason: 'เอกสารที่มีผลทางกฎหมาย', icon: FileOutput },
  { no: 25, name: 'พิมพ์ยกเลิกสัญญาจอง', category: 'เอกสาร/ฟอร์ม', responsible: 'ที่ปรึกษาการขาย', description: 'Generate PDF หนังสือบอกเลิก/ยกเลิกสัญญา', riskLevel: 'medium', riskScore: 3, riskReason: 'เอกสารที่มีผลทางกฎหมาย', icon: FileOutput },
];

const getRiskBadge = (level: RiskLevel) => {
  const config = riskConfig[level];
  return (
    <Badge className={`${config.bgColor} ${config.color} ${config.borderColor} border`}>
      {config.label}
    </Badge>
  );
};

const getRiskBar = (score: number) => {
  const colors: Record<number, string> = {
    1: 'bg-green-500',
    2: 'bg-yellow-500',
    3: 'bg-yellow-600',
    4: 'bg-orange-500',
    5: 'bg-red-500',
  };
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${colors[score] || 'bg-muted-foreground'}`}
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>
      <span className="text-xs font-bold text-muted-foreground w-6 text-right">{score}/5</span>
    </div>
  );
};

export default function FunctionOverviewPage() {
  const categories = ['Workflow หลัก', 'Workflow ยกเลิก', 'Master Data', 'Reports', 'เอกสาร/ฟอร์ม'];

  const criticalCount = functions.filter(f => f.riskLevel === 'critical').length;
  const highCount = functions.filter(f => f.riskLevel === 'high').length;
  const mediumCount = functions.filter(f => f.riskLevel === 'medium').length;
  const lowCount = functions.filter(f => f.riskLevel === 'low').length;
  const avgRisk = (functions.reduce((sum, f) => sum + f.riskScore, 0) / functions.length).toFixed(1);

  return (
    <div className="space-y-6">
      <Header
        title="Function Overview"
        subtitle="ภาพรวม Function ทั้งหมดของระบบพร้อมน้ำหนักความเสี่ยงทาง Business"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="border-l-4 border-l-foreground">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-foreground">{functions.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Function ทั้งหมด</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
              <p className="text-xs text-muted-foreground mt-1">ความเสี่ยงสูงมาก</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-orange-600">{highCount}</p>
              <p className="text-xs text-muted-foreground mt-1">ความเสี่ยงสูง</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-yellow-600">{mediumCount}</p>
              <p className="text-xs text-muted-foreground mt-1">ปานกลาง</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{lowCount}</p>
              <p className="text-xs text-muted-foreground mt-1">ต่ำ</p>
            </CardContent>
          </Card>
        </div>

        {/* Risk Score Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="w-5 h-5 text-orange-500" />
              ค่าเฉลี่ยความเสี่ยง: {avgRisk} / 5.0
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                <ShieldAlert className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-sm font-semibold text-red-700">สูงมาก (5/5)</p>
                  <p className="text-xs text-red-600">เกี่ยวข้องกับเงินโดยตรง สูญเสียรายได้/ข้อพิพาท</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
                <AlertTriangle className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-sm font-semibold text-orange-700">สูง (4/5)</p>
                  <p className="text-xs text-orange-600">ผูกมัดทางกฎหมาย ส่งผลต่อ margin</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <Shield className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="text-sm font-semibold text-yellow-700">ปานกลาง (2-3/5)</p>
                  <p className="text-xs text-yellow-600">ส่งผลต่อความถูกต้องของข้อมูล</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                <ShieldCheck className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm font-semibold text-green-700">ต่ำ (1/5)</p>
                  <p className="text-xs text-green-600">ข้อมูลพื้นฐาน แก้ไขง่าย ไม่กระทบ Transaction</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Function Tables by Category */}
        {categories.map((category) => {
          const categoryFunctions = functions.filter(f => f.category === category);
          const categoryIcon = category === 'Workflow หลัก' ? FileText
            : category === 'Workflow ยกเลิก' ? Ban
            : category === 'Master Data' ? Database
            : category === 'Reports' ? BarChart3
            : FileOutput;
          const CategoryIcon = categoryIcon;

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CategoryIcon className="w-5 h-5 text-primary" />
                  {category}
                  <Badge variant="secondary" className="ml-2">{categoryFunctions.length} Functions</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border rounded-lg overflow-hidden mx-6 mb-6">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Function</TableHead>
                        <TableHead className="hidden md:table-cell">ผู้รับผิดชอบ</TableHead>
                        <TableHead className="hidden lg:table-cell">รายละเอียด</TableHead>
                        <TableHead className="text-center">ความเสี่ยง</TableHead>
                        <TableHead className="w-[160px]">คะแนน</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryFunctions.map((fn) => {
                        const FnIcon = fn.icon;
                        return (
                          <TableRow key={fn.no} className={
                            fn.riskLevel === 'critical' ? 'bg-red-50/50' :
                            fn.riskLevel === 'high' ? 'bg-orange-50/30' : ''
                          }>
                            <TableCell className="font-medium text-muted-foreground">{fn.no}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <FnIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                                <div>
                                  <p className="font-medium text-sm">{fn.name}</p>
                                  <p className="text-xs text-muted-foreground md:hidden">{fn.responsible}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                              {fn.responsible}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <p className="text-xs text-muted-foreground line-clamp-2">{fn.description}</p>
                              <p className="text-xs text-orange-600 mt-0.5 italic">{fn.riskReason}</p>
                            </TableCell>
                            <TableCell className="text-center">
                              {getRiskBadge(fn.riskLevel)}
                            </TableCell>
                            <TableCell>
                              {getRiskBar(fn.riskScore)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
