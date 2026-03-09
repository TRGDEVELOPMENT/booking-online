import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
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
  Code2,
  Clock,
  Zap,
  Gauge,
} from 'lucide-react';

type RiskLevel = 'critical' | 'high' | 'medium' | 'low';
type DevDifficulty = 'very_hard' | 'hard' | 'medium' | 'easy';
type WeightLevel = 'complete' | 'minor' | 'major' | 'critical';

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
  devDifficulty: DevDifficulty;
  devScore: number; // 1-5
  devManDays: number;
  devNotes: string;
  weightLevel: WeightLevel;
  weightScore: number; // 10, 7, 4, 1
}

const weightConfig: Record<WeightLevel, { label: string; score: number; color: string; bgColor: string; borderColor: string; emoji: string; description: string }> = {
  complete: { label: 'Complete', score: 10, color: 'text-emerald-700', bgColor: 'bg-emerald-100', borderColor: 'border-emerald-300', emoji: '✅', description: 'ไม่มีข้อผิดพลาด — ขาดไปแทบไม่กระทบการใช้งาน' },
  minor: { label: 'Minor', score: 7, color: 'text-blue-700', bgColor: 'bg-blue-100', borderColor: 'border-blue-300', emoji: '🔵', description: 'กระทบจำกัด มี Workaround — Dev ปานกลาง-ง่าย' },
  major: { label: 'Major', score: 4, color: 'text-orange-700', bgColor: 'bg-orange-100', borderColor: 'border-orange-300', emoji: '🟠', description: 'กระทบ Workflow หลัก / ทำงานไม่ครบ — Dev ยาก-ปานกลาง' },
  critical: { label: 'Critical', score: 1, color: 'text-red-700', bgColor: 'bg-red-100', borderColor: 'border-red-300', emoji: '🔴', description: 'ระบบใช้งานไม่ได้ / เงินสูญหาย / กฎหมาย — Dev ยากมาก' },
};

