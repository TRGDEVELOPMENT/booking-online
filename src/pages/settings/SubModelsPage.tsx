import MasterDataPage from './MasterDataPage';

const mockSubModels = [
  { id: '1', code: 'KICKS-E', name: 'Kicks e-POWER E', description: 'รุ่นมาตรฐาน' },
  { id: '2', code: 'KICKS-V', name: 'Kicks e-POWER V', description: 'รุ่นกลาง' },
  { id: '3', code: 'KICKS-VL', name: 'Kicks e-POWER VL', description: 'รุ่นท็อป' },
  { id: '4', code: 'ALMERA-E', name: 'Almera E', description: 'รุ่นมาตรฐาน' },
  { id: '5', code: 'ALMERA-EL', name: 'Almera EL', description: 'รุ่นกลาง' },
  { id: '6', code: 'ALMERA-VL', name: 'Almera VL', description: 'รุ่นท็อป' },
];

export default function SubModelsPage() {
  return (
    <MasterDataPage
      title="รุ่นย่อย (Sub Model)"
      subtitle="จัดการข้อมูลรุ่นย่อยรถยนต์"
      initialData={mockSubModels}
      codeLabel="รหัสรุ่นย่อย"
      nameLabel="ชื่อรุ่นย่อย"
    />
  );
}
