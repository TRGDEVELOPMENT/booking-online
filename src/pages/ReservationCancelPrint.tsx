import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Printer, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { companies } from "@/data/mockData";
import type { DatabaseReservation } from "@/types/database-reservation";
import lacLogo from '@/assets/LAC.png';

const companyLogos: Record<string, string> = {
  LAC: lacLogo,
};

const companyNames: Record<string, string> = {
  BPK: "บริษัท บิซ พีเค จำกัด",
  KCR: "บริษัท กาญจนบุรี ซี.อาร์.กรุ๊ป จำกัด",
  ICCK: "บริษัท อีซูซุชัยเจริญกิจมอเตอร์ส จำกัด",
  VPA: "บริษัท วี.พี. ออโต้ เอ็นเตอร์ไพรส์ จำกัด",
};

const cancelReasonSubjectMap: Record<string, string> = {
  "ไม่ผ่านสินเชื่อ": "บอกเลิกสัญญาจองรถยนต์ กรณีไม่ได้รับอนุมัติสินเชื่อ",
  "ลูกค้าไม่รับรถ": "บอกเลิกสัญญาจองรถยนต์ กรณีไม่มารับรถยนต์",
  "ลูกค้าเปลี่ยนใจ": "ขอให้ปฏิบัติตามสัญญาจองรถยนต์ กรณีการขออนุมัติสินเชื่อ",
  "ลูกค้ายกเลิกจอง": "ยกเลิกสัญญาจองรถยนต์",
};

const getSubjectByReason = (reason: string | null): string => {
  if (reason && cancelReasonSubjectMap[reason]) {
    return cancelReasonSubjectMap[reason];
  }
  return "ยกเลิกสัญญาจองรถยนต์";
};

export default function ReservationCancelPrint() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<DatabaseReservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReservation = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from("reservations")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching reservation:", error);
          return;
        }

        if (data) {
          setReservation({
            ...data,
            freebies: Array.isArray(data.freebies)
              ? (data.freebies as DatabaseReservation["freebies"])
              : null,
            accessories: Array.isArray(data.accessories)
              ? (data.accessories as DatabaseReservation["accessories"])
              : null,
            benefits: Array.isArray(data.benefits)
              ? (data.benefits as DatabaseReservation["benefits"])
              : null,
          });
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservation();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">ไม่พบข้อมูลใบจอง</p>
        <Button onClick={() => navigate("/reservations/cancel")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          กลับหน้ารายการ
        </Button>
      </div>
    );
  }

  const companyName =
    companyNames[reservation.company_id] ||
    companies.find((c) => c.id === reservation.company_id)?.name ||
    reservation.company_id;

  const today = new Date();
  const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
  ];
  const thaiYear = today.getFullYear() + 543;

  const reservationDate = reservation.created_at
    ? new Date(reservation.created_at)
    : today;
  const reservationThaiYear = reservationDate.getFullYear() + 543;

  return (
    <>
      {/* Print Controls */}
      <div className="print:hidden fixed top-0 left-0 right-0 bg-background/95 backdrop-blur border-b z-50 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate("/reservations/cancel")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับ
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              เลขที่: {reservation.document_number}
            </span>
            <Button onClick={handlePrint} className="btn-primary-gradient">
              <Printer className="w-4 h-4 mr-2" />
              พิมพ์เอกสาร
            </Button>
          </div>
        </div>
      </div>

      {/* Print Content */}
      <div
        className="print:mt-0 mt-20 p-12 max-w-4xl mx-auto bg-white min-h-screen"
        style={{ fontFamily: "TH Sarabun New, Sarabun, serif" }}
      >
        {/* Date */}
        <div className="text-right mb-10">
          <p className="text-base">
            วันที่ {today.getDate()} {thaiMonths[today.getMonth()]}{" "}
            {thaiYear}
          </p>
        </div>

        {/* Subject */}
        <div className="mb-2 text-base leading-relaxed">
          <p>
            <span className="font-semibold">เรื่อง</span>
            &nbsp;&nbsp;&nbsp;&nbsp;{getSubjectByReason((reservation as any).cancel_reason)}
          </p>
        </div>

        {/* To */}
        <div className="mb-2 text-base">
          <p>
            <span className="font-semibold">เรียน</span>
            &nbsp;&nbsp;&nbsp;&nbsp;{reservation.customer_name}
          </p>
        </div>

        {/* Reference */}
        <div className="mb-8 text-base">
          <p>
            <span className="font-semibold">อ้างถึง</span>
            &nbsp;&nbsp;&nbsp;&nbsp;สัญญาจองรถยนต์เลขที่{" "}
            <span className="font-semibold">{reservation.document_number}</span>
            &nbsp;&nbsp;ฉบับลงวันที่{" "}
            <span className="font-semibold">
              {reservationDate.getDate()} {thaiMonths[reservationDate.getMonth()]}{" "}
              {reservationThaiYear}
            </span>
          </p>
        </div>

        {/* Body */}
        <div className="text-base leading-[2] space-y-4 indent-16">
          <p>
            ตามที่ท่านได้ทำสัญญาจองรถยนต์กับ{companyName} ("บริษัท")
            รายละเอียดตามสัญญาจองรถยนต์ฉบับที่อ้างถึง
            และท่านได้ขออนุมัติสินเชื่อเพื่อซื้อรถยนต์ดังกล่าวกับ
            ....................................................... นั้น
          </p>

          <p>
            ปรากฏว่าท่านไม่ได้รับอนุมัติสินเชื่อจาก
            ...................................................
            ภายในกำหนดเวลาส่งมอบรถยนต์ที่ระบุไว้ในสัญญาจองรถยนต์
          </p>

          <p>
            โดยหนังสือฉบับนี้ บริษัทขอให้ท่านปฏิบัติตามสัญญาจองรถยนต์โดยดำเนินการขออนุมัติสินเชื่อให้แล้วเสร็จ
            หรือนำเงินค่ารถยนต์มาชำระให้แก่บริษัทภายใน 7 วัน
            นับแต่วันที่ท่านได้รับหนังสือฉบับนี้ หาก
            ท่านไม่ดำเนินการดังกล่าว
            บริษัทมีความจำเป็นต้องบอกเลิกสัญญาจองรถยนต์กับท่านต่อไป
          </p>
        </div>

        {/* Closing */}
        <div className="mt-16 text-center text-base">
          <p>ขอแสดงความนับถือ</p>
          <p className="mt-1">{companyName}</p>

          <div className="mt-16">
            <p>........................................................</p>
            <p className="mt-2">
              (.......................................................)
            </p>
            <p className="mt-1 font-semibold">ผู้จัดการฝ่ายขาย</p>
          </div>
        </div>
      </div>
    </>
  );
}
