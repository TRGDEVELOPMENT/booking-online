import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, LogIn, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const companies = [
  { id: 'BPK', name: 'บริษัท บิซ พีเค จำกัด' },
  { id: 'LAC', name: 'บริษัท เลกซัส ออโต้ ซิตี้ จำกัด' },
  { id: 'ICCK', name: 'บริษัท อีซูซุชัยเจริญกิจมอเตอร์ส จำกัด' },
  { id: 'VPA', name: 'บริษัท วี.พี. ออโต้ เอ็นเตอร์ไพรส์ จำกัด' },
];

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!company) {
      toast.error('กรุณาเลือกบริษัท');
      return;
    }

    if (!username) {
      toast.error('กรุณากรอกรหัสพนักงาน');
      return;
    }

    setIsLoading(true);

    try {
      // Construct internal email from username (company-independent)
      // Lowercase + sanitize to match the format used during user creation
      const sanitizedUsername = username.toLowerCase().replace(/[^a-z0-9._-]/g, '');
      const internalEmail = `${sanitizedUsername}@app.internal`;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: internalEmail,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง');
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data.user) {
        // Check if user is IT Admin — IT can log into any company
        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id);
        const isIT = rolesData?.some(r => r.role === 'it') ?? false;

        const { data: profileData } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (isIT) {
          // IT Admin: sync the selected company into profile so it acts as the active context
          if (profileData && profileData.company_id !== company) {
            await supabase
              .from('profiles')
              .update({ company_id: company })
              .eq('user_id', data.user.id);
          }
        } else {
          // Non-IT users are strictly bound to their assigned company
          if (profileData && profileData.company_id !== company) {
            await supabase.auth.signOut();
            toast.error(`บัญชีนี้ไม่ได้สังกัดบริษัท ${company}`);
            return;
          }
        }

        localStorage.setItem('selectedCompany', company);
        toast.success('เข้าสู่ระบบสำเร็จ');
        navigate('/');
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-border/50">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-vivid to-accent flex items-center justify-center shadow-lg mb-4">
            <Car className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-blue-vivid to-accent bg-clip-text text-transparent">
            ระบบบันทึกจอง Online
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">เลือกบริษัท</Label>
              <Select value={company} onValueChange={setCompany}>
                <SelectTrigger id="company">
                  <SelectValue placeholder="เลือกบริษัท" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="font-medium">{c.id}</span>
                      <span className="text-muted-foreground ml-2">- {c.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">รหัสพนักงาน</Label>
              <Input
                id="username"
                type="text"
                placeholder="เช่น EMP001, somchai"
                value={username}
                onChange={(e) => setUsername(e.target.value.trim())}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  กำลังเข้าสู่ระบบ...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  เข้าสู่ระบบ
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground text-center mb-3">
              เข้าสู่ระบบ (บัญชีทดสอบ) {company && <span className="font-semibold text-foreground">— {company}</span>}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(() => {
                // Map company → list of test accounts (matches users created per branch)
                const companyAccounts: Record<string, Array<{ label: string; username: string; icon: string; role: string }>> = {
                  BPK: [
                    { label: 'ที่ปรึกษาการขาย', username: 'sale_bpk', icon: '👤', role: 'sale' },
                    { label: 'แคชเชียร์', username: 'cashier_bpk', icon: '💰', role: 'cashier' },
                    { label: 'หัวหน้าทีมขาย', username: 'sup_bpk', icon: '👨‍💼', role: 'sale_supervisor' },
                    { label: 'ผจก.ฝ่ายขาย', username: 'mgr_bpk', icon: '📋', role: 'sale_manager' },
                    { label: 'ผู้ดูแลระบบ', username: 'useradmin_bpk', icon: '🔧', role: 'user_admin' },
                    { label: 'IT Admin', username: 'itadmin_bpk', icon: '💻', role: 'it' },
                  ],
                  LAC: [
                    { label: 'ที่ปรึกษาการขาย', username: 'sale_lra', icon: '👤', role: 'sale' },
                    { label: 'แคชเชียร์', username: 'cashier_lra', icon: '💰', role: 'cashier' },
                    { label: 'หัวหน้าทีมขาย', username: 'sup_lra', icon: '👨‍💼', role: 'sale_supervisor' },
                    { label: 'ผจก.ฝ่ายขาย', username: 'mgr_lra', icon: '📋', role: 'sale_manager' },
                    { label: 'ผู้ดูแลระบบ', username: 'useradmin_lac', icon: '🔧', role: 'user_admin' },
                    { label: 'IT Admin', username: 'itadmin_lac', icon: '💻', role: 'it' },
                  ],
                  ICCK: [
                    { label: 'ที่ปรึกษาการขาย', username: 'sale_ick', icon: '👤', role: 'sale' },
                    { label: 'แคชเชียร์', username: 'cashier_ick', icon: '💰', role: 'cashier' },
                    { label: 'หัวหน้าทีมขาย', username: 'sup_ick', icon: '👨‍💼', role: 'sale_supervisor' },
                    { label: 'ผจก.ฝ่ายขาย', username: 'mgr_ick', icon: '📋', role: 'sale_manager' },
                    { label: 'ผู้ดูแลระบบ', username: 'useradmin_icck', icon: '🔧', role: 'user_admin' },
                    { label: 'IT Admin', username: 'itadmin_icck', icon: '💻', role: 'it' },
                  ],
                  VPA: [
                    { label: 'ที่ปรึกษาการขาย', username: 'sale_vpa', icon: '👤', role: 'sale' },
                    { label: 'แคชเชียร์', username: 'cashier_vpa', icon: '💰', role: 'cashier' },
                    { label: 'หัวหน้าทีมขาย', username: 'sup_vpa', icon: '👨‍💼', role: 'sale_supervisor' },
                    { label: 'ผจก.ฝ่ายขาย', username: 'mgr_vpa', icon: '📋', role: 'sale_manager' },
                    { label: 'ผู้ดูแลระบบ', username: 'useradmin_vpa', icon: '🔧', role: 'user_admin' },
                    { label: 'IT Admin', username: 'itadmin_vpa', icon: '💻', role: 'it' },
                  ],
                };
                const targetCompany = company || 'BPK';
                const accounts = companyAccounts[targetCompany] || companyAccounts.BPK;
                return accounts.map((acc) => (
                  <Button
                    key={acc.username}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs justify-start gap-1.5 h-9"
                    disabled={isLoading}
                    onClick={async () => {
                      if (!company) setCompany(targetCompany);
                      setUsername(acc.username);
                      setPassword('Test1234!');
                      setIsLoading(true);
                      try {
                        const { data, error } = await supabase.auth.signInWithPassword({
                          email: `${acc.username}@app.internal`,
                          password: 'Test1234!',
                        });
                        if (error) {
                          toast.error(`เข้าสู่ระบบไม่สำเร็จ: ${error.message}`);
                          return;
                        }
                        if (data.user) {
                          // Do NOT override company_id — each test account is pre-bound
                          // to its correct company. Just sync localStorage.
                          localStorage.setItem('selectedCompany', targetCompany);
                          toast.success(`เข้าสู่ระบบเป็น ${acc.label} (${targetCompany}) สำเร็จ`);
                          navigate('/');
                        }
                      } catch {
                        toast.error('เกิดข้อผิดพลาด');
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    <span>{acc.icon}</span>
                    {acc.label}
                  </Button>
                ));
              })()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
