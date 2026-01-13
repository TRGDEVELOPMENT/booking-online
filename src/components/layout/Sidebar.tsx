import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  FilePlus, 
  Users, 
  Car, 
  Settings, 
  BarChart3,
  Building2,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { companies } from '@/data/mockData';
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

const menuItems = [
  { 
    id: 'dashboard', 
    label: 'แดชบอร์ด', 
    icon: LayoutDashboard, 
    path: '/' 
  },
  { 
    id: 'reservations', 
    label: 'ใบจองรถยนต์', 
    icon: FileText, 
    path: '/reservations',
    subItems: [
      { id: 'list', label: 'รายการใบจอง', path: '/reservations' },
      { id: 'create', label: 'สร้างใบจองใหม่', path: '/reservations/create' },
    ]
  },
  { 
    id: 'customers', 
    label: 'ข้อมูลลูกค้า', 
    icon: Users, 
    path: '/customers' 
  },
  { 
    id: 'vehicles', 
    label: 'ข้อมูลรถยนต์', 
    icon: Car, 
    path: '/vehicles' 
  },
  { 
    id: 'reports', 
    label: 'รายงาน', 
    icon: BarChart3, 
    path: '/reports' 
  },
  { 
    id: 'settings', 
    label: 'ตั้งค่าระบบ', 
    icon: Settings, 
    path: '/settings' 
  },
];

export function Sidebar({ selectedCompany, onCompanyChange }: SidebarProps) {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['reservations']);
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
              <h1 className="text-lg font-bold text-sidebar-foreground">ชื่อบริษัท</h1>
              <p className="text-xs text-sidebar-foreground/60">ระบบใบจองรถยนต์</p>
            </div>
          </div>
        </div>

        {/* Company Selector */}
        <div className="p-4 border-b border-sidebar-border">
          <label className="text-xs text-sidebar-foreground/60 mb-2 block">
            เลือกบริษัท
          </label>
          <Select value={selectedCompany} onValueChange={onCompanyChange}>
            <SelectTrigger className="w-full bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <SelectValue placeholder="เลือกบริษัท" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {companies.map(company => (
                <SelectItem key={company.id} value={company.id}>
                  <span className="font-medium">{company.code}</span>
                  <span className="text-muted-foreground ml-2 text-sm">- {company.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isExpanded = expandedMenus.includes(item.id);
              const active = isActive(item.path);

              return (
                <li key={item.id}>
                  {hasSubItems ? (
                    <>
                      <button
                        onClick={() => toggleMenu(item.id)}
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
                          {item.subItems.map(subItem => (
                            <li key={subItem.id}>
                              <Link
                                to={subItem.path}
                                onClick={() => setIsMobileOpen(false)}
                                className={cn(
                                  "sidebar-item text-sm",
                                  location.pathname === subItem.path && "sidebar-item-active"
                                )}
                              >
                                {subItem.label}
                              </Link>
                            </li>
                          ))}
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
              ส
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                สมชาย ใจดี
              </p>
              <p className="text-xs text-sidebar-foreground/60">
                ที่ปรึกษาการขาย
              </p>
            </div>
            <button className="p-2 rounded-lg hover:bg-sidebar-border transition-colors text-sidebar-foreground/60 hover:text-sidebar-foreground">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
