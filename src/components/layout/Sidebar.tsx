import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  List,
  Ban,
  FilePlus2, 
  Users, 
  Car, 
  Settings, 
  BarChart3,
  Building2,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Layers,
  Palette,
  Gauge,
  Fuel,
  DollarSign,
  Gift,
  Wrench,
  Award,
  User,
  CalendarDays,
  Clock,
  Wallet,
  BookOpen,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { companies } from '@/data/mockData';
import { useAuth } from '@/hooks/useAuth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SidebarProps {
  selectedCompany: string;
  onCompanyChange: (companyId: string) => void;
}

interface SubItem {
  id: string;
  label: string;
  path: string;
  icon?: LucideIcon;
  roles?: string[]; // Optional: restrict to specific roles
}

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  subItems?: SubItem[];
}

const menuItems: MenuItem[] = [
  { 
    id: 'dashboard', 
    label: 'แดชบอร์ด', 
    icon: LayoutDashboard, 
    path: '/' 
  },
  { 
    id: 'function-overview', 
    label: 'Function Overview', 
    icon: Layers, 
    path: '/function-overview' 
  },
  { 
    id: 'reservations', 
    label: 'ใบจองรถยนต์', 
    icon: FileText, 
    path: '/reservations',
    subItems: [
      { id: 'list', label: 'รายการใบจอง', path: '/reservations', icon: List },
      { id: 'create', label: 'สร้างใบจองใหม่', path: '/reservations/create', icon: FilePlus2 },
      { id: 'pending-payment', label: 'ใบจองรอยืนยันรับเงิน', path: '/reservations/pending-payment', icon: Wallet, roles: ['cashier'] },
    ]
  },
  { 
    id: 'customers', 
    label: 'ข้อมูลลูกค้า', 
    icon: Users, 
    path: '/settings/customers' 
  },
  { 
    id: 'cancelled', 
    label: 'ยกเลิกใบจอง', 
    icon: Ban, 
    path: '/reservations/cancel' 
  },
  { 
    id: 'reports', 
    label: 'รายงาน', 
    icon: BarChart3, 
    path: '/reports',
    subItems: [
      { id: 'monthly', label: 'รายงานการจองประจำเดือน', path: '/reports/monthly', icon: CalendarDays },
      { id: 'pending-approval', label: 'รายงานการจองที่ยังไม่อนุมัติ', path: '/reports/pending-approval', icon: Clock },
      { id: 'cancelled', label: 'รายงานการยกเลิกการจอง', path: '/reports/cancelled', icon: Ban },
    ]
  },
  { 
    id: 'settings', 
    label: 'ตั้งค่าระบบ', 
    icon: Settings, 
    path: '/settings',
    subItems: [
      { id: 'vehicle-types', label: 'ชนิดรถยนต์', path: '/settings/vehicle-types', icon: Car },
      { id: 'models', label: 'รุ่น (Model)', path: '/settings/models', icon: Layers },
      { id: 'submodels', label: 'รุ่นย่อย (Sub Model)', path: '/settings/submodels', icon: Layers },
      { id: 'colors', label: 'สี', path: '/settings/colors', icon: Palette },
      { id: 'engine-sizes', label: 'ขนาด/กำลังเครื่องยนต์', path: '/settings/engine-sizes', icon: Gauge },
      { id: 'fuel-types', label: 'ประเภทเชื้อเพลิง', path: '/settings/fuel-types', icon: Fuel },
      { id: 'standard-prices', label: 'ราคามาตรฐาน', path: '/settings/standard-prices', icon: DollarSign },
      { id: 'freebies', label: 'ของแถม', path: '/settings/freebies', icon: Gift },
      { id: 'accessories', label: 'อุปกรณ์ตกแต่ง', path: '/settings/accessories', icon: Wrench },
      { id: 'benefits', label: 'สิทธิประโยชน์', path: '/settings/benefits', icon: Award },
      { id: 'surnames', label: 'คำนำหน้าชื่อ', path: '/settings/surnames', icon: User },
    ]
  },
  { 
    id: 'documentation', 
    label: 'เอกสารโครงการ', 
    icon: BookOpen, 
    path: '/docs' 
  },
  { 
    id: 'api-spec', 
    label: 'API Specification', 
    icon: BookOpen, 
    path: '/api-spec' 
  },
];

export function Sidebar({ selectedCompany, onCompanyChange }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, roles, signOut, hasRole } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['reservations']);
  
  // Check if user is a cashier
  const isCashier = hasRole('cashier');
  
  // Filter subItems based on role
  const filterSubItemsByRole = (subItems?: SubItem[]) => {
    if (!subItems) return [];
    return subItems.filter(subItem => {
      // If no role restriction, show to everyone
      if (!subItem.roles || subItem.roles.length === 0) return true;
      // Check if user has any of the required roles
      return subItem.roles.some(role => hasRole(role as any));
    });
  };
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const selectedCompanyData = companies.find(c => c.id === selectedCompany);
  
  // Get company name from selectedCompany (login selection)
  const displayCompany = companies.find(c => c.id === selectedCompany);

  // Map role to Thai display name
  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'sale': 'ที่ปรึกษาการขาย',
      'cashier': 'แคชเชียร์',
      'sale_supervisor': 'หัวหน้าทีมขาย',
      'sale_manager': 'ผู้จัดการฝ่ายขาย',
      'it': 'IT',
    };
    return roleMap[role] || role;
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-sidebar text-sidebar-foreground shadow-lg"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 w-72 bg-sidebar flex flex-col shadow-xl transition-transform duration-300",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header with Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-vivid to-accent flex items-center justify-center shadow-lg">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">
                {displayCompany?.name || 'ชื่อบริษัท'}
              </h1>
              <p className="text-xs text-sidebar-foreground/60">ระบบบันทึกจอง Online</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const filteredSubItems = filterSubItemsByRole(item.subItems);
              const hasSubItems = filteredSubItems.length > 0;
              const isExpanded = expandedMenus.includes(item.id);
              const active = isActive(item.path);

              return (
                <li key={item.id}>
                  {hasSubItems ? (
                    <>
                      <button
                        onClick={() => {
                          toggleMenu(item.id);
                          navigate(item.path);
                          setIsMobileOpen(false);
                        }}
                        className={cn(
                          "sidebar-item w-full justify-between",
                          active && "sidebar-item-active"
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          {item.label}
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      {isExpanded && (
                        <ul className="mt-1 ml-4 pl-4 border-l border-sidebar-border space-y-1">
                          {filteredSubItems.map(subItem => {
                            const SubIcon = subItem.icon;
                            return (
                              <li key={subItem.id}>
                                <Link
                                  to={subItem.path}
                                  onClick={() => setIsMobileOpen(false)}
                                  className={cn(
                                    "sidebar-item text-sm",
                                    location.pathname === subItem.path && "sidebar-item-active"
                                  )}
                                >
                                  {SubIcon && <SubIcon className="w-4 h-4" />}
                                  {subItem.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "sidebar-item",
                        active && "sidebar-item-active"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-vivid to-primary flex items-center justify-center text-white font-semibold">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {profile?.full_name || 'ผู้ใช้งาน'}
              </p>
              <p className="text-xs text-sidebar-foreground/60">
                {roles[0] ? getRoleDisplayName(roles[0].role) : 'ไม่ระบุตำแหน่ง'}
              </p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-sidebar-border transition-colors text-sidebar-foreground/60 hover:text-sidebar-foreground"
              title="ออกจากระบบ"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
