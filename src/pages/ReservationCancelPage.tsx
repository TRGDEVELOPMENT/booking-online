import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DatabaseReservation } from "@/types/database-reservation";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Ban, Loader2, AlertTriangle } from "lucide-react";
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

const ReservationCancelPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const selectedCompany = profile?.company_id || "BPK";

  const [reservations, setReservations] = useState<DatabaseReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReservation, setSelectedReservation] = useState<DatabaseReservation | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchApprovedReservations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .eq("company_id", selectedCompany)
        .eq("approval_status", "approved")
        .neq("status", "cancelled")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const transformedData: DatabaseReservation[] = (data || []).map((item) => ({
        id: item.id,
        document_number: item.document_number,
        company_id: item.company_id,
        branch_id: item.branch_id,
        status: item.status,
        customer_type: item.customer_type,
        customer_name: item.customer_name,
        customer_id_card: item.customer_id_card,
        customer_phone: item.customer_phone,
        customer_email: item.customer_email,
        customer_address: item.customer_address,
        buyer_name: item.buyer_name,
        buyer_id_card: item.buyer_id_card,
        buyer_phone: item.buyer_phone,
        buyer_address: item.buyer_address,
        vehicle_type: item.vehicle_type,
        model: item.model,
        submodel: item.submodel,
        color: item.color,
        fuel_type: item.fuel_type,
        list_price: item.list_price,
        discount: item.discount,
        net_price: item.net_price,
        deposit_amount: item.deposit_amount,
        expected_delivery_date: item.expected_delivery_date,
        freebies: item.freebies as DatabaseReservation["freebies"],
        accessories: item.accessories as DatabaseReservation["accessories"],
        benefits: item.benefits as DatabaseReservation["benefits"],
        created_by: item.created_by,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      setReservations(transformedData);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลใบจองได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedReservations();
  }, [selectedCompany]);

  const handleOpenCancelDialog = (reservation: DatabaseReservation) => {
    setSelectedReservation(reservation);
    setCancelReason("");
    setIsCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedReservation) return;

    setIsCancelling(true);
    try {
      const { error } = await supabase
        .from("reservations")
        .update({
          status: "cancelled",
        })
        .eq("id", selectedReservation.id);

      if (error) throw error;

      toast({
        title: "ยกเลิกใบจองสำเร็จ",
        description: `ใบจองเลขที่ ${selectedReservation.document_number} ถูกยกเลิกแล้ว`,
      });

      setIsCancelDialogOpen(false);
      setSelectedReservation(null);
      fetchApprovedReservations();
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถยกเลิกใบจองได้",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const filteredReservations = reservations.filter((reservation) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      reservation.document_number?.toLowerCase().includes(searchLower) ||
      reservation.customer_name?.toLowerCase().includes(searchLower) ||
      reservation.model?.toLowerCase().includes(searchLower) ||
      reservation.submodel?.toLowerCase().includes(searchLower)
    );
  });

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
    <div className="space-y-6">
      <Header
        title="ยกเลิกใบจอง"
        subtitle={`${selectedCompany} - ${companyNames[selectedCompany] || selectedCompany}`}
      />

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="ค้นหาด้วยเลขที่เอกสาร, ชื่อลูกค้า, รุ่นรถ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
        <div>
          <p className="text-sm font-medium text-warning">
            แสดงเฉพาะใบจองที่ผ่านการอนุมัติจากผู้จัดการฝ่ายขายแล้วเท่านั้น
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            จำนวน {filteredReservations.length} รายการ
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>เลขที่เอกสาร</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>ผู้จอง</TableHead>
              <TableHead>รุ่นรถ / สี</TableHead>
              <TableHead className="text-right">ราคาสุทธิ</TableHead>
              <TableHead className="text-right">เงินจอง</TableHead>
              <TableHead>สาขา</TableHead>
              <TableHead>วันที่สร้าง</TableHead>
              <TableHead className="text-center">ดำเนินการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">กำลังโหลดข้อมูล...</p>
                </TableCell>
              </TableRow>
            ) : filteredReservations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12">
                  <Ban className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <p className="mt-2 text-muted-foreground">ไม่พบใบจองที่ผ่านการอนุมัติ</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredReservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell className="font-medium">
                    {reservation.document_number}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-success/20 text-success hover:bg-success/20">
                      อนุมัติแล้ว
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{reservation.customer_name}</p>
                      {reservation.customer_phone && (
                        <p className="text-sm text-muted-foreground">
                          {reservation.customer_phone}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{reservation.model || "-"}</p>
                      {reservation.submodel && (
                        <p className="text-sm text-muted-foreground">
                          {reservation.submodel}
                          {reservation.color && ` / ${reservation.color}`}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(reservation.net_price)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(reservation.deposit_amount)}
                  </TableCell>
                  <TableCell>
                    {branchNames[reservation.branch_id || ""] || reservation.branch_id || "-"}
                  </TableCell>
                  <TableCell>{formatDate(reservation.created_at)}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleOpenCancelDialog(reservation)}
                    >
                      <Ban className="h-4 w-4 mr-1" />
                      ยกเลิก
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              ยืนยันการยกเลิกใบจอง
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>คุณต้องการยกเลิกใบจองนี้หรือไม่?</p>
                
                {selectedReservation && (
                  <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">เลขที่เอกสาร:</span>
                      <span className="font-medium text-foreground">
                        {selectedReservation.document_number}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ลูกค้า:</span>
                      <span className="font-medium text-foreground">
                        {selectedReservation.customer_name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">รถ:</span>
                      <span className="font-medium text-foreground">
                        {selectedReservation.model}
                        {selectedReservation.submodel && ` ${selectedReservation.submodel}`}
                        {selectedReservation.color && ` - ${selectedReservation.color}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ราคาสุทธิ:</span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(selectedReservation.net_price)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">
                    เหตุผลในการยกเลิก <span className="text-destructive">*</span>
                  </Label>
                  <RadioGroup
                    value={cancelReason}
                    onValueChange={setCancelReason}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="ไม่ผ่านสินเชื่อ" id="reason1" />
                      <Label htmlFor="reason1" className="font-normal cursor-pointer">
                        ไม่ผ่านสินเชื่อ
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="ลูกค้าไม่รับรถ" id="reason2" />
                      <Label htmlFor="reason2" className="font-normal cursor-pointer">
                        ลูกค้าไม่รับรถ
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="ลูกค้าเปลี่ยนใจ" id="reason3" />
                      <Label htmlFor="reason3" className="font-normal cursor-pointer">
                        ลูกค้าเปลี่ยนใจ
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="ลูกค้ายกเลิกจอง" id="reason4" />
                      <Label htmlFor="reason4" className="font-normal cursor-pointer">
                        ลูกค้ายกเลิกจอง
                      </Label>
                    </div>
                  </RadioGroup>
                  {!cancelReason && (
                    <p className="text-sm text-destructive">กรุณาเลือกเหตุผลในการยกเลิก</p>
                  )}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              disabled={isCancelling || !cancelReason}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  กำลังดำเนินการ...
                </>
              ) : (
                <>
                  <Ban className="h-4 w-4 mr-2" />
                  ยืนยันการยกเลิก
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ReservationCancelPage;
