import { useState } from 'react';
import { Check, X, Pencil, Save, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

interface Permission {
  feature: string;
  sale: boolean;
  cashier: boolean;
  sale_supervisor: boolean;
  sale_manager: boolean;
  user_admin: boolean;
  it: boolean;
}

const defaultPermissions: Permission[] = [
  { feature: 'สร้างใบจอง', sale: true, cashier: false, sale_supervisor: true, sale_manager: true, user_admin: false, it: true },
  { feature: 'แก้ไขใบจอง', sale: true, cashier: false, sale_supervisor: true, sale_manager: true, user_admin: false, it: true },
  { feature: 'ตรวจสอบใบจอง (Review)', sale: false, cashier: false, sale_supervisor: true, sale_manager: false, user_admin: false, it: true },
  { feature: 'อนุมัติใบจอง (Approve)', sale: false, cashier: false, sale_supervisor: false, sale_manager: true, user_admin: false, it: true },
  { feature: 'ยืนยันรับเงิน (Payment)', sale: false, cashier: true, sale_supervisor: false, sale_manager: false, user_admin: false, it: true },
  { feature: 'ขอยกเลิกใบจอง', sale: true, cashier: false, sale_supervisor: true, sale_manager: true, user_admin: false, it: true },
  { feature: 'ตรวจสอบการยกเลิก', sale: false, cashier: false, sale_supervisor: true, sale_manager: false, user_admin: false, it: true },
  { feature: 'อนุมัติการยกเลิก', sale: false, cashier: false, sale_supervisor: false, sale_manager: true, user_admin: false, it: true },
  { feature: 'ตั้งค่าข้อมูลหลัก', sale: false, cashier: false, sale_supervisor: false, sale_manager: true, user_admin: false, it: true },
  { feature: 'จัดการผู้ใช้งาน', sale: false, cashier: false, sale_supervisor: false, sale_manager: false, user_admin: true, it: true },
  { feature: 'ดูรายงาน', sale: true, cashier: true, sale_supervisor: true, sale_manager: true, user_admin: false, it: true },
];

const roleHeaders = [
  { key: 'sale', label: 'พนักงานขาย' },
  { key: 'cashier', label: 'แคชเชียร์' },
  { key: 'sale_supervisor', label: 'หัวหน้าทีมขาย' },
  { key: 'sale_manager', label: 'ผจก.ฝ่ายขาย' },
  { key: 'user_admin', label: 'ผู้ดูแลระบบ' },
  { key: 'it', label: 'IT Admin' },
];

export default function UserPermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>(defaultPermissions);
  const [isEditing, setIsEditing] = useState(false);
  const [backup, setBackup] = useState<Permission[]>([]);

  const handleEdit = () => {
    setBackup(permissions.map(p => ({ ...p })));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setPermissions(backup);
    setIsEditing(false);
  };

  const handleSave = () => {
    setIsEditing(false);
    toast.success('บันทึกสิทธิ์ผู้ใช้งานเรียบร้อย');
  };

  const togglePermission = (featureIndex: number, roleKey: string) => {
    setPermissions(prev => prev.map((p, i) => {
      if (i !== featureIndex) return p;
      return { ...p, [roleKey]: !p[roleKey as keyof Permission] };
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">กำหนดสิทธิ์ผู้ใช้งาน</h1>
          <p className="text-muted-foreground">ตารางแสดงสิทธิ์การเข้าถึงฟีเจอร์ตามกลุ่มผู้ใช้งาน</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} className="gap-2">
                <XCircle className="w-4 h-4" />
                ยกเลิก
              </Button>
              <Button onClick={handleSave} className="gap-2 btn-primary-gradient">
                <Save className="w-4 h-4" />
                บันทึก
              </Button>
            </>
          ) : (
            <Button onClick={handleEdit} className="gap-2 btn-primary-gradient">
              <Pencil className="w-4 h-4" />
              แก้ไขสิทธิ์
            </Button>
          )}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border/50 overflow-auto shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="table-header">
              <TableHead className="min-w-[200px] sticky left-0 bg-secondary z-10 font-semibold text-primary">ฟีเจอร์</TableHead>
              {roleHeaders.map(r => (
                <TableHead key={r.key} className="text-center min-w-[120px] font-semibold text-primary">{r.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map((perm, index) => (
              <TableRow key={perm.feature} className="hover:bg-muted/30">
                <TableCell className="font-medium sticky left-0 bg-card z-10">{perm.feature}</TableCell>
                {roleHeaders.map(r => (
                  <TableCell key={r.key} className="text-center">
                    {isEditing ? (
                      <Checkbox
                        checked={!!perm[r.key as keyof Permission]}
                        onCheckedChange={() => togglePermission(index, r.key)}
                        className="mx-auto"
                      />
                    ) : (
                      perm[r.key as keyof Permission] ? (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />
                      )
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
