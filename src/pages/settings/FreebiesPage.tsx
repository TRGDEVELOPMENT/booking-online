import MasterDataPage from './MasterDataPage';

const mockFreebies = [
  { id: '1', code: 'TINT', name: 'ฟิล์มกรองแสง', description: 'ฟิล์มกรองแสงรอบคัน' },
  { id: '2', code: 'COATING', name: 'เคลือบแก้ว', description: 'เคลือบแก้วนาโน' },
  { id: '3', code: 'MAT', name: 'พรมปูพื้น', description: 'พรมปูพื้นรถยนต์' },
  { id: '4', code: 'CAMERA', name: 'กล้องหน้า-หลัง', description: 'กล้องบันทึกหน้า-หลัง' },
  { id: '5', code: 'INSURANCE', name: 'ประกันภัยชั้น 1', description: 'ประกันภัยชั้น 1 ฟรี 1 ปี' },
  { id: '6', code: 'WARRANTY', name: 'รับประกันเพิ่ม', description: 'ขยายรับประกันเป็น 5 ปี' },
];

export default function FreebiesPage() {
  return (
    <MasterDataPage
      title="ของแถม"
      subtitle="จัดการข้อมูลของแถมพิเศษ"
      initialData={mockFreebies}
      codeLabel="รหัส"
      nameLabel="ชื่อของแถม"
    />
  );
}
