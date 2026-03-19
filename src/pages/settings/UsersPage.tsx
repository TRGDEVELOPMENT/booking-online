import { useState, useEffect } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserWithRole {
  user_id: string;
  full_name: string;
  company_id: string;
  branch_id: string | null;
  roles: string[];
}

export default function UsersPage() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.company_id) return;
    fetchUsers();
  }, [profile?.company_id]);

  const fetchUsers = async () => {
    setLoading(true);
    // Fetch profiles for the same company
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, full_name, company_id, branch_id')
      .eq('company_id', profile?.company_id || '');

    if (profiles) {
      // Fetch roles for each user
      const usersWithRoles: UserWithRole[] = await Promise.all(
        profiles.map(async (p) => {
          const { data: rolesData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', p.user_id);
          return {
            ...p,
            roles: rolesData?.map(r => r.role) || [],
          };
        })
      );
      setUsers(usersWithRoles);
    }
    setLoading(false);
  };

  const filteredUsers = users.filter(u =>
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleLabels: Record<string, string> = {
    sale: 'พนักงานขาย',
    cashier: 'แคชเชียร์',
    sale_supervisor: 'หัวหน้าทีมขาย',
    sale_manager: 'ผู้จัดการฝ่ายขาย',
    it: 'IT Admin',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ผู้ใช้งาน</h1>
          <p className="text-muted-foreground">จัดการข้อมูลผู้ใช้งานในระบบ</p>
        </div>
        <Button disabled>
          <UserPlus className="w-4 h-4 mr-2" />
          เพิ่มผู้ใช้งาน
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาชื่อผู้ใช้งาน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">ลำดับ</TableHead>
              <TableHead>ชื่อ-สกุล</TableHead>
              <TableHead>บริษัท</TableHead>
              <TableHead>สาขา</TableHead>
              <TableHead>บทบาท</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  กำลังโหลด...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user, index) => (
                <TableRow key={user.user_id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.company_id}</TableCell>
                  <TableCell>{user.branch_id || '-'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map(role => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {roleLabels[role] || role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
