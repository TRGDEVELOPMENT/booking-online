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
  Building2,
  UserCog,
  Shield,
  KeyRound,
  ChevronDown,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  color: string;
}

interface MenuGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  children: MenuItem[];
}

type MenuEntry = MenuItem | MenuGroup;

function isMenuGroup(entry: MenuEntry): entry is MenuGroup {
  return 'children' in entry;
}

const settingsMenuItems: MenuEntry[] = [
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
  { id: 'branches', label: 'สาขา', icon: Building2, path: '/settings/branches', color: 'text-slate-500' },
  {
    id: 'user-management',
    label: 'จัดการผู้ใช้งาน',
    icon: UserCog,
    color: 'text-purple-500',
    children: [
      { id: 'users', label: 'ผู้ใช้งาน', icon: Users, path: '/settings/users', color: 'text-purple-500' },
      { id: 'user-groups', label: 'กลุ่มผู้ใช้งาน', icon: Shield, path: '/settings/user-groups', color: 'text-purple-400' },
      { id: 'user-permissions', label: 'กำหนดสิทธิ์ผู้ใช้งาน', icon: KeyRound, path: '/settings/user-permissions', color: 'text-purple-300' },
    ],
  },
];

export default function SettingsLayout() {
  const location = useLocation();
  
  const userMgmtGroup = settingsMenuItems.find(e => isMenuGroup(e) && e.id === 'user-management') as MenuGroup | undefined;
  const isUserMgmtActive = userMgmtGroup?.children.some(c => location.pathname === c.path) ?? false;
  const [userMgmtOpen, setUserMgmtOpen] = useState(isUserMgmtActive);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      <aside className="lg:w-64 flex-shrink-0">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-4 px-2">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">ตั้งค่าระบบ</h2>
          </div>
          <nav>
            <ul className="space-y-1">
              {settingsMenuItems.map(entry => {
                if (isMenuGroup(entry)) {
                  const GroupIcon = entry.icon;
                  const isOpen = userMgmtOpen || isUserMgmtActive;
                  return (
                    <li key={entry.id}>
                      <button
                        onClick={() => setUserMgmtOpen(!isOpen)}
                        className={cn(
                          "flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors",
                          isUserMgmtActive
                            ? "text-primary font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <GroupIcon className={cn("w-4 h-4", entry.color)} />
                          {entry.label}
                        </span>
                        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
                      </button>
                      {isOpen && (
                        <ul className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                          {entry.children.map(child => {
                            const ChildIcon = child.icon;
                            const isChildActive = location.pathname === child.path;
                            return (
                              <li key={child.id}>
                                <Link
                                  to={child.path}
                                  className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                                    isChildActive
                                      ? "bg-primary text-primary-foreground"
                                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                  )}
                                >
                                  <ChildIcon className={cn("w-4 h-4", isChildActive ? "text-primary-foreground" : child.color)} />
                                  {child.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                }

                const Icon = entry.icon;
                const isActive = location.pathname === (entry as MenuItem).path;
                return (
                  <li key={entry.id}>
                    <Link
                      to={(entry as MenuItem).path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                        isActive 
                          ? "bg-primary text-primary-foreground" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className={cn("w-4 h-4", isActive ? "text-primary-foreground" : entry.color)} />
                      {(entry as MenuItem).label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
