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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [email, setEmail] = useState('');
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

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.user) {
        // Update user's profile with selected company
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ company_id: company })
          .eq('user_id', data.user.id);

        if (updateError) {
          console.error('Failed to update company:', updateError);
        }

        // Save selected company to localStorage
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
              <Label htmlFor="email">ชื่อผู้ใช้งาน</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              บัญชีทดสอบตาม Role
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>ที่ปรึกษาการขาย:</strong> sale@test.com</p>
              <p><strong>แคชเชียร์:</strong> cashier@test.com</p>
              <p><strong>หัวหน้าทีมขาย:</strong> supervisor@test.com</p>
              <p><strong>ผู้จัดการฝ่ายขาย:</strong> manager@test.com</p>
              <p><strong>ผู้ดูแลระบบ:</strong> useradmin@test.com</p>
              <p><strong>IT:</strong> it@test.com</p>
              <p className="mt-2 text-center">รหัสผ่าน: <strong>Test1234!</strong></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
