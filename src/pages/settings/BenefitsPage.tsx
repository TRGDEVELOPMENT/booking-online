import MasterDataPage from './MasterDataPage';

const mockBenefits = [
  { id: '1', code: 'FREE-SERVICE', name: 'ฟรีค่าแรงบำรุงรักษา', description: 'ฟรีค่าแรงบำรุงรักษา 5 ปี' },
  { id: '2', code: 'FREE-CHECK', name: 'ฟรีตรวจเช็คสภาพ', description: 'ฟรีตรวจเช็คสภาพรถ 20 ครั้ง' },
  { id: '3', code: 'RESCUE', name: 'บริการช่วยเหลือฉุกเฉิน', description: 'บริการช่วยเหลือฉุกเฉิน 24 ชม.' },
  { id: '4', code: 'REPLACE-CAR', name: 'รถทดแทน', description: 'บริการรถทดแทนระหว่างซ่อม' },
  { id: '5', code: 'DISCOUNT', name: 'ส่วนลดอะไหล่', description: 'ส่วนลดค่าอะไหล่ 10%' },
  { id: '6', code: 'INTEREST', name: 'ดอกเบี้ยพิเศษ', description: 'ดอกเบี้ยพิเศษ 0%' },
];

export default function BenefitsPage() {
  return (
    <MasterDataPage
      title="สิทธิ์ประโยชน์อื่นๆ"
      subtitle="จัดการข้อมูลสิทธิประโยชน์พิเศษ"
      initialData={mockBenefits}
      codeLabel="รหัส"
      nameLabel="ชื่อสิทธิประโยชน์"
    />
  );
}
