import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Ban, Loader2, ArrowLeft, FileSearch } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

const CANCEL_REASONS = [
  "ไม่ผ่านสินเชื่อ",
  "ลูกค้าไม่รับรถ",
  "ลูกค้าเปลี่ยนใจ",
  "ลูกค้ายกเลิกจอง",
];

const ReservationCancelCreate = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const selectedCompany = profile?.company_id || "BPK";

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelRemark, setCancelRemark] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      let query = supabase
        .from("reservations")
        .select("*")
        .eq("company_id", selectedCompany)
        .eq("approval_status", "approved")
        .neq("status", "cancelled")
        .is("cancel_request_status", null)
        .order("updated_at", { ascending: false })
        .limit(50);

      if (searchTerm.trim()) {
        query = query.ilike("document_number", `%${searchTerm.trim()}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error(error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถค้นหาใบจองได้",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleOpenSearch = () => {
    setIsSearchOpen(true);
    setSearchTerm("");
    setSearchResults([]);
    handleSearch();
  };

  const handleSelectReservation = (reservation: any) => {
    setSelectedReservation(reservation);
    setIsSearchOpen(false);
  };

  const handleSubmit = async () => {
    if (!selectedReservation || !cancelReason) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("reservations")
        .update({
          cancel_request_status: "requested",
          cancel_requested_at: new Date().toISOString(),
          cancel_reason: cancelReason,
          cancel_review_remark: cancelRemark.trim() || null,
        } as any)
        .eq("id", selectedReservation.id);

      if (error) throw error;

      toast({
        title: "บันทึกขอยกเลิกสำเร็จ",
        description: `ใบจองเลขที่ ${selectedReservation.document_number} อยู่ระหว่างรอการอนุมัติยกเลิก`,
      });
      navigate("/reservations/cancel");
    } catch (error) {
      console.error(error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกขอยกเลิกใบจองได้",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
      return format(new Date(dateString), "d MMM yyyy", { locale: th });
    } catch {
      return "-";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Header title="ยกเลิกใบจอง" subtitle="บันทึกคำขอยกเลิกใบจองที่ผ่านการอนุมัติแล้ว" />
        <Button variant="outline" onClick={() => navigate("/reservations/cancel")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> กลับ
        </Button>
      </div>

      {/* Document number search section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">เลขที่ใบจอง</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              readOnly
              value={selectedReservation?.document_number || ""}
              placeholder="คลิกเพื่อค้นหาและเลือกใบจอง"
              className="bg-muted/40 cursor-pointer"
              onClick={handleOpenSearch}
            />
            <Button onClick={handleOpenSearch}>
              <FileSearch className="w-4 h-4 mr-2" /> ค้นหาเลขที่ใบจอง
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Selected reservation details */}
      {selectedReservation && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">รายละเอียดใบจอง</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">เลขที่เอกสาร</p>
                  <p className="font-medium">{selectedReservation.document_number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">วันที่จอง</p>
                  <p className="font-medium">{formatDate(selectedReservation.created_at)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">สาขา</p>
                  <p className="font-medium">{selectedReservation.branch_id || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">วันที่นัดส่งมอบ</p>
                  <p className="font-medium">{formatDate(selectedReservation.expected_delivery_date)}</p>
                </div>

                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs">ลูกค้าผู้จอง</p>
                  <p className="font-medium">{selectedReservation.customer_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">เบอร์โทร</p>
                  <p className="font-medium">{selectedReservation.customer_phone || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">เลขบัตรประชาชน</p>
                  <p className="font-medium">{selectedReservation.customer_id_card || "-"}</p>
                </div>

                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs">รุ่น / รุ่นย่อย</p>
                  <p className="font-medium">
                    {selectedReservation.model || "-"}
                    {selectedReservation.submodel && ` / ${selectedReservation.submodel}`}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">สี</p>
                  <p className="font-medium">{selectedReservation.color || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">ประเภทรถ</p>
                  <p className="font-medium">{selectedReservation.vehicle_type || "-"}</p>
                </div>

                <div>
                  <p className="text-muted-foreground text-xs">ราคาตั้ง</p>
                  <p className="font-medium">{formatCurrency(selectedReservation.list_price)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">ส่วนลด</p>
                  <p className="font-medium">{formatCurrency(selectedReservation.discount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">ราคาสุทธิ</p>
                  <p className="font-medium text-primary">{formatCurrency(selectedReservation.net_price)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">เงินจอง</p>
                  <p className="font-medium">{formatCurrency(selectedReservation.deposit_amount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cancellation reason section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                เหตุผลในการยกเลิก <span className="text-destructive">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={cancelReason} onValueChange={setCancelReason} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CANCEL_REASONS.map((reason, idx) => (
                  <label
                    key={reason}
                    htmlFor={`reason-${idx}`}
                    className="flex items-center gap-3 border rounded-md p-3 cursor-pointer hover:bg-accent transition-colors"
                  >
                    <RadioGroupItem value={reason} id={`reason-${idx}`} />
                    <span className="font-normal">{reason}</span>
                  </label>
                ))}
              </RadioGroup>
              {!cancelReason && (
                <p className="text-sm text-destructive mt-3">กรุณาเลือกเหตุผลในการยกเลิก</p>
              )}

              <div className="mt-4 space-y-2">
                <Label htmlFor="cancel-remark">หมายเหตุเพิ่มเติม (Remark)</Label>
                <Textarea
                  id="cancel-remark"
                  value={cancelRemark}
                  onChange={(e) => setCancelRemark(e.target.value)}
                  placeholder="ระบุรายละเอียดเพิ่มเติมเกี่ยวกับการขอยกเลิก..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate("/reservations/cancel")} disabled={isSubmitting}>
              ยกเลิก
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!cancelReason || isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> กำลังบันทึก...
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4 mr-2" /> บันทึกขอยกเลิก
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {/* Search Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>ค้นหาเลขที่ใบจอง (อนุมัติแล้ว)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="พิมพ์เลขที่ใบจองเพื่อค้นหา..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "ค้นหา"}
              </Button>
            </div>

            <div className="border rounded-lg max-h-[420px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead>เลขที่ใบจอง</TableHead>
                    <TableHead>ลูกค้า</TableHead>
                    <TableHead>รุ่นรถ</TableHead>
                    <TableHead className="text-right">ราคาสุทธิ</TableHead>
                    <TableHead>วันที่จอง</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isSearching ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : searchResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        ไม่พบใบจองที่ผ่านการอนุมัติ
                      </TableCell>
                    </TableRow>
                  ) : (
                    searchResults.map((r) => (
                      <TableRow
                        key={r.id}
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => handleSelectReservation(r)}
                      >
                        <TableCell className="font-medium">{r.document_number}</TableCell>
                        <TableCell>{r.customer_name}</TableCell>
                        <TableCell>
                          {r.model || "-"}
                          {r.submodel && ` / ${r.submodel}`}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(r.net_price)}</TableCell>
                        <TableCell>{formatDate(r.created_at)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReservationCancelCreate;
