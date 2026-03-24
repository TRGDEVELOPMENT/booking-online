import { Shield } from 'lucide-react';

export default function UserGroupsPage() {
  const groups = [
    { id: 'sale', name: 'พนักงานขาย (Sale)', description: 'สร้างและจัดการใบจอง' },
    { id: 'cashier', name: 'แคชเชียร์ (Cashier)', description: 'ยืนยันการรับชำระเงิน' },
    { id: 'sale_supervisor', name: 'หัวหน้าทีมขาย (Sale Supervisor)', description: 'ตรวจสอบใบจองจากทีมขาย' },
    { id: 'sale_manager', name: 'ผู้จัดการฝ่ายขาย (Sale Manager)', description: 'อนุมัติใบจอง' },
    { id: 'it', name: 'IT Admin', description: 'จัดการระบบและตั้งค่าทั้งหมด' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">กลุ่มผู้ใช้งาน</h1>
        <p className="text-muted-foreground">แสดงกลุ่มผู้ใช้งาน (Roles) ที่กำหนดในระบบ</p>
      </div>

      <div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="text-left px-4 py-2 font-semibold w-12">ลำดับ</th>
              <th className="text-left px-4 py-2 font-semibold">ชื่อกลุ่ม</th>
              <th className="text-left px-4 py-2 font-semibold">Role ID</th>
              <th className="text-left px-4 py-2 font-semibold">คำอธิบาย</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group, index) => (
              <tr key={group.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-2 text-muted-foreground">{index + 1}</td>
                <td className="px-4 py-2 font-medium text-foreground">{group.name}</td>
                <td className="px-4 py-2">
                  <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{group.id}</span>
                </td>
                <td className="px-4 py-2 text-muted-foreground">{group.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
