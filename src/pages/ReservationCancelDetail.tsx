import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CancellationWorkflowSteps } from "@/components/reservations/CancellationWorkflowSteps";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { th } from "date-fns/locale";

const companyNames: Record<string, string> = {
  BPK: "บริษัท บ้านโป่งกิจเจริญยนต์ จำกัด",
  KCR: "บริษัท กาญจนบุรี ซี.อาร์.กรุ๊ป จำกัด",
};

const branchNames: Record<string, string> = {
  "00": "สำนักงานใหญ่",
  "01": "สาขา 1",
  "02": "สาขา 2",
};

export default function ReservationCancelDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, hasRole } = useAuth();
  const { toast } = useToast();
  const [reservation, setReservation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reviewRemark, setReviewRemark] = useState("");
  const [approvalRemark, setApprovalRemark] = useState("");

  const fetchReservation = async () => {
    if (!id) return;
    try {
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      setReservation(data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservation();
  }, [id]);

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return "-";
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "d MMM yyyy HH:mm", { locale: th });
    } catch {
      return "-";
    }
  };

  // Sales Lead: Review cancel request
  const handleReviewCancel = async () => {
    if (!reservation) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("reservations")
        .update({
          cancel_review_status: "reviewed",
          cancel_reviewed_at: new Date().toISOString(),
          cancel_reviewed_by: profile?.user_id || null,
          cancel_review_remark: reviewRemark.trim() || reservation.cancel_review_remark || null,
        } as any)
        .eq("id", reservation.id);

      if (error) throw error;
      toast({ title: "ตรวจสอบเรียบร้อย", description: "ส่งต่อให้ผู้จัดการฝ่ายขายอนุมัติแล้ว" });
      fetchReservation();
    } catch (err) {
      console.error(err);
      toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  // Sales Manager: Approve cancel
  const handleApproveCancel = async () => {
    if (!reservation) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("reservations")
        .update({
          cancel_approval_status: "approved",
          cancel_approved_at: new Date().toISOString(),
          cancel_approved_by: profile?.user_id || null,
          cancel_approval_remark: approvalRemark.trim() || null,
          status: "cancelled",
        } as any)
        .eq("id", reservation.id);

      if (error) throw error;
      toast({ title: "อนุมัติยกเลิกเรียบร้อย", description: "ใบจองถูกยกเลิกแล้ว" });
      fetchReservation();
    } catch (err) {
      console.error(err);
      toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-lg text-muted-foreground">ไม่พบข้อมูลใบจอง</p>
        <Button onClick={() => navigate("/reservations/cancel")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          กลับหน้ารายการ
        </Button>
      </div>
    );
  }

  const canReview = hasRole("sale_supervisor") && reservation.cancel_request_status === "requested" && reservation.cancel_review_status !== "reviewed";
  const canApprove = hasRole("sale_manager") && reservation.cancel_review_status === "reviewed" && reservation.cancel_approval_status !== "approved";

  const freebies = Array.isArray(reservation.freebies) ? reservation.freebies : [];
  const accessories = Array.isArray(reservation.accessories) ? reservation.accessories : [];
  const benefits = Array.isArray(reservation.benefits) ? reservation.benefits : [];

  return (
    <div className="space-y-6">
      <Header
        title="รายละเอียดการยกเลิกใบจอง"
        subtitle={`เลขที่ ${reservation.document_number}`}
      />

      <Button variant="outline" onClick={() => navigate("/reservations/cancel")}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        กลับหน้ารายการ
      </Button>

      {/* Cancellation Workflow Steps */}
      <CancellationWorkflowSteps
        cancelRequestStatus={reservation.cancel_request_status}
        cancelReviewStatus={reservation.cancel_review_status}
        cancelApprovalStatus={reservation.cancel_approval_status}
      />

      {/* Action panel for role-based actions */}
      {(canReview || canApprove) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {canReview ? "ตรวจสอบการขอยกเลิก" : "อนุมัติยกเลิกใบจอง"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {canReview && (
              <div className="space-y-2">
                <Label htmlFor="review-remark">หมายเหตุการตรวจสอบ (Remark)</Label>
                <Textarea
                  id="review-remark"
                  value={reviewRemark}
                  onChange={(e) => setReviewRemark(e.target.value)}
                  placeholder="ระบุความเห็นหรือหมายเหตุการตรวจสอบ..."
                  rows={3}
                />
              </div>
            )}
            {canApprove && (
              <div className="space-y-2">
                <Label htmlFor="approval-remark">หมายเหตุการอนุมัติ (Remark)</Label>
                <Textarea
                  id="approval-remark"
                  value={approvalRemark}
                  onChange={(e) => setApprovalRemark(e.target.value)}
                  placeholder="ระบุความเห็นหรือหมายเหตุการอนุมัติยกเลิก..."
                  rows={3}
                />
              </div>
            )}
            <div className="flex gap-3">
              {canReview && (
                <Button
                  onClick={handleReviewCancel}
                  disabled={isProcessing}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  ตรวจสอบการขอยกเลิก
                </Button>
              )}
              {canApprove && (
                <Button
                  onClick={handleApproveCancel}
                  disabled={isProcessing}
                  variant="destructive"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  อนุมัติยกเลิกใบจอง
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancel Reason & Remarks */}
      {(reservation.cancel_reason || reservation.cancel_review_remark || reservation.cancel_approval_remark) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-red-700">เหตุผล / หมายเหตุการยกเลิก</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {reservation.cancel_reason && (
              <div>
                <p className="text-xs text-muted-foreground">เหตุผลการยกเลิก</p>
                <p className="font-medium">{reservation.cancel_reason}</p>
              </div>
            )}
            {reservation.cancel_review_remark && (
              <div>
                <p className="text-xs text-muted-foreground">หมายเหตุ (ขั้นตอนขอ/ตรวจสอบ)</p>
                <p className="whitespace-pre-wrap">{reservation.cancel_review_remark}</p>
              </div>
            )}
            {reservation.cancel_approval_remark && (
              <div>
                <p className="text-xs text-muted-foreground">หมายเหตุการอนุมัติยกเลิก</p>
                <p className="whitespace-pre-wrap">{reservation.cancel_approval_remark}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reservation Details - Read Only */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ข้อมูลลูกค้าผู้จอง</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ชื่อลูกค้า</span>
              <span className="font-medium">{reservation.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ประเภทลูกค้า</span>
              <span>{reservation.customer_type === "individual" ? "บุคคลธรรมดา" : "นิติบุคคล"}</span>
            </div>
            {reservation.customer_id_card && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">เลขบัตรประชาชน</span>
                <span>{reservation.customer_id_card}</span>
              </div>
            )}
            {reservation.customer_phone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">เบอร์โทร</span>
                <span>{reservation.customer_phone}</span>
              </div>
            )}
            {reservation.customer_email && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">อีเมล</span>
                <span>{reservation.customer_email}</span>
              </div>
            )}
            {reservation.customer_address && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">ที่อยู่</span>
                <span className="text-right max-w-[200px]">{reservation.customer_address}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vehicle Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ข้อมูลรถ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {reservation.vehicle_type && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">ประเภทรถ</span>
                <span>{reservation.vehicle_type}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">รุ่น</span>
              <span className="font-medium">{reservation.model || "-"}</span>
            </div>
            {reservation.submodel && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">รุ่นย่อย</span>
                <span>{reservation.submodel}</span>
              </div>
            )}
            {reservation.color && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">สี</span>
                <span>{reservation.color}</span>
              </div>
            )}
            {reservation.fuel_type && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">ประเภทเชื้อเพลิง</span>
                <span>{reservation.fuel_type}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ข้อมูลราคา</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ราคาตั้ง</span>
              <span>{formatCurrency(reservation.list_price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ส่วนลด</span>
              <span>{formatCurrency(reservation.discount)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>ราคาสุทธิ</span>
              <span>{formatCurrency(reservation.net_price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">เงินจอง</span>
              <span>{formatCurrency(reservation.deposit_amount)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Document Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ข้อมูลเอกสาร</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">เลขที่เอกสาร</span>
              <span className="font-medium">{reservation.document_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">บริษัท</span>
              <span>{companyNames[reservation.company_id] || reservation.company_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">สาขา</span>
              <span>{branchNames[reservation.branch_id || ""] || reservation.branch_id || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">สถานะ</span>
              <span>
                {reservation.status === "cancelled" ? (
                  <Badge variant="destructive">ยกเลิกแล้ว</Badge>
                ) : reservation.cancel_request_status === "requested" ? (
                  <Badge className="bg-orange-500 text-white">อยู่ระหว่างยกเลิกใบจอง</Badge>
                ) : (
                  <Badge variant="outline" className="text-green-600 border-green-600">อนุมัติใบจองแล้ว</Badge>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">วันที่สร้าง</span>
              <span>{formatDate(reservation.created_at)}</span>
            </div>
            {reservation.cancel_requested_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">วันที่ขอยกเลิก</span>
                <span>{formatDate(reservation.cancel_requested_at)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Freebies / Accessories / Benefits */}
      {(freebies.length > 0 || accessories.length > 0 || benefits.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {freebies.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">ของแถม</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {freebies.map((item: any, i: number) => (
                    <li key={i} className="flex justify-between">
                      <span>{item.name}</span>
                      <span>{formatCurrency(item.value)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {accessories.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">อุปกรณ์เสริม</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {accessories.map((item: any, i: number) => (
                    <li key={i} className="flex justify-between">
                      <span>{item.name}</span>
                      <span>{formatCurrency(item.value)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {benefits.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">สิทธิประโยชน์</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {benefits.map((item: any, i: number) => (
                    <li key={i} className="flex justify-between">
                      <span>{item.name}</span>
                      <span>{formatCurrency(item.value)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
