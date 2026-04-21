import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DatabaseReservation } from "@/types/database-reservation";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Ban, Loader2, ClipboardCheck, Eye } from "lucide-react";
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

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "-";
  try {
    return format(new Date(dateString), "d MMM yyyy HH:mm", { locale: th });
  } catch {
    return "-";
  }
};

const ReservationCancelApprovePage = () => {
  const navigate = useNavigate();
  const { profile, hasRole } = useAuth();
  const { toast } = useToast();
  const selectedCompany = profile?.company_id || "BPK";

  const isManager = hasRole("sale_manager");
  const isAdminViewer = hasRole("it") || hasRole("user_admin");
  const canApprove = isManager;

  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");

  const fetchReservations = async () => {
    setIsLoading(true);
    try {
      // ดึงเฉพาะใบจองที่อยู่ใน Process การยกเลิก
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .eq("company_id", selectedCompany)
        .or("cancel_request_status.not.is.null,status.eq.cancelled")
        .order("updated_at", { ascending: false }) as any;

      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [selectedCompany]);

  // รออนุมัติยกเลิก: ผ่านการตรวจสอบจากหัวหน้าทีมแล้ว แต่ยังไม่อนุมัติยกเลิก และยังไม่ถูกยกเลิก
  const pendingApproval = reservations.filter((r) => {
    if (r.status === "cancelled") return false;
    if (r.cancel_approval_status === "approved") return false;
    // รออนุมัติ: มี cancel_request_status = 'requested' และ supervisor review แล้ว (หรือยังไม่ทันรีวิว ก็ให้แสดงเพื่อให้ Manager เห็นภาพรวม)
    return r.cancel_request_status === "requested";
  });

  // อนุมัติยกเลิกแล้ว
  const approvedCancellations = reservations.filter(
    (r) => r.cancel_approval_status === "approved" || r.status === "cancelled"
  );

  const filterBySearch = (list: any[]) => {
    const s = searchTerm.toLowerCase();
    if (!s) return list;
    return list.filter(
      (r) =>
        r.document_number?.toLowerCase().includes(s) ||
        r.customer_name?.toLowerCase().includes(s) ||
        r.model?.toLowerCase().includes(s) ||
        r.submodel?.toLowerCase().includes(s)
    );
  };

  const visiblePending = filterBySearch(pendingApproval);
  const visibleApproved = filterBySearch(approvedCancellations);

  const renderRow = (r: any, mode: "pending" | "approved") => (
    <TableRow key={r.id}>
      <TableCell className="font-medium">{r.document_number}</TableCell>
      <TableCell>
        <p className="font-medium">{r.customer_name}</p>
        {r.customer_phone && (
          <p className="text-sm text-muted-foreground">{r.customer_phone}</p>
        )}
      </TableCell>
      <TableCell>
        <p>{r.model || "-"}</p>
        {r.submodel && (
          <p className="text-sm text-muted-foreground">{r.submodel}</p>
        )}
      </TableCell>
      <TableCell className="text-right">{formatCurrency(r.net_price)}</TableCell>
      <TableCell>{branchNames[r.branch_id || ""] || r.branch_id || "-"}</TableCell>
      <TableCell>{r.cancel_reason || "-"}</TableCell>
      <TableCell>
        {mode === "pending"
          ? formatDate(r.cancel_requested_at)
          : formatDate(r.cancel_approved_at || r.updated_at)}
      </TableCell>
      <TableCell className="text-center">
        {mode === "approved" ? (
          <Badge variant="destructive" className="hover:bg-destructive">ยกเลิกแล้ว</Badge>
        ) : (
          <Badge className="bg-orange-500 text-white border-orange-500 hover:bg-orange-500">
            รออนุมัติ
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => navigate(`/reservations/${r.id}/cancel-detail`)}
          title={canApprove && mode === "pending" ? "พิจารณาอนุมัติยกเลิก" : "ดูรายละเอียด"}
        >
          {canApprove && mode === "pending" ? (
            <ClipboardCheck className="h-4 w-4 text-orange-500" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-6">
      <Header
        title="อนุมัติยกเลิกใบจอง"
        subtitle={`${selectedCompany} - ${companyNames[selectedCompany] || selectedCompany}`}
      />

      {isAdminViewer && !isManager && (
        <div className="bg-muted/50 border border-border rounded-lg p-3 text-sm text-muted-foreground">
          โหมดดูอย่างเดียว (Admin) — ไม่สามารถอนุมัติได้
        </div>
      )}

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

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="pending">
            รออนุมัติยกเลิก ({visiblePending.length})
          </TabsTrigger>
          {canApprove && (
            <TabsTrigger value="approved">
              อนุมัติยกเลิกแล้ว ({visibleApproved.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>เลขที่เอกสาร</TableHead>
                  <TableHead>ลูกค้าผู้จอง</TableHead>
                  <TableHead>รุ่นรถ</TableHead>
                  <TableHead className="text-right">ราคาสุทธิ</TableHead>
                  <TableHead>สาขา</TableHead>
                  <TableHead>เหตุผลยกเลิก</TableHead>
                  <TableHead>วันที่ขอยกเลิก</TableHead>
                  <TableHead className="text-center">สถานะ</TableHead>
                  <TableHead className="text-center">ดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : visiblePending.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <Ban className="h-12 w-12 mx-auto text-muted-foreground/50" />
                      <p className="mt-2 text-muted-foreground">ไม่มีรายการรออนุมัติยกเลิก</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  visiblePending.map((r) => renderRow(r, "pending"))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {canApprove && (
          <TabsContent value="approved" className="mt-4">
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>เลขที่เอกสาร</TableHead>
                    <TableHead>ลูกค้าผู้จอง</TableHead>
                    <TableHead>รุ่นรถ</TableHead>
                    <TableHead className="text-right">ราคาสุทธิ</TableHead>
                    <TableHead>สาขา</TableHead>
                    <TableHead>เหตุผลยกเลิก</TableHead>
                    <TableHead>วันที่อนุมัติยกเลิก</TableHead>
                    <TableHead className="text-center">สถานะ</TableHead>
                    <TableHead className="text-center">ดำเนินการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : visibleApproved.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12">
                        <Ban className="h-12 w-12 mx-auto text-muted-foreground/50" />
                        <p className="mt-2 text-muted-foreground">ยังไม่มีรายการที่อนุมัติยกเลิก</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleApproved.map((r) => renderRow(r, "approved"))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ReservationCancelApprovePage;
