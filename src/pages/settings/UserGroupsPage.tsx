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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map(group => (
          <div
            key={group.id}
            className="bg-card rounded-xl border border-border p-5 flex items-start gap-4"
          >
            <div className="p-3 rounded-lg bg-primary/10">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{group.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
              <span className="inline-block mt-2 text-xs font-mono bg-muted px-2 py-1 rounded">
                {group.id}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
