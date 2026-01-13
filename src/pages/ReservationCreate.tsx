import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
  Save, 
  ArrowRight, 
  User, 
  Car, 
  Wallet, 
  Gift, 
  Paperclip,
  Building2,
  Users
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { WorkflowSteps } from '@/components/reservations/WorkflowSteps';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  companies, 
  branches, 
  vehicleModels,
  standardSubmodels 
} from '@/data/mockData';
import { cn } from '@/lib/utils';
import type { CustomerType, FuelType, PurchaseType } from '@/types/reservation';

export default function ReservationCreate() {
  const navigate = useNavigate();
  const { selectedCompany } = useOutletContext<{ selectedCompany: string }>();
  const company = companies.find(c => c.id === selectedCompany);

  // Form state
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedBU, setSelectedBU] = useState('');
  
  // Booking Customer
  const [bookingCustomerType, setBookingCustomerType] = useState<CustomerType>('individual');
  const [bookingTitle, setBookingTitle] = useState('');
  const [bookingFirstName, setBookingFirstName] = useState('');
  const [bookingLastName, setBookingLastName] = useState('');
  const [bookingIdNo, setBookingIdNo] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  
  // Buyer
  const [isBuyerSame, setIsBuyerSame] = useState(true);
  
  // Vehicle
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedSubmodel, setSelectedSubmodel] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedFuelType, setSelectedFuelType] = useState<FuelType>('ICE');
  
  // Pricing
  const [purchaseType, setPurchaseType] = useState<PurchaseType>('cash');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');

  const companyBranches = branches.filter(b => b.companyId === selectedCompany);
  const companyModels = vehicleModels.filter(m => m.companyId === selectedCompany);
  const selectedSubmodelData = standardSubmodels.find(s => s.id === selectedSubmodel);

  const basePrice = 0; // Will be set from master data later
  const finalPrice = basePrice - discountAmount;

  const handleSaveDraft = () => {
    // Save draft logic
    console.log('Saving draft...');
    navigate('/reservations');
  };

  return (
    <>
      <Header 
        title="สร้างใบจองใหม่"
        subtitle={`${company?.code} - Step 1: สร้างสัญญาจอง`}
      />
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
          {/* Workflow Progress */}
          <WorkflowSteps currentStage="step1" documentStatus="draft" />

          {/* Form Sections */}
          <div className="space-y-6">
            {/* Section 1: Branch/Vehicle Type Selection */}
            <div className="form-section">
              <div className="form-section-header flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                ข้อมูลสาขา / ประเภทรถยนต์
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branch">สาขา <span className="text-destructive">*</span></Label>
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger className="input-focus">
                      <SelectValue placeholder="เลือกสาขา" />
                    </SelectTrigger>
                    <SelectContent>
                      {companyBranches.map(branch => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleType">ประเภทรถยนต์ <span className="text-destructive">*</span></Label>
                  <Select value={selectedBU} onValueChange={setSelectedBU}>
                    <SelectTrigger className="input-focus">
                      <SelectValue placeholder="เลือกประเภทรถยนต์" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">รถยนต์ส่วนบุคคลไม่เกิน 7 ที่นั่ง</SelectItem>
                      <SelectItem value="pickup">รถยนต์กระบะ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 2: Booking Customer */}
            <div className="form-section">
              <div className="form-section-header flex items-center gap-2">
                <User className="w-5 h-5" />
                ข้อมูลผู้จองรถ
              </div>
              
              {/* Customer Type */}
              <div className="mb-4">
                <Label>ประเภทผู้จอง <span className="text-destructive">*</span></Label>
                <RadioGroup 
                  value={bookingCustomerType} 
                  onValueChange={(v) => setBookingCustomerType(v as CustomerType)}
                  className="flex gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="individual" id="individual" />
                    <Label htmlFor="individual" className="cursor-pointer">บุคคลธรรมดา</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="corporate" id="corporate" />
                    <Label htmlFor="corporate" className="cursor-pointer">นิติบุคคล</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>คำนำหน้า</Label>
                  <Select value={bookingTitle} onValueChange={setBookingTitle}>
                    <SelectTrigger className="input-focus">
                      <SelectValue placeholder="เลือก" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="นาย">นาย</SelectItem>
                      <SelectItem value="นาง">นาง</SelectItem>
                      <SelectItem value="นางสาว">นางสาว</SelectItem>
                      <SelectItem value="บริษัท">บริษัท</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label>ชื่อ <span className="text-destructive">*</span></Label>
                  <Input 
                    value={bookingFirstName} 
                    onChange={(e) => setBookingFirstName(e.target.value)}
                    placeholder="ชื่อ"
                    className="input-focus"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>นามสกุล <span className="text-destructive">*</span></Label>
                  <Input 
                    value={bookingLastName} 
                    onChange={(e) => setBookingLastName(e.target.value)}
                    placeholder="นามสกุล"
                    className="input-focus"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>เลขบัตรประชาชน <span className="text-destructive">*</span></Label>
                  <Input 
                    value={bookingIdNo} 
                    onChange={(e) => setBookingIdNo(e.target.value)}
                    placeholder="X-XXXX-XXXXX-XX-X"
                    className="input-focus"
                  />
                </div>
                <div className="space-y-2">
                  <Label>เบอร์โทรศัพท์ <span className="text-destructive">*</span></Label>
                  <Input 
                    value={bookingPhone} 
                    onChange={(e) => setBookingPhone(e.target.value)}
                    placeholder="0XX-XXX-XXXX"
                    className="input-focus"
                  />
                </div>
                <div className="space-y-2">
                  <Label>อีเมล</Label>
                  <Input 
                    type="email"
                    value={bookingEmail} 
                    onChange={(e) => setBookingEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="input-focus"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Buyer (if different) */}
            <div className="form-section">
              <div className="form-section-header flex items-center gap-2">
                <Users className="w-5 h-5" />
                ข้อมูลผู้ซื้อรถ
              </div>
              
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox 
                  id="buyerSame" 
                  checked={isBuyerSame}
                  onCheckedChange={(checked) => setIsBuyerSame(checked as boolean)}
                />
                <Label htmlFor="buyerSame" className="cursor-pointer">
                  ผู้ซื้อรถเป็นคนเดียวกันกับผู้จอง
                </Label>
              </div>

              {!isBuyerSame && (
                <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                  <p className="text-sm text-muted-foreground mb-4">
                    กรุณากรอกข้อมูลผู้ซื้อรถ (หากเป็นคนละบุคคลกับผู้จอง)
                  </p>
                  {/* Same fields as booking customer */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>คำนำหน้า + ชื่อ <span className="text-destructive">*</span></Label>
                      <Input placeholder="นาย/นาง/นางสาว ชื่อ" className="input-focus" />
                    </div>
                    <div className="space-y-2">
                      <Label>นามสกุล <span className="text-destructive">*</span></Label>
                      <Input placeholder="นามสกุล" className="input-focus" />
                    </div>
                    <div className="space-y-2">
                      <Label>เบอร์โทรศัพท์ <span className="text-destructive">*</span></Label>
                      <Input placeholder="0XX-XXX-XXXX" className="input-focus" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: Vehicle Selection */}
            <div className="form-section">
              <div className="form-section-header flex items-center gap-2">
                <Car className="w-5 h-5" />
                รายละเอียดรถ
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>รุ่นรถ <span className="text-destructive">*</span></Label>
                  <Select value={selectedModel} onValueChange={(v) => { setSelectedModel(v); setSelectedSubmodel(''); }}>
                    <SelectTrigger className="input-focus">
                      <SelectValue placeholder="เลือกรุ่นรถ" />
                    </SelectTrigger>
                    <SelectContent>
                      {companyModels.map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>รุ่นย่อย <span className="text-destructive">*</span></Label>
                  <Select value={selectedSubmodel} onValueChange={setSelectedSubmodel} disabled={!selectedModel}>
                    <SelectTrigger className="input-focus">
                      <SelectValue placeholder="เลือกรุ่นย่อย" />
                    </SelectTrigger>
                    <SelectContent>
                      {standardSubmodels.map(sub => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>สี <span className="text-destructive">*</span></Label>
                  <Select value={selectedColor} onValueChange={setSelectedColor} disabled={!selectedSubmodel}>
                    <SelectTrigger className="input-focus">
                      <SelectValue placeholder="เลือกสี" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="white">ขาว</SelectItem>
                      <SelectItem value="black">ดำ</SelectItem>
                      <SelectItem value="silver">เงิน</SelectItem>
                      <SelectItem value="gray">เทา</SelectItem>
                      <SelectItem value="red">แดง</SelectItem>
                      <SelectItem value="blue">น้ำเงิน</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ประเภทเชื้อเพลิง <span className="text-destructive">*</span></Label>
                  <Select value={selectedFuelType} onValueChange={(v) => setSelectedFuelType(v as FuelType)} disabled={!selectedSubmodel}>
                    <SelectTrigger className="input-focus">
                      <SelectValue placeholder="เลือกประเภทเชื้อเพลิง" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ICE">น้ำมันเบนซิน/ดีเซล</SelectItem>
                      <SelectItem value="Hybrid">ไฮบริด</SelectItem>
                      <SelectItem value="PHEV">ปลั๊กอินไฮบริด</SelectItem>
                      <SelectItem value="EV">ไฟฟ้า (EV)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 5: Pricing */}
            <div className="form-section">
              <div className="form-section-header flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                ราคา / เงื่อนไข
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>ราคารถ (รวม VAT)</Label>
                  <Input 
                    value={basePrice > 0 ? `฿${basePrice.toLocaleString()}` : '-'}
                    readOnly
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ส่วนลด</Label>
                  <Input 
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    placeholder="0"
                    className="input-focus"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ราคาสุทธิ</Label>
                  <Input 
                    value={finalPrice ? `฿${finalPrice.toLocaleString()}` : '-'}
                    readOnly
                    className="bg-primary/5 font-semibold text-primary"
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label>ประเภทการซื้อ <span className="text-destructive">*</span></Label>
                <RadioGroup 
                  value={purchaseType} 
                  onValueChange={(v) => setPurchaseType(v as PurchaseType)}
                  className="flex gap-6 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="cursor-pointer">เงินสด</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="finance" id="finance" />
                    <Label htmlFor="finance" className="cursor-pointer">สินเชื่อ (ผ่อน)</Label>
                  </div>
                </RadioGroup>
              </div>

              {purchaseType === 'finance' && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm font-medium text-blue-800 mb-3">ข้อมูลสินเชื่อ</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>เงินดาวน์</Label>
                      <Input type="number" placeholder="0" className="input-focus" />
                    </div>
                    <div className="space-y-2">
                      <Label>ยอดจัดไฟแนนซ์</Label>
                      <Input type="number" placeholder="0" className="input-focus" />
                    </div>
                    <div className="space-y-2">
                      <Label>ระยะเวลาผ่อน (เดือน)</Label>
                      <Select>
                        <SelectTrigger className="input-focus">
                          <SelectValue placeholder="เลือก" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="36">36 เดือน</SelectItem>
                          <SelectItem value="48">48 เดือน</SelectItem>
                          <SelectItem value="60">60 เดือน</SelectItem>
                          <SelectItem value="72">72 เดือน</SelectItem>
                          <SelectItem value="84">84 เดือน</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>เงินจอง</Label>
                  <Input 
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    placeholder="0"
                    className="input-focus"
                  />
                </div>
                <div className="space-y-2">
                  <Label>วันที่คาดว่าจะรับรถ</Label>
                  <Input 
                    type="date"
                    value={expectedDeliveryDate}
                    onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                    className="input-focus"
                  />
                </div>
              </div>
            </div>

            {/* Section 6: Freebies/Items (Collapsed by default) */}
            <div className="form-section">
              <div className="form-section-header flex items-center gap-2">
                <Gift className="w-5 h-5" />
                ของแถม / อุปกรณ์ / สิทธิประโยชน์
              </div>
              <div className="p-4 bg-muted/30 rounded-lg border border-dashed border-border text-center">
                <p className="text-muted-foreground">ยังไม่มีรายการ</p>
                <Button variant="outline" size="sm" className="mt-2">
                  + เพิ่มรายการ
                </Button>
              </div>
            </div>

            {/* Section 7: Attachments */}
            <div className="form-section">
              <div className="form-section-header flex items-center gap-2">
                <Paperclip className="w-5 h-5" />
                เอกสารแนบ
              </div>
              <div className="p-4 bg-muted/30 rounded-lg border border-dashed border-border text-center">
                <p className="text-muted-foreground">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
                <Button variant="outline" size="sm" className="mt-2">
                  เลือกไฟล์
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
              <Button 
                variant="outline" 
                onClick={() => navigate('/reservations')}
              >
                ยกเลิก
              </Button>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleSaveDraft}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  บันทึกฉบับร่าง
                </Button>
                <Button 
                  className="btn-primary-gradient gap-2"
                  onClick={handleSaveDraft}
                >
                  บันทึกและไป Step 2
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
