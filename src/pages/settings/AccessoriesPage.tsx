import MasterDataPage from './MasterDataPage';

const mockAccessories = [
  { id: '1', code: 'BODYKIT', name: 'ชุดแต่งรอบคัน', description: 'ชุดแต่ง Bodykit' },
  { id: '2', code: 'SPOILER', name: 'สปอยเลอร์', description: 'สปอยเลอร์หลัง' },
  { id: '3', code: 'RACK', name: 'แร็คหลังคา', description: 'แร็คหลังคา Crossbar' },
  { id: '4', code: 'SIDESTEP', name: 'บันไดข้าง', description: 'บันไดข้างสแตนเลส' },
  { id: '5', code: 'ROLLBAR', name: 'โรลบาร์', description: 'โรลบาร์สแตนเลส' },
  { id: '6', code: 'LINER', name: 'ซับในกระบะ', description: 'ซับในกระบะพลาสติก' },
  { id: '7', code: 'CANOPY', name: 'หลังคาแคนอปี้', description: 'หลังคาแคนอปี้ไฟเบอร์' },
];

export default function AccessoriesPage() {
  return (
    <MasterDataPage
      title="อุปกรณ์ติดตั้งเพิ่มเติม"
      subtitle="จัดการข้อมูลอุปกรณ์ตกแต่งเพิ่มเติม"
      initialData={mockAccessories}
      codeLabel="รหัส"
      nameLabel="ชื่ออุปกรณ์"
    />
  );
}
