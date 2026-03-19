import { Check, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Permission {
  feature: string;
  sale: boolean;
  cashier: boolean;
  sale_supervisor: boolean;
  sale_manager: boolean;
  it: boolean;
}

const permissions: Permission[] = [
  { feature: 'สร้างใบจอง', sale: true, cashier: false, sale_supervisor: true, sale_manager: true, it: true },
  { feature: 'แก้ไขใบจอง', sale: true, cashier: false, sale_supervisor: true, sale_manager: true, it: true },
  { feature: 'ตรวจสอบใบจอง (Review)', sale: false, cashier: false, sale_supervisor: true, sale_manager: false, it: true },
  { feature: 'อนุมัติใบจอง (Approve)', sale: false, cashier: false, sale_supervisor: false, sale_manager: true, it: true },
  { feature: 'ยืนยันรับเงิน (Payment)', sale: false, cashier: true, sale_supervisor: false, sale_manager: false, it: true },
  { feature: 'ขอยกเลิกใบจอง', sale: true, cashier: false, sale_supervisor: true, sale_manager: true, it: true },
  { feature: 'ตรวจสอบการยกเลิก', sale: false, cashier: false, sale_supervisor: true, sale_manager: false, it: true },
  { feature: 'อนุมัติการยกเลิก', sale: false, cashier: false, sale_supervisor: false, sale_manager: true, it: true },
  { feature: 'ตั้งค่าข้อมูลหลัก', sale: false, cashier: false, sale_supervisor: false, sale_manager: true, it: true },
  { feature: 'จัดการผู้ใช้งาน', sale: false, cashier: false, sale_supervisor: false, sale_manager: false, it: true },
  { feature: 'ดูรายงาน', sale: true, cashier: true, sale_supervisor: true, sale_manager: true, it: true },
];

const roleHeaders = [
  { key: 'sale', label: 'พนักงานขาย' },
  { key: 'cashier', label: 'แคชเชียร์' },
  { key: 'sale_supervisor', label: 'หัวหน้าทีมขาย' },
  { key: 'sale_manager', label: 'ผจก.ฝ่ายขาย' },
  { key: 'it', label: 'IT Admin' },
];

export default function UserPermissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">กำหนดสิทธิ์ผู้ใช้งาน</h1>
        <p className="text-muted-foreground">ตารางแสดงสิทธิ์การเข้าถึงฟีเจอร์ตามกลุ่มผู้ใช้งาน</p>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px] sticky left-0 bg-card z-10">ฟีเจอร์</TableHead>
              {roleHeaders.map(r => (
                <TableHead key={r.key} className="text-center min-w-[120px]">{r.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map((perm) => (
              <TableRow key={perm.feature}>
                <TableCell className="font-medium sticky left-0 bg-card z-10">{perm.feature}</TableCell>
                {roleHeaders.map(r => (
                  <TableCell key={r.key} className="text-center">
                    {perm[r.key as keyof Permission] ? (
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
