import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Separator } from '@/components/ui/separator';
import {
  Car,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Download,
  Smartphone,
  Mail,
  Clock,
  RefreshCw,
} from 'lucide-react';

const mockReservation = {
  documentNumber: 'BPKRS-260400001',
  customerName: 'คุณสมชาย ใจดี',
  phone: '08X-XXX-1234',
  email: 'somchai@example.com',
  model: 'Toyota Yaris ATIV',
  submodel: 'Premium 1.2',
  color: 'ขาวมุก',
  listPrice: 629000,
  deposit: 5000,
  expectedDelivery: '2026-05-15',
  salesAdvisor: 'คุณนภา รักดี',
  advisorPhone: '081-234-5678',
};

function formatBaht(n: number) {
  return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2 }).format(n);
}

/* ---------- Shared Mobile Frame ---------- */
function MobileFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="rounded-[2.5rem] border-8 border-slate-800 bg-background overflow-hidden shadow-2xl">
        {/* Status bar */}
        <div className="bg-slate-800 text-white text-[10px] flex justify-between px-6 py-1.5">
          <span>9:41</span>
          <span>● ● ●</span>
        </div>
        <div className="max-h-[640px] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

/* ---------- Reservation Summary (shared) ---------- */
function ReservationSummary() {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">เลขที่ใบจอง</span>
        <span className="font-semibold">{mockReservation.documentNumber}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">ผู้จอง</span>
        <span className="font-medium">{mockReservation.customerName}</span>
      </div>
      <Separator />
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <span className="text-muted-foreground">รุ่น</span>
          <span>{mockReservation.model}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">รุ่นย่อย</span>
          <span>{mockReservation.submodel}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">สี</span>
          <span>{mockReservation.color}</span>
        </div>
      </div>
      <Separator />
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <span className="text-muted-foreground">ราคารถ</span>
          <span className="font-medium">{formatBaht(mockReservation.listPrice)} ฿</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">เงินจอง</span>
          <span className="font-semibold text-primary">{formatBaht(mockReservation.deposit)} ฿</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">วันที่ส่งมอบ</span>
          <span>{mockReservation.expectedDelivery}</span>
        </div>
      </div>
      <Separator />
      <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-1">
        <div className="font-medium text-foreground">ที่ปรึกษาการขาย</div>
        <div className="text-muted-foreground">{mockReservation.salesAdvisor}</div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Phone className="w-3 h-3" />
          {mockReservation.advisorPhone}
        </div>
      </div>
    </div>
  );
}

/* ---------- Header inside phone ---------- */
function PhoneHeader({ subtitle }: { subtitle?: string }) {
  return (
    <div className="bg-gradient-to-br from-primary to-blue-vivid text-white p-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
          <Car className="w-4 h-4" />
        </div>
        <div className="text-xs opacity-90">BIZPK Auto</div>
      </div>
      <h2 className="text-lg font-bold">ยืนยันสัญญาจองรถยนต์</h2>
      {subtitle && <p className="text-xs opacity-90 mt-1">{subtitle}</p>}
    </div>
  );
}

/* ============= OTP STATES ============= */
function OtpRequestState() {
  return (
    <MobileFrame>
      <PhoneHeader subtitle="ยืนยันด้วยรหัส OTP" />
      <div className="p-5 space-y-5">
        <ReservationSummary />
        <div className="rounded-lg border border-dashed p-4 text-center space-y-2">
          <Smartphone className="w-8 h-8 mx-auto text-primary" />
          <p className="text-sm">
            เราจะส่งรหัส OTP 6 หลักไปที่
            <br />
            <span className="font-semibold text-foreground">{mockReservation.phone}</span>
          </p>
        </div>
        <Button className="w-full" size="lg">
          <Phone className="w-4 h-4" /> ขอรหัส OTP
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          หากไม่ใช่เบอร์ของท่าน กรุณาติดต่อที่ปรึกษาการขาย
        </p>
      </div>
    </MobileFrame>
  );
}

function OtpEnterState() {
  const [value, setValue] = useState('');
  return (
    <MobileFrame>
      <PhoneHeader subtitle="กรอกรหัส OTP ที่ได้รับ" />
      <div className="p-5 space-y-5">
        <ReservationSummary />
        <div className="space-y-3">
          <p className="text-sm text-center text-muted-foreground">
            ส่งรหัสไปที่ <span className="font-medium text-foreground">{mockReservation.phone}</span>
          </p>
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={value} onChange={setValue}>
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            รหัสหมดอายุใน <span className="font-medium text-foreground">04:32</span>
          </div>
          <button className="w-full text-xs text-primary hover:underline flex items-center justify-center gap-1">
            <RefreshCw className="w-3 h-3" /> ส่งรหัสใหม่อีกครั้ง
          </button>
        </div>
        <Button className="w-full" size="lg">
          <ShieldCheck className="w-4 h-4" /> ยืนยันสัญญาจอง
        </Button>
      </div>
    </MobileFrame>
  );
}

function SuccessState() {
  return (
    <MobileFrame>
      <PhoneHeader subtitle="ยืนยันสำเร็จ" />
      <div className="p-5 space-y-5">
        <div className="flex flex-col items-center text-center py-4 space-y-3">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#02681f20' }}
          >
            <CheckCircle2 className="w-10 h-10" style={{ color: '#02681f' }} />
          </div>
          <h3 className="text-lg font-bold" style={{ color: '#02681f' }}>
            ยืนยันสัญญาจองสำเร็จ
          </h3>
          <p className="text-xs text-muted-foreground">
            ยืนยันเมื่อ 19 เม.ย. 2026 เวลา 14:32 น.
          </p>
          <Badge style={{ backgroundColor: '#02681f', color: 'white' }} className="hover:opacity-90">
            Confirmed
          </Badge>
        </div>
        <ReservationSummary />
        <Button variant="outline" className="w-full" size="lg">
          <Download className="w-4 h-4" /> ดาวน์โหลดสำเนาใบจอง (PDF)
        </Button>
      </div>
    </MobileFrame>
  );
}