const riskConfig: Record<RiskLevel, { label: string; color: string; bgColor: string; borderColor: string }> = {
  critical: { label: 'สูงมาก', color: 'text-red-700', bgColor: 'bg-red-100', borderColor: 'border-red-300' },
  high: { label: 'สูง', color: 'text-orange-700', bgColor: 'bg-orange-100', borderColor: 'border-orange-300' },
  medium: { label: 'ปานกลาง', color: 'text-yellow-700', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-300' },
  low: { label: 'ต่ำ', color: 'text-green-700', bgColor: 'bg-green-100', borderColor: 'border-green-300' },
};

const devConfig: Record<DevDifficulty, { label: string; color: string; bgColor: string; borderColor: string; emoji: string }> = {
  very_hard: { label: 'ยากมาก', color: 'text-purple-700', bgColor: 'bg-purple-100', borderColor: 'border-purple-300', emoji: '🔴' },
  hard: { label: 'ยาก', color: 'text-blue-700', bgColor: 'bg-blue-100', borderColor: 'border-blue-300', emoji: '🟠' },
  medium: { label: 'ปานกลาง', color: 'text-cyan-700', bgColor: 'bg-cyan-100', borderColor: 'border-cyan-300', emoji: '🟡' },
  easy: { label: 'ง่าย', color: 'text-emerald-700', bgColor: 'bg-emerald-100', borderColor: 'border-emerald-300', emoji: '🟢' },
};

const functions: FunctionItem[] = [
  // Workflow หลัก
  { no: 1, name: 'สร้างสัญญาจอง', category: 'Workflow หลัก', responsible: 'ที่ปรึกษาการขาย', description: 'เลือกสาขา/BU, กรอกข้อมูลลูกค้า, เลือกรถ/สี/ของแถม, สถานะ Draft', riskLevel: 'medium', riskScore: 3, riskReason: 'ข้อมูลผิดพลาดแก้ไขได้ก่อนยืนยัน', icon: FileText,
    devDifficulty: 'hard', devScore: 4, devManDays: 3.0, devNotes: 'ฟอร์มซับซ้อน มี Cascade Dropdown (Model→SubModel→Color), คำนวณราคา, ค้นหาลูกค้า, ของแถม/อุปกรณ์', weightLevel: 'critical', weightScore: 1 },
  { no: 2, name: 'ยืนยันสัญญาจอง (OTP/Link)', category: 'Workflow หลัก', responsible: 'ลูกค้า / ที่ปรึกษาการขาย', description: 'ส่ง OTP หรือ Link ให้ลูกค้ายืนยัน, ระบบ Stamp เวลา', riskLevel: 'high', riskScore: 4, riskReason: 'ผูกมัดทางกฎหมาย — ต้องมีหลักฐานยืนยันตัวตน', icon: UserCheck,
    devDifficulty: 'very_hard', devScore: 5, devManDays: 2.0, devNotes: 'ต้องมี OTP Generation, SMS/Email Integration, Token Management, Expiry Logic, Retry/Lock mechanism', weightLevel: 'critical', weightScore: 1 },
  { no: 3, name: 'ตรวจสอบการชำระเงิน', category: 'Workflow หลัก', responsible: 'แคชเชียร์', description: 'แนบ Slip, บันทึกช่องทางชำระ, ยืนยันรับเงินจอง, Stamp วันที่+เวลา', riskLevel: 'critical', riskScore: 5, riskReason: 'เกี่ยวข้องกับเงินโดยตรง — ผิดพลาดสูญเสียรายได้', icon: CreditCard,
    devDifficulty: 'hard', devScore: 4, devManDays: 1.5, devNotes: 'File Upload (Slip), Role-based Access, Stamp Logic, Validation ช่องทางชำระ', weightLevel: 'critical', weightScore: 1 },
  { no: 4, name: 'ตรวจสอบรายละเอียดใบจอง', category: 'Workflow หลัก', responsible: 'หัวหน้าทีมขาย', description: 'ตรวจสอบความถูกต้องรายละเอียดทั้งหมด, Lock Fields สำคัญ', riskLevel: 'medium', riskScore: 3, riskReason: 'จุดตรวจสอบก่อนอนุมัติ แก้ไขได้', icon: ClipboardCheck,
    devDifficulty: 'medium', devScore: 3, devManDays: 1.0, devNotes: 'Read-only view + Review action, Comment field, Status transition, Role check', weightLevel: 'major', weightScore: 4 },
  { no: 5, name: 'พิจารณาอนุมัติ', category: 'Workflow หลัก', responsible: 'ผู้จัดการฝ่ายขาย', description: 'อนุมัติใบจอง หรือ ปฏิเสธ + Comment', riskLevel: 'high', riskScore: 4, riskReason: 'การตัดสินใจผูกมัดบริษัท ส่งผลต่อรายได้/margin', icon: Stamp,
    devDifficulty: 'medium', devScore: 3, devManDays: 1.0, devNotes: 'Approve/Reject action, Comment, Timestamp, Status transition logic', weightLevel: 'major', weightScore: 4 },
  { no: 6, name: 'พิมพ์/ลงนาม/ส่งลูกค้า', category: 'Workflow หลัก', responsible: 'ที่ปรึกษาการขาย', description: 'Generate PDF, ลงนามบนกระดาษ/e-Sign', riskLevel: 'low', riskScore: 2, riskReason: 'เป็นขั้นตอนท้าย ข้อมูลผ่านการยืนยันแล้ว', icon: Printer,
    devDifficulty: 'hard', devScore: 4, devManDays: 2.0, devNotes: 'PDF Generation ตามแบบฟอร์มบริษัท, Layout ซับซ้อน, Print Preview, ต้อง Pixel-perfect', weightLevel: 'major', weightScore: 4 },

  // Workflow ยกเลิก
  { no: 7, name: 'บันทึกขอยกเลิก/บอกเลิก', category: 'Workflow ยกเลิก', responsible: 'ที่ปรึกษาการขาย', description: 'ทำคำร้องขอยกเลิก แนบหนังสือ/ไฟล์ เลือกเลขที่ใบจอง', riskLevel: 'high', riskScore: 4, riskReason: 'เกี่ยวข้องกับการคืนเงินและข้อพิพาททางกฎหมาย', icon: Ban,
    devDifficulty: 'hard', devScore: 4, devManDays: 1.5, devNotes: 'Multi-step workflow, File upload, ค้นหาใบจอง, Validation เหตุผล, Status transition', weightLevel: 'major', weightScore: 4 },
  { no: 8, name: 'อนุมัติยกเลิกใบจอง', category: 'Workflow ยกเลิก', responsible: 'ผู้จัดการฝ่ายขาย', description: 'พิจารณาอนุมัติยกเลิก', riskLevel: 'critical', riskScore: 5, riskReason: 'สูญเสียรายได้ทันที + อาจเกิดข้อพิพาทกับลูกค้า', icon: Gavel,
    devDifficulty: 'medium', devScore: 3, devManDays: 1.0, devNotes: 'Review + Approve/Reject, Status transition, คล้ายกับ F5 แต่เป็น Cancel flow', weightLevel: 'critical', weightScore: 1 },
  { no: 9, name: 'ชุดเอกสารการยกเลิกจอง', category: 'Workflow ยกเลิก', responsible: 'แคชเชียร์', description: 'ออกชุดเอกสารยกเลิก + Attach Files', riskLevel: 'medium', riskScore: 3, riskReason: 'เอกสารต้องถูกต้องตามกฎหมาย', icon: FolderArchive,
    devDifficulty: 'hard', devScore: 4, devManDays: 1.5, devNotes: 'PDF Generation (Cancel Form), Layout เฉพาะ, รวมข้อมูลจากหลาย Section', weightLevel: 'major', weightScore: 4 },

  // Master Data
  { no: 10, name: 'จัดการ Master ยี่ห้อ', category: 'Master Data', responsible: 'IT / Admin', description: 'CRUD ยี่ห้อรถ', riskLevel: 'low', riskScore: 1, riskReason: 'ข้อมูลพื้นฐาน แก้ไขง่าย', icon: Database,
    devDifficulty: 'easy', devScore: 1, devManDays: 0.25, devNotes: 'CRUD มาตรฐาน, Dialog เพิ่ม/แก้ไข, ตาราง + Search', weightLevel: 'complete', weightScore: 10 },
  { no: 11, name: 'จัดการ Master รุ่น (Model)', category: 'Master Data', responsible: 'IT / Admin', description: 'CRUD รุ่นรถ', riskLevel: 'medium', riskScore: 2, riskReason: 'ส่งผลต่อการเลือกรถในใบจอง', icon: Database,
    devDifficulty: 'easy', devScore: 1, devManDays: 0.25, devNotes: 'CRUD มาตรฐาน เหมือน F10', weightLevel: 'minor', weightScore: 7 },
  { no: 12, name: 'จัดการ Master รุ่นย่อย', category: 'Master Data', responsible: 'IT / Admin', description: 'CRUD รุ่นย่อย + ผูก Model', riskLevel: 'medium', riskScore: 2, riskReason: 'ส่งผลต่อราคาและสเปค', icon: Database,
    devDifficulty: 'medium', devScore: 2, devManDays: 0.5, devNotes: 'CRUD + Dropdown เลือก Model, Foreign key relationship', weightLevel: 'minor', weightScore: 7 },
  { no: 13, name: 'จัดการ Master สี', category: 'Master Data', responsible: 'IT / Admin', description: 'CRUD สี + ผูก Model/Sub Model', riskLevel: 'low', riskScore: 1, riskReason: 'ข้อมูลพื้นฐาน', icon: Database,
    devDifficulty: 'medium', devScore: 2, devManDays: 0.5, devNotes: 'CRUD + Color Picker + ผูก Model/SubModel', weightLevel: 'complete', weightScore: 10 },
  { no: 14, name: 'จัดการ Master ขนาดเครื่องยนต์', category: 'Master Data', responsible: 'IT / Admin', description: 'CRUD ขนาดเครื่อง', riskLevel: 'low', riskScore: 1, riskReason: 'ข้อมูลพื้นฐาน', icon: Database,
    devDifficulty: 'easy', devScore: 1, devManDays: 0.25, devNotes: 'CRUD มาตรฐาน', weightLevel: 'complete', weightScore: 10 },
  { no: 15, name: 'จัดการ Master ประเภทเชื้อเพลิง', category: 'Master Data', responsible: 'IT / Admin', description: 'CRUD ประเภทเชื้อเพลิง', riskLevel: 'low', riskScore: 1, riskReason: 'ข้อมูลพื้นฐาน', icon: Database,
    devDifficulty: 'easy', devScore: 1, devManDays: 0.25, devNotes: 'CRUD มาตรฐาน', weightLevel: 'complete', weightScore: 10 },
  { no: 16, name: 'จัดการ Master ราคาตั้ง', category: 'Master Data', responsible: 'IT / Admin', description: 'CRUD ราคามาตรฐาน ผูก Model+Sub Model', riskLevel: 'high', riskScore: 4, riskReason: 'ส่งผลต่อราคาขายและ margin โดยตรง', icon: Database,
    devDifficulty: 'medium', devScore: 3, devManDays: 0.5, devNotes: 'CRUD + Cascade Dropdown (Model→SubModel), Validation ราคา', weightLevel: 'major', weightScore: 4 },
  { no: 17, name: 'จัดการ Master ของแถม', category: 'Master Data', responsible: 'IT / Admin', description: 'CRUD ของแถม + มูลค่า', riskLevel: 'medium', riskScore: 2, riskReason: 'ส่งผลต่อต้นทุนทางอ้อม', icon: Database,
    devDifficulty: 'easy', devScore: 1, devManDays: 0.25, devNotes: 'CRUD มาตรฐาน + มูลค่า', weightLevel: 'minor', weightScore: 7 },
  { no: 18, name: 'จัดการ Master อุปกรณ์เสริม', category: 'Master Data', responsible: 'IT / Admin', description: 'CRUD อุปกรณ์เสริม + มูลค่า', riskLevel: 'medium', riskScore: 2, riskReason: 'ส่งผลต่อต้นทุนทางอ้อม', icon: Database,
    devDifficulty: 'easy', devScore: 1, devManDays: 0.25, devNotes: 'CRUD มาตรฐาน + มูลค่า', weightLevel: 'minor', weightScore: 7 },
  { no: 19, name: 'จัดการ Master สิทธิประโยชน์', category: 'Master Data', responsible: 'IT / Admin', description: 'CRUD สิทธิประโยชน์ + มูลค่า', riskLevel: 'medium', riskScore: 2, riskReason: 'ส่งผลต่อต้นทุนทางอ้อม', icon: Database,
    devDifficulty: 'easy', devScore: 1, devManDays: 0.25, devNotes: 'CRUD มาตรฐาน + มูลค่า', weightLevel: 'minor', weightScore: 7 },
  { no: 20, name: 'จัดการ Master คำนำหน้า', category: 'Master Data', responsible: 'IT / Admin', description: 'CRUD คำนำหน้าชื่อ', riskLevel: 'low', riskScore: 1, riskReason: 'ข้อมูลพื้นฐาน', icon: Database,
    devDifficulty: 'easy', devScore: 1, devManDays: 0.25, devNotes: 'CRUD มาตรฐาน', weightLevel: 'complete', weightScore: 10 },

  // Reports
  { no: 21, name: 'รายงานใบจองประจำเดือน', category: 'Reports', responsible: 'ทุกบทบาท', description: 'สรุปใบจองตาม period, สถานะ, ยอดเงิน', riskLevel: 'medium', riskScore: 3, riskReason: 'ใช้ประกอบการตัดสินใจทางธุรกิจ', icon: BarChart3,
    devDifficulty: 'medium', devScore: 3, devManDays: 1.0, devNotes: 'Query Aggregation, Date Filter, Chart, Export Excel', weightLevel: 'minor', weightScore: 7 },
  { no: 22, name: 'รายงานใบจองที่ยังไม่อนุมัติ', category: 'Reports', responsible: 'ผู้จัดการฝ่ายขาย', description: 'แสดงรายการค้างอนุมัติ เพื่อ follow up', riskLevel: 'medium', riskScore: 3, riskReason: 'ถ้าไม่ follow up อาจสูญเสียการขาย', icon: BarChart3,
    devDifficulty: 'easy', devScore: 2, devManDays: 0.5, devNotes: 'Filter ตามสถานะ, ตาราง + Sorting', weightLevel: 'minor', weightScore: 7 },
  { no: 23, name: 'รายงานยกเลิกใบจอง', category: 'Reports', responsible: 'ผู้จัดการฝ่ายขาย', description: 'สรุปรายการที่ถูกยกเลิก + เหตุผล', riskLevel: 'medium', riskScore: 3, riskReason: 'ใช้วิเคราะห์สาเหตุการยกเลิก', icon: BarChart3,
    devDifficulty: 'easy', devScore: 2, devManDays: 0.5, devNotes: 'Filter + ตาราง, คล้าย F22', weightLevel: 'minor', weightScore: 7 },

  // Forms
  { no: 24, name: 'พิมพ์สัญญาจอง', category: 'เอกสาร/ฟอร์ม', responsible: 'ที่ปรึกษาการขาย', description: 'Generate PDF สัญญาจองตามแบบฟอร์มบริษัท', riskLevel: 'medium', riskScore: 3, riskReason: 'เอกสารที่มีผลทางกฎหมาย', icon: FileOutput,
    devDifficulty: 'hard', devScore: 4, devManDays: 2.0, devNotes: 'PDF Layout ตามแบบฟอร์มจริง, Pixel-perfect, หลายหน้า, รองรับหลายบริษัท', weightLevel: 'major', weightScore: 4 },
  { no: 25, name: 'พิมพ์ยกเลิกสัญญาจอง', category: 'เอกสาร/ฟอร์ม', responsible: 'ที่ปรึกษาการขาย', description: 'Generate PDF หนังสือบอกเลิก/ยกเลิกสัญญา', riskLevel: 'medium', riskScore: 3, riskReason: 'เอกสารที่มีผลทางกฎหมาย', icon: FileOutput,
    devDifficulty: 'hard', devScore: 4, devManDays: 1.5, devNotes: 'PDF Layout เฉพาะ Cancel Form, คล้าย F24 แต่แบบฟอร์มต่าง', weightLevel: 'major', weightScore: 4 },
];

const getRiskBadge = (level: RiskLevel) => {
  const config = riskConfig[level];
  return (
    <Badge className={`${config.bgColor} ${config.color} ${config.borderColor} border`}>
      {config.label}
    </Badge>
  );
};

const getDevBadge = (level: DevDifficulty) => {
  const config = devConfig[level];
  return (
    <Badge className={`${config.bgColor} ${config.color} ${config.borderColor} border`}>
      {config.emoji} {config.label}
    </Badge>
  );
};

const getWeightBadge = (level: WeightLevel) => {
  const config = weightConfig[level];
  return (
    <Badge className={`${config.bgColor} ${config.color} ${config.borderColor} border font-bold`}>
      {config.emoji} {config.label} ({config.score})
    </Badge>
  );
};

const getWeightBar = (score: number) => {
  const color = score >= 10 ? 'bg-emerald-500' : score >= 7 ? 'bg-blue-500' : score >= 4 ? 'bg-orange-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${(score / 10) * 100}%` }} />
      </div>
      <span className="text-xs font-bold text-muted-foreground w-8 text-right">{score}/10</span>
    </div>
  );
};

