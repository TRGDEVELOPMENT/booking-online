import { useOutletContext } from 'react-router-dom';
import { 
  FileText, 
  FileCheck, 
  Clock, 
  XCircle, 
  TrendingUp,
  Car,
  Users,
  Wallet
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentReservations } from '@/components/dashboard/RecentReservations';
import { WorkflowOverview } from '@/components/dashboard/WorkflowOverview';
import { companies, reservationSummary, monthlyStats } from '@/data/mockData';

export default function Dashboard() {
  const { selectedCompany } = useOutletContext<{ selectedCompany: string }>();
  const company = companies.find(c => c.id === selectedCompany);

  return (
    <>
      <Header 
        title={`แดชบอร์ด - ${company?.name || ''}`}
        subtitle="ภาพรวมระบบใบจองรถยนต์"
      />
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="ใบจองทั้งหมด"
              value={reservationSummary.total}
              subtitle="เดือนนี้"
              icon={FileText}
              variant="primary"
              trend={{ value: 12.5, isPositive: true }}
            />
            <StatCard
              title="สมบูรณ์"
              value={reservationSummary.final}
              icon={FileCheck}
              variant="success"
            />
            <StatCard
              title="รอดำเนินการ"
              value={reservationSummary.draft}
              icon={Clock}
              variant="warning"
            />
            <StatCard
              title="ยกเลิก"
              value={reservationSummary.cancelled}
              icon={XCircle}
              variant="danger"
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="มูลค่ารวม"
              value={`฿${(reservationSummary.totalAmount / 1000000).toFixed(1)}M`}
              subtitle="ยอดรวมใบจองที่สมบูรณ์"
              icon={Wallet}
            />
            <StatCard
              title="รถจองแล้ว"
              value="89"
              subtitle="รอส่งมอบ"
              icon={Car}
            />
            <StatCard
              title="ลูกค้าใหม่"
              value="34"
              subtitle="เดือนนี้"
              icon={Users}
              trend={{ value: 8.3, isPositive: true }}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Reservations - Takes 2 columns */}
            <div className="lg:col-span-2">
              <RecentReservations />
            </div>

            {/* Workflow Overview */}
            <div className="lg:col-span-1">
              <WorkflowOverview />
            </div>
          </div>

          {/* Monthly Stats Chart Placeholder */}
          <div className="bg-card rounded-xl border border-border/50 p-6 shadow-card">
            <h2 className="text-lg font-semibold text-foreground mb-4">สถิติรายเดือน</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {monthlyStats.map((stat) => (
                <div key={stat.month} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">{stat.month}</span>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.reservations}</p>
                  <p className="text-sm text-muted-foreground">
                    ฿{(stat.amount / 1000000).toFixed(1)}M
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
