import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, useParams, useSearchParams, useLocation } from 'react-router-dom';
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
  Loader2,
  CreditCard,
  Upload,
  CheckCircle,
  Send,
  Clock,
  ShieldCheck,
  Smartphone,
  Mail,
  Link as LinkIcon,
  RefreshCw,
  ClipboardCheck,
  UserCheck,
  RotateCcw,
  XCircle,
  ThumbsUp,
  AlertCircle,
  FileText
} from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/Header';
import { WorkflowSteps } from '@/components/reservations/WorkflowSteps';
import { MasterItemPickerDialog, type MasterItemType } from '@/components/reservations/MasterItemPickerDialog';
import FileUploadSection from '@/components/reservations/FileUploadSection';
import { useReservationAttachments } from '@/hooks/useReservationAttachments';
import { useReservationAssignments } from '@/hooks/useReservationAssignments';
import { useReservationActivityLog } from '@/hooks/useReservationActivityLog';
import { AdminAssignmentPanel } from '@/components/reservations/AdminAssignmentPanel';
import { ActivityTimeline } from '@/components/reservations/ActivityTimeline';
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
import type { CustomerType, FuelType, PurchaseType, WorkflowStage, DocumentStatus } from '@/types/reservation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function ReservationEdit() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedCompany } = useOutletContext<{ selectedCompany: string }>();
  const { user, profile, hasRole } = useAuth();
  const company = companies.find(c => c.id === selectedCompany);
  
  // Check if view-only mode (URL does NOT end with /edit)
  const isViewOnly = !location.pathname.endsWith('/edit');
  
  // Check if in cashier mode
  const isCashierMode = !isViewOnly && (searchParams.get('mode') === 'cashier' || hasRole('cashier'));
  const isCashier = hasRole('cashier');
  
  // Check if user is a sales advisor (hide certain sections)
  const isSaleRole = hasRole('sale');
  const isIT = hasRole('it');
  const isSaleSupervisor = hasRole('sale_supervisor');
  const isSaleManager = hasRole('sale_manager');
  const isAdmin = hasRole('user_admin') || isIT;

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Reservation status for workflow
  const [reservationStatus, setReservationStatus] = useState<string>('draft');
  const [documentNumber, setDocumentNumber] = useState('');

  // Sale role loses edit rights once the document has been submitted for approval.
  // After 'ส่งขออนุมัติ' the status becomes 'pending' (or downstream) — sale becomes view-only.
  const isSaleLocked = isSaleRole && !isIT && !isAdmin && (
    reservationStatus === 'pending' || reservationStatus === 'cancelled'
  );
  const effectiveViewOnly = isViewOnly || isSaleLocked;

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

  // Finance details (when purchaseType === 'finance')
  const [downPayment, setDownPayment] = useState<number>(0);
  const [financeAmount, setFinanceAmount] = useState<number>(0);
  const [installmentPeriodId, setInstallmentPeriodId] = useState<string>('');
  const [dbInstallmentPeriods, setDbInstallmentPeriods] = useState<Array<{ id: string; description: string }>>([]);

  // Payment Details (Finance Section)
  const [paymentType, setPaymentType] = useState<string>('cash');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentDescription, setPaymentDescription] = useState('');
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [isSavingPayment, setIsSavingPayment] = useState(false);

  // Customer Confirmation - New Design
  const [confirmationStatus, setConfirmationStatus] = useState<'pending' | 'otp_sent' | 'link_sent' | 'confirmed'>('pending');
  const [confirmationMethod, setConfirmationMethod] = useState<'otp' | 'link'>('otp');
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [linkSendMethod, setLinkSendMethod] = useState<'sms' | 'email'>('sms');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(null);

  // Review (หัวหน้าทีมขาย)
  const [reviewStatus, setReviewStatus] = useState<'pending' | 'reviewed' | 'returned'>('pending');
  const [reviewRemark, setReviewRemark] = useState('');
  const [reviewedAt, setReviewedAt] = useState<string | null>(null);
  const [isSavingReview, setIsSavingReview] = useState(false);

  // Cashier verification
  const [cashierUserId, setCashierUserId] = useState<string | null>(null);
  const [cashierUserName, setCashierUserName] = useState<string | null>(null);
  const [cashierVerifiedAt, setCashierVerifiedAt] = useState<string | null>(null);

  // Approval (ผู้จัดการฝ่ายขาย)
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [approvalRemark, setApprovalRemark] = useState('');
  const [approvedAt, setApprovedAt] = useState<string | null>(null);
  const [isSavingApproval, setIsSavingApproval] = useState(false);

  // Stage actor info (for WorkflowSteps display)
  const [createdByName, setCreatedByName] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [reviewedByName, setReviewedByName] = useState<string | null>(null);
  const [approvedByName, setApprovedByName] = useState<string | null>(null);

  // Items - ของแถม, อุปกรณ์ตกแต่ง, สิทธิประโยชน์
  const [freebies, setFreebies] = useState<Array<{ id: number; name: string; value: number }>>([]);
  const [accessories, setAccessories] = useState<Array<{ id: number; name: string; value: number }>>([]);
  const [benefits, setBenefits] = useState<Array<{ id: number; name: string; value: number }>>([]);

  // DB-driven master data (mirror Create page)
  const [dbBranches, setDbBranches] = useState<Array<{ branch_id: string; branch_name: string }>>([]);
  const [dbModels, setDbModels] = useState<Array<{ id: string; description: string }>>([]);
  const [dbSubModels, setDbSubModels] = useState<Array<{ id: string; description: string }>>([]);
  const [dbColors, setDbColors] = useState<Array<{ id: string; description: string }>>([]);

  // Original DB strings (used to match against master data once loaded)
  const [pendingModelName, setPendingModelName] = useState<string | null>(null);
  const [pendingSubmodelName, setPendingSubmodelName] = useState<string | null>(null);
  const [pendingColorName, setPendingColorName] = useState<string | null>(null);
  
  // Attachments - using hook for real file storage
  const {
    attachments,
    isLoading: isLoadingAttachments,
    addFiles: handleAddFiles,
    removeFile: handleRemoveFile,
    saveAttachments,
    openFile: handleOpenFile
  } = useReservationAttachments({ 
    reservationId: id, 
    companyId: selectedCompany 
  });

  // Reservation assignments (for admin panel & workflow display)
  const { assignments, refetch: refetchAssignments } = useReservationAssignments({
    reservationId: id,
    companyId: selectedCompany,
    branchId: selectedBranch || null,
  });

  // Activity log
  const { logs: activityLogs, isLoading: isLoadingLogs, logActivity, refetch: refetchLogs } = useReservationActivityLog(id);

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
        setReservationStatus(data.status || 'draft');
        setSelectedBranch(data.branch_id || '');
        setSelectedBU(data.vehicle_type || '');
        setBookingCustomerType((data.customer_type as CustomerType) || 'individual');
        
        // Parse customer name (format: "{title}{firstName} {lastName...}")
        const fullName = data.customer_name || '';
        const titles = ['นางสาว', 'นาย', 'นาง', 'บริษัท']; // longest first
        let title = '';
        let remaining = fullName;
        for (const t of titles) {
          if (fullName.startsWith(t)) {
            title = t;
            remaining = fullName.substring(t.length).trim();
            break;
          }
        }
        const nameParts = remaining.split(' ').filter(Boolean);
        setBookingTitle(title);
        if (nameParts.length >= 2) {
          setBookingFirstName(nameParts[0]);
          setBookingLastName(nameParts.slice(1).join(' '));
        } else {
          setBookingFirstName(remaining);
          setBookingLastName('');
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
        
        // Vehicle - keep DB strings; resolve to UUIDs once master data loads
        setPendingModelName(data.model || null);
        setPendingSubmodelName(data.submodel || null);
        setPendingColorName(data.color || null);

        setSelectedFuelType((data.fuel_type as FuelType) || 'ICE');
        
        // Pricing
        setBasePrice(data.list_price || 0);
        setDiscountAmount(data.discount || 0);
        setDepositAmount(data.deposit_amount || 0);
        setExpectedDeliveryDate(data.expected_delivery_date || '');

        // Purchase type & finance details
        const anyData = data as any;
        if (anyData.purchase_type) {
          setPurchaseType(anyData.purchase_type as PurchaseType);
        }
        if (anyData.down_payment != null) setDownPayment(Number(anyData.down_payment) || 0);
        if (anyData.finance_amount != null) setFinanceAmount(Number(anyData.finance_amount) || 0);
        if (anyData.installment_period_id) setInstallmentPeriodId(anyData.installment_period_id);
        
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
        
        // Confirmation data
        if (data.confirmation_status) {
          setConfirmationStatus(data.confirmation_status as 'pending' | 'otp_sent' | 'link_sent' | 'confirmed');
        }
        if (data.confirmation_method) {
          setConfirmationMethod(data.confirmation_method as 'otp' | 'link');
        }
        if (data.confirmed_at) {
          setConfirmedAt(data.confirmed_at);
        }
        
        // Review data
        if (data.review_status) {
          setReviewStatus(data.review_status as 'pending' | 'reviewed' | 'returned');
        }
        if (data.review_remark) {
          setReviewRemark(data.review_remark);
        }
        if (data.reviewed_at) {
          setReviewedAt(data.reviewed_at);
        }

        // Cashier data
        setCashierUserId((data as any).cashier_user_id || null);
        setCashierUserName((data as any).cashier_user_name || null);
        // Use updated_at as proxy for cashier verified time if not stored separately
        if ((data as any).cashier_user_id) {
          setCashierVerifiedAt(data.updated_at);
        }

        if (data.approval_status) {
          setApprovalStatus(data.approval_status as 'pending' | 'approved' | 'rejected');
        }
        if (data.approval_remark) {
          setApprovalRemark(data.approval_remark);
        }
        if (data.approved_at) {
          setApprovedAt(data.approved_at);
        }

        // Created info
        setCreatedAt(data.created_at);

        // Lookup actor names from profiles
        const actorIds = [data.created_by, data.reviewed_by, data.approved_by].filter(Boolean) as string[];
        if (actorIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, full_name')
            .in('user_id', actorIds);
          const nameMap = new Map(profiles?.map((p: any) => [p.user_id, p.full_name]) || []);
          if (data.created_by) setCreatedByName(nameMap.get(data.created_by) || null);
          if (data.reviewed_by) setReviewedByName(nameMap.get(data.reviewed_by) || null);
          if (data.approved_by) setApprovedByName(nameMap.get(data.approved_by) || null);
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

  // Fetch DB master data: branches for current company
  useEffect(() => {
    if (!selectedCompany) { setDbBranches([]); return; }
    supabase
      .from('branches')
      .select('branch_id, branch_name')
      .eq('company_id', selectedCompany)
      .eq('status', 'active')
      .order('branch_id', { ascending: true })
      .then(({ data }) => { if (data) setDbBranches(data); });
  }, [selectedCompany]);

  // Fetch all active models (shared across branches per company memory)
  useEffect(() => {
    supabase
      .from('models')
      .select('id, description')
      .eq('status', 'active')
      .order('description')
      .then(({ data }) => { if (data) setDbModels(data); });
  }, []);

  // Fetch installment periods (active) for current company
  useEffect(() => {
    if (!selectedCompany) return;
    supabase
      .from('installment_periods')
      .select('id, description')
      .eq('status', 'active')
      .eq('company_id', selectedCompany)
      .order('no', { ascending: true })
      .then(({ data }) => { if (data) setDbInstallmentPeriods(data); });
  }, [selectedCompany]);

  // Resolve pending model name -> uuid once dbModels loaded
  useEffect(() => {
    if (!pendingModelName || dbModels.length === 0) return;
    const m = dbModels.find(x => x.description === pendingModelName);
    if (m) {
      setSelectedModel(m.id);
      setPendingModelName(null);
    }
  }, [pendingModelName, dbModels]);

  // Fetch sub_models filtered by selected model (do NOT clear selection here, may be from initial load)
  useEffect(() => {
    if (!selectedModel) { setDbSubModels([]); return; }
    supabase
      .from('sub_models')
      .select('id, description')
      .eq('model_id', selectedModel)
      .eq('status', 'active')
      .order('description')
      .then(({ data }) => { if (data) setDbSubModels(data); });
  }, [selectedModel]);

  // Resolve pending sub-model name -> uuid
  useEffect(() => {
    if (!pendingSubmodelName || dbSubModels.length === 0) return;
    const s = dbSubModels.find(x => x.description === pendingSubmodelName);
    if (s) {
      setSelectedSubmodel(s.id);
      setPendingSubmodelName(null);
    }
  }, [pendingSubmodelName, dbSubModels]);

  // Fetch colors filtered by model + sub_model
  useEffect(() => {
    if (!selectedModel || !selectedSubmodel) { setDbColors([]); return; }
    supabase
      .from('colors')
      .select('id, description')
      .eq('model_id', selectedModel)
      .eq('sub_model_id', selectedSubmodel)
      .eq('status', 'active')
      .order('description')
      .then(({ data }) => { if (data) setDbColors(data); });
  }, [selectedModel, selectedSubmodel]);

  // Resolve pending color name -> uuid (color stored as description string in reservations.color)
  useEffect(() => {
    if (!pendingColorName || dbColors.length === 0) return;
    const c = dbColors.find(x => x.description === pendingColorName);
    if (c) {
      setSelectedColor(c.id);
      setPendingColorName(null);
    }
  }, [pendingColorName, dbColors]);

  // Master item picker state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerType, setPickerType] = useState<MasterItemType>('freebies');

  const openPicker = (type: MasterItemType) => {
    setPickerType(type);
    setPickerOpen(true);
  };

  const handlePickerSelect = (item: { name: string; value: number }) => {
    const currentList = pickerType === 'freebies' ? freebies : pickerType === 'accessories' ? accessories : benefits;
    const key = item.name.trim().toLowerCase();
    const isDuplicate = currentList.some((i) => (i.name || '').trim().toLowerCase() === key);
    if (isDuplicate) {
      toast.error('รายการนี้ถูกเลือกแล้ว ไม่สามารถเพิ่มซ้ำได้');
      return;
    }
    const newItem = { id: Date.now() + Math.random(), name: item.name, value: item.value };
    if (pickerType === 'freebies') setFreebies([...freebies, newItem]);
    else if (pickerType === 'accessories') setAccessories([...accessories, newItem]);
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

  // Handle payment file selection
  const handlePaymentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentFile(file);
    }
  };

  // Save payment details ONLY (does NOT advance workflow stage; cashier can keep editing)
  const handleSavePaymentDetails = async () => {
    if (!id) return;
    setIsSavingPayment(true);
    try {
      const now = new Date().toISOString();

      // Just bump updated_at; do NOT set cashier_user_id (that happens on confirm)
      const { error } = await supabase
        .from('reservations')
        .update({ updated_at: now })
        .eq('id', id);

      if (error) throw error;

      // Log activity (saved details only)
      await logActivity({
        reservationId: id,
        action: 'updated',
        actionLabel: 'บันทึกรายละเอียดการชำระเงิน',
        details: {
          payment_type: paymentType,
          payment_amount: paymentAmount,
          payment_description: paymentDescription,
          saved_at: now,
          saved_by: profile?.full_name || user?.email,
        },
        companyId: selectedCompany,
        branchId: selectedBranch || null,
      });

      // Save payment attachment if exists
      if (paymentFile && id) {
        const fileExt = paymentFile.name.split('.').pop() || 'file';
        const filePath = `${selectedCompany}/${id}/payment-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('reservation-attachments')
          .upload(filePath, paymentFile, { cacheControl: '3600', upsert: false });

        if (!uploadError) {
          await supabase.from('reservation_attachments').insert({
            reservation_id: id,
            company_id: selectedCompany,
            file_name: paymentFile.name,
            file_path: filePath,
            file_size: paymentFile.size,
            file_type: paymentFile.type,
            uploaded_by: user?.id,
          });
          setPaymentFile(null);
        }
      }

      toast.success('บันทึกรายละเอียดการชำระเงินสำเร็จ');
    } catch (err) {
      console.error('Error saving payment details:', err);
      toast.error('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSavingPayment(false);
    }
  };

  // Confirm payment received → set cashier_user_id and advance workflow to Step 4
  const handleSavePayment = async () => {
    if (!id) return;
    if (paymentAmount <= 0) {
      toast.error('กรุณากรอกจำนวนเงิน');
      return;
    }

    setIsSavingPayment(true);
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('reservations')
        .update({
          cashier_user_id: user?.id || null,
          cashier_user_name: profile?.full_name || user?.email || null,
          updated_at: now,
        })
        .eq('id', id);

      if (error) throw error;

      // Advance workflow locally
      setCashierUserId(user?.id || null);
      setCashierUserName(profile?.full_name || user?.email || null);
      setCashierVerifiedAt(now);

      await logActivity({
        reservationId: id,
        action: 'cashier_verified',
        actionLabel: 'ยืนยันการรับเงิน',
        details: {
          payment_type: paymentType,
          payment_amount: paymentAmount,
          payment_description: paymentDescription,
          confirmed_at: now,
          confirmed_by: profile?.full_name || user?.email,
        },
        companyId: selectedCompany,
        branchId: selectedBranch || null,
      });

      toast.success('บันทึกยืนยันรับเงินจองสำเร็จ');
      navigate('/reservations');
    } catch (err) {
      console.error('Error saving payment:', err);
      toast.error('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSavingPayment(false);
    }
  };

  // Cashier returns reservation to sale for revision (Step 3 → back to Step 1)
  // Sale will only be allowed to edit the deposit (จำนวนเงินจอง) field.
  // Customer confirmation is preserved (no re-confirm needed) and on resubmit the
  // workflow returns straight to the cashier (Step 3).
  const handleReturnPayment = async () => {
    if (!id) return;
    if (!paymentDescription.trim()) {
      toast.error('กรุณากรอกเหตุผลในการส่งกลับเพื่อแก้ไข');
      return;
    }
    setIsSavingPayment(true);
    try {
      const now = new Date().toISOString();
      // Tag the remark so the sale role knows this came from cashier (deposit-only edit)
      const taggedRemark = `[DEPOSIT_RETURN] ${paymentDescription.trim()}`;
      const { error } = await supabase
        .from('reservations')
        .update({
          status: 'draft',
          // Preserve customer confirmation – do NOT reset confirmation_status
          review_status: 'returned',
          review_remark: taggedRemark,
          // Clear cashier verification so resubmit lands back at Step 3
          cashier_user_id: null,
          cashier_user_name: null,
          updated_at: now,
        })
        .eq('id', id);
      if (error) throw error;

      await logActivity({
        reservationId: id,
        action: 'review_returned',
        actionLabel: 'ส่งกลับเพื่อแก้ไข (แคชเชียร์ - แก้ไขจำนวนเงินจอง)',
        details: {
          reason: paymentDescription,
          returned_at: now,
          returned_by: profile?.full_name || user?.email,
          returned_from_stage: 'cashier',
          editable_field: 'deposit_amount',
        },
        companyId: selectedCompany,
        branchId: selectedBranch || null,
      });

      toast.success('ส่งกลับเพื่อแก้ไขเรียบร้อย');
      navigate('/reservations/pending-payment');
    } catch (err) {
      console.error('Error returning payment:', err);
      toast.error('เกิดข้อผิดพลาดในการส่งกลับ');
    } finally {
      setIsSavingPayment(false);
    }
  };

  // Branches & models now sourced from DB; keep aliases for minimal diff
  const companyBranches = dbBranches.map(b => ({ id: b.branch_id, name: b.branch_name }));
  const companyModels = dbModels.map(m => ({ id: m.id, name: m.description }));

  // Calculate net price
  const finalPrice = basePrice - discountAmount;

  // Detect which stage returned the reservation for revision (drives section locking + banner)
  const returnedFromCashier = reviewStatus === 'returned' && !cashierUserId;
  const returnedFromSupervisor = reviewStatus === 'returned' && !!cashierUserId;
  const returnedFromManager = approvalStatus === 'rejected';
  const isReturnedForRevision = returnedFromCashier || returnedFromSupervisor || returnedFromManager;
  // Strip the [DEPOSIT_RETURN] tag we added when displaying the cashier remark
  const displayedReviewRemark = (reviewRemark || '').replace(/^\[DEPOSIT_RETURN\]\s*/, '');

  // Calculate workflow stage based on status
  const calculateWorkflowStage = (): WorkflowStage => {
    // If cancelled
    if (reservationStatus === 'cancelled') return 'step7';

    // If supervisor returned for revision → roll back to Step 1 (Sale must edit & resubmit)
    if (reviewStatus === 'returned' && reservationStatus === 'draft') return 'step1';

    // If approved → Step 6 พิมพ์/ลงนาม
    if (approvalStatus === 'approved') return 'step6';
    
    // If reviewed, waiting for approval → Step 5
    if (reviewStatus === 'reviewed') return 'step5';
    
    // If confirmed by customer:
    //  - Until cashier verifies payment (cashier_user_id is set) → Step 3 ตรวจสอบการชำระเงิน
    //  - After cashier verifies → Step 4 ตรวจสอบรายละเอียด
    if (confirmationStatus === 'confirmed') {
      const cashierVerified = !!cashierUserId;
      return cashierVerified ? 'step4' : 'step3';
    }
    
    // If OTP/Link sent → Step 2
    if (confirmationStatus === 'otp_sent' || confirmationStatus === 'link_sent') return 'step2';
    
    // Default: Step 1 สร้างใบจอง
    return 'step1';
  };

  // Calculate document status for workflow display
  const calculateDocumentStatus = (): DocumentStatus => {
    if (reservationStatus === 'cancelled') return 'cancelled';
    if (approvalStatus === 'approved') return 'final';
    return 'draft';
  };

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
      const modelName = dbModels.find(m => m.id === selectedModel)?.description || '';
      const submodelName = dbSubModels.find(s => s.id === selectedSubmodel)?.description || '';
      const colorName = dbColors.find(c => c.id === selectedColor)?.description || '';

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
        color: colorName || null,
        fuel_type: selectedFuelType || null,
        list_price: basePrice,
        discount: discountAmount,
        net_price: finalPrice,
        deposit_amount: depositAmount,
        expected_delivery_date: expectedDeliveryDate || null,
        freebies: freebies.filter(f => f.name),
        accessories: accessories.filter(a => a.name),
        benefits: benefits.filter(b => b.name),
        purchase_type: purchaseType,
        down_payment: purchaseType === 'finance' ? downPayment : 0,
        finance_amount: purchaseType === 'finance' ? financeAmount : 0,
        installment_period_id: purchaseType === 'finance' ? (installmentPeriodId || null) : null,
      };

      const { error } = await supabase
        .from('reservations')
        .update(updateData as any)
        .eq('id', id);

      if (error) {
        console.error('Error updating reservation:', error);
        toast.error('เกิดข้อผิดพลาดในการบันทึก: ' + error.message);
        return;
      }

      // Save any new attachments
      const newAttachments = attachments.filter(a => a.isNew);
      if (newAttachments.length > 0) {
        const { success, savedCount } = await saveAttachments(id);
        if (success && savedCount > 0) {
          toast.success(`บันทึกเอกสารแนบ ${savedCount} ไฟล์สำเร็จ`);
        }
      }

      // Log activity
      await logActivity({
        reservationId: id,
        action: 'updated',
        companyId: selectedCompany,
        branchId: selectedBranch || null,
      });

      toast.success('บันทึกการแก้ไขสำเร็จ');
      navigate('/reservations');
    } catch (err) {
      console.error('Error:', err);
      toast.error('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSaving(false);
    }
  };

  // Submit reservation for approval — transitions status from 'confirmed' to 'pending'.
  // On a resubmission after any stage returned for revision (cashier / supervisor / manager),
  // we keep `confirmation_status='confirmed'` so the customer is NOT asked to re-confirm,
  // and we reset the relevant review/approval flags so the workflow advances to the right next stage.
  const handleSubmitForApproval = async () => {
    if (!id) return;
    if (confirmationStatus !== 'confirmed') {
      toast.error('กรุณายืนยันสัญญาจองก่อนส่งขออนุมัติ');
      return;
    }
    setIsSaving(true);
    try {
      const wasReturnedFromCashier = returnedFromCashier;
      const wasReturnedFromSupervisor = returnedFromSupervisor;
      const wasReturnedFromManager = returnedFromManager;
      const wasResubmission = wasReturnedFromCashier || wasReturnedFromSupervisor || wasReturnedFromManager;

      const updatePayload: Record<string, any> = {
        status: 'pending',
        // Always preserve confirmation_status='confirmed' (no re-confirm on resubmit)
        // Persist deposit_amount in case cashier returned for editing it
        deposit_amount: depositAmount,
      };

      // Any resubmission after a return → route back to "ตรวจสอบการชำระเงิน" (cashier stage)
      // by clearing cashier verification + downstream review/approval flags.
      if (wasResubmission) {
        updatePayload.cashier_user_id = null;
        updatePayload.cashier_user_name = null;
        updatePayload.review_status = 'pending';
        updatePayload.review_remark = null;
        updatePayload.reviewed_at = null;
        updatePayload.reviewed_by = null;
        updatePayload.approval_status = 'pending';
        updatePayload.approval_remark = null;
        updatePayload.approved_at = null;
        updatePayload.approved_by = null;
      } else {
        // Non-resubmission: keep prior behavior
        updatePayload.review_status = reviewStatus === 'returned' ? 'pending' : reviewStatus;
      }

      const { error } = await supabase
        .from('reservations')
        .update(updatePayload)
        .eq('id', id);
      if (error) {
        toast.error('เกิดข้อผิดพลาดในการส่งขออนุมัติ: ' + error.message);
        return;
      }
      setReservationStatus('pending');
      if (reviewStatus === 'returned') setReviewStatus('pending');
      if (wasReturnedFromManager) setApprovalStatus('pending');

      await logActivity({
        reservationId: id,
        action: wasResubmission ? 'resubmitted_for_approval' : 'submitted_for_approval',
        actionLabel: wasReturnedFromCashier
          ? 'ส่งขออนุมัติอีกครั้ง (แก้ไขจำนวนเงินจอง)'
          : wasResubmission
            ? 'ส่งขออนุมัติอีกครั้ง (หลังถูกส่งกลับเพื่อแก้ไข)'
            : 'ส่งขออนุมัติ',
        details: {
          submitted_by: profile?.full_name || user?.email,
          submitted_at: new Date().toISOString(),
          resubmission: wasResubmission,
          returned_from: wasReturnedFromCashier ? 'cashier' : wasReturnedFromSupervisor ? 'supervisor' : wasReturnedFromManager ? 'manager' : null,
          new_deposit_amount: wasReturnedFromCashier ? depositAmount : undefined,
        },
        companyId: selectedCompany,
        branchId: selectedBranch || null,
      });
      toast.success(wasResubmission ? 'ส่งขออนุมัติอีกครั้งสำเร็จ' : 'ส่งขออนุมัติสำเร็จ');
      navigate('/reservations');
    } catch (err) {
      console.error('Error:', err);
      toast.error('เกิดข้อผิดพลาดในการส่งขออนุมัติ');
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
        title={isViewOnly || isSaleManager ? "รายละเอียดใบจอง" : isCashierMode ? "รับเงินจอง" : "แก้ไขใบจอง"}
        subtitle={`${company?.code} - เลขที่: ${documentNumber}${isCashierMode ? ' (โหมดแคชเชียร์)' : ''}`}
      />
      
       <div className={cn("flex-1 p-6 overflow-auto", ((effectiveViewOnly && !isSaleSupervisor && !isCashier && !isSaleManager) || isSaleManager) && "pointer-events-none")}>
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
          {/* Workflow Progress */}
          <WorkflowSteps
            currentStage={calculateWorkflowStage()}
            documentStatus={calculateDocumentStatus()}
            assignments={assignments}
            stepActors={{
              step1: { name: createdByName, at: createdAt },
              step2: { name: createdByName, at: confirmedAt },
              step3: { name: cashierUserName, at: cashierVerifiedAt },
              step4: { name: reviewedByName, at: reviewedAt },
              step5: { name: approvedByName, at: approvedAt },
            }}
          />

          {/* Returned-for-revision banner hidden by request */}

           {/* Admin Assignment Panel - visible only to user_admin/it */}
           {isAdmin && id && (
             <AdminAssignmentPanel
               reservationId={id}
               companyId={selectedCompany}
               branchId={selectedBranch || null}
               currentStatus={reservationStatus}
               confirmationStatus={confirmationStatus}
               reviewStatus={reviewStatus}
               approvalStatus={approvalStatus}
               onStatusChange={() => {
                 // Reload the page data
                 window.location.reload();
               }}
             />
           )}

           {/* Rejection / Return-for-revision notice (Sale role only) */}
           {isSaleRole && isReturnedForRevision && (
             <div className="mb-4 rounded-md border border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/40 p-4">
               <div className="flex items-start gap-3">
                 <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />
                 <div className="flex-1 space-y-1">
                   <p className="text-sm font-semibold text-rose-800 dark:text-rose-200">
                     {returnedFromCashier && 'ใบจองถูกส่งกลับโดยเจ้าหน้าที่การเงิน (แคชเชียร์)'}
                     {returnedFromSupervisor && 'ใบจองถูกส่งกลับโดยหัวหน้าทีมขาย'}
                     {returnedFromManager && 'ใบจองถูกปฏิเสธโดยผู้จัดการฝ่ายขาย'}
                   </p>
                   <p className="text-xs text-rose-700 dark:text-rose-300">
                     กรุณาตรวจสอบเหตุผลด้านล่าง แก้ไขข้อมูล แล้วส่งขออนุมัติอีกครั้ง
                   </p>
                   {(returnedFromManager ? approvalRemark : displayedReviewRemark) ? (
                     <div className="mt-2 rounded border border-rose-200 dark:border-rose-800 bg-white dark:bg-rose-950/60 p-2.5">
                       <p className="text-[11px] uppercase tracking-wide text-rose-600 dark:text-rose-400 mb-1">
                         เหตุผล / หมายเหตุ
                         {returnedFromManager && approvedByName ? ` จาก ${approvedByName}` : ''}
                         {(returnedFromCashier || returnedFromSupervisor) && reviewedByName ? ` จาก ${reviewedByName}` : ''}
                       </p>
                       <p className="text-sm text-rose-900 dark:text-rose-100 whitespace-pre-wrap">
                         {returnedFromManager ? approvalRemark : displayedReviewRemark}
                       </p>
                     </div>
                   ) : (
                     <p className="text-sm italic text-rose-700/80 dark:text-rose-300/80 mt-1">
                       (ไม่มีหมายเหตุระบุไว้)
                     </p>
                   )}
                 </div>
               </div>
             </div>
           )}

           {/* Form Sections */}
          <div className="space-y-6">
           {/* Compact summary view for Sale Manager (approval stage) */}
           {isSaleManager && !isIT ? (
             <div className="space-y-4">
               {/* Summary Card */}
               <div className="form-section">
                 <div className="form-section-header flex items-center gap-2">
                   <FileText className="w-5 h-5" />
                   สรุปข้อมูลใบจอง
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                   <div><span className="text-muted-foreground">เลขที่: </span><span className="font-medium">{documentNumber}</span></div>
                   <div><span className="text-muted-foreground">สาขา: </span><span className="font-medium">{selectedBranch || '-'}</span></div>
                   <div><span className="text-muted-foreground">ผู้จอง: </span><span className="font-medium">{`${bookingTitle} ${bookingFirstName} ${bookingLastName}`.trim() || '-'}</span></div>
                   <div><span className="text-muted-foreground">เบอร์โทร: </span><span className="font-medium">{bookingPhone || '-'}</span></div>
                   <div><span className="text-muted-foreground">เลขประจำตัว: </span><span className="font-medium">{bookingIdNo || '-'}</span></div>
                   <div><span className="text-muted-foreground">ผู้ซื้อ: </span><span className="font-medium">{isBuyerSame ? 'เหมือนผู้จอง' : (buyerName || '-')}</span></div>
                 </div>
                 <div className="border-t pt-2 mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                   <div><span className="text-muted-foreground">รุ่น: </span><span className="font-medium">{models.find(m => m.id === selectedModel)?.description || selectedModel || '-'}</span></div>
                   <div><span className="text-muted-foreground">รุ่นย่อย: </span><span className="font-medium">{submodels.find(s => s.id === selectedSubmodel)?.description || selectedSubmodel || '-'}</span></div>
                   <div><span className="text-muted-foreground">สี: </span><span className="font-medium">{colors.find(c => c.id === selectedColor)?.description || selectedColor || '-'}</span></div>
                   <div><span className="text-muted-foreground">ประเภทเชื้อเพลิง: </span><span className="font-medium">{selectedFuelType}</span></div>
                 </div>
                 <div className="border-t pt-2 mt-2 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 text-sm">
                   <div><span className="text-muted-foreground">ราคา: </span><span className="font-medium">{basePrice.toLocaleString()}</span></div>
                   <div><span className="text-muted-foreground">ส่วนลด: </span><span className="font-medium">{discountAmount.toLocaleString()}</span></div>
                   <div><span className="text-muted-foreground">ราคาสุทธิ: </span><span className="font-semibold text-primary">{(basePrice - discountAmount).toLocaleString()}</span></div>
                   <div><span className="text-muted-foreground">เงินจอง: </span><span className="font-medium">{depositAmount.toLocaleString()}</span></div>
                   <div><span className="text-muted-foreground">ประเภทซื้อ: </span><span className="font-medium">{purchaseType === 'cash' ? 'เงินสด' : 'เช่าซื้อ'}</span></div>
                   {purchaseType === 'finance' && (
                     <>
                       <div><span className="text-muted-foreground">ดาวน์: </span><span className="font-medium">{downPayment.toLocaleString()}</span></div>
                       <div><span className="text-muted-foreground">จัดไฟแนนซ์: </span><span className="font-medium">{financeAmount.toLocaleString()}</span></div>
                     </>
                   )}
                   <div><span className="text-muted-foreground">รับรถ: </span><span className="font-medium">{expectedDeliveryDate || '-'}</span></div>
                 </div>
                 {(freebies.length > 0 || accessories.length > 0 || benefits.length > 0) && (
                   <div className="border-t pt-2 mt-2 text-sm space-y-1">
                     {freebies.length > 0 && <div><span className="text-muted-foreground">ของแถม: </span><span>{freebies.map(f => f.itemName).join(', ')}</span></div>}
                     {accessories.length > 0 && <div><span className="text-muted-foreground">อุปกรณ์: </span><span>{accessories.map(a => a.itemName).join(', ')}</span></div>}
                     {benefits.length > 0 && <div><span className="text-muted-foreground">สิทธิประโยชน์: </span><span>{benefits.map(b => b.itemName).join(', ')}</span></div>}
                   </div>
                 )}
               </div>

               {/* Compact Attachments */}
               <div className="form-section">
                 <div className="form-section-header flex items-center gap-2">
                   <Paperclip className="w-5 h-5" />
                   ไฟล์แนบ ({attachments.length})
                 </div>
                 {attachments.length === 0 ? (
                   <p className="text-sm text-muted-foreground">ไม่มีไฟล์แนบ</p>
                 ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                     {attachments.map(file => (
                       <button
                         key={file.id}
                         type="button"
                         onClick={() => handleOpenFile(file)}
                         className="flex items-center gap-2 p-2 rounded border hover:bg-muted/50 text-sm text-left transition-colors"
                       >
                         <Paperclip className="w-4 h-4 text-primary shrink-0" />
                         <span className="truncate flex-1">{file.name}</span>
                         <span className="text-xs text-muted-foreground shrink-0">{(file.size / 1024).toFixed(0)} KB</span>
                       </button>
                     ))}
                   </div>
                 )}
               </div>
             </div>
           ) : (
           <>
           {/* Cashier read-only wrapper for non-payment sections (also locks all sections when cashier returned for revision) */}
           <div className={cn(
             ((isCashier || isSaleSupervisor) && !isIT) && "pointer-events-none select-none opacity-90",
             (isSaleRole && returnedFromCashier) && "pointer-events-none select-none opacity-90"
           )}>
            {/* Section 1: Branch/Vehicle Type Selection */}
            <div className="form-section">
              <div className="form-section-header flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                ข้อมูลสาขา / ประเภทรถยนต์
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branch">สาขา <span className="text-destructive">*</span></Label>
                  <Select value={selectedBranch} onValueChange={setSelectedBranch} disabled={isCashierMode}>
                    <SelectTrigger className={cn("input-focus", isCashierMode && "bg-muted cursor-not-allowed")}>
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
                  <Select value={selectedBU} onValueChange={setSelectedBU} disabled={isCashierMode}>
                    <SelectTrigger className={cn("input-focus", isCashierMode && "bg-muted cursor-not-allowed")}>
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

            {/* Section 2: Booking Customer - locked when any stage returned for revision */}
            <div className={cn(
              "form-section",
              isSaleRole && isReturnedForRevision && "pointer-events-none select-none opacity-90"
            )}>
              <div className="form-section-header flex items-center gap-2">
                <User className="w-5 h-5" />
                ข้อมูลผู้จองรถ {isSaleRole && isReturnedForRevision && (
                  <Badge variant="outline" className="ml-2 bg-muted text-muted-foreground">View Only</Badge>
                )}
              </div>
              
              {/* Customer Type */}
              <div className="mb-4">
                <Label>ประเภทผู้จอง <span className="text-destructive">*</span></Label>
                <RadioGroup 
                  value={bookingCustomerType} 
                  onValueChange={(v) => setBookingCustomerType(v as CustomerType)}
                  className="flex gap-4 mt-2"
                  disabled={isCashierMode}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="individual" id="individual" disabled={isCashierMode} />
                    <Label htmlFor="individual" className="cursor-pointer">บุคคลธรรมดา</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="corporate" id="corporate" disabled={isCashierMode} />
                    <Label htmlFor="corporate" className="cursor-pointer">นิติบุคคล</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>คำนำหน้า</Label>
                  <Select value={bookingTitle} onValueChange={setBookingTitle} disabled={isCashierMode}>
                    <SelectTrigger className={cn("input-focus", isCashierMode && "bg-muted cursor-not-allowed")}>
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
                    disabled={isCashierMode}
                    className={cn("input-focus", isCashierMode && "bg-muted cursor-not-allowed")}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>นามสกุล <span className="text-destructive">*</span></Label>
                  <Input 
                    value={bookingLastName} 
                    onChange={(e) => setBookingLastName(e.target.value)}
                    placeholder="นามสกุล"
                    disabled={isCashierMode}
                    className={cn("input-focus", isCashierMode && "bg-muted cursor-not-allowed")}
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
                    disabled={isCashierMode}
                    className={cn("input-focus", isCashierMode && "bg-muted cursor-not-allowed")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>เบอร์โทรศัพท์ <span className="text-destructive">*</span></Label>
                  <Input 
                    value={bookingPhone} 
                    onChange={(e) => setBookingPhone(e.target.value)}
                    placeholder="0XX-XXX-XXXX"
                    disabled={isCashierMode}
                    className={cn("input-focus", isCashierMode && "bg-muted cursor-not-allowed")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>อีเมล</Label>
                  <Input 
                    type="email"
                    value={bookingEmail} 
                    onChange={(e) => setBookingEmail(e.target.value)}
                    placeholder="email@example.com"
                    disabled={isCashierMode}
                    className={cn("input-focus", isCashierMode && "bg-muted cursor-not-allowed")}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Buyer (if different) - locked when any stage returned for revision (no changing customer) */}
            <div className={cn(
              "form-section",
              isSaleRole && isReturnedForRevision && "pointer-events-none select-none opacity-90"
            )}>
              <div className="form-section-header flex items-center gap-2">
                <Users className="w-5 h-5" />
                ข้อมูลผู้ซื้อรถ {isSaleRole && isReturnedForRevision && (
                  <Badge variant="outline" className="ml-2 bg-muted text-muted-foreground">View Only</Badge>
                )}
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
                      {dbColors.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.description}
                        </SelectItem>
                      ))}
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

              {purchaseType === 'finance' && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-3">ข้อมูลสินเชื่อ</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>เงินดาวน์</Label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={downPayment > 0 ? downPayment.toLocaleString() : ''}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '');
                          setDownPayment(v ? Number(v) : 0);
                        }}
                        placeholder="0"
                        className="input-focus"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ยอดจัดไฟแนนซ์</Label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={financeAmount > 0 ? financeAmount.toLocaleString() : ''}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '');
                          setFinanceAmount(v ? Number(v) : 0);
                        }}
                        placeholder="0"
                        className="input-focus"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ระยะเวลาผ่อน (งวด)</Label>
                      <Select value={installmentPeriodId} onValueChange={setInstallmentPeriodId}>
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
                <div className={cn(
                  "space-y-1.5",
                  // When cashier returned for revision, lift the parent lock so sale can edit the deposit only
                  (isSaleRole && returnedFromCashier) && "pointer-events-auto select-auto opacity-100 ring-2 ring-amber-500 rounded-md p-2 -m-0.5 bg-amber-50 dark:bg-amber-950/30"
                )}>
                  <Label className={cn(
                    "flex items-center gap-1.5",
                    (isSaleRole && returnedFromCashier) && "text-amber-800 dark:text-amber-200 font-semibold"
                  )}>
                    {(isSaleRole && returnedFromCashier) && (
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    )}
                    เงินจอง
                    {(isSaleRole && returnedFromCashier) && (
                      <span className="ml-1 text-[10px] bg-amber-600 text-white px-1.5 py-0.5 rounded font-medium">
                        แก้ไข
                      </span>
                    )}
                  </Label>
                  <Input 
                    type="text"
                    inputMode="numeric"
                    value={depositAmount > 0 ? depositAmount.toLocaleString() : ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setDepositAmount(value ? Number(value) : 0);
                    }}
                    placeholder="0"
                    className={cn(
                      "input-focus",
                      (isSaleRole && returnedFromCashier) && "border-amber-500 bg-white dark:bg-amber-950/50 font-semibold text-amber-900 dark:text-amber-100 focus-visible:ring-amber-500"
                    )}
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

            {/* Section 6: ยืนยันสัญญาจอง - locked when returned for revision OR already confirmed (no re-confirm on resubmit) */}
            <div className={cn(
              "form-section border-2 border-green-500/20 bg-green-50/50 dark:bg-green-950/20",
              isSaleRole && (isReturnedForRevision || confirmationStatus === 'confirmed') && "pointer-events-none select-none opacity-90"
            )}>
              <div className="form-section-header flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <ShieldCheck className="w-5 h-5" />
                  ยืนยันสัญญาจอง
                  {isSaleRole && (isReturnedForRevision || confirmationStatus === 'confirmed') && (
                    <Badge variant="outline" className="ml-2 bg-muted text-muted-foreground">View Only</Badge>
                  )}
                </div>
                {/* Status Badge */}
                {confirmationStatus === 'pending' && (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400">
                    <Clock className="w-3 h-3 mr-1" />
                    รอยืนยัน
                  </Badge>
                )}
                {confirmationStatus === 'otp_sent' && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400">
                    <Send className="w-3 h-3 mr-1" />
                    ส่ง OTP แล้ว
                  </Badge>
                )}
                {confirmationStatus === 'link_sent' && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400">
                    <LinkIcon className="w-3 h-3 mr-1" />
                    ส่ง Link แล้ว
                  </Badge>
                )}
                {confirmationStatus === 'confirmed' && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    ยืนยันแล้ว
                  </Badge>
                )}
              </div>
              
              {/* Confirmed State */}
              {confirmationStatus === 'confirmed' && confirmedAt ? (
                <div className="p-4 bg-green-100/50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-300">ลูกค้ายืนยันการจองแล้ว</p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        วันที่ {new Date(confirmedAt).toLocaleDateString('th-TH', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })} เวลา {new Date(confirmedAt).toLocaleTimeString('th-TH', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} น.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Method Selection */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">เลือกวิธียืนยัน</Label>
                    <RadioGroup 
                      value={confirmationMethod} 
                      onValueChange={(v) => setConfirmationMethod(v as 'otp' | 'link')}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <label 
                        className={cn(
                          "flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all",
                          confirmationMethod === 'otp' 
                            ? "border-green-500 bg-green-50 dark:bg-green-950/30" 
                            : "border-border hover:border-green-300"
                        )}
                      >
                        <RadioGroupItem value="otp" className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 font-medium">
                            <Smartphone className="w-4 h-4 text-green-600" />
                            ส่งรหัส OTP ให้ลูกค้า
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            ลูกค้าจะได้รับ SMS รหัส OTP 6 หลัก และแจ้งกลับมาที่พนักงานขาย
                          </p>
                        </div>
                      </label>
                      
                      <label 
                        className={cn(
                          "flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all",
                          confirmationMethod === 'link' 
                            ? "border-green-500 bg-green-50 dark:bg-green-950/30" 
                            : "border-border hover:border-green-300"
                        )}
                      >
                        <RadioGroupItem value="link" className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 font-medium">
                            <LinkIcon className="w-4 h-4 text-green-600" />
                            ส่ง Link ให้ลูกค้ากดยืนยัน
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            ลูกค้าจะได้รับ Link สำหรับยืนยันการจอง และระบบจะ Stamp เวลาอัตโนมัติ
                          </p>
                        </div>
                      </label>
                    </RadioGroup>
                  </div>

                  {/* OTP Method */}
                  {confirmationMethod === 'otp' && (
                    <div className="p-4 bg-background rounded-lg border border-border space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">หมายเลขโทรศัพท์ลูกค้า</p>
                          <p className="font-medium">
                            {bookingPhone ? `${bookingPhone.slice(0, 3)}-XXX-${bookingPhone.slice(-4)}` : 'ไม่ระบุ'}
                          </p>
                        </div>
                        {confirmationStatus === 'pending' && (
                          <Button 
                            variant="outline" 
                            onClick={async () => {
                              if (!bookingPhone) {
                                toast.error('กรุณากรอกเบอร์โทรศัพท์ลูกค้า');
                                return;
                              }
                              setIsSendingOtp(true);
                              try {
                                await new Promise(resolve => setTimeout(resolve, 1500));
                                setConfirmationStatus('otp_sent');
                                toast.success('ส่งรหัส OTP ไปที่ลูกค้าแล้ว (Demo)');
                              } finally {
                                setIsSendingOtp(false);
                              }
                            }}
                            disabled={isSendingOtp}
                            className="gap-2"
                          >
                            {isSendingOtp ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                            ส่ง OTP
                          </Button>
                        )}
                      </div>

                      {confirmationStatus === 'otp_sent' && (
                        <div className="pt-4 border-t border-border">
                          <Label className="mb-2 block">กรอกรหัส OTP จากลูกค้า</Label>
                          <div className="flex items-center gap-4">
                            <InputOTP 
                              maxLength={6} 
                              value={otpCode}
                              onChange={setOtpCode}
                            >
                              <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                              </InputOTPGroup>
                            </InputOTP>
                            <Button 
                              onClick={async () => {
                                if (otpCode.length !== 6) {
                                  toast.error('กรุณากรอกรหัส OTP 6 หลัก');
                                  return;
                                }
                                setIsVerifyingOtp(true);
                                try {
                                  await new Promise(resolve => setTimeout(resolve, 1000));
                                  const now = new Date().toISOString();
                                  setConfirmationStatus('confirmed');
                                  setConfirmedAt(now);
                                  setReservationStatus('confirmed');
                                   await supabase
                                     .from('reservations')
                                     .update({ 
                                       status: 'confirmed',
                                       confirmation_status: 'confirmed',
                                       confirmation_method: 'otp',
                                       confirmed_at: now
                                     })
                                     .eq('id', id);
                                   await logActivity({
                                     reservationId: id!,
                                     action: 'confirmed',
                                     actionLabel: 'ยืนยันสัญญาจอง (OTP)',
                                     details: {
                                       method: 'otp',
                                       confirmed_at: now,
                                       confirmed_by: profile?.full_name || user?.email,
                                       contact: bookingPhone || bookingEmail || '',
                                     },
                                     companyId: selectedCompany,
                                     branchId: selectedBranch || null,
                                   });
                                   toast.success('ยืนยันสัญญาจองสำเร็จ');
                                } catch (err) {
                                  toast.error('รหัส OTP ไม่ถูกต้อง');
                                } finally {
                                  setIsVerifyingOtp(false);
                                }
                              }}
                              disabled={isVerifyingOtp || otpCode.length !== 6}
                              className="bg-green-600 hover:bg-green-700 text-white gap-2"
                            >
                              {isVerifyingOtp ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              ยืนยันสัญญาจอง
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Link Method */}
                  {confirmationMethod === 'link' && (
                    <div className="p-4 bg-background rounded-lg border border-border space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">ส่ง Link ให้ลูกค้ากดยืนยันผ่าน</p>
                        <p className="font-medium">
                          {bookingPhone ? `โทรศัพท์: ${bookingPhone}` : ''}{bookingPhone && bookingEmail ? ' / ' : ''}{bookingEmail ? `อีเมล: ${bookingEmail}` : ''}
                          {!bookingPhone && !bookingEmail && 'ไม่ระบุข้อมูลติดต่อ'}
                        </p>
                      </div>

                      <Button 
                        onClick={async () => {
                          if (!bookingPhone && !bookingEmail) {
                            toast.error('กรุณากรอกเบอร์โทรศัพท์หรืออีเมลลูกค้า');
                            return;
                          }
                          setIsSendingLink(true);
                          try {
                            await new Promise(resolve => setTimeout(resolve, 1500));
                            // Simulate customer confirmed via link
                            const now = new Date().toISOString();
                            setConfirmationStatus('confirmed');
                            setConfirmedAt(now);
                            setReservationStatus('confirmed');
                            await supabase
                              .from('reservations')
                              .update({ 
                                status: 'confirmed',
                                confirmation_status: 'confirmed',
                                confirmation_method: 'link',
                                confirmed_at: now
                              })
                              .eq('id', id);
                            await logActivity({
                              reservationId: id!,
                              action: 'confirmed',
                              actionLabel: 'ยืนยันสัญญาจอง (Link)',
                              details: {
                                method: 'link',
                                confirmed_at: now,
                                confirmed_by: profile?.full_name || user?.email,
                                contact: bookingPhone || bookingEmail || '',
                              },
                              companyId: selectedCompany,
                              branchId: selectedBranch || null,
                            });
                            // Show confirmation dialog
                            toast.success('ลูกค้ายืนยันเรียบร้อย', {
                              description: 'ลูกค้ากดยืนยันสัญญาจองผ่าน Link เรียบร้อยแล้ว',
                              duration: 5000,
                            });
                          } catch (err) {
                            toast.error('เกิดข้อผิดพลาด');
                          } finally {
                            setIsSendingLink(false);
                          }
                        }}
                        disabled={isSendingLink}
                        className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isSendingLink ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        ส่ง Link ยืนยัน
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Section 7: ของแถม */}
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
                      {!isViewOnly && !isCashierMode && !isSaleManager && !isSaleSupervisor && (
                        <Button variant="ghost" size="icon" onClick={() => removeItem('freebies', item.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {!isViewOnly && !isCashierMode && !isSaleManager && !isSaleSupervisor && (
                  <Button variant="outline" size="sm" onClick={() => openPicker('freebies')} className="gap-1">
                    <Plus className="w-4 h-4" />
                    เพิ่มรายการ
                  </Button>
                )}
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
                      {!isViewOnly && !isCashierMode && !isSaleManager && !isSaleSupervisor && (
                        <Button variant="ghost" size="icon" onClick={() => removeItem('accessories', item.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {!isViewOnly && !isCashierMode && !isSaleManager && !isSaleSupervisor && (
                  <Button variant="outline" size="sm" onClick={() => openPicker('accessories')} className="gap-1">
                    <Plus className="w-4 h-4" />
                    เพิ่มรายการ
                  </Button>
                )}
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
                      {!isViewOnly && !isCashierMode && !isSaleManager && !isSaleSupervisor && (
                        <Button variant="ghost" size="icon" onClick={() => removeItem('benefits', item.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {!isViewOnly && !isCashierMode && !isSaleManager && !isSaleSupervisor && (
                  <Button variant="outline" size="sm" onClick={() => openPicker('benefits')} className="gap-1">
                    <Plus className="w-4 h-4" />
                    เพิ่มรายการ
                  </Button>
                )}
              </div>
            </div>

            {/* Section 9: Attachments - always interactive (preview/download) regardless of parent read-only state.
                Trash icon is hidden whenever the form is effectively view-only for this user. */}
            <div className="pointer-events-auto">
              <FileUploadSection
                files={attachments}
                onFilesAdd={(files) => handleAddFiles(files)}
                onFileRemove={handleRemoveFile}
                onFileOpen={handleOpenFile}
                disabled={effectiveViewOnly || isCashierMode || ((isCashier || isSaleSupervisor || isSaleManager) && !isIT)}
                isLoading={isLoadingAttachments}
              />
            </div>

             </div>
             {/* End cashier read-only wrapper */}
             </>
             )}

             {/* Section 10: รายละเอียดการชำระเงิน (เฉพาะการเงิน) - Show when sent for approval (pending) or approved */}
            {(isIT || isCashier || isSaleManager || approvalStatus === 'approved' || (!isSaleRole && !isSaleSupervisor && reservationStatus === 'pending')) && (
            <div className={cn(
              "form-section border-2 border-primary/20 bg-primary/5",
              ((isSaleSupervisor || isSaleManager) && !isIT) && "pointer-events-none select-none opacity-90"
            )}>
              <div className="form-section-header flex items-center gap-2 text-primary">
                <CreditCard className="w-5 h-5" />
                รายละเอียดการชำระเงิน (เฉพาะการเงิน)
              </div>

              {isSaleManager && !isIT ? (
                /* Compact summary for Sale Manager */
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <span className="text-muted-foreground">ประเภท: </span>
                      <span className="font-medium">
                        {paymentType === 'cash' ? 'เงินสด' : paymentType === 'transfer' ? 'เงินโอน' : paymentType === 'credit' ? 'บัตรเครดิต' : 'ใบสั่งซื้อ'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">จำนวนรับ: </span>
                      <span className="font-medium">{paymentAmount.toLocaleString()} บาท</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">เงินจอง: </span>
                      <span className="font-medium">{depositAmount.toLocaleString()} บาท</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">โดย: </span>
                      <span className="font-medium">{cashierUserName || '-'}</span>
                    </div>
                  </div>
                  {paymentDescription && (
                    <div className="p-2 bg-background/60 rounded border text-xs">
                      <span className="text-muted-foreground">หมายเหตุ: </span>
                      <span>{paymentDescription}</span>
                    </div>
                  )}
                </div>
              ) : (
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

                {/* Save Payment Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-border flex-wrap">
                  {/* บันทึกรายละเอียด button */}
                  <Button 
                    variant="outline"
                    onClick={handleSavePaymentDetails}
                    disabled={isSavingPayment}
                    className="gap-2"
                  >
                    {isSavingPayment ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    บันทึกรายละเอียด
                  </Button>
                  {/* ส่งกลับเพื่อแก้ไข button */}
                  <Button 
                    variant="outline"
                    onClick={handleReturnPayment}
                    disabled={isSavingPayment}
                    className="gap-2 border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400"
                  >
                    {isSavingPayment ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RotateCcw className="w-4 h-4" />
                    )}
                    ส่งกลับเพื่อแก้ไข
                  </Button>
                  {/* บันทึกยืนยันรับเงินจอง button */}
                  <Button 
                    onClick={handleSavePayment}
                    disabled={isSavingPayment || paymentAmount <= 0}
                    className="btn-primary-gradient gap-2"
                  >
                    {isSavingPayment ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    บันทึกยืนยันรับเงินจอง
                  </Button>
                </div>
              </div>
              )}
            </div>
            )}

            {/* Section 11: ตรวจสอบใบจอง (หัวหน้าทีมขาย) - Show when in review step or approved */}
            {(isIT || isSaleSupervisor || isSaleManager || (approvalStatus === 'approved' || (!isCashierMode && !isSaleRole && (reviewStatus !== 'pending' || reservationStatus === 'pending')))) && (
            <div className={cn(
              "form-section border-2 border-orange-500/20 bg-orange-50/50 dark:bg-orange-950/20",
              isSaleManager && !isIT && "pointer-events-none select-none opacity-90"
            )}>
              <div className="form-section-header flex items-center justify-between">
                <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                  <ClipboardCheck className="w-5 h-5" />
                  ตรวจสอบใบจอง (หัวหน้าทีมขาย)
                </div>
                {reviewStatus === 'pending' && (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400">
                    <Clock className="w-3 h-3 mr-1" />
                    รอตรวจสอบ
                  </Badge>
                )}
                {reviewStatus === 'reviewed' && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    ตรวจสอบแล้ว
                  </Badge>
                )}
                {reviewStatus === 'returned' && (
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400">
                    <RotateCcw className="w-3 h-3 mr-1" />
                    ส่งกลับแก้ไข
                  </Badge>
                )}
              </div>

              {reviewStatus === 'reviewed' && reviewedAt ? (
                <div className="p-4 bg-green-100/50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-300">ตรวจสอบแล้ว</p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {new Date(reviewedAt).toLocaleDateString('th-TH', { 
                          year: 'numeric', month: 'long', day: 'numeric' 
                        })} เวลา {new Date(reviewedAt).toLocaleTimeString('th-TH', { 
                          hour: '2-digit', minute: '2-digit' 
                        })} น.
                      </p>
                    </div>
                  </div>
                  {reviewRemark && (
                    <div className="p-3 bg-white/50 dark:bg-black/20 rounded border border-green-200 dark:border-green-700">
                      <p className="text-sm text-muted-foreground mb-1">Remark:</p>
                      <p className="text-sm">{reviewRemark}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Remark</Label>
                    <Textarea 
                      value={reviewRemark}
                      onChange={(e) => setReviewRemark(e.target.value)}
                      placeholder="หมายเหตุการตรวจสอบ..."
                      className="input-focus min-h-[80px]"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3 pt-2">
                    <Button 
                      variant="outline"
                      className="gap-2 border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400"
                      onClick={async () => {
                        setIsSavingReview(true);
                        try {
                          const now = new Date().toISOString();
                          await supabase
                            .from('reservations')
                            .update({ 
                              review_status: 'returned',
                              review_remark: reviewRemark,
                              reviewed_by: user?.id,
                              reviewed_at: now,
                              status: 'draft'
                            })
                            .eq('id', id);
                          await logActivity({
                            reservationId: id!,
                            action: 'review_returned',
                            details: { remark: reviewRemark, reviewed_at: now, reviewed_by: profile?.full_name || user?.email },
                            companyId: selectedCompany,
                            branchId: selectedBranch || null,
                          });
                          setReviewStatus('returned');
                          setReviewedAt(now);
                          toast.success('ส่งกลับไปแก้ไขแล้ว');
                          navigate('/reservations');
                        } catch (err) {
                          toast.error('เกิดข้อผิดพลาด');
                        } finally {
                          setIsSavingReview(false);
                        }
                      }}
                      disabled={isSavingReview}
                    >
                      {isSavingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                      ส่งกลับเพื่อแก้ไข
                    </Button>
                    <Button 
                      className="gap-2 bg-orange-600 hover:bg-orange-700 text-white"
                      onClick={async () => {
                        setIsSavingReview(true);
                        try {
                          const now = new Date().toISOString();
                          await supabase
                            .from('reservations')
                            .update({ 
                              review_status: 'reviewed',
                              review_remark: reviewRemark,
                              reviewed_by: user?.id,
                              reviewed_at: now,
                              status: 'pending'
                            })
                            .eq('id', id);
                          await logActivity({
                            reservationId: id!,
                            action: 'reviewed',
                            details: { remark: reviewRemark, reviewed_at: now, reviewed_by: profile?.full_name || user?.email },
                            companyId: selectedCompany,
                            branchId: selectedBranch || null,
                          });
                          setReviewStatus('reviewed');
                          setReviewedAt(now);
                          toast.success('บันทึกการตรวจสอบสำเร็จ');
                          navigate('/reservations');
                        } catch (err) {
                          toast.error('เกิดข้อผิดพลาด');
                        } finally {
                          setIsSavingReview(false);
                        }
                      }}
                      disabled={isSavingReview}
                    >
                      {isSavingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Approve
                    </Button>
                  </div>
                </div>
              )}
            </div>
            )}

            {/* Section 12: อนุมัติใบจอง (ผู้จัดการฝ่ายขาย) - Show when reviewed or approved */}
            {(isIT || isSaleManager || (!isSaleSupervisor && (approvalStatus === 'approved' || (!isCashierMode && !isSaleRole && reviewStatus === 'reviewed')))) && (
            <div className="form-section border-2 border-purple-500/20 bg-purple-50/50 dark:bg-purple-950/20 pointer-events-auto">
              <div className="form-section-header flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                  <UserCheck className="w-5 h-5" />
                  อนุมัติใบจอง (ผู้จัดการฝ่ายขาย)
                </div>
                {approvalStatus === 'pending' && (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400">
                    <Clock className="w-3 h-3 mr-1" />
                    รออนุมัติ
                  </Badge>
                )}
                {approvalStatus === 'approved' && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400">
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    อนุมัติแล้ว
                  </Badge>
                )}
                {approvalStatus === 'rejected' && (
                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400">
                    <XCircle className="w-3 h-3 mr-1" />
                    ไม่อนุมัติ
                  </Badge>
                )}
              </div>

              {approvalStatus !== 'pending' && approvedAt ? (
                <div className={cn(
                  "p-4 rounded-lg border",
                  approvalStatus === 'approved' 
                    ? "bg-green-100/50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    : "bg-red-100/50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                )}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      approvalStatus === 'approved' ? "bg-green-500" : "bg-red-500"
                    )}>
                      {approvalStatus === 'approved' 
                        ? <ThumbsUp className="w-5 h-5 text-white" />
                        : <XCircle className="w-5 h-5 text-white" />
                      }
                    </div>
                    <div>
                      <p className={cn(
                        "font-semibold",
                        approvalStatus === 'approved' 
                          ? "text-green-800 dark:text-green-300"
                          : "text-red-800 dark:text-red-300"
                      )}>
                        {approvalStatus === 'approved' ? 'อนุมัติแล้ว' : 'ไม่อนุมัติ'}
                      </p>
                      <p className={cn(
                        "text-sm",
                        approvalStatus === 'approved'
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      )}>
                        {new Date(approvedAt).toLocaleDateString('th-TH', { 
                          year: 'numeric', month: 'long', day: 'numeric' 
                        })} เวลา {new Date(approvedAt).toLocaleTimeString('th-TH', { 
                          hour: '2-digit', minute: '2-digit' 
                        })} น.
                      </p>
                    </div>
                  </div>
                  {approvalRemark && (
                    <div className={cn(
                      "p-3 rounded border",
                      approvalStatus === 'approved'
                        ? "bg-white/50 dark:bg-black/20 border-green-200 dark:border-green-700"
                        : "bg-white/50 dark:bg-black/20 border-red-200 dark:border-red-700"
                    )}>
                      <p className="text-sm text-muted-foreground mb-1">Remark:</p>
                      <p className="text-sm">{approvalRemark}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Remark</Label>
                    <Textarea 
                      value={approvalRemark}
                      onChange={(e) => setApprovalRemark(e.target.value)}
                      placeholder="หมายเหตุการอนุมัติ..."
                      className="input-focus min-h-[80px]"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3 pt-2">
                    <Button 
                      variant="outline"
                      className="gap-2 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400"
                      onClick={async () => {
                        setIsSavingApproval(true);
                        try {
                          const now = new Date().toISOString();
                          await supabase
                            .from('reservations')
                            .update({ 
                              approval_status: 'rejected',
                              approval_remark: approvalRemark,
                              approved_by: user?.id,
                              approved_at: now,
                              status: 'draft',
                              review_status: 'pending',
                              reviewed_at: null,
                              reviewed_by: null,
                              review_remark: null
                            })
                            .eq('id', id);

                          // Activity log
                          await supabase.from('reservation_activity_logs').insert({
                            reservation_id: id!,
                            action: 'approval_rejected',
                            action_label: 'ไม่อนุมัติใบจอง',
                            performed_by: user!.id,
                            performed_by_name: profile?.full_name || '',
                            company_id: selectedCompany,
                            branch_id: selectedBranch || null,
                            details: { remark: approvalRemark, status: 'rejected' }
                          });

                          setApprovalStatus('rejected');
                          setApprovedAt(now);
                          toast.success('บันทึกการไม่อนุมัติแล้ว');
                          refetchLogs();
                          navigate('/reservations');
                        } catch (err) {
                          toast.error('เกิดข้อผิดพลาด');
                        } finally {
                          setIsSavingApproval(false);
                        }
                      }}
                      disabled={isSavingApproval}
                    >
                      {isSavingApproval ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                      ส่งกลับเพื่อแก้ไข
                    </Button>
                    <Button
                      className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={async () => {
                        setIsSavingApproval(true);
                        try {
                          const now = new Date().toISOString();
                          await supabase
                            .from('reservations')
                            .update({ 
                              approval_status: 'approved',
                              approval_remark: approvalRemark,
                              approved_by: user?.id,
                              approved_at: now,
                              status: 'approved'
                            })
                            .eq('id', id);

                          // Activity log
                          await supabase.from('reservation_activity_logs').insert({
                            reservation_id: id!,
                            action: 'approval_approved',
                            action_label: 'อนุมัติใบจอง',
                            performed_by: user!.id,
                            performed_by_name: profile?.full_name || '',
                            company_id: selectedCompany,
                            branch_id: selectedBranch || null,
                            details: { remark: approvalRemark, status: 'approved' }
                          });

                          setApprovalStatus('approved');
                          setApprovedAt(now);
                          toast.success('อนุมัติใบจองสำเร็จ');
                          refetchLogs();
                          navigate('/reservations');
                        } catch (err) {
                          toast.error('เกิดข้อผิดพลาด');
                        } finally {
                          setIsSavingApproval(false);
                        }
                      }}
                      disabled={isSavingApproval}
                    >
                      {isSavingApproval ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
                      Approve
                    </Button>
                  </div>
                </div>
              )}
            </div>
            )}
            
            {/* Action Buttons - Hidden in view-only mode (and when sale role is locked after submission) */}
            {!effectiveViewOnly && !isCashierMode && !isSaleSupervisor && !isSaleManager && (
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
                  className={cn(
                    "gap-2",
                    confirmationStatus === 'confirmed' 
                      ? "btn-primary-gradient" 
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                  onClick={handleSubmitForApproval}
                  disabled={isSaving || confirmationStatus !== 'confirmed'}
                  title={confirmationStatus !== 'confirmed' ? 'กรุณายืนยันสัญญาจองก่อนส่งขออนุมัติ' : ''}
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  ส่งขออนุมัติ
                  {!isSaving && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            )}
            
            {/* Cashier Action Button */}
            {!isViewOnly && isCashierMode && (
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
              <Button 
                variant="outline" 
                onClick={() => navigate('/reservations/pending-payment')}
              >
                กลับไปหน้ารายการ
              </Button>
            </div>
            )}

            {/* Activity Timeline */}
            <div className="pointer-events-auto">
              <ActivityTimeline logs={activityLogs} isLoading={isLoadingLogs} />
            </div>

            {/* View-only back button */}
            {effectiveViewOnly && (
            <div className="flex items-center pt-4 border-t border-border pointer-events-auto">
              <Button 
                variant="outline" 
                onClick={() => navigate('/reservations')}
              >
                กลับไปหน้ารายการ
              </Button>
            </div>
            )}
          </div>
        </div>
      </div>

      <MasterItemPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        type={pickerType}
        companyId={selectedCompany}
        onSelect={handlePickerSelect}
        excludeNames={(pickerType === 'freebies' ? freebies : pickerType === 'accessories' ? accessories : benefits).map((i) => i.name)}
      />
    </>
  );
}
