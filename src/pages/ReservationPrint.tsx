import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { companies, branches } from '@/data/mockData';
import type { DatabaseReservation } from '@/types/database-reservation';
import bizrLogo from '@/assets/bizpk-logo.png';
import lacLogo from '@/assets/LAC.png';
import nissanLogo from '@/assets/nissan-logo.png';

const companyLogos: Record<string, string> = {
  BPK: bizrLogo,
  LAC: lacLogo,
};

// Top-right corner brand logo (per company)
const companyTopRightLogos: Record<string, string> = {
  BPK: nissanLogo,
};

export default function ReservationPrint() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<DatabaseReservation | null>(null);
  const [creatorName, setCreatorName] = useState<string>('');
  const [managerName, setManagerName] = useState<string>('');
  const [branchManagerName, setBranchManagerName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

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
          return;
        }

        if (data) {
          setReservation({
            ...data,
            freebies: Array.isArray(data.freebies) ? data.freebies as DatabaseReservation['freebies'] : null,
            accessories: Array.isArray(data.accessories) ? data.accessories as DatabaseReservation['accessories'] : null,
            benefits: Array.isArray(data.benefits) ? data.benefits as DatabaseReservation['benefits'] : null,
          });

          // Fetch creator (sale advisor) name via security definer to bypass RLS
          if (data.created_by) {
            const { data: creatorFullName } = await supabase
              .rpc('get_profile_name', { _user_id: data.created_by });
            if (creatorFullName) setCreatorName(creatorFullName as string);
          }

          // Fetch sale manager: prefer approver, then assignment, then any sale_manager in company
          let mgrUserId: string | null = (data as any).approved_by ?? null;

          if (!mgrUserId) {
            const { data: assignment } = await supabase
              .from('reservation_assignments')
              .select('assigned_user_id')
              .eq('reservation_id', id)
              .eq('stage', 'sale_manager')
              .maybeSingle();
            mgrUserId = assignment?.assigned_user_id ?? null;
          }

          if (mgrUserId) {
            const { data: mgrName } = await supabase
              .rpc('get_profile_name', { _user_id: mgrUserId });
            if (mgrName) setManagerName(mgrName as string);
          }

          // Final fallback: any sale_manager in same company
          if (!mgrUserId || !managerName) {
            const { data: fallbackName } = await supabase
              .rpc('get_company_role_user_name', { _company_id: data.company_id, _role: 'sale_manager' });
            if (fallbackName) setManagerName(prev => prev || (fallbackName as string));


          // Fetch branch manager name from branches table
          if (data.branch_id && data.company_id) {
            const { data: branchData } = await supabase
              .from('branches')
              .select('manager_name')
              .eq('company_id', data.company_id)
              .eq('branch_id', data.branch_id)
              .maybeSingle();
            if (branchData?.manager_name) setBranchManagerName(branchData.manager_name);
          }
        }
        }
      } catch (err) {
        console.error('Error:', err);
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
        <Button onClick={() => navigate('/reservations')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          กลับหน้ารายการ
        </Button>
      </div>
    );
  }

  const company = companies.find(c => c.id === reservation.company_id);
  const branch = branches.find(b => b.id === reservation.branch_id);
  const createdDate = new Date(reservation.created_at);
  const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 
                      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  const thaiYear = createdDate.getFullYear() + 543;
  const companyName = company?.name || 'บริษัท บิซ พีเค จำกัด';
  const branchName = branch?.name || 'ปิ่นเกล้า';
  const isCancelled = reservation.status === 'cancelled' || (reservation as any).cancel_approval_status === 'approved';
  const topRightLogo = companyTopRightLogos[reservation.company_id];

  const dotLine = (width = '200px') => (
    <span style={{ 
      display: 'inline-block', 
      width, 
      borderBottom: '1px dotted #000', 
      minHeight: '1.2em',
      verticalAlign: 'bottom'
    }}>&nbsp;</span>
  );

  const filledDotLine = (text: string, width = '200px') => (
    <span style={{ 
      display: 'inline-block', 
      width, 
      borderBottom: '1px dotted #000', 
      minHeight: '1.2em',
      verticalAlign: 'bottom',
      textAlign: 'center',
      fontWeight: 600
    }}>{text}</span>
  );

  return (
    <>
      {/* Print Controls */}
      <div className="print:hidden fixed top-0 left-0 right-0 bg-background/95 backdrop-blur border-b z-50 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับ
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">เลขที่: {reservation.document_number}</span>
            <Button onClick={handlePrint} className="btn-primary-gradient">
              <Printer className="w-4 h-4 mr-2" />
              พิมพ์เอกสาร
            </Button>
          </div>
        </div>
      </div>

      {/* Fixed watermark - repeats on every printed page */}
      {isCancelled && (
        <div
          aria-hidden
          className="cancel-watermark print:flex"
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        >
          <span
            style={{
              fontSize: '12rem',
              fontWeight: 900,
              color: 'rgba(244, 63, 94, 0.22)',
              transform: 'rotate(-35deg)',
              letterSpacing: '0.2em',
              whiteSpace: 'nowrap',
              fontFamily: 'TH Sarabun New, Sarabun, serif',
            }}
          >
            ยกเลิก
          </span>
        </div>
      )}

      {/* Print Content */}
      <div
        className="print:mt-0 mt-20 p-8 mx-auto bg-white min-h-screen relative print-page"
        style={{
          fontFamily: 'TH Sarabun New, Sarabun, serif',
          fontSize: '16px',
          lineHeight: '1.8',
          color: '#000',
          width: '210mm',
          maxWidth: '100%',
        }}
      >
        <div className="relative">
          {/* ===== PAGE 1: Header & Company Info ===== */}
          <div className="mb-2">
            {/* Logo & Title */}
            <div className="flex items-start gap-4 mb-4">
              {companyLogos[reservation.company_id] && (
                <img src={companyLogos[reservation.company_id]} alt="Company Logo" className="h-16 object-contain" />
              )}
              <div className="flex-1"></div>
              {topRightLogo && (
                <img
                  src={topRightLogo}
                  alt="Brand Logo"
                  className="h-16 object-contain"
                  style={{ marginLeft: 'auto' }}
                />
              )}
            </div>

            <h1 className="text-center text-xl font-bold mb-1">แบบสัญญามาตรฐาน สัญญาจองรถยนต์ (รถใหม่)</h1>

            <div className="flex justify-between mt-4 mb-4">
              <div>เล่มที่ {dotLine('120px')}</div>
              <div>เลขที่ {filledDotLine(reservation.document_number, '150px')}</div>
            </div>
          </div>

          {/* Company Info Section */}
          <div className="mb-4">
            <p>ชื่อผู้ประกอบธุรกิจ <span className="font-bold underline">{companyName}</span> สาขา {filledDotLine(branchName, '120px')}</p>
            <p>ผู้จัดการฝ่ายขาย ชื่อ - สกุล {managerName ? filledDotLine(managerName, '250px') : dotLine('250px')} หมายเลขโทรศัพท์มือถือ {dotLine('120px')}</p>
            <p>พนักงานขาย/พนักงานผู้รับจอง ชื่อ - สกุล {creatorName ? filledDotLine(creatorName, '200px') : dotLine('200px')} หมายเลขโทรศัพท์มือถือ {dotLine('120px')}</p>
          </div>

          {/* Contract Date */}
          <div className="mb-4 text-center">
            <p>สัญญาฉบับนี้ทำขึ้น ณ {dotLine('250px')} เมื่อวันที่ {filledDotLine(String(createdDate.getDate()), '40px')} เดือน {filledDotLine(thaiMonths[createdDate.getMonth()], '100px')} พ.ศ. {filledDotLine(String(thaiYear), '60px')}</p>
          </div>

          {/* Party 1 - Business */}
          <div className="mb-4 text-indent">
            <p className="indent-8">ระหว่าง <span className="font-bold underline">{companyName}</span> ผู้จำหน่าย/ตัวแทนจำหน่ายรถยนต์ของผู้ประกอบธุรกิจ ☐ สำนักงานใหญ่ ☒ สำนักงานสาขา ตั้งอยู่ เลขที่ 800/1 อาคาร {dotLine('80px')} ชั้น {dotLine('40px')} ห้อง {dotLine('40px')} หมู่ที่ {dotLine('40px')} ตรอก/ซอย {dotLine('80px')} ถนนบรมราชชนนี ตำบล/แขวงบางบำหรุ อำเภอ/เขตบางพลัด จังหวัดกรุงเทพมหานคร</p>
            <p className="indent-8">หมายเลขโทรศัพท์ 02-8864466 อีเมล bizpk_01@nissan-dealer.in.th</p>
            <p className="indent-8">โดย {branchManagerName ? filledDotLine(branchManagerName, '200px') : dotLine('200px')} กรรมการผู้มีอำนาจ หรือ {dotLine('150px')} ผู้มีอำนาจกระทำการแทนผู้ประกอบธุรกิจ ตามหนังสือมอบอำนาจ ลงวันที่ {dotLine('40px')} เดือน {dotLine('80px')} พ.ศ. {dotLine('50px')} (ให้แสดงหนังสือมอบอำนาจต่อผู้บริโภค)</p>
            <p className="indent-8">ซึ่งต่อไปในสัญญานี้เรียกว่า <span className="font-bold">"ผู้ประกอบธุรกิจ"</span> ฝ่ายหนึ่ง</p>
          </div>

          {/* Party 2 - Consumer */}
          <div className="mb-4">
            <p className="indent-8">กับนาย/นาง/นางสาว/(อื่นๆ) {filledDotLine(reservation.customer_name, '300px')}</p>
            <p className="indent-8">บ้านเลขที่/อาคาร {filledDotLine(reservation.customer_address || '', '200px')} ชั้น {dotLine('40px')} ห้อง {dotLine('40px')}</p>
            <p className="indent-8">หมู่ที่ {dotLine('40px')} ตรอก/ซอย {dotLine('100px')} ถนน {dotLine('150px')}</p>
            <p className="indent-8">ตำบล/แขวง {dotLine('120px')} อำเภอ/เขต {dotLine('120px')}</p>
            <p className="indent-8">จังหวัด {dotLine('120px')} หมายเลขโทรศัพท์ที่ทำงาน {dotLine('120px')}</p>
            <p className="indent-8">หมายเลขโทรศัพท์บ้าน {dotLine('120px')} หมายเลขโทรศัพท์มือถือ {filledDotLine(reservation.customer_phone || '', '120px')}</p>
            <p className="indent-8">อีเมล {filledDotLine(reservation.customer_email || '', '200px')} ซึ่งต่อไปในสัญญานี้เรียกว่า <span className="font-bold">"ผู้บริโภค"</span> อีกฝ่ายหนึ่ง</p>
          </div>

          {/* Agreement Intro */}
          <p className="indent-8 mb-4 font-bold">คู่สัญญาทั้งสองฝ่ายตกลงทำสัญญากันโดยมีข้อความดังต่อไปนี้</p>

          {/* ===== SECTION 1 ===== */}
          <div className="mb-4">
            <p className="font-bold">ข้อ ๑. ข้อตกลงการจองรถยนต์</p>
            <p className="indent-8">ผู้บริโภคตกลงจองและผู้ประกอบธุรกิจให้จองรถยนต์ โดยมีรายละเอียดเกี่ยวกับรถยนต์ ดังนี้</p>
          </div>

          {/* 1.1 Vehicle Type */}
          <div className="mb-4 ml-6">
            <p className="font-bold mb-1">๑.๑ ประเภท/ชนิด</p>
            <p className="indent-4">ยี่ห้อ {filledDotLine(reservation.model || '-', '150px')} รุ่น {filledDotLine(reservation.submodel || '-', '150px')} ปีที่ผลิต {dotLine('60px')}</p>
            <p className="indent-4">สี {filledDotLine(reservation.color || '-', '150px')} และขนาดหรือกำลังของ เครื่องกำเนิดพลังงาน กรณีรถยนต์ไฟฟ้าให้มีรายละเอียดเกี่ยวกับรถยนต์เพิ่มเติมอย่างน้อย เช่น กำลังของมอเตอร์ไฟฟ้า ประเภทของแบตเตอรี่ ขนาดความจุของแบตเตอรี่</p>
            <p className="indent-4">เครื่องยนต์ {filledDotLine(reservation.fuel_type || '-', '120px')}</p>
          </div>

          {/* 1.2 Accessories & Freebies */}
          <div className="mb-4 ml-6">
            <p className="font-bold mb-1">๑.๒ รายการอุปกรณ์ติดตั้งเพิ่มเติมและของแถม หรือสิทธิประโยชน์ต่างๆ หรือส่วนที่เพิ่มตัวรถยนต์ที่ ผู้ประกอบธุรกิจจะให้หรือจัดหาให้เพื่อตอบแทน ในกรณีที่ผู้บริโภคตกลงทำสัญญา (ถ้ามี) โดยแนบรายละเอียดรายการทั้งหมดที่ตกลงกัน ตามเอกสารแนบ</p>
          </div>

          {/* 1.3 Deposit */}
          <div className="mb-4 ml-6">
            <p className="font-bold text-lg mb-2">๑.๓ เงินจองหรือผลประโยชน์อื่นใดในลักษณะทำนองเดียวกับเงินจองที่ไม่ใช่เงินมัดจำ (ถ้ามี)</p>
            <p className="indent-4 mb-1">☐ เงินสดจำนวน {filledDotLine(reservation.deposit_amount?.toLocaleString() || '', '120px')} บาท ({dotLine('200px')})</p>
            <p className="indent-4 mb-1">☐ โอนเข้าบัญชีชื่อผู้ประกอบธุรกิจ <span className="font-bold underline">{companyName}</span></p>
            <p className="indent-8 mb-1">เลขที่บัญชี 063-3-145784 ธนาคาร กสิกรไทย จำกัด (มหาชน) สาขา พุทธมณฑลสาย 4 เป็นเงิน {dotLine('100px')} บาท ({dotLine('150px')})</p>
            <p className="indent-4 mb-1">☐ เช็ค เลขที่ {dotLine('100px')} เล่มที่ {dotLine('60px')} ธนาคาร {dotLine('100px')} เป็นเงิน {dotLine('80px')} บาท ({dotLine('120px')})</p>
            <p className="indent-4 mb-1">☐ แคชเชียร์เช็คเลขที่ {dotLine('100px')} เลขที่ {dotLine('60px')} เล่มที่ {dotLine('60px')} ธนาคาร {dotLine('100px')} เป็นเงิน {dotLine('80px')} บาท ({dotLine('120px')})</p>
            <p className="indent-4 mb-1">☐ บัตรเครดิต/บัตรเดบิตธนาคาร {dotLine('120px')} ประเภทบัตรเครดิต/บัตรเดบิต {dotLine('100px')} เป็นเงิน {dotLine('80px')} บาท ({dotLine('120px')})</p>
            <p className="indent-4 mb-1">☐ อื่น ๆ {dotLine('200px')} เป็นเงิน {dotLine('80px')} บาท ({dotLine('120px')})</p>
          </div>

          {/* 1.4 Vehicle Price */}
          <div className="mb-4 ml-6">
            <p className="font-bold mb-2">๑.๔ ราคารถยนต์ใหม่</p>
            <p className="indent-4 mb-1">☐ ไม่รวมภาษีมูลค่าเพิ่ม เป็นเงิน {dotLine('120px')} บาท ({dotLine('200px')})</p>
            <p className="indent-4 mb-1">☒ รวมภาษีมูลค่าเพิ่ม เป็นเงิน {filledDotLine(reservation.net_price?.toLocaleString() || '', '120px')} บาท ({dotLine('200px')})</p>
          </div>

          {/* ===== SECTION 2 ===== */}
          <div className="mb-4">
            <p className="font-bold">ข้อ ๒. กำหนดวัน เดือน ปี และสถานที่ที่ต้องมอบรถยนต์</p>
            <p className="indent-8">
              {reservation.expected_delivery_date ? (
                <>วันที่คาดว่าจะส่งมอบรถยนต์: {filledDotLine(
                  new Date(reservation.expected_delivery_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }),
                  '250px'
                )}</>
              ) : (
                <>{dotLine('400px')}</>
              )}
            </p>
          </div>

          {/* ===== SECTION 3 ===== */}
          <div className="mb-4">
            <p className="font-bold">ข้อ ๓. ผู้บริโภคมีสิทธิบอกเลิกสัญญาเมื่อผู้ประกอบธุรกิจกระทำการอย่างใดอย่างหนึ่ง ดังต่อไปนี้</p>
            <p className="indent-8 ml-4">๓.๑ ปรับเปลี่ยนราคารถยนต์สูงขึ้น</p>
            <p className="indent-8 ml-4">๓.๒ ไม่ส่งมอบรถยนต์ให้ผู้บริโภคภายในเวลาที่กำหนด</p>
            <p className="indent-8 ml-4">๓.๓ ไม่ส่งมอบรถยนต์ตามยี่ห้อ รุ่น ปีที่ผลิต สี และขนาดหรือกำลังของเครื่องกำเนิดพลังงานที่กำหนดในสัญญา</p>
            <p className="indent-8 ml-4">๓.๔ ไม่ส่งมอบรถยนต์ ที่มีรายการอุปกรณ์ติดตั้งเพิ่มเติมและของแถมหรือสิทธิประโยชน์ต่าง ๆ หรือส่วนเพิ่มตัวรถยนต์ตามที่กำหนดในสัญญา</p>
            <p className="indent-8 ml-4">๓.๕ ไม่ส่งมอบรถยนต์ที่มีราคาส่วนลด (ถ้ามี) ตามที่กำหนดในสัญญา</p>
          </div>

          {/* ===== SECTION 4 ===== */}
          <div className="mb-4">
            <p className="font-bold">ข้อ ๔. ผู้ประกอบธุรกิจมีสิทธิบอกเลิกสัญญา</p>
            <p className="indent-8">เมื่อผู้บริโภคไม่เข้าไปรับรถยนต์ภายในกำหนดระยะเวลาที่กำหนดไว้ในสัญญาและไม่แจ้งเหตุขัดข้อง ให้ทราบ ให้ผู้ประกอบธุรกิจมีสิทธิริบเงินจองได้</p>
          </div>

          {/* ===== SECTION 5 ===== */}
          <div className="mb-4">
            <p className="font-bold">ข้อ ๕. ผู้บริโภคหรือผู้ประกอบธุรกิจฝ่ายหนึ่งฝ่ายใดมีสิทธิบอกเลิกสัญญา</p>
            <p className="indent-8">หากมีข้อเท็จจริงที่ผู้ประกอบธุรกิจได้รับทราบว่า ผู้บริโภคต้องขอสินเชื่อเพื่อการซื้อรถยนต์และผู้บริโภคไม่ได้รับอนุมัติสินเชื่อตามที่ขอภายในกำหนดเวลาส่งมอบรถยนต์</p>
          </div>

          {/* ===== SECTION 6 ===== */}
          <div className="mb-4">
            <p className="font-bold">ข้อ ๖. ผู้ประกอบธุรกิจคืนเงิน</p>
            <p className="indent-8">เมื่อมีการบอกเลิกสัญญาตามข้อ ๓ หรือ ข้อ ๔ แล้ว ผู้ประกอบธุรกิจต้องคืนเงินจองหรือผลประโยชน์อื่นใดในลักษณะทำนองเดียวกับเงินจองที่ไม่ใช่เงินมัดจำทั้งหมดให้แก่ผู้บริโภค</p>
            <p className="indent-8 ml-4">๖.๑ กรณีชำระเงินคืนเป็นเงินสดหรือเงินโอน หรือเช็คให้แก่ผู้บริโภคภายในสิบห้าวันนับแต่วันที่มีการบอกเลิกสัญญา</p>
            <p className="indent-8 ml-4">๖.๒ กรณีชำระคืนผ่านบัตรเครดิตให้แก่ผู้บริโภคภายในสี่สิบห้าวันนับแต่วันที่มีการบอกเลิกสัญญาและให้ผู้ประกอบธุรกิจมีสิทธิหักค่าธรรมเนียมการใช้บัตรเครดิต (ถ้ามี) ได้</p>
          </div>

          {/* ===== SECTION 7 ===== */}
          <div className="mb-6">
            <p className="font-bold">ข้อ ๗. การบอกเลิกสัญญาของผู้ประกอบธุรกิจตามข้อ ๔ หรือข้อ ๕ ให้</p>
            <p className="indent-8">ทำเป็นหนังสือบอกกล่าวให้ผู้บริโภคปฏิบัติตามสัญญาภายในระยะเวลาไม่น้อยกว่าเจ็ดวันนับแต่วันที่ผู้บริโภคได้รับหนังสือ และผู้บริโภคละเลยเสียไม่ปฏิบัติตามหนังสือบอกกล่าวนั้น ผู้ประกอบธุรกิจมีสิทธิบอกเลิก</p>
          </div>

          {/* Closing statement */}
          <p className="indent-8 mb-8">สัญญาสัญญาจองรถยนต์นี้มีข้อความถูกต้องตรงกัน คู่สัญญาได้อ่านและเข้าใจข้อความโดยละเอียดแล้ว จึงได้ลงลายมือชื่อ พร้อมทั้งประทับตรา (ถ้ามี) ไว้เป็นสำคัญต่อหน้าพยานและคู่สัญญา และเก็บไว้ฝ่ายละหนึ่งฉบับ</p>

          {/* ===== SIGNATURES ===== */}
          <div className="mt-8">
            <div className="grid grid-cols-2 gap-x-12 gap-y-2">
              {/* Row 1: Consumer & Business */}
              <div className="text-center mb-10">
                <p>(ลงชื่อ){dotLine('180px')}ผู้บริโภค</p>
                <p>( {filledDotLine(reservation.customer_name, '180px')} )</p>
              </div>
              <div className="text-center mb-10">
                <p>(ลงชื่อ){dotLine('180px')}</p>
                <p>ผู้ประกอบธุรกิจ</p>
                <p>( {branchManagerName ? filledDotLine(branchManagerName, '180px') : dotLine('180px')} )</p>
              </div>

              {/* Row 2: Sales Manager & Salesperson */}
              <div className="text-center mb-10">
                <p>(ลงชื่อ){dotLine('180px')}ผู้จัดการฝ่ายขาย</p>
                <p>( {managerName ? filledDotLine(managerName, '180px') : dotLine('180px')} )</p>
              </div>
              <div className="text-center mb-10">
                <p>(ลงชื่อ){dotLine('180px')}พนักงานขาย/พนักงานผู้รับจอง</p>
                <p>( {creatorName ? filledDotLine(creatorName, '180px') : dotLine('180px')} )</p>
              </div>

              {/* Row 3: Witnesses */}
              <div className="text-center mb-6">
                <p>(ลงชื่อ){dotLine('180px')}พยาน</p>
                <p>( {dotLine('180px')} )</p>
              </div>
              <div className="text-center mb-6">
                <p>(ลงชื่อ){dotLine('180px')}พยาน</p>
                <p>( {dotLine('180px')} )</p>
              </div>
            </div>
          </div>

          {/* ===== PAGE BREAK - ATTACHMENT ===== */}
          <div className="break-before-page mt-8 pt-8 border-t-2 border-gray-300 print:border-0">
            <p className="text-center font-bold text-lg mb-4">เอกสารแนบท้ายสัญญาจองรถยนต์ใหม่</p>
            <p className="text-center mb-2">เล่มที่ {dotLine('80px')} เลขที่ {filledDotLine(reservation.document_number, '120px')}</p>
            <p className="text-center mb-4">ลงวันที่ {filledDotLine(`${createdDate.getDate()} ${thaiMonths[createdDate.getMonth()]} ${thaiYear}`, '200px')}</p>

            <p className="mb-1">ระหว่าง <span className="font-bold underline">{companyName}</span> {dotLine('200px')} ผู้ประกอบการ</p>
            <p className="mb-4">กับ นาย/นาง/นางสาว/(อื่น ๆ) {filledDotLine(reservation.customer_name, '250px')} ผู้บริโภค</p>

            <p className="font-bold mb-2">รายการอุปกรณ์ตกแต่งเพิ่มเติม ของแถม หรือ สิทธิประโยชน์อื่น ๆ (ถ้ามี)</p>

            <table className="w-full border-collapse border border-gray-800 mb-6">
              <thead>
                <tr>
                  <th className="border border-gray-800 p-2 text-center w-12 bg-gray-50"></th>
                  <th className="border border-gray-800 p-2 text-center bg-gray-50">รายการอุปกรณ์ตกแต่ง</th>
                  <th className="border border-gray-800 p-2 text-center w-12 bg-gray-50"></th>
                  <th className="border border-gray-800 p-2 text-center bg-gray-50">ของแถม</th>
                  <th className="border border-gray-800 p-2 text-center bg-gray-50">สิทธิประโยชน์อื่น ๆ</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 10 }).map((_, idx) => {
                  const accessory = reservation.accessories?.[idx];
                  const freebie = reservation.freebies?.[idx];
                  const benefit = reservation.benefits?.[idx];
                  return (
                    <tr key={idx}>
                      <td className="border border-gray-800 p-2 text-center">{idx + 1}</td>
                      <td className="border border-gray-800 p-2">{accessory?.name || ''}</td>
                      <td className="border border-gray-800 p-2 text-center">{idx + 1}</td>
                      <td className="border border-gray-800 p-2">{freebie?.name || ''}</td>
                      <td className="border border-gray-800 p-2">{benefit?.name || ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Attachment Signatures */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-2 mt-8">
              <div className="text-center mb-10">
                <p>(ลงชื่อ){dotLine('180px')}ผู้บริโภค</p>
                <p>( {filledDotLine(reservation.customer_name, '180px')} )</p>
              </div>
              <div className="text-center mb-10">
                <p>(ลงชื่อ){dotLine('180px')}</p>
                <p>ผู้ประกอบธุรกิจ</p>
                <p>( {branchManagerName ? filledDotLine(branchManagerName, '180px') : dotLine('180px')} )</p>
              </div>

              <div className="text-center mb-10">
                <p>(ลงชื่อ){dotLine('180px')}ผู้จัดการฝ่ายขาย</p>
                <p>( {managerName ? filledDotLine(managerName, '180px') : dotLine('180px')} )</p>
              </div>
              <div className="text-center mb-10">
                <p>(ลงชื่อ){dotLine('180px')}พนักงานขาย/พนักงานผู้รับจอง</p>
                <p>( {creatorName ? filledDotLine(creatorName, '180px') : dotLine('180px')} )</p>
              </div>

              <div className="text-center mb-6">
                <p>(ลงชื่อ){dotLine('180px')}พยาน</p>
                <p>( {dotLine('180px')} )</p>
              </div>
              <div className="text-center mb-6">
                <p>(ลงชื่อ){dotLine('180px')}พยาน</p>
                <p>( {dotLine('180px')} )</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4;
            margin: 15mm;
          }
          .print-page {
            width: 100% !important;
            max-width: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .break-before-page {
            page-break-before: always;
            border-top: none !important;
            padding-top: 0 !important;
            margin-top: 0 !important;
          }
          /* Ensure watermark repeats on every page */
          .cancel-watermark {
            position: fixed !important;
            top: 0; left: 0; right: 0; bottom: 0;
          }
        }
        .indent-8 {
          text-indent: 2rem;
        }
        .indent-4 {
          text-indent: 1rem;
        }
      `}</style>
    </>
  );
}