/* ============= LINK STATES ============= */
function LinkLandingState() {
  return (
    <MobileFrame>
      <PhoneHeader subtitle="ตรวจสอบและยืนยันสัญญาจอง" />
      <div className="p-5 space-y-5">
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm">
          สวัสดีคุณ <span className="font-semibold">{mockReservation.customerName}</span>,
          <br />
          กรุณาตรวจสอบรายละเอียดสัญญาจองด้านล่าง
        </div>
        <ReservationSummary />
        <div className="rounded-lg border p-3 space-y-2">
          <div className="flex items-start gap-2">
            <Checkbox id="terms" className="mt-0.5" />
            <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
              ข้าพเจ้าได้อ่านและยอมรับ
              <span className="text-primary"> เงื่อนไขสัญญาจองรถยนต์ </span>
              ทั้งหมดแล้ว
            </label>
          </div>
        </div>
        <Button className="w-full" size="lg">
          <ShieldCheck className="w-4 h-4" /> ยืนยันสัญญาจอง
        </Button>
      </div>
    </MobileFrame>
  );
}

function LinkExpiredState() {
  return (
    <MobileFrame>
      <PhoneHeader subtitle="ลิงก์ยืนยันไม่สามารถใช้งานได้" />
      <div className="p-5 space-y-5">
        <div className="flex flex-col items-center text-center py-6 space-y-3">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-amber-700">ลิงก์นี้หมดอายุแล้ว</h3>
          <p className="text-sm text-muted-foreground">
            กรุณาติดต่อที่ปรึกษาการขายของท่านเพื่อขอลิงก์ใหม่
          </p>
        </div>
        <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
          <div className="font-medium">ติดต่อที่ปรึกษาการขาย</div>
          <div className="text-muted-foreground">{mockReservation.salesAdvisor}</div>
          <a
            href={`tel:${mockReservation.advisorPhone}`}
            className="flex items-center gap-2 text-primary font-medium"
          >
            <Phone className="w-4 h-4" /> {mockReservation.advisorPhone}
          </a>
        </div>
        <Button variant="outline" className="w-full" size="lg">
          <Mail className="w-4 h-4" /> ส่งคำขอลิงก์ใหม่
        </Button>
      </div>
    </MobileFrame>
  );
}

/* ============= MAIN PAGE ============= */
export default function CustomerConfirmPreviewPage() {
  const [otpState, setOtpState] = useState<'request' | 'enter' | 'success'>('request');
  const [linkState, setLinkState] = useState<'landing' | 'expired' | 'success'>('landing');

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      {/* Page header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Smartphone className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">ยืนยันสัญญาจอง (Customer View)</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          หน้านี้เป็นตัวอย่าง UI ฝั่งลูกค้า สำหรับ Confirm Design — ไม่มีการเชื่อมต่อข้อมูลจริง
        </p>
      </div>

      <Tabs defaultValue="otp" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="otp">
            <ShieldCheck className="w-4 h-4 mr-2" /> ยืนยันด้วย OTP
          </TabsTrigger>
          <TabsTrigger value="link">
            <Mail className="w-4 h-4 mr-2" /> ยืนยันด้วย Link
          </TabsTrigger>
        </TabsList>

        {/* OTP TAB */}
        <TabsContent value="otp" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">กรณียืนยันด้วย OTP</CardTitle>
              <p className="text-sm text-muted-foreground">
                ลูกค้าจะได้รับรหัส OTP 6 หลักทาง SMS เพื่อยืนยันการทำสัญญาจอง
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* State switcher */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'request', label: '1. ขอรหัส OTP' },
                  { id: 'enter', label: '2. กรอกรหัส OTP' },
                  { id: 'success', label: '3. ยืนยันสำเร็จ' },
                ].map((s) => (
                  <Button
                    key={s.id}
                    size="sm"
                    variant={otpState === s.id ? 'default' : 'outline'}
                    onClick={() => setOtpState(s.id as typeof otpState)}
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
              <div className="bg-muted/30 rounded-xl p-6">
                {otpState === 'request' && <OtpRequestState />}
                {otpState === 'enter' && <OtpEnterState />}
                {otpState === 'success' && <SuccessState />}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LINK TAB */}
        <TabsContent value="link" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">กรณียืนยันด้วย Link</CardTitle>
              <p className="text-sm text-muted-foreground">
                ลูกค้าจะได้รับลิงก์ยืนยันทาง Email/SMS แล้วกดเพื่อตรวจสอบและยอมรับเงื่อนไข
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'landing', label: '1. หน้าตรวจสอบสัญญา' },
                  { id: 'expired', label: '2. ลิงก์หมดอายุ' },
                  { id: 'success', label: '3. ยืนยันสำเร็จ' },
                ].map((s) => (
                  <Button
                    key={s.id}
                    size="sm"
                    variant={linkState === s.id ? 'default' : 'outline'}
                    onClick={() => setLinkState(s.id as typeof linkState)}
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
              <div className="bg-muted/30 rounded-xl p-6">
                {linkState === 'landing' && <LinkLandingState />}
                {linkState === 'expired' && <LinkExpiredState />}
                {linkState === 'success' && <SuccessState />}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