const getRiskBar = (score: number, maxScore = 5) => {
  const colors: Record<number, string> = {
    1: 'bg-green-500',
    2: 'bg-yellow-500',
    3: 'bg-yellow-600',
    4: 'bg-orange-500',
    5: 'bg-red-500',
  };
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${colors[score] || 'bg-muted-foreground'}`}
          style={{ width: `${(score / maxScore) * 100}%` }}
        />
      </div>
      <span className="text-xs font-bold text-muted-foreground w-6 text-right">{score}/{maxScore}</span>
    </div>
  );
};

const getDevBar = (score: number) => {
  const colors: Record<number, string> = {
    1: 'bg-emerald-500',
    2: 'bg-cyan-500',
    3: 'bg-blue-500',
    4: 'bg-violet-500',
    5: 'bg-purple-600',
  };
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
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

  const veryHardCount = functions.filter(f => f.devDifficulty === 'very_hard').length;
  const hardCount = functions.filter(f => f.devDifficulty === 'hard').length;
  const devMediumCount = functions.filter(f => f.devDifficulty === 'medium').length;
  const easyCount = functions.filter(f => f.devDifficulty === 'easy').length;
  const avgDev = (functions.reduce((sum, f) => sum + f.devScore, 0) / functions.length).toFixed(1);
  const totalManDays = functions.reduce((sum, f) => sum + f.devManDays, 0);

  // Weight Score stats
  const wCriticalCount = functions.filter(f => f.weightLevel === 'critical').length;
  const wMajorCount = functions.filter(f => f.weightLevel === 'major').length;
  const wMinorCount = functions.filter(f => f.weightLevel === 'minor').length;
  const wCompleteCount = functions.filter(f => f.weightLevel === 'complete').length;
  const avgWeight = (functions.reduce((sum, f) => sum + f.weightScore, 0) / functions.length).toFixed(1);
  const totalWeight = functions.reduce((sum, f) => sum + f.weightScore, 0);
  const maxTotalWeight = functions.length * 10;

  const categoryStats = categories.map(cat => {
    const fns = functions.filter(f => f.category === cat);
    return {
      name: cat,
      avgRisk: +(fns.reduce((s, f) => s + f.riskScore, 0) / fns.length).toFixed(1),
      avgDev: +(fns.reduce((s, f) => s + f.devScore, 0) / fns.length).toFixed(1),
      avgWeight: +(fns.reduce((s, f) => s + f.weightScore, 0) / fns.length).toFixed(1),
      totalWeight: fns.reduce((s, f) => s + f.weightScore, 0),
      totalDays: +fns.reduce((s, f) => s + f.devManDays, 0).toFixed(1),
      count: fns.length,
    };
  });

  // Score Map data: sorted by weight score ascending (critical first)
  const scoreMapData = functions
    .map(f => ({
      ...f,
      totalScore: f.riskScore + f.devScore,
      priority: f.weightLevel,
    }))
    .sort((a, b) => a.weightScore - b.weightScore || b.devScore - a.devScore);

  const exportToExcel = () => {
    // Sheet 1: Score Map
    const scoreMapSheet = scoreMapData.map((f, i) => ({
      'ลำดับ': i + 1,
      'F.No': f.no,
      'Function Name': f.name,
      'Category': f.category,
      'Weight Level': weightConfig[f.weightLevel].label,
      'Weight Score (Max 10)': f.weightScore,
      'Responsible': f.responsible,
      'Dev Difficulty': devConfig[f.devDifficulty].label,
      'Dev Score': f.devScore,
      'Man-Days': f.devManDays,
      'Dev Notes': f.devNotes,
    }));
    const ws0 = XLSX.utils.json_to_sheet(scoreMapSheet);
    ws0['!cols'] = [
      { wch: 6 }, { wch: 5 }, { wch: 30 }, { wch: 18 }, { wch: 12 }, { wch: 16 },
      { wch: 22 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 50 },
    ];

    // Sheet 2: Function Details
    const detailData = functions.map(f => ({
      'No.': f.no,
      'Function Name': f.name,
      'Category': f.category,
      'Weight Level': weightConfig[f.weightLevel].label,
      'Weight Score': f.weightScore,
      'Responsible': f.responsible,
      'Description': f.description,
      'Dev Difficulty': devConfig[f.devDifficulty].label,
      'Dev Score (1-5)': f.devScore,
      'Man-Days': f.devManDays,
      'Dev Notes': f.devNotes,
    }));
    const ws1 = XLSX.utils.json_to_sheet(detailData);
    ws1['!cols'] = [
      { wch: 5 }, { wch: 30 }, { wch: 18 }, { wch: 12 }, { wch: 14 },
      { wch: 22 }, { wch: 50 }, { wch: 12 }, { wch: 14 }, { wch: 10 }, { wch: 50 },
    ];

    // Sheet 3: Summary by Category
    const summaryData = categoryStats.map(c => ({
      'Category': c.name,
      'จำนวน Function': c.count,
      'Avg Weight Score': c.avgWeight,
      'Total Weight Score': c.totalWeight,
      'Avg Dev Score': c.avgDev,
      'Total Man-Days': c.totalDays,
    }));
    summaryData.push({
      'Category': 'รวมทั้งหมด',
      'จำนวน Function': functions.length,
      'Avg Weight Score': +avgWeight,
      'Total Weight Score': totalWeight,
      'Avg Dev Score': +avgDev,
      'Total Man-Days': totalManDays,
    });
    const ws2 = XLSX.utils.json_to_sheet(summaryData);
    ws2['!cols'] = [{ wch: 20 }, { wch: 16 }, { wch: 16 }, { wch: 18 }, { wch: 16 }, { wch: 16 }];

    // Sheet 4: Distribution
    const distData = [
      { 'ประเภท': 'Weight - Critical (1)', 'จำนวน': wCriticalCount },
      { 'ประเภท': 'Weight - Major (4)', 'จำนวน': wMajorCount },
      { 'ประเภท': 'Weight - Minor (7)', 'จำนวน': wMinorCount },
      { 'ประเภท': 'Weight - Complete (10)', 'จำนวน': wCompleteCount },
      { 'ประเภท': '', 'จำนวน': '' as any },
      { 'ประเภท': 'Dev - ยากมาก', 'จำนวน': veryHardCount },
      { 'ประเภท': 'Dev - ยาก', 'จำนวน': hardCount },
      { 'ประเภท': 'Dev - ปานกลาง', 'จำนวน': devMediumCount },
      { 'ประเภท': 'Dev - ง่าย', 'จำนวน': easyCount },
    ];
    const ws3 = XLSX.utils.json_to_sheet(distData);
    ws3['!cols'] = [{ wch: 24 }, { wch: 10 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws0, 'Score Map');
    XLSX.utils.book_append_sheet(wb, ws1, 'Function Details');
    XLSX.utils.book_append_sheet(wb, ws2, 'Summary by Category');
    XLSX.utils.book_append_sheet(wb, ws3, 'Distribution');

    // Sheet 5-9: แยกตามกลุ่ม Function
    const categorySheetNames: Record<string, string> = {
      'Workflow หลัก': 'WF หลัก',
      'Workflow ยกเลิก': 'WF ยกเลิก',
      'Master Data': 'Master Data',
      'Reports': 'Reports',
      'เอกสาร/ฟอร์ม': 'เอกสาร-ฟอร์ม',
    };

    categories.forEach(cat => {
      const catFns = functions.filter(f => f.category === cat);
      const catTotalDays = catFns.reduce((s, f) => s + f.devManDays, 0);
      const catAvgDev = +(catFns.reduce((s, f) => s + f.devScore, 0) / catFns.length).toFixed(1);

      const rows = catFns.map((f, i) => ({
        'ลำดับ': i + 1,
        'F.No': f.no,
        'Function Name': f.name,
        'Weight Level': weightConfig[f.weightLevel].label,
        'Weight Score': f.weightScore,
        'Responsible': f.responsible,
        'Description': f.description,
        'Dev Difficulty': devConfig[f.devDifficulty].label,
        'Dev Score (1-5)': f.devScore,
        'Man-Days': f.devManDays,
        'Dev Notes': f.devNotes,
      }));

      // Add summary row
      const catAvgWeight = +(catFns.reduce((s, f) => s + f.weightScore, 0) / catFns.length).toFixed(1);
      const catTotalWeight = catFns.reduce((s, f) => s + f.weightScore, 0);
      rows.push({
        'ลำดับ': '' as any,
        'F.No': '' as any,
        'Function Name': '--- สรุป ---',
        'Weight Level': '',
        'Weight Score': catAvgWeight as any,
        'Responsible': '',
        'Description': `จำนวน ${catFns.length} Functions`,
        'Dev Difficulty': '',
        'Dev Score (1-5)': catAvgDev as any,
        'Man-Days': catTotalDays,
        'Dev Notes': `Avg Weight: ${catAvgWeight} | Total Weight: ${catTotalWeight} | Avg Dev: ${catAvgDev} | Total: ${catTotalDays} Man-Days`,
      });

      const wsCat = XLSX.utils.json_to_sheet(rows);
      wsCat['!cols'] = [
        { wch: 6 }, { wch: 5 }, { wch: 30 }, { wch: 12 }, { wch: 12 },
        { wch: 22 }, { wch: 45 }, { wch: 12 }, { wch: 14 }, { wch: 10 }, { wch: 50 },
      ];
      XLSX.utils.book_append_sheet(wb, wsCat, categorySheetNames[cat] || cat);
    });

    XLSX.writeFile(wb, 'FunctionOverview_ScoreMap.xlsx');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Header
          title="Function Overview"
          subtitle="ภาพรวม Function ทั้งหมด — ความเสี่ยงทาง Business + ความยากในการพัฒนา"
        />
        <Button onClick={exportToExcel} className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Export Excel
        </Button>
      </div>

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Summary Cards Row 1 - Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="border-l-4 border-l-foreground">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-foreground">{functions.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Function ทั้งหมด</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-amber-600">{avgWeight}</p>
              <p className="text-xs text-muted-foreground mt-1">Avg Weight Score /10</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-700">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-amber-700">{totalWeight}<span className="text-lg">/{maxTotalWeight}</span></p>
              <p className="text-xs text-muted-foreground mt-1">Total Weight Score</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-violet-500">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-violet-600">{avgDev}</p>
              <p className="text-xs text-muted-foreground mt-1">ค่าเฉลี่ยความยาก Dev</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{totalManDays}</p>
              <p className="text-xs text-muted-foreground mt-1">รวม Man-Days</p>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards Row 2 - Weight + Dev Difficulty breakdown */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {/* Weight */}
          <Card className="border-t-2 border-t-red-500">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-red-600">{wCriticalCount}</p>
              <p className="text-[10px] text-muted-foreground">🔴 Critical (1)</p>
            </CardContent>
          </Card>
          <Card className="border-t-2 border-t-orange-500">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-orange-600">{wMajorCount}</p>
              <p className="text-[10px] text-muted-foreground">🟠 Major (4)</p>
            </CardContent>
          </Card>
          <Card className="border-t-2 border-t-blue-500">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{wMinorCount}</p>
              <p className="text-[10px] text-muted-foreground">🔵 Minor (7)</p>
            </CardContent>
          </Card>
          <Card className="border-t-2 border-t-emerald-500">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-emerald-600">{wCompleteCount}</p>
              <p className="text-[10px] text-muted-foreground">✅ Complete (10)</p>
            </CardContent>
          </Card>
          {/* Dev */}
          <Card className="border-t-2 border-t-purple-600">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-purple-600">{veryHardCount}</p>
              <p className="text-[10px] text-muted-foreground">Dev ยากมาก</p>
            </CardContent>
          </Card>
          <Card className="border-t-2 border-t-violet-500">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-violet-600">{hardCount}</p>
              <p className="text-[10px] text-muted-foreground">Dev ยาก</p>
            </CardContent>
          </Card>
          <Card className="border-t-2 border-t-cyan-500">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-cyan-600">{devMediumCount}</p>
              <p className="text-[10px] text-muted-foreground">Dev ปานกลาง</p>
            </CardContent>
          </Card>
          <Card className="border-t-2 border-t-emerald-500">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-emerald-600">{easyCount}</p>
              <p className="text-[10px] text-muted-foreground">Dev ง่าย</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie Chart - Weight Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                การกระจาย Weight Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Critical (1)', value: wCriticalCount },
                      { name: 'Major (4)', value: wMajorCount },
                      { name: 'Minor (7)', value: wMinorCount },
                      { name: 'Complete (10)', value: wCompleteCount },
                    ]}
                    cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={4} dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {['#dc2626', '#ea580c', '#3b82f6', '#10b981'].map((color, i) => (
                      <Cell key={i} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart - Dev Difficulty Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Code2 className="w-4 h-4 text-violet-500" />
                การกระจายความยาก Dev
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'ยากมาก', value: veryHardCount },
                      { name: 'ยาก', value: hardCount },
                      { name: 'ปานกลาง', value: devMediumCount },
                      { name: 'ง่าย', value: easyCount },
                    ]}
                    cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={4} dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {['#9333ea', '#7c3aed', '#06b6d4', '#10b981'].map((color, i) => (
                      <Cell key={i} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Radar Chart - Category comparison */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Gauge className="w-4 h-4 text-blue-500" />
                เปรียบเทียบตามหมวด
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={categoryStats}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 9 }} />
                  <Radar name="Avg Weight" dataKey="avgWeight" stroke="#d97706" fill="#d97706" fillOpacity={0.3} />
                  <Radar name="ความยาก Dev" dataKey="avgDev" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.3} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bar Chart - Man-Days by Category */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Man-Days ตามหมวด (รวม {totalManDays} วัน)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryStats} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = { totalDays: 'Man-Days', avgWeight: 'Avg Weight', avgDev: 'ความยาก Dev', count: 'จำนวน' };
                  return [value, labels[name] || name];
                }} />
                <Legend formatter={(value) => {
                  const labels: Record<string, string> = { totalDays: 'Man-Days', avgWeight: 'Avg Weight Score', avgDev: 'ความยาก Dev เฉลี่ย', count: 'จำนวน Function' };
                  return labels[value] || value;
                }} />
                <Bar dataKey="totalDays" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgWeight" fill="#d97706" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgDev" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Dev Difficulty Legend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Code2 className="w-4 h-4 text-violet-500" />
              เกณฑ์ความยากในการพัฒนา
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
                <Zap className="w-7 h-7 text-purple-600" />
                <div>
                  <p className="text-sm font-semibold text-purple-700">🔴 ยากมาก (5/5)</p>
                  <p className="text-xs text-purple-600">ต้อง Integrate ระบบภายนอก, Logic ซับซ้อน, Security สูง</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <Code2 className="w-7 h-7 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-blue-700">🟠 ยาก (4/5)</p>
                  <p className="text-xs text-blue-600">ฟอร์มซับซ้อน, PDF Generation, Multi-step workflow</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan-50 border border-cyan-200">
                <Gauge className="w-7 h-7 text-cyan-600" />
                <div>
                  <p className="text-sm font-semibold text-cyan-700">🟡 ปานกลาง (2-3/5)</p>
                  <p className="text-xs text-cyan-600">Workflow มาตรฐาน, Dropdown ผูก FK, Query + Filter</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-emerald-700">🟢 ง่าย (1/5)</p>
                  <p className="text-xs text-emerald-600">CRUD มาตรฐาน, ตาราง + Dialog, ไม่มี Logic พิเศษ</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weight Score Legend */}
        <Card className="border-2 border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              เกณฑ์ Weight Score (Max 10 ต่อ Function)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {(['critical', 'major', 'minor', 'complete'] as WeightLevel[]).map(level => {
                const cfg = weightConfig[level];
                return (
                  <div key={level} className={`flex items-center gap-3 p-3 rounded-lg ${cfg.bgColor} border ${cfg.borderColor}`}>
                    <span className="text-2xl">{cfg.emoji}</span>
                    <div>
                      <p className={`text-sm font-semibold ${cfg.color}`}>{cfg.label} ({cfg.score}/10)</p>
                      <p className={`text-xs ${cfg.color} opacity-80`}>{cfg.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 text-xs text-muted-foreground text-right">
              Total Weight: <span className="font-bold">{totalWeight}/{maxTotalWeight}</span> ({((totalWeight / maxTotalWeight) * 100).toFixed(0)}%) | Avg: <span className="font-bold">{avgWeight}/10</span>
            </div>
          </CardContent>
        </Card>

        {/* Score Map Table - All Functions ranked by Weight Score */}
        <Card className="border-2 border-amber-300/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="w-5 h-5 text-amber-500" />
              Score Map — Function ทั้งหมด จัดเรียงตาม Weight Score (Critical → Complete)
              <Badge variant="outline" className="ml-2 text-amber-700 border-amber-400">{functions.length} Functions</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border rounded-lg overflow-hidden mx-6 mb-6">
              <Table>
                <TableHeader>
                  <TableRow className="bg-amber-50/50">
                    <TableHead className="w-10">ลำดับ</TableHead>
                    <TableHead className="w-10">F.No</TableHead>
                    <TableHead>Function</TableHead>
                    <TableHead>หมวด</TableHead>
                    <TableHead className="text-center">Weight Level</TableHead>
                    <TableHead className="w-[120px]">Weight Score</TableHead>
                    <TableHead className="text-center">ความยาก Dev</TableHead>
                    <TableHead className="text-center">Man-Days</TableHead>
                    <TableHead className="hidden xl:table-cell">ผู้รับผิดชอบ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scoreMapData.map((fn, idx) => {
                    const FnIcon = fn.icon;
                    const rowBg = fn.weightScore <= 1 ? 'bg-red-50/40' : fn.weightScore <= 4 ? 'bg-orange-50/30' : fn.weightScore <= 7 ? 'bg-blue-50/20' : '';
                    return (
                      <TableRow key={fn.no} className={rowBg}>
                        <TableCell className="font-bold text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell className="text-muted-foreground">{fn.no}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FnIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="font-medium text-sm">{fn.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{fn.category}</TableCell>
                        <TableCell className="text-center">
                          {getWeightBadge(fn.weightLevel)}
                        </TableCell>
                        <TableCell>
                          {getWeightBar(fn.weightScore)}
                        </TableCell>
                        <TableCell className="text-center">
                          {getDevBadge(fn.devDifficulty)}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-bold text-sm text-blue-700">{fn.devManDays}</span>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-xs text-muted-foreground">{fn.responsible}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>


        {categories.map((category) => {
          const categoryFunctions = functions.filter(f => f.category === category);
          const categoryIcon = category === 'Workflow หลัก' ? FileText
            : category === 'Workflow ยกเลิก' ? Ban
            : category === 'Master Data' ? Database
            : category === 'Reports' ? BarChart3
            : FileOutput;
          const CategoryIcon = categoryIcon;
          const catDays = categoryFunctions.reduce((s, f) => s + f.devManDays, 0);

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CategoryIcon className="w-5 h-5 text-primary" />
                  {category}
                  <Badge variant="secondary" className="ml-2">{categoryFunctions.length} Functions</Badge>
                  <Badge variant="outline" className="ml-1 text-blue-600 border-blue-300">{catDays} Man-Days</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border rounded-lg overflow-hidden mx-6 mb-6">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="w-10">#</TableHead>
                        <TableHead>Function</TableHead>
                        <TableHead className="text-center">Weight</TableHead>
                        <TableHead className="w-[110px]">Weight Score</TableHead>
                        <TableHead className="text-center">ความยาก Dev</TableHead>
                        <TableHead className="text-center w-20">Man-Days</TableHead>
                        <TableHead className="hidden xl:table-cell">หมายเหตุ Dev</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryFunctions.map((fn) => {
                        const FnIcon = fn.icon;
                        return (
                          <TableRow key={fn.no} className={
                            fn.weightScore <= 1 ? 'bg-red-50/40' :
                            fn.weightScore <= 4 ? 'bg-orange-50/30' :
                            fn.weightScore <= 7 ? 'bg-blue-50/20' : ''
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
                            <TableCell className="text-center">
                              {getWeightBadge(fn.weightLevel)}
                            </TableCell>
                            <TableCell>
                              {getWeightBar(fn.weightScore)}
                            </TableCell>
                            <TableCell className="text-center">
                              {getDevBadge(fn.devDifficulty)}
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="font-bold text-sm text-blue-700">{fn.devManDays}</span>
                            </TableCell>
                            <TableCell className="hidden xl:table-cell">
                              <p className="text-xs text-muted-foreground line-clamp-2">{fn.devNotes}</p>
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

        {/* Total Summary */}
        <Card className="border-2 border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">📊 สรุปการประเมินรวม</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                     <TableHead>หมวดหมู่</TableHead>
                    <TableHead className="text-center">จำนวน Function</TableHead>
                    <TableHead className="text-center">Avg Weight Score</TableHead>
                    <TableHead className="text-center">Total Weight</TableHead>
                    <TableHead className="text-center">ความยาก Dev เฉลี่ย</TableHead>
                    <TableHead className="text-center">Man-Days รวม</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryStats.map(cs => (
                    <TableRow key={cs.name}>
                     <TableCell className="font-medium">{cs.name}</TableCell>
                      <TableCell className="text-center">{cs.count}</TableCell>
                      <TableCell className="text-center">
                        <span className="text-amber-600 font-semibold">{cs.avgWeight}/10</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-amber-700 font-bold">{cs.totalWeight}/{cs.count * 10}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-violet-600 font-semibold">{cs.avgDev}/5</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-blue-700 font-bold">{cs.totalDays} วัน</span>
                      </TableCell>
                    </TableRow>
                  ))}
                   <TableRow className="bg-muted/50 font-bold">
                    <TableCell>รวมทั้งหมด</TableCell>
                    <TableCell className="text-center">{functions.length}</TableCell>
                    <TableCell className="text-center text-amber-600">{avgWeight}/10</TableCell>
                    <TableCell className="text-center text-amber-700">{totalWeight}/{maxTotalWeight}</TableCell>
                    <TableCell className="text-center text-violet-600">{avgDev}/5</TableCell>
                    <TableCell className="text-center text-blue-700 text-lg">{totalManDays} วัน</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
