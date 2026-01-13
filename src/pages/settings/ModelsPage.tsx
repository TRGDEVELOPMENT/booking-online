import MasterDataPage from './MasterDataPage';

const mockModels = [
  { id: '1', code: 'NISSAN-KICKS', name: 'Nissan Kicks', description: 'รถ Crossover ขนาดเล็ก' },
  { id: '2', code: 'NISSAN-ALMERA', name: 'Nissan Almera', description: 'รถเก๋งขนาดกลาง' },
  { id: '3', code: 'NISSAN-NAVARA', name: 'Nissan Navara', description: 'รถกระบะ' },
  { id: '4', code: 'ISUZU-DMAX', name: 'Isuzu D-Max', description: 'รถกระบะ' },
  { id: '5', code: 'ISUZU-MUX', name: 'Isuzu MU-X', description: 'รถ SUV 7 ที่นั่ง' },
];

export default function ModelsPage() {
  return (
    <MasterDataPage
      title="รุ่น (Model)"
      subtitle="จัดการข้อมูลรุ่นรถยนต์"
      initialData={mockModels}
      codeLabel="รหัสรุ่น"
      nameLabel="ชื่อรุ่น"
    />
  );
}
