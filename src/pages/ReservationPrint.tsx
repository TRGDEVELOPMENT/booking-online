import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { companies, branches } from '@/data/mockData';
import type { DatabaseReservation } from '@/types/database-reservation';

export default function ReservationPrint() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<DatabaseReservation | null>(null);
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
  const today = new Date();
  const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 
                      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  const thaiYear = today.getFullYear() + 543;

  return (
    <>
      {/* Print Controls - Hidden when printing */}
      <div className="print:hidden fixed top-0 left-0 right-0 bg-background/95 backdrop-blur border-b z-50 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/reservations')}>
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

      {/* Print Content */}
      <div className="print:mt-0 mt-20 p-8 max-w-4xl mx-auto bg-white min-h-screen">
        <div className="print-content text-sm leading-relaxed" style={{ fontFamily: 'TH Sarabun New, Sarabun, serif' }}>
          
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-1">แบบสัญญามาตรฐาน</h1>
            <h2 className="text-lg font-bold">สัญญาจองรถยนต์ (รถใหม่)</h2>
          </div>

          {/* Document Info */}
          <div className="flex justify-between mb-4">
            <div>เล่มที่ .........................</div>
            <div>เลขที่ <span className="font-semibold">{reservation.document_number}</span></div>
          </div>

          {/* Company Info */}
          <div className="mb-4 p-3 border border-gray-300 rounded">
            <p className="font-semibold mb-2">ผู้ประกอบธุรกิจ: {company?.name || 'บริษัท บิซ พีเค จำกัด'}</p>
            <p>สาขา: {branch?.name || 'สำนักงานใหญ่'}</p>
            <p>ที่อยู่: 800/1 ถนนบรมราชชนนี แขวงบางบำหรุ เขตบางพลัด กรุงเทพมหานคร 10700</p>
            <p>โทรศัพท์: 02-886-4466 | อีเมล: bizpk_01@nissan-dealer.in.th</p>
          </div>

          {/* Contract Date */}
          <div className="mb-4 text-center">
            <p>
              สัญญาฉบับนี้ทำขึ้น ณ วันที่ <span className="font-semibold">{today.getDate()}</span> เดือน <span className="font-semibold">{thaiMonths[today.getMonth()]}</span> พ.ศ. <span className="font-semibold">{thaiYear}</span>
            </p>
          </div>

          {/* Parties */}
          <div className="mb-6">
            <p className="mb-2">
              ระหว่าง <span className="font-semibold">{company?.name || 'บริษัท บิซ พีเค จำกัด'}</span> ผู้จำหน่าย/ตัวแทนจำหน่ายรถยนต์ 
              ซึ่งต่อไปในสัญญานี้เรียกว่า <span className="font-semibold">"ผู้ประกอบธุรกิจ"</span> ฝ่ายหนึ่ง
            </p>
            <p>
              กับ <span className="font-semibold">{reservation.customer_name}</span> 
              {reservation.customer_phone && <> โทรศัพท์: {reservation.customer_phone}</>}
              {reservation.customer_email && <> อีเมล: {reservation.customer_email}</>}
            </p>
            <p>
              ซึ่งต่อไปในสัญญานี้เรียกว่า <span className="font-semibold">"ผู้บริโภค"</span> อีกฝ่ายหนึ่ง
            </p>
          </div>

          <p className="mb-4 font-semibold">คู่สัญญาทั้งสองฝ่ายตกลงทำสัญญากันโดยมีข้อความดังต่อไปนี้</p>

          {/* Section 1 */}
          <div className="mb-6">
            <h3 className="font-bold mb-3">ข้อ 1. ข้อตกลงการจองรถยนต์</h3>
            <p className="mb-3">ผู้บริโภคตกลงจองและผู้ประกอบธุรกิจให้จองรถยนต์ โดยมีรายละเอียดเกี่ยวกับรถยนต์ดังนี้</p>

            {/* 1.1 Vehicle Details */}
            <div className="mb-4 ml-4">
              <p className="font-semibold mb-2">1.1 ประเภท/ชนิด</p>
              <table className="w-full border-collapse border border-gray-300">
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-2 w-1/4 bg-gray-50">ยี่ห้อ/รุ่น</td>
                    <td className="border border-gray-300 p-2">{reservation.model || '-'} {reservation.submodel || ''}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 bg-gray-50">สี</td>
                    <td className="border border-gray-300 p-2">{reservation.color || '-'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 bg-gray-50">ประเภทเชื้อเพลิง</td>
                    <td className="border border-gray-300 p-2">{reservation.fuel_type || '-'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 bg-gray-50">ประเภทรถ</td>
                    <td className="border border-gray-300 p-2">
                      {reservation.vehicle_type === 'personal' ? 'รถยนต์ส่วนบุคคลไม่เกิน 7 ที่นั่ง' : 
                       reservation.vehicle_type === 'pickup' ? 'รถยนต์กระบะ' : reservation.vehicle_type || '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 1.2 Accessories */}
            <div className="mb-4 ml-4">
              <p className="font-semibold mb-2">1.2 รายการอุปกรณ์ตกแต่งเพิ่มเติมและของแถม หรือสิทธิประโยชน์ต่างๆ</p>
              {(reservation.freebies && reservation.freebies.length > 0) || 
               (reservation.accessories && reservation.accessories.length > 0) || 
               (reservation.benefits && reservation.benefits.length > 0) ? (
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-2 text-left w-12">ลำดับ</th>
                      <th className="border border-gray-300 p-2 text-left">รายการ</th>
                      <th className="border border-gray-300 p-2 text-left">ประเภท</th>
                      <th className="border border-gray-300 p-2 text-right w-32">มูลค่า (บาท)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservation.freebies?.map((item, idx) => (
                      <tr key={`freebie-${idx}`}>
                        <td className="border border-gray-300 p-2">{idx + 1}</td>
                        <td className="border border-gray-300 p-2">{item.name}</td>
                        <td className="border border-gray-300 p-2">ของแถม</td>
                        <td className="border border-gray-300 p-2 text-right">{item.value?.toLocaleString() || '-'}</td>
                      </tr>
                    ))}
                    {reservation.accessories?.map((item, idx) => (
                      <tr key={`acc-${idx}`}>
                        <td className="border border-gray-300 p-2">{(reservation.freebies?.length || 0) + idx + 1}</td>
                        <td className="border border-gray-300 p-2">{item.name}</td>
                        <td className="border border-gray-300 p-2">อุปกรณ์ตกแต่ง</td>
                        <td className="border border-gray-300 p-2 text-right">{item.value?.toLocaleString() || '-'}</td>
                      </tr>
                    ))}
                    {reservation.benefits?.map((item, idx) => (
                      <tr key={`benefit-${idx}`}>
                        <td className="border border-gray-300 p-2">{(reservation.freebies?.length || 0) + (reservation.accessories?.length || 0) + idx + 1}</td>
                        <td className="border border-gray-300 p-2">{item.name}</td>
                        <td className="border border-gray-300 p-2">สิทธิประโยชน์</td>
                        <td className="border border-gray-300 p-2 text-right">{item.value?.toLocaleString() || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 italic">- ไม่มี -</p>
              )}
            </div>

            {/* 1.3 Deposit */}
            <div className="mb-4 ml-4">
              <p className="font-semibold mb-2">1.3 เงินจองหรือผลประโยชน์อื่นใดในลักษณะทำนองเดียวกับเงินจอง</p>
              <p>เงินจอง จำนวน <span className="font-semibold">{reservation.deposit_amount?.toLocaleString() || '0'}</span> บาท</p>
            </div>

            {/* 1.4 Price */}
            <div className="mb-4 ml-4">
              <p className="font-semibold mb-2">1.4 ราคารถยนต์ใหม่</p>
              <table className="w-full border-collapse border border-gray-300">
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-2 w-1/3 bg-gray-50">ราคารถ</td>
                    <td className="border border-gray-300 p-2 text-right">{reservation.list_price?.toLocaleString() || '0'} บาท</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 bg-gray-50">ส่วนลด</td>
                    <td className="border border-gray-300 p-2 text-right">{reservation.discount?.toLocaleString() || '0'} บาท</td>
                  </tr>
                  <tr className="font-semibold">
                    <td className="border border-gray-300 p-2 bg-gray-100">ราคาสุทธิ (รวมภาษีมูลค่าเพิ่ม)</td>
                    <td className="border border-gray-300 p-2 text-right bg-gray-100">{reservation.net_price?.toLocaleString() || '0'} บาท</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2 */}
          <div className="mb-6">
            <h3 className="font-bold mb-3">ข้อ 2. กำหนดวัน เดือน ปี และสถานที่ที่ต้องมอบรถยนต์</h3>
            <p>
              วันที่คาดว่าจะส่งมอบรถยนต์: <span className="font-semibold">
                {reservation.expected_delivery_date ? 
                  new Date(reservation.expected_delivery_date).toLocaleDateString('th-TH', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'จะแจ้งให้ทราบภายหลัง'}
              </span>
            </p>
          </div>

          {/* Section 3-7 Terms */}
          <div className="mb-6 text-xs">
            <h3 className="font-bold mb-2">ข้อ 3. ผู้บริโภคมีสิทธิบอกเลิกสัญญาเมื่อผู้ประกอบธุรกิจกระทำการอย่างใดอย่างหนึ่ง ดังต่อไปนี้</h3>
            <p className="ml-4">3.1 ปรับเปลี่ยนราคารถยนต์สูงขึ้น</p>
            <p className="ml-4">3.2 ไม่ส่งมอบรถยนต์ให้ผู้บริโภคภายในเวลากำหนด</p>
            <p className="ml-4">3.3 ไม่ส่งมอบรถยนต์ตามยี่ห้อ รุ่น ปี สี และขนาดกำลังของเครื่องกำเนิดพลังงานตามที่กำหนดในสัญญา</p>
            <p className="ml-4">3.4 ไม่ส่งมอบรถยนต์ที่มีรายการอุปกรณ์ตกแต่งเพิ่มเติมและของแถม หรือสิทธิประโยชน์ต่างๆ ตามที่กำหนดในสัญญา</p>
            <p className="ml-4">3.5 ไม่ส่งมอบรถยนต์ในราคาสินเชื่อตามที่กำหนดในสัญญา</p>

            <h3 className="font-bold mt-3 mb-2">ข้อ 4. ผู้ประกอบธุรกิจมีสิทธิบอกเลิกสัญญา</h3>
            <p className="ml-4">เมื่อผู้บริโภคไม่เข้าไปรับรถยนต์ภายในกำหนดระยะเวลาและไม่แจ้งเหตุขัดข้องให้ทราบ</p>

            <h3 className="font-bold mt-3 mb-2">ข้อ 5. การบอกเลิกสัญญากรณีสินเชื่อ</h3>
            <p className="ml-4">หากผู้บริโภคต้องขอสินเชื่อเพื่อการซื้อรถยนต์ และผู้บริโภคไม่ได้รับอนุมัติสินเชื่อตามที่ขอภายในกำหนด คู่สัญญาฝ่ายใดฝ่ายหนึ่งมีสิทธิบอกเลิกสัญญา</p>

            <h3 className="font-bold mt-3 mb-2">ข้อ 6. การคืนเงิน</h3>
            <p className="ml-4">เมื่อมีการบอกเลิกสัญญาตามข้อ 3, 4 หรือ 5 ผู้ประกอบธุรกิจต้องคืนเงินจองให้แก่ผู้บริโภคภายใน 15 วันนับแต่วันที่มีการบอกเลิกสัญญา</p>

            <h3 className="font-bold mt-3 mb-2">ข้อ 7. การบอกกล่าว</h3>
            <p className="ml-4">การบอกเลิกสัญญาของผู้ประกอบธุรกิจตามข้อ 4 หรือข้อ 5 ให้ทำเป็นหนังสือบอกกล่าวให้ผู้บริโภคปฏิบัติตามสัญญาภายในระยะเวลาไม่น้อยกว่า 7 วัน</p>
          </div>

          {/* Signatures */}
          <div className="mt-12 pt-6 border-t border-gray-300">
            <p className="text-center mb-8">
              สัญญาจองรถยนต์นี้มีข้อความถูกต้องตรงกัน คู่สัญญาได้อ่านและเข้าใจข้อความโดยละเอียดแล้ว จึงได้ลงลายมือชื่อ พร้อมทั้งประทับตรา (ถ้ามี) ไว้เป็นสำคัญต่อหน้าพยานและคู่สัญญา และเก็บไว้ฝ่ายละหนึ่งฉบับ
            </p>

            <div className="grid grid-cols-2 gap-8 mt-8">
              <div className="text-center">
                <div className="mb-16">
                  <p className="border-b border-dotted border-gray-400 pb-1 mb-1">ลงชื่อ ................................................................</p>
                  <p className="font-semibold">( {reservation.customer_name} )</p>
                  <p>ผู้บริโภค</p>
                </div>
              </div>
              <div className="text-center">
                <div className="mb-16">
                  <p className="border-b border-dotted border-gray-400 pb-1 mb-1">ลงชื่อ ................................................................</p>
                  <p className="font-semibold">( ............................................................. )</p>
                  <p>ผู้ประกอบธุรกิจ</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mt-4">
              <div className="text-center">
                <div className="mb-12">
                  <p className="border-b border-dotted border-gray-400 pb-1 mb-1">ลงชื่อ ................................................................</p>
                  <p>ผู้จัดการฝ่ายขาย</p>
                </div>
              </div>
              <div className="text-center">
                <div className="mb-12">
                  <p className="border-b border-dotted border-gray-400 pb-1 mb-1">ลงชื่อ ................................................................</p>
                  <p>พนักงานขาย/พนักงานรับจอง</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mt-4">
              <div className="text-center">
                <p className="border-b border-dotted border-gray-400 pb-1 mb-1">ลงชื่อ ................................................................</p>
                <p>พยาน</p>
              </div>
              <div className="text-center">
                <p className="border-b border-dotted border-gray-400 pb-1 mb-1">ลงชื่อ ................................................................</p>
                <p>พยาน</p>
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
          .print-content {
            font-size: 14px !important;
            line-height: 1.6 !important;
          }
          @page {
            size: A4;
            margin: 15mm;
          }
        }
      `}</style>
    </>
  );
}
