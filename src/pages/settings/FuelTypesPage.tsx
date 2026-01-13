import MasterDataPage from './MasterDataPage';

const mockFuelTypes = [
  { id: '1', code: 'GASOLINE', name: 'น้ำมันเบนซิน', description: 'เชื้อเพลิงน้ำมันเบนซิน' },
  { id: '2', code: 'DIESEL', name: 'น้ำมันดีเซล', description: 'เชื้อเพลิงน้ำมันดีเซล' },
  { id: '3', code: 'HYBRID', name: 'ไฮบริด', description: 'ระบบไฮบริด (เบนซิน + ไฟฟ้า)' },
  { id: '4', code: 'E-POWER', name: 'e-POWER', description: 'ระบบ e-POWER (ไฟฟ้าจากเครื่องยนต์)' },
  { id: '5', code: 'PHEV', name: 'Plug-in Hybrid', description: 'ปลั๊กอินไฮบริด' },
  { id: '6', code: 'EV', name: 'ไฟฟ้า 100%', description: 'พลังงานไฟฟ้าล้วน' },
];

export default function FuelTypesPage() {
  return (
    <MasterDataPage
      title="ประเภทเชื้อเพลิง"
      subtitle="จัดการข้อมูลประเภทเชื้อเพลิง"
      initialData={mockFuelTypes}
      codeLabel="รหัส"
      nameLabel="ประเภทเชื้อเพลิง"
    />
  );
}
