import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  List,
  ClipboardList,
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
  GitBranch,
  Smartphone,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { companies } from '@/data/mockData';
import { useAuth } from '@/hooks/useAuth';
import { getCurrentStageRole, isActionableForRole } from '@/lib/reservationStage';
import type { DatabaseReservation } from '@/types/database-reservation';
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
  roles?: string[]; // If set, only these roles can see this menu (empty = everyone)
}

const isPublished = window.location.hostname === 'booking-online.lovable.app';

const devMenuIds = ['function-overview', 'test-cases', 'documentation', 'api-spec'];

const allMenuItems: MenuItem[] = [
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
    id: 'test-cases', 
    label: 'Test Cases', 
    icon: ClipboardList, 
    path: '/test-cases' 
  },
  { 
    id: 'reservations', 
    label: 'ใบจองรถยนต์', 
    icon: FileText, 
    path: '/reservations',
    subItems: [
      { id: 'list', label: 'รายการใบจอง', path: '/reservations', icon: List },
      { id: 'create', label: 'สร้างใบจองใหม่', path: '/reservations/create', icon: FilePlus2 },
      { id: 'customer-confirm-preview', label: 'ยืนยันสัญญาจอง (Customer View)', path: '/reservations/customer-confirm-preview', icon: Smartphone, roles: ['sale', 'sale_supervisor', 'sale_manager', 'it', 'user_admin'] },
      { id: 'approval-chain', label: 'เปลี่ยนสายอนุมัติของใบจอง', path: '/reservations/approval-chain', icon: GitBranch, roles: ['user_admin', 'it'] },
      { id: 'cancel-approval-chain', label: 'เปลี่ยนสายอนุมัติยกเลิกใบจอง', path: '/reservations/cancel-approval-chain', icon: GitBranch, roles: ['user_admin', 'it'] },
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
    path: '/reservations/cancel',
    roles: ['sale', 'sale_supervisor', 'sale_manager', 'it', 'user_admin'],
    subItems: [
      { id: 'cancel-list', label: 'รายการยกเลิกใบจอง', path: '/reservations/cancel', icon: List },
      { id: 'cancel-approve', label: 'อนุมัติยกเลิกใบจอง', path: '/reservations/cancel-approve', icon: Award, roles: ['sale_manager', 'it', 'user_admin'] },
    ],
  },
  { 
    id: 'reports', 
    label: 'รายงาน', 
    icon: BarChart3, 
    path: '/reports',
    roles: ['sale_supervisor', 'sale_manager', 'it'],
    subItems: [
      { id: 'monthly', label: 'รายงานการจองประจำเดือน', path: '/reports/monthly', icon: CalendarDays },
      { id: 'pending-approval', label: 'รายงานการจองที่ยังไม่อนุมัติ', path: '/reports/pending-approval', icon: Clock },
      { id: 'cancelled', label: 'รายงานการยกเลิกการจอง', path: '/reports/cancelled', icon: Ban },
    ]
  },
  { 
    id: 'user-management', 
    label: 'จัดการผู้ใช้งาน', 
    icon: Users, 
    path: '/settings/users',
    roles: ['user_admin', 'it'],
    subItems: [
      { id: 'users', label: 'ผู้ใช้งาน', path: '/settings/users', icon: User },
      { id: 'user-groups', label: 'กลุ่มผู้ใช้งาน', path: '/settings/user-groups', icon: Users },
      { id: 'user-permissions', label: 'กำหนดสิทธิ์ผู้ใช้งาน', path: '/settings/user-permissions', icon: Award },
      { id: 'approval-chain', label: 'ปรับปรุงสายอนุมัติใบจอง', path: '/settings/approval-chain', icon: GitBranch },
      { id: 'cancel-approval-chain', label: 'ปรับปรุงสายอนุมัติยกเลิกใบจอง', path: '/settings/cancel-approval-chain', icon: GitBranch },
      { id: 'sales-teams', label: 'ปรับปรุงทีมขาย', path: '/settings/sales-teams', icon: Users },
    ]
  },
  { 
    id: 'settings', 
    label: 'ตั้งค่าระบบ', 
    icon: Settings, 
    path: '/settings',
    roles: ['user_admin', 'it'],
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
      { id: 'branches', label: 'สาขา', path: '/settings/branches', icon: Building2 },
      { id: 'installment-periods', label: 'ระยะเวลาผ่อน', path: '/settings/installment-periods', icon: CalendarDays },
    ]
  },
  { 
    id: 'documentation', 
    label: 'เอกสารโครงการ', 
    icon: BookOpen, 
    path: '/docs' 
  },
  { 
    id: 'requirement-spec', 
    label: 'Requirement Spec', 
    icon: BookOpen, 
    path: '/requirement-spec' 
  },
  { 
    id: 'design-doc', 
    label: 'Design Document', 
    icon: BookOpen, 
    path: '/design-doc' 
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
  const [actionableCount, setActionableCount] = useState(0);
  const [pendingCancelCount, setPendingCancelCount] = useState(0);

  // Check if user is a cashier
  const isCashier = hasRole('cashier');
  const currentRole = roles[0]?.role || '';
  const isAdminViewer = hasRole('it') || hasRole('user_admin');
  const isManager = hasRole('sale_manager');

  // Fetch count of reservations awaiting action by the current role
  useEffect(() => {
    if (!selectedCompany || !currentRole || isAdminViewer) {
      setActionableCount(0);
      return;
    }
    let cancelled = false;
    const fetchCount = async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select('id, status, confirmation_status, review_status, approval_status, cancel_approval_status, cashier_user_id')
        .eq('company_id', selectedCompany);
      if (cancelled || error || !data) return;
      const count = data.filter((r: any) => {
        const stageRole = getCurrentStageRole(r as DatabaseReservation);
        return isActionableForRole(stageRole, currentRole);
      }).length;
      setActionableCount(count);
    };
    fetchCount();

    // Realtime: refresh badge whenever any reservation in this company changes
    const channel = supabase
      .channel(`sidebar-reservations-${selectedCompany}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations', filter: `company_id=eq.${selectedCompany}` },
        () => { fetchCount(); }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [selectedCompany, currentRole, isAdminViewer, location.pathname]);

  // Fetch count of cancellation requests pending for sale_manager approval
  useEffect(() => {
    if (!selectedCompany || !isManager) {
      setPendingCancelCount(0);
      return;
    }
    let cancelled = false;
    const fetchCancelCount = async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select('id, status, cancel_request_status, cancel_approval_status')
        .eq('company_id', selectedCompany)
        .eq('cancel_request_status', 'requested')
        .neq('status', 'cancelled');
      if (cancelled || error || !data) return;
      const count = data.filter((r: any) => r.cancel_approval_status !== 'approved').length;
      setPendingCancelCount(count);
    };
    fetchCancelCount();

    const channel = supabase
      .channel(`sidebar-cancel-${selectedCompany}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations', filter: `company_id=eq.${selectedCompany}` },
        () => { fetchCancelCount(); }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [selectedCompany, isManager, location.pathname]);

  // Filter subItems based on role
  const filterSubItemsByRole = (subItems?: SubItem[]) => {
    if (!subItems) return [];
    return subItems.filter(subItem => {
      if (!subItem.roles || subItem.roles.length === 0) return true;
      return subItem.roles.some(role => hasRole(role as any));
    });
  };
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId) ? [] : [menuId]
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
      'user_admin': 'ผู้ดูแลระบบ',
      'it': 'IT',
    };
    return roleMap[role] || role;
  };

  // Filter top-level menu items by role
  // IT can see everything; other roles check the `roles` property
  const isIT = hasRole('it');
  const filterMenuByRole = (items: MenuItem[]) => {
    return items.filter(item => {
      if (isIT) return true; // IT sees all
      if (!item.roles || item.roles.length === 0) return true; // No restriction
      return item.roles.some(role => hasRole(role as any));
    });
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
        "fixed lg:sticky lg:top-0 inset-y-0 left-0 z-40 w-72 h-screen lg:h-screen bg-sidebar flex flex-col shadow-xl transition-transform duration-300 shrink-0",
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
        <nav className="flex-1 p-4 overflow-y-auto sidebar-scroll">
          <ul className="space-y-1">
            {filterMenuByRole(allMenuItems.filter(item => !isPublished || !devMenuIds.includes(item.id))).map(item => {
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
                          {filteredSubItems.map(subItem => {
                            const SubIcon = subItem.icon;
                            return (
                              <li key={subItem.id}>
                                <Link
                                  to={subItem.path}
                                  onClick={() => setIsMobileOpen(false)}
                                  className={cn(
                                    "sidebar-item text-sm justify-between",
                                    location.pathname === subItem.path && "sidebar-item-active"
                                  )}
                                >
                                  <span className="flex items-center gap-3">
                                    {SubIcon && <SubIcon className="w-4 h-4" />}
                                    {subItem.label}
                                  </span>
                                  {subItem.id === 'list' && actionableCount > 0 && (
                                    <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold leading-none">
                                      {actionableCount > 99 ? '99+' : actionableCount}
                                    </span>
                                  )}
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

        {/* Role Switcher for Review */}
        <div className="px-4 pt-4 pb-2 border-t border-sidebar-border">
          <label className="text-xs text-sidebar-foreground/50 mb-1.5 block">สลับ Role (Review Mode)</label>
          <Select
            value={roles[0]?.role || ''}
            onValueChange={async (newRole) => {
              try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;
                const res = await supabase.functions.invoke('switch-role', {
                  body: { role: newRole },
                });
                if (res.error) {
                  console.error('Switch role error:', res.error);
                  return;
                }
                window.location.reload();
              } catch (err) {
                console.error('Switch role error:', err);
              }
            }}
          >
            <SelectTrigger className="h-8 text-xs bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                { value: 'sale', label: 'ที่ปรึกษาการขาย (Sale)' },
                { value: 'cashier', label: 'แคชเชียร์ (Cashier)' },
                { value: 'sale_supervisor', label: 'หัวหน้าทีมขาย (Supervisor)' },
                { value: 'sale_manager', label: 'ผจก.ฝ่ายขาย (Manager)' },
                { value: 'user_admin', label: 'ผู้ดูแลระบบ (User Admin)' },
                { value: 'it', label: 'IT Admin' },
              ].map(r => (
                <SelectItem key={r.value} value={r.value} className="text-xs">{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

      </aside>
    </>
  );
}
