// Database reservation type that matches Supabase schema
export interface DatabaseReservation {
  id: string;
  document_number: string;
  company_id: string;
  branch_id: string | null;
  status: string;
  customer_type: string;
  customer_name: string;
  customer_id_card: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  customer_address: string | null;
  buyer_name: string | null;
  buyer_id_card: string | null;
  buyer_phone: string | null;
  buyer_address: string | null;
  vehicle_type: string | null;
  model: string | null;
  submodel: string | null;
  color: string | null;
  fuel_type: string | null;
  list_price: number | null;
  discount: number | null;
  net_price: number | null;
  deposit_amount: number | null;
  expected_delivery_date: string | null;
  freebies: Array<{ id: number; name: string; value: number }> | null;
  accessories: Array<{ id: number; name: string; value: number }> | null;
  benefits: Array<{ id: number; name: string; value: number }> | null;
  confirmation_status: string | null;
  confirmation_method: string | null;
  confirmed_at: string | null;
  review_status: string | null;
  approval_status: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Status labels for database values
export const DatabaseStatusLabels: Record<string, string> = {
  draft: 'ฉบับร่าง',
  final: 'สมบูรณ์',
  cancelled: 'ยกเลิก',
};
