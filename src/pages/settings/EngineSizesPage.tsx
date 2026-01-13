import MasterDataPage from './MasterDataPage';

const mockEngineSizes = [
  { id: '1', code: '1200CC', name: '1.2 ลิตร', description: '1,200 cc' },
  { id: '2', code: '1500CC', name: '1.5 ลิตร', description: '1,500 cc' },
  { id: '3', code: '1800CC', name: '1.8 ลิตร', description: '1,800 cc' },
  { id: '4', code: '2000CC', name: '2.0 ลิตร', description: '2,000 cc' },
  { id: '5', code: '2500CC', name: '2.5 ลิตร', description: '2,500 cc' },
  { id: '6', code: '3000CC', name: '3.0 ลิตร', description: '3,000 cc' },
];

export default function EngineSizesPage() {
  return (
    <MasterDataPage
      title="ขนาด/กำลังเครื่องยนต์"
      subtitle="จัดการข้อมูลขนาดและกำลังเครื่องยนต์"
      initialData={mockEngineSizes}
      codeLabel="รหัส"
      nameLabel="ขนาดเครื่องยนต์"
    />
  );
}
