import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { 
  Save, 
  ArrowRight, 
  User, 
  Car, 
  Wallet, 
  Gift, 
  Paperclip,
  Building2,
  Users,
  Wrench,
  Star,
  Plus,
  Trash2,
  Loader2
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { WorkflowSteps } from '@/components/reservations/WorkflowSteps';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function ReservationEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedCompany } = useOutletContext<{ selectedCompany: string }>();
  const { user } = useAuth();
  const company = companies.find(c => c.id === selectedCompany);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [documentNumber, setDocumentNumber] = useState('');

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
  const [buyerName, setBuyerName] = useState('');
  const [buyerIdCard, setBuyerIdCard] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  
  // Vehicle
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedSubmodel, setSelectedSubmodel] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedFuelType, setSelectedFuelType] = useState<FuelType>('ICE');
  
  // Pricing
  const [purchaseType, setPurchaseType] = useState<PurchaseType>('cash');
  const [basePrice, setBasePrice] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');

  // Items - ของแถม, อุปกรณ์ตกแต่ง, สิทธิประโยชน์
  const [freebies, setFreebies] = useState<Array<{ id: number; name: string; value: number }>>([]);
  const [accessories, setAccessories] = useState<Array<{ id: number; name: string; value: number }>>([]);
  const [benefits, setBenefits] = useState<Array<{ id: number; name: string; value: number }>>([]);

  // Fetch reservation data
  useEffect(() => {
    const fetchReservation = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('reservations')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching reservation:', error);
          toast.error('ไม่สามารถโหลดข้อมูลได้');
          navigate('/reservations');
          return;
        }

        if (!data) {
          toast.error('ไม่พบข้อมูลใบจอง');
          navigate('/reservations');
          return;
        }

        // Populate form with data
        setDocumentNumber(data.document_number);
        setSelectedBranch(data.branch_id || '');
        setSelectedBU(data.vehicle_type || '');
        setBookingCustomerType((data.customer_type as CustomerType) || 'individual');
        
        // Parse customer name (format: "คำนำหน้าชื่อ นามสกุล")
        const nameParts = data.customer_name.split(' ');
        if (nameParts.length >= 2) {
          // Try to extract title
          const titles = ['นาย', 'นาง', 'นางสาว', 'บริษัท'];
          let title = '';
          let firstName = nameParts[0];
          
          for (const t of titles) {
            if (nameParts[0].startsWith(t)) {
              title = t;
              firstName = nameParts[0].substring(t.length);
              break;
            }
          }
          
          setBookingTitle(title);
          setBookingFirstName(firstName);
          setBookingLastName(nameParts.slice(1).join(' '));
        } else {
          setBookingFirstName(data.customer_name);
        }
        
        setBookingIdNo(data.customer_id_card || '');
        setBookingPhone(data.customer_phone || '');
        setBookingEmail(data.customer_email || '');
        
        // Buyer info
        const isSame = data.buyer_name === data.customer_name;
        setIsBuyerSame(isSame);
        if (!isSame && data.buyer_name) {
          setBuyerName(data.buyer_name);
          setBuyerIdCard(data.buyer_id_card || '');
          setBuyerPhone(data.buyer_phone || '');
        }
        
        // Vehicle - find model by name
        const model = vehicleModels.find(m => m.name === data.model);
        if (model) setSelectedModel(model.id);
        
        const submodel = standardSubmodels.find(s => s.name === data.submodel);
        if (submodel) setSelectedSubmodel(submodel.id);
        
        setSelectedColor(data.color || '');
        setSelectedFuelType((data.fuel_type as FuelType) || 'ICE');
        
        // Pricing
        setBasePrice(data.list_price || 0);
        setDiscountAmount(data.discount || 0);
        setDepositAmount(data.deposit_amount || 0);
        setExpectedDeliveryDate(data.expected_delivery_date || '');
        
        // Items
        if (Array.isArray(data.freebies)) {
          setFreebies(data.freebies as Array<{ id: number; name: string; value: number }>);
        }
        if (Array.isArray(data.accessories)) {
          setAccessories(data.accessories as Array<{ id: number; name: string; value: number }>);
        }
        if (Array.isArray(data.benefits)) {
          setBenefits(data.benefits as Array<{ id: number; name: string; value: number }>);
        }
      } catch (err) {
        console.error('Error:', err);
        toast.error('เกิดข้อผิดพลาด');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservation();
  }, [id, navigate]);

  const addItem = (type: 'freebies' | 'accessories' | 'benefits') => {
    const newItem = { id: Date.now(), name: '', value: 0 };
    if (type === 'freebies') setFreebies([...freebies, newItem]);
    else if (type === 'accessories') setAccessories([...accessories, newItem]);
    else setBenefits([...benefits, newItem]);
  };

  const removeItem = (type: 'freebies' | 'accessories' | 'benefits', itemId: number) => {
    if (type === 'freebies') setFreebies(freebies.filter(item => item.id !== itemId));
    else if (type === 'accessories') setAccessories(accessories.filter(item => item.id !== itemId));
    else setBenefits(benefits.filter(item => item.id !== itemId));
  };

  const updateItem = (type: 'freebies' | 'accessories' | 'benefits', itemId: number, field: 'name' | 'value', value: string | number) => {
    const updateFn = (items: Array<{ id: number; name: string; value: number }>) =>
      items.map(item => item.id === itemId ? { ...item, [field]: value } : item);
    
    if (type === 'freebies') setFreebies(updateFn(freebies));
    else if (type === 'accessories') setAccessories(updateFn(accessories));
    else setBenefits(updateFn(benefits));
  };

  const companyBranches = branches.filter(b => b.companyId === selectedCompany);
  const companyModels = vehicleModels.filter(m => m.companyId === selectedCompany);

  // Calculate net price
  const finalPrice = basePrice - discountAmount;

  const handleSave = async () => {
    if (!id) return;

    // Validation
    if (!selectedBranch) {
      toast.error('กรุณาเลือกสาขา');
      return;
    }
    if (!bookingFirstName || !bookingLastName) {
      toast.error('กรุณากรอกชื่อ-นามสกุลผู้จอง');
      return;
    }
    if (!bookingIdNo) {
      toast.error('กรุณากรอกเลขบัตรประชาชน');
      return;
    }
    if (!bookingPhone) {
      toast.error('กรุณากรอกเบอร์โทรศัพท์');
      return;
    }
    if (basePrice <= 0) {
      toast.error('กรุณากรอกราคารถ');
      return;
    }

    setIsSaving(true);

    try {
      const customerName = `${bookingTitle}${bookingFirstName} ${bookingLastName}`;
      const modelName = vehicleModels.find(m => m.id === selectedModel)?.name || '';
      const submodelName = standardSubmodels.find(s => s.id === selectedSubmodel)?.name || '';

      const updateData = {
        branch_id: selectedBranch,
        customer_type: bookingCustomerType,
        customer_name: customerName,
        customer_id_card: bookingIdNo,
        customer_phone: bookingPhone,
        customer_email: bookingEmail || null,
        buyer_name: isBuyerSame ? customerName : buyerName || null,
        buyer_id_card: isBuyerSame ? bookingIdNo : buyerIdCard || null,
        buyer_phone: isBuyerSame ? bookingPhone : buyerPhone || null,
        vehicle_type: selectedBU || null,
        model: modelName || null,
        submodel: submodelName || null,
        color: selectedColor || null,
        fuel_type: selectedFuelType || null,
        list_price: basePrice,
        discount: discountAmount,
        net_price: finalPrice,
        deposit_amount: depositAmount,
        expected_delivery_date: expectedDeliveryDate || null,
        freebies: freebies.filter(f => f.name),
        accessories: accessories.filter(a => a.name),
        benefits: benefits.filter(b => b.name),
      };

      const { error } = await supabase
        .from('reservations')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating reservation:', error);
        toast.error('เกิดข้อผิดพลาดในการบันทึก: ' + error.message);
        return;
      }

      toast.success('บันทึกการแก้ไขสำเร็จ');
      navigate('/reservations');
    } catch (err) {
      console.error('Error:', err);
      toast.error('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header 
          title="แก้ไขใบจอง"
          subtitle="กำลังโหลดข้อมูล..."
        />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header 
        title="แก้ไขใบจอง"
        subtitle={`${company?.code} - เลขที่: ${documentNumber}`}
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
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 13);
                      setBookingIdNo(value);
                    }}
                    placeholder="กรอกเลข 13 หลัก"
                    maxLength={13}
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>ชื่อ-นามสกุล <span className="text-destructive">*</span></Label>
                      <Input 
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        placeholder="ชื่อ-นามสกุล" 
                        className="input-focus" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>เลขบัตรประชาชน</Label>
                      <Input 
                        value={buyerIdCard}
                        onChange={(e) => setBuyerIdCard(e.target.value)}
                        placeholder="เลขบัตรประชาชน" 
                        className="input-focus" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>เบอร์โทรศัพท์ <span className="text-destructive">*</span></Label>
                      <Input 
                        value={buyerPhone}
                        onChange={(e) => setBuyerPhone(e.target.value)}
                        placeholder="0XX-XXX-XXXX" 
                        className="input-focus" 
                      />
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
                  <Select value={selectedColor} onValueChange={setSelectedColor}>
                    <SelectTrigger className="input-focus">
                      <SelectValue placeholder="เลือกสี" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="red">แดง</SelectItem>
                      <SelectItem value="blue">น้ำเงิน</SelectItem>
                      <SelectItem value="yellow">เหลือง</SelectItem>
                      <SelectItem value="white">ขาว</SelectItem>
                      <SelectItem value="black">ดำ</SelectItem>
                      <SelectItem value="purple">ม่วง</SelectItem>
                      <SelectItem value="green">เขียว</SelectItem>
                      <SelectItem value="orange">ส้ม</SelectItem>
                      <SelectItem value="brown">น้ำตาล</SelectItem>
                      <SelectItem value="pink">ชมพู</SelectItem>
                      <SelectItem value="skyblue">ฟ้า</SelectItem>
                      <SelectItem value="gray">เทา</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ประเภทเชื้อเพลิง <span className="text-destructive">*</span></Label>
                  <Select value={selectedFuelType} onValueChange={(v) => setSelectedFuelType(v as FuelType)}>
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
                  <Label>ราคารถ (รวม VAT) <span className="text-destructive">*</span></Label>
                  <Input 
                    type="text"
                    inputMode="numeric"
                    value={basePrice > 0 ? basePrice.toLocaleString() : ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setBasePrice(value ? Number(value) : 0);
                    }}
                    placeholder="กรอกราคารถ"
                    className="input-focus"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ส่วนลด</Label>
                  <Input 
                    type="text"
                    inputMode="numeric"
                    value={discountAmount > 0 ? discountAmount.toLocaleString() : ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setDiscountAmount(value ? Number(value) : 0);
                    }}
                    placeholder="0"
                    className="input-focus"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ราคาสุทธิ</Label>
                  <Input 
                    value={finalPrice > 0 ? `฿${finalPrice.toLocaleString()}` : '-'}
                    readOnly
                    disabled
                    className="bg-primary/10 font-semibold text-primary cursor-not-allowed"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>เงินจอง</Label>
                  <Input 
                    type="text"
                    inputMode="numeric"
                    value={depositAmount > 0 ? depositAmount.toLocaleString() : ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setDepositAmount(value ? Number(value) : 0);
                    }}
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

            {/* Section 6: ของแถม */}
            <div className="form-section">
              <div className="form-section-header flex items-center gap-2">
                <Gift className="w-5 h-5" />
                ของแถม
              </div>
              <div className="space-y-3">
                {freebies.length > 0 && (
                  <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground px-2">
                    <div className="col-span-1">ลำดับที่</div>
                    <div className="col-span-7">รายการ</div>
                    <div className="col-span-3">มูลค่า</div>
                    <div className="col-span-1"></div>
                  </div>
                )}
                {freebies.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-1 text-center text-sm text-muted-foreground">{index + 1}</div>
                    <div className="col-span-7">
                      <Input 
                        value={item.name}
                        onChange={(e) => updateItem('freebies', item.id, 'name', e.target.value)}
                        placeholder="ชื่อรายการ"
                        className="input-focus"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input 
                        type="number"
                        value={item.value || ''}
                        onChange={(e) => updateItem('freebies', item.id, 'value', Number(e.target.value))}
                        placeholder="0"
                        className="input-focus"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button variant="ghost" size="icon" onClick={() => removeItem('freebies', item.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addItem('freebies')} className="gap-1">
                  <Plus className="w-4 h-4" />
                  เพิ่มรายการ
                </Button>
              </div>
            </div>

            {/* Section 7: อุปกรณ์ตกแต่ง */}
            <div className="form-section">
              <div className="form-section-header flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                อุปกรณ์ตกแต่ง
              </div>
              <div className="space-y-3">
                {accessories.length > 0 && (
                  <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground px-2">
                    <div className="col-span-1">ลำดับที่</div>
                    <div className="col-span-7">รายการ</div>
                    <div className="col-span-3">มูลค่า</div>
                    <div className="col-span-1"></div>
                  </div>
                )}
                {accessories.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-1 text-center text-sm text-muted-foreground">{index + 1}</div>
                    <div className="col-span-7">
                      <Input 
                        value={item.name}
                        onChange={(e) => updateItem('accessories', item.id, 'name', e.target.value)}
                        placeholder="ชื่อรายการ"
                        className="input-focus"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input 
                        type="number"
                        value={item.value || ''}
                        onChange={(e) => updateItem('accessories', item.id, 'value', Number(e.target.value))}
                        placeholder="0"
                        className="input-focus"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button variant="ghost" size="icon" onClick={() => removeItem('accessories', item.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addItem('accessories')} className="gap-1">
                  <Plus className="w-4 h-4" />
                  เพิ่มรายการ
                </Button>
              </div>
            </div>

            {/* Section 8: สิทธิประโยชน์อื่นๆ */}
            <div className="form-section">
              <div className="form-section-header flex items-center gap-2">
                <Star className="w-5 h-5" />
                สิทธิประโยชน์อื่นๆ
              </div>
              <div className="space-y-3">
                {benefits.length > 0 && (
                  <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground px-2">
                    <div className="col-span-1">ลำดับที่</div>
                    <div className="col-span-7">รายการ</div>
                    <div className="col-span-3">มูลค่า</div>
                    <div className="col-span-1"></div>
                  </div>
                )}
                {benefits.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-1 text-center text-sm text-muted-foreground">{index + 1}</div>
                    <div className="col-span-7">
                      <Input 
                        value={item.name}
                        onChange={(e) => updateItem('benefits', item.id, 'name', e.target.value)}
                        placeholder="ชื่อรายการ"
                        className="input-focus"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input 
                        type="number"
                        value={item.value || ''}
                        onChange={(e) => updateItem('benefits', item.id, 'value', Number(e.target.value))}
                        placeholder="0"
                        className="input-focus"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button variant="ghost" size="icon" onClick={() => removeItem('benefits', item.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addItem('benefits')} className="gap-1">
                  <Plus className="w-4 h-4" />
                  เพิ่มรายการ
                </Button>
              </div>
            </div>

            {/* Section 9: Attachments */}
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
                disabled={isSaving}
              >
                ยกเลิก
              </Button>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleSave}
                  className="gap-2"
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  บันทึก
                </Button>
                <Button 
                  className="btn-primary-gradient gap-2"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'บันทึกและปิด'}
                  {!isSaving && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
