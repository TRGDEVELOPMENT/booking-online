import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
  Save, 
  ArrowRight, 
  User, 
  Car, 
  Wallet, 
  Gift, 
  Building2,
  Users,
  Wrench,
  Star,
  Plus,
  Trash2,
  Loader2,
  Search,
  CheckCircle2,
  X,
  CreditCard,
  Upload,
  Paperclip
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { WorkflowSteps } from '@/components/reservations/WorkflowSteps';
import { CustomerSearchDialog, type Customer } from '@/components/reservations/CustomerSearchDialog';
import { MasterItemPickerDialog, type MasterItemType } from '@/components/reservations/MasterItemPickerDialog';
import FileUploadSection from '@/components/reservations/FileUploadSection';
import { useReservationAttachments, type AttachmentFile } from '@/hooks/useReservationAttachments';
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
} from '@/data/mockData';

import { cn } from '@/lib/utils';
import type { FuelType, PurchaseType } from '@/types/reservation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useReservationActivityLog } from '@/hooks/useReservationActivityLog';

// Note: Payment section, Review section, and Approval section are hidden for 'sale' role

export default function ReservationCreate() {
  const navigate = useNavigate();
  const { selectedCompany } = useOutletContext<{ selectedCompany: string }>();
  const { user, hasRole } = useAuth();
  const company = companies.find(c => c.id === selectedCompany);
  
  // Check if user is a sales advisor (hide certain sections)
  const isSaleRole = hasRole('sale');
  const isIT = hasRole('it');

  // Activity log
  const { logActivity } = useReservationActivityLog(undefined);

  // Loading state
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedBU, setSelectedBU] = useState('');
  
  // Booking Customer - now using search/select
  const [bookingCustomerType, setBookingCustomerType] = useState<'individual' | 'corporate'>('individual');
  const [selectedBookingCustomer, setSelectedBookingCustomer] = useState<Customer | null>(null);
  const [isBookingSearchOpen, setIsBookingSearchOpen] = useState(false);
  
  // Legacy fields (kept for backward compatibility, will be removed)
  const [bookingTitle, setBookingTitle] = useState('');
  const [bookingFirstName, setBookingFirstName] = useState('');
  const [bookingLastName, setBookingLastName] = useState('');
  const [bookingIdNo, setBookingIdNo] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  
  // Buyer - now using search/select
  const [isBuyerSame, setIsBuyerSame] = useState(true);
  const [selectedBuyerCustomer, setSelectedBuyerCustomer] = useState<Customer | null>(null);
  const [isBuyerSearchOpen, setIsBuyerSearchOpen] = useState(false);
  
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

  // DB-driven models, sub_models, colors
  const [dbModels, setDbModels] = useState<Array<{ id: string; description: string }>>([]);
  const [dbSubModels, setDbSubModels] = useState<Array<{ id: string; description: string }>>([]);
  const [dbColors, setDbColors] = useState<Array<{ id: string; description: string }>>([]);
  const [dbInstallmentPeriods, setDbInstallmentPeriods] = useState<Array<{ id: string; description: string }>>([]);

  // Fetch installment periods (active) for current company
  useEffect(() => {
    if (!selectedCompany) return;
    const fetchPeriods = async () => {
      const { data } = await supabase
        .from('installment_periods')
        .select('id, description')
        .eq('status', 'active')
        .eq('company_id', selectedCompany)
        .order('no', { ascending: true });
      if (data) setDbInstallmentPeriods(data);
    };
    fetchPeriods();
  }, [selectedCompany]);

  // Fetch models from DB
  useEffect(() => {
    const fetchModels = async () => {
      const { data } = await supabase
        .from('models')
        .select('id, description')
        .eq('status', 'active')
        .order('description');
      if (data) setDbModels(data);
    };
    fetchModels();
  }, []);

  // Fetch sub_models filtered by selected model
  useEffect(() => {
    setDbSubModels([]);
    setSelectedSubmodel('');
    if (!selectedModel) return;
    const fetchSubModels = async () => {
      const { data } = await supabase
        .from('sub_models')
        .select('id, description')
        .eq('model_id', selectedModel)
        .eq('status', 'active')
        .order('description');
      if (data) setDbSubModels(data);
    };
    fetchSubModels();
  }, [selectedModel]);

  // Fetch colors filtered by model + sub_model
  useEffect(() => {
    setDbColors([]);
    setSelectedColor('');
    if (!selectedModel || !selectedSubmodel) return;
    const fetchColors = async () => {
      const { data } = await supabase
        .from('colors')
        .select('id, description')
        .eq('model_id', selectedModel)
        .eq('sub_model_id', selectedSubmodel)
        .eq('status', 'active')
        .order('description');
      if (data) setDbColors(data);
    };
    fetchColors();
  }, [selectedModel, selectedSubmodel]);

  // Fetch standard price by model + sub_model
  useEffect(() => {
    if (!selectedModel || !selectedSubmodel) {
      setBasePrice(0);
      return;
    }
    const fetchPrice = async () => {
      const { data } = await supabase
        .from('standard_prices')
        .select('price')
        .eq('model_id', selectedModel)
        .eq('sub_model_id', selectedSubmodel)
        .eq('status', 'active')
        .limit(1)
        .single();
      if (data) setBasePrice(Number(data.price));
    };
    fetchPrice();
  }, [selectedModel, selectedSubmodel]);

  // Items - ของแถม, อุปกรณ์ตกแต่ง, สิทธิประโยชน์
  const [freebies, setFreebies] = useState<Array<{ id: number; name: string; value: number }>>([]);
  const [accessories, setAccessories] = useState<Array<{ id: number; name: string; value: number }>>([]);
  const [benefits, setBenefits] = useState<Array<{ id: number; name: string; value: number }>>([]);

  // Payment Details (Finance Section)
  const [paymentType, setPaymentType] = useState<string>('cash');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentDescription, setPaymentDescription] = useState('');
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  
  // Attachments - using hook (will save after reservation is created)
  const [pendingAttachments, setPendingAttachments] = useState<File[]>([]);
  const [attachmentFiles, setAttachmentFiles] = useState<AttachmentFile[]>([]);
  
  // Add files handler
  const handleAddFiles = (files: File[]) => {
    const newAttachments: AttachmentFile[] = files.map(file => ({
      id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      isNew: true
    }));
    setAttachmentFiles(prev => [...prev, ...newAttachments]);
    setPendingAttachments(prev => [...prev, ...files]);
  };
  
  // Remove file handler
  const handleRemoveFile = (id: string) => {
    const file = attachmentFiles.find(f => f.id === id);
    if (file?.file) {
      setPendingAttachments(prev => prev.filter(f => f !== file.file));
    }
    setAttachmentFiles(prev => prev.filter(f => f.id !== id));
  };
  
  // Open file handler
  const handleOpenFile = (attachment: AttachmentFile) => {
    if (attachment.file) {
      const url = URL.createObjectURL(attachment.file);
      window.open(url, '_blank');
    } else if (attachment.url) {
      window.open(attachment.url, '_blank');
    }
  };

  // Handle payment file selection
  const handlePaymentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentFile(file);
    }
  };

  // Master item picker state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerType, setPickerType] = useState<MasterItemType>('freebies');

  const openPicker = (type: MasterItemType) => {
    setPickerType(type);
    setPickerOpen(true);
  };

  const handlePickerSelect = (item: { name: string; value: number }) => {
    const newItem = { id: Date.now() + Math.random(), name: item.name, value: item.value };
    if (pickerType === 'freebies') setFreebies([...freebies, newItem]);
    else if (pickerType === 'accessories') setAccessories([...accessories, newItem]);
    else setBenefits([...benefits, newItem]);
  };

  const removeItem = (type: 'freebies' | 'accessories' | 'benefits', id: number) => {
    if (type === 'freebies') setFreebies(freebies.filter(item => item.id !== id));
    else if (type === 'accessories') setAccessories(accessories.filter(item => item.id !== id));
    else setBenefits(benefits.filter(item => item.id !== id));
  };

  const updateItem = (type: 'freebies' | 'accessories' | 'benefits', id: number, field: 'name' | 'value', value: string | number) => {
    const updateFn = (items: Array<{ id: number; name: string; value: number }>) =>
      items.map(item => item.id === id ? { ...item, [field]: value } : item);
    
    if (type === 'freebies') setFreebies(updateFn(freebies));
    else if (type === 'accessories') setAccessories(updateFn(accessories));
    else setBenefits(updateFn(benefits));
  };
  const companyBranches = branches.filter(b => b.companyId === selectedCompany);
  const selectedSubmodelData = dbSubModels.find(s => s.id === selectedSubmodel);

  // Auto-select branch when company has only one branch
  useEffect(() => {
    if (companyBranches.length === 1 && !selectedBranch) {
      setSelectedBranch(companyBranches[0].id);
    }
  }, [companyBranches, selectedBranch]);

  // Calculate net price
  const finalPrice = basePrice - discountAmount;

  // Generate document number via database function
  const generateDocumentNumber = async (): Promise<string> => {
    const { data, error } = await supabase.rpc('generate_document_number', {
      p_company_id: selectedCompany,
      p_branch_id: selectedBranch,
    });
    if (error) throw new Error('ไม่สามารถสร้างเลขที่เอกสารได้: ' + error.message);
    return data as string;
  };

  const handleSaveDraft = async () => {
    // Validation
    if (!selectedBranch) {
      toast.error('กรุณาเลือกสาขา');
      return;
    }
    if (!selectedBookingCustomer) {
      toast.error('กรุณาเลือกลูกค้าผู้จอง');
      return;
    }
    if (!isBuyerSame && !selectedBuyerCustomer) {
      toast.error('กรุณาเลือกลูกค้าผู้ซื้อรถ');
      return;
    }
    if (basePrice <= 0) {
      toast.error('กรุณากรอกราคารถ');
      return;
    }

    setIsSaving(true);

    try {
      const documentNumber = await generateDocumentNumber();
      const customerName = `${selectedBookingCustomer.surnames?.description || ''}${selectedBookingCustomer.first_name} ${selectedBookingCustomer.last_name}`;
      const modelName = dbModels.find(m => m.id === selectedModel)?.description || '';
      const submodelName = dbSubModels.find(s => s.id === selectedSubmodel)?.description || '';

      // Get customer address
      const customerAddress = [
        selectedBookingCustomer.address1,
        selectedBookingCustomer.address2,
        selectedBookingCustomer.district,
        selectedBookingCustomer.province,
        selectedBookingCustomer.postal_code
      ].filter(Boolean).join(' ');

      // Get buyer info
      const buyerCustomer = isBuyerSame ? selectedBookingCustomer : selectedBuyerCustomer;
      const buyerName = buyerCustomer 
        ? `${buyerCustomer.surnames?.description || ''}${buyerCustomer.first_name} ${buyerCustomer.last_name}`
        : null;
      const buyerAddress = buyerCustomer ? [
        buyerCustomer.address1,
        buyerCustomer.address2,
        buyerCustomer.district,
        buyerCustomer.province,
        buyerCustomer.postal_code
      ].filter(Boolean).join(' ') : null;

      const reservationData = {
        document_number: documentNumber,
        company_id: selectedCompany,
        branch_id: selectedBranch,
        status: 'draft',
        customer_type: selectedBookingCustomer.customer_type,
        customer_name: customerName,
        customer_id_card: selectedBookingCustomer.tax_id,
        customer_phone: selectedBookingCustomer.mobile_phone,
        customer_email: selectedBookingCustomer.email || null,
        customer_address: customerAddress || null,
        buyer_name: buyerName,
        buyer_id_card: buyerCustomer?.tax_id || null,
        buyer_phone: buyerCustomer?.mobile_phone || null,
        buyer_address: buyerAddress || null,
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
        created_by: user?.id || null,
      };

      const { data, error } = await supabase
        .from('reservations')
        .insert(reservationData)
        .select('id')
        .single();

      if (error) {
        console.error('Error saving reservation:', error);
        toast.error('เกิดข้อผิดพลาดในการบันทึก: ' + error.message);
        return;
      }

      // Save attachments if any
      if (data?.id && pendingAttachments.length > 0) {
        let savedCount = 0;
        for (const file of pendingAttachments) {
          try {
            // Generate unique file path
            const fileExt = file.name.split('.').pop() || 'file';
            const filePath = `${selectedCompany}/${data.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

            // Upload to storage
            const { error: uploadError } = await supabase.storage
              .from('reservation-attachments')
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
              });

            if (uploadError) {
              console.error('Upload error:', uploadError);
              continue;
            }

            // Save to database
            const { error: dbError } = await supabase
              .from('reservation_attachments')
              .insert({
                reservation_id: data.id,
                company_id: selectedCompany,
                file_name: file.name,
                file_path: filePath,
                file_size: file.size,
                file_type: file.type,
                uploaded_by: user?.id
              });

            if (!dbError) {
              savedCount++;
            }
          } catch (err) {
            console.error('Error saving attachment:', err);
          }
        }
        
        if (savedCount > 0) {
          toast.success(`บันทึกเอกสารแนบ ${savedCount} ไฟล์สำเร็จ`);
        }
      }

      // Log activity
      if (data?.id) {
        await logActivity({
          reservationId: data.id,
          action: 'created',
          companyId: selectedCompany,
          branchId: selectedBranch || null,
          details: { document_number: documentNumber },
        });
      }

      toast.success('บันทึกใบจองสำเร็จ');
      navigate('/reservations');
    } catch (err) {
      console.error('Error:', err);
      toast.error('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSaving(false);
    }
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
                  onValueChange={(v) => {
                    setBookingCustomerType(v as 'individual' | 'corporate');
                    setSelectedBookingCustomer(null); // Reset when type changes
                  }}
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

              {/* Customer Selection */}
              {!selectedBookingCustomer ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsBookingSearchOpen(true)}
                  className="gap-2"
                >
                  <Search className="w-4 h-4" />
                  เลือกลูกค้า
                </Button>
              ) : (
                <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-600">ลูกค้าที่เลือก</span>
                      </div>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">รหัส:</span>
                            <span className="font-mono">{selectedBookingCustomer.customer_id}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Tax ID:</span>
                            <span>{selectedBookingCustomer.tax_id}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">ชื่อ:</span>
                            <span className="font-medium">
                              {selectedBookingCustomer.surnames?.description || ''}{selectedBookingCustomer.first_name} {selectedBookingCustomer.last_name}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">เบอร์โทร:</span>
                            <span>{selectedBookingCustomer.mobile_phone || selectedBookingCustomer.telephone || '-'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">อีเมล:</span>
                            <span>{selectedBookingCustomer.email || '-'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedBookingCustomer(null)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsBookingSearchOpen(true)}
                    className="mt-3 gap-2"
                  >
                    <Search className="w-4 h-4" />
                    เปลี่ยนลูกค้า
                  </Button>
                </div>
              )}
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
                !selectedBuyerCustomer ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsBuyerSearchOpen(true)}
                    className="gap-2"
                  >
                    <Search className="w-4 h-4" />
                    เลือกลูกค้าผู้ซื้อ
                  </Button>
                ) : (
                  <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-green-600">ผู้ซื้อที่เลือก</span>
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">รหัส:</span>
                              <span className="font-mono">{selectedBuyerCustomer.customer_id}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Tax ID:</span>
                              <span>{selectedBuyerCustomer.tax_id}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">ชื่อ:</span>
                              <span className="font-medium">
                                {selectedBuyerCustomer.surnames?.description || ''}{selectedBuyerCustomer.first_name} {selectedBuyerCustomer.last_name}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">เบอร์โทร:</span>
                              <span>{selectedBuyerCustomer.mobile_phone || selectedBuyerCustomer.telephone || '-'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">อีเมล:</span>
                              <span>{selectedBuyerCustomer.email || '-'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedBuyerCustomer(null)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsBuyerSearchOpen(true)}
                      className="mt-3 gap-2"
                    >
                      <Search className="w-4 h-4" />
                      เปลี่ยนลูกค้า
                    </Button>
                  </div>
                )
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
                      {dbModels.map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.description}
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
                      {dbSubModels.map(sub => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.description}
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
                      {dbColors.map(color => (
                        <SelectItem key={color.id} value={color.description}>
                          {color.description}
                        </SelectItem>
                      ))}
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
                      <Label>ระยะเวลาผ่อน (งวด)</Label>
                      <Select>
                        <SelectTrigger className="input-focus">
                          <SelectValue placeholder="เลือก" />
                        </SelectTrigger>
                        <SelectContent>
                          {dbInstallmentPeriods.length === 0 ? (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                              ไม่มีข้อมูล กรุณาเพิ่มที่ ตั้งค่าระบบ &gt; ระยะเวลาผ่อน
                            </div>
                          ) : (
                            dbInstallmentPeriods.map(p => (
                              <SelectItem key={p.id} value={p.id}>{p.description}</SelectItem>
                            ))
                          )}
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
                <Button variant="outline" size="sm" onClick={() => openPicker('freebies')} className="gap-1">
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
                <Button variant="outline" size="sm" onClick={() => openPicker('accessories')} className="gap-1">
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
                <Button variant="outline" size="sm" onClick={() => openPicker('benefits')} className="gap-1">
                  <Plus className="w-4 h-4" />
                  เพิ่มรายการ
                </Button>
              </div>
            </div>

            {/* Section: รายละเอียดการชำระเงิน (เฉพาะการเงิน) - Only shown at payment verification stage (step3), hidden on create */}
            {isIT && !isSaleRole && (
            <div className="form-section border-2 border-primary/20 bg-primary/5">
              <div className="form-section-header flex items-center gap-2 text-primary">
                <CreditCard className="w-5 h-5" />
                รายละเอียดการชำระเงิน (เฉพาะการเงิน)
              </div>
              
              <div className="space-y-4">
                {/* Payment Type */}
                <div>
                  <Label>ประเภทการชำระเงิน <span className="text-destructive">*</span></Label>
                  <RadioGroup 
                    value={paymentType} 
                    onValueChange={setPaymentType}
                    className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2"
                  >
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="cash" id="payment-cash" />
                      <Label htmlFor="payment-cash" className="cursor-pointer flex-1">เงินสด</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="transfer" id="payment-transfer" />
                      <Label htmlFor="payment-transfer" className="cursor-pointer flex-1">เงินโอน</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="credit" id="payment-credit" />
                      <Label htmlFor="payment-credit" className="cursor-pointer flex-1">บัตรเครดิต</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="po" id="payment-po" />
                      <Label htmlFor="payment-po" className="cursor-pointer flex-1">ใบสั่งซื้อ</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Payment Amount */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>ลูกค้าชำระเงินจอง (บาท)</Label>
                    <Input 
                      type="text"
                      value={depositAmount > 0 ? depositAmount.toLocaleString() : '0'}
                      disabled
                      className="input-focus bg-muted cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>จำนวนเงินโอนที่ได้รับ (บาท) <span className="text-destructive">*</span></Label>
                    <Input 
                      type="text"
                      inputMode="numeric"
                      value={paymentAmount > 0 ? paymentAmount.toLocaleString() : ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setPaymentAmount(value ? Number(value) : 0);
                      }}
                      placeholder="กรอกจำนวนเงิน"
                      className="input-focus"
                    />
                  </div>
                </div>

                {/* Payment Description */}
                <div className="space-y-2">
                  <Label>รายละเอียด</Label>
                  <Textarea 
                    value={paymentDescription}
                    onChange={(e) => setPaymentDescription(e.target.value)}
                    placeholder="กรอกรายละเอียดเพิ่มเติม (ถ้ามี)"
                    className="input-focus min-h-[100px]"
                  />
                </div>

                {/* Attach File */}
                <div className="space-y-2">
                  <Label>แนบไฟล์หลักฐานการชำระเงิน</Label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <Upload className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">เลือกไฟล์</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*,.pdf"
                        onChange={handlePaymentFileChange}
                      />
                    </label>
                    {paymentFile && (
                      <div className="flex items-center gap-2 text-sm">
                        <Paperclip className="w-4 h-4 text-primary" />
                        <span className="text-foreground">{paymentFile.name}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => setPaymentFile(null)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* Section 7: Attachments */}
            <FileUploadSection
              files={attachmentFiles}
              onFilesAdd={handleAddFiles}
              onFileRemove={handleRemoveFile}
              onFileOpen={handleOpenFile}
            />

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
                  onClick={handleSaveDraft}
                  className="gap-2"
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  บันทึก
                </Button>
                <Button 
                  className="btn-primary-gradient gap-2"
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ส่งเอกสาร'}
                  {!isSaving && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Search Dialogs */}
      <CustomerSearchDialog
        open={isBookingSearchOpen}
        onOpenChange={setIsBookingSearchOpen}
        onSelect={setSelectedBookingCustomer}
        companyId={selectedCompany}
        customerType={bookingCustomerType}
      />

      <CustomerSearchDialog
        open={isBuyerSearchOpen}
        onOpenChange={setIsBuyerSearchOpen}
        onSelect={setSelectedBuyerCustomer}
        companyId={selectedCompany}
      />

      <MasterItemPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        type={pickerType}
        companyId={selectedCompany}
        onSelect={handlePickerSelect}
      />
    </>
  );
}
