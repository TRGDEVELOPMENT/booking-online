import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Car, 
  Layers, 
  Palette, 
  Gauge, 
  Fuel, 
  DollarSign, 
  Gift, 
  Wrench, 
  Award,
  Settings,
  User,
  Users,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  color: string;
}

const settingsMenuItems: MenuItem[] = [
  { id: 'vehicle-types', label: 'ชนิดรถยนต์', icon: Car, path: '/settings/vehicle-types', color: 'text-blue-500' },
  { id: 'models', label: 'รุ่น (Model)', icon: Layers, path: '/settings/models', color: 'text-indigo-500' },
  { id: 'submodels', label: 'รุ่นย่อย (Sub Model)', icon: Layers, path: '/settings/submodels', color: 'text-violet-500' },
  { id: 'colors', label: 'สี', icon: Palette, path: '/settings/colors', color: 'text-pink-500' },
  { id: 'engine-sizes', label: 'ขนาด/กำลังเครื่องยนต์', icon: Gauge, path: '/settings/engine-sizes', color: 'text-orange-500' },
  { id: 'fuel-types', label: 'ประเภทเชื้อเพลิง', icon: Fuel, path: '/settings/fuel-types', color: 'text-green-500' },
  { id: 'standard-prices', label: 'ราคามาตรฐานตามรุ่นรถ', icon: DollarSign, path: '/settings/standard-prices', color: 'text-emerald-500' },
  { id: 'freebies', label: 'ของแถม', icon: Gift, path: '/settings/freebies', color: 'text-red-500' },
  { id: 'accessories', label: 'อุปกรณ์ติดตั้งเพิ่มเติม', icon: Wrench, path: '/settings/accessories', color: 'text-amber-500' },
  { id: 'benefits', label: 'สิทธิ์ประโยชน์อื่นๆ', icon: Award, path: '/settings/benefits', color: 'text-yellow-500' },
  { id: 'surnames', label: 'คำนำหน้าชื่อ', icon: User, path: '/settings/surnames', color: 'text-cyan-500' },
  { id: 'customers', label: 'ข้อมูลลูกค้า', icon: Users, path: '/settings/customers', color: 'text-teal-500' },
];

export default function SettingsLayout() {
  const location = useLocation();

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Settings Sidebar */}
      <aside className="lg:w-64 flex-shrink-0">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-4 px-2">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">ตั้งค่าระบบ</h2>
          </div>
          <nav>
            <ul className="space-y-1">
              {settingsMenuItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <li key={item.id}>
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                        isActive 
                          ? "bg-primary text-primary-foreground" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className={cn("w-4 h-4", isActive ? "text-primary-foreground" : item.color)} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
