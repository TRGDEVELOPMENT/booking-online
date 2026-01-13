// Company Types
export type CompanyCode = 'BPK' | 'LAC' | 'ICCK' | 'VPA';

export interface Company {
  id: string;
  code: CompanyCode;
  name: string;
  logo?: string;
}

export interface Branch {
  id: string;
  companyId: string;
  code: string;
  name: string;
}

export interface BusinessUnit {
  id: string;
  branchId: string;
  code: string;
  name: string;
}

// Document Status & Workflow
export type DocumentStatus = 'draft' | 'final' | 'cancelled';
export type WorkflowStage = 'step1' | 'step2' | 'step3' | 'step4' | 'step5' | 'step6' | 'step7';

export const WorkflowStageLabels: Record<WorkflowStage, string> = {
  step1: 'สร้างสัญญาจอง',
  step2: 'ยืนยันสัญญาจอง',
  step3: 'ตรวจสอบการชำระเงิน',
  step4: 'ตรวจสอบรายละเอียด',
  step5: 'อนุมัติ',
  step6: 'พิมพ์/ลงนาม',
  step7: 'ยกเลิก/บอกเลิก',
};

export const DocumentStatusLabels: Record<DocumentStatus, string> = {
  draft: 'ฉบับร่าง',
  final: 'สมบูรณ์',
  cancelled: 'ยกเลิก',
};

// Customer Types
export type CustomerType = 'individual' | 'corporate';
export type IdType = 'citizen_id' | 'passport' | 'corporate_id';

export interface Customer {
  type: CustomerType;
  title?: string;
  firstName: string;
  lastName: string;
  idType: IdType;
  idNo: string;
  phone: string;
  email?: string;
  address?: string;
  taxId?: string;
  contactPerson?: string;
}

// Vehicle Types
export type FuelType = 'ICE' | 'Hybrid' | 'PHEV' | 'EV';
export type PurchaseType = 'cash' | 'finance';

export interface VehicleModel {
  id: string;
  companyId: string;
  name: string;
  submodels: VehicleSubmodel[];
}

export interface VehicleSubmodel {
  id: string;
  modelId: string;
  name: string;
  basePrice: number;
  colors: VehicleColor[];
  fuelTypes: FuelType[];
}

export interface VehicleColor {
  id: string;
  name: string;
  code: string;
}

// Reservation (Main Transaction)
export interface Reservation {
  id: string;
  companyId: string;
  branchId: string;
  buId: string;
  
  // Document Numbers
  draftNo: string;
  finalNo?: string;
  
  // Status
  documentStatus: DocumentStatus;
  workflowStage: WorkflowStage;
  
  // Sales Info
  salesUserId: string;
  salesUserName: string;
  
  // Customer Info
  bookingCustomer: Customer;
  isBuyerSameAsBooking: boolean;
  buyerCustomer?: Customer;
  
  // Vehicle Info
  vehicleModelId: string;
  vehicleModelName: string;
  vehicleSubmodelId: string;
  vehicleSubmodelName: string;
  vehicleColorId: string;
  vehicleColorName: string;
  fuelType: FuelType;
  
  // Pricing
  basePrice: number;
  discountAmount: number;
  finalVehiclePrice: number;
  vatType: 'include' | 'exclude';
  
  // Financing
  purchaseType: PurchaseType;
  downPayment?: number;
  financeAmount?: number;
  interestRate?: number;
  installmentTermMonth?: number;
  installmentAmount?: number;
  
  // Deposit
  depositAmount?: number;
  paymentMethod?: string;
  paymentDueDate?: string;
  expectedDeliveryDate?: string;
  
  // Items
  freebies: ReservationItem[];
  accessories: ReservationItem[];
  benefits: ReservationItem[];
  
  // Attachments
  attachments: Attachment[];
  
  // Workflow Data
  customerConfirmedAt?: string;
  confirmationChannel?: 'otp' | 'link';
  cashierVerifiedAt?: string;
  cashierUserId?: string;
  reviewedAt?: string;
  reviewerUserId?: string;
  approvedAt?: string;
  approverUserId?: string;
  approvalComment?: string;
  
  // Cancellation
  cancelledAt?: string;
  cancelType?: string;
  cancelReason?: string;
  
  // Audit
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface ReservationItem {
  id: string;
  itemId: string;
  itemName: string;
  qty: number;
  unitPrice: number;
  amount: number;
  remark?: string;
}

export interface Attachment {
  id: string;
  type: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  uploadedBy: string;
}

// User & RBAC
export type UserRole = 'system_admin' | 'manager' | 'sales_head' | 'sales' | 'cashier';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId?: string; // null for system_admin
  branchId?: string;
  permissions: Permission[];
}

export interface Permission {
  resource: string;
  actions: ('view' | 'insert' | 'edit' | 'delete')[];
}

// Reports
export interface ReservationSummary {
  total: number;
  draft: number;
  final: number;
  cancelled: number;
  totalAmount: number;
}
