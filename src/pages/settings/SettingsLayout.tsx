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
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const settingsMenuItems = [
  { id: 'vehicle-types', label: 'ชนิดรถยนต์', icon: Car, path: '/settings/vehicle-types' },
  { id: 'models', label: 'รุ่น (Model)', icon: Layers, path: '/settings/models' },
  { id: 'submodels', label: 'รุ่นย่อย (Sub Model)', icon: Layers, path: '/settings/submodels' },
  { id: 'colors', label: 'สี', icon: Palette, path: '/settings/colors' },
  { id: 'engine-sizes', label: 'ขนาด/กำลังเครื่องยนต์', icon: Gauge, path: '/settings/engine-sizes' },
  { id: 'fuel-types', label: 'ประเภทเชื้อเพลิง', icon: Fuel, path: '/settings/fuel-types' },
  { id: 'standard-prices', label: 'ราคามาตรฐานตามรุ่นรถ', icon: DollarSign, path: '/settings/standard-prices' },
  { id: 'freebies', label: 'ของแถม', icon: Gift, path: '/settings/freebies' },
  { id: 'accessories', label: 'อุปกรณ์ติดตั้งเพิ่มเติม', icon: Wrench, path: '/settings/accessories' },
  { id: 'benefits', label: 'สิทธิ์ประโยชน์อื่นๆ', icon: Award, path: '/settings/benefits' },
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
                      <Icon className="w-4 h-4" />
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
