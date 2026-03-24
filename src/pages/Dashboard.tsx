import { useOutletContext } from 'react-router-dom';
import { 
  FileText, 
  FileCheck, 
  Clock, 
  XCircle, 
  TrendingUp,
  TrendingDown,
  Plus,
  Download,
  Car,
  Wallet,
  Users,
  ArrowUpRight,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { companies, reservationSummary, monthlyStats, mockReservations } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
} from 'recharts';

// Sparkline mini component
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const lineData = data.map((v, i) => ({ v, i }));
  return (
    <div className="w-20 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={lineData}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// KPI data
const kpiCards = [
  {
    title: 'ใบจองทั้งหมด',
    value: reservationSummary.total,
    suffix: 'ใบ',
    icon: FileText,
    trend: 12.5,
    sparkData: [30, 35, 28, 42, 45, 52, 59],
    color: 'hsl(var(--primary))',
    bgClass: 'bg-primary/10',
    iconClass: 'text-primary',
  },
  {
    title: 'มูลค่ารวม',
    value: `฿${(reservationSummary.totalAmount / 1000000).toFixed(1)}M`,
    icon: Wallet,
    trend: 8.3,
    sparkData: [18, 22, 19, 25, 28, 32, 38],
    color: 'hsl(var(--success))',
    bgClass: 'bg-success/10',
    iconClass: 'text-success',
  },
  {
    title: 'สมบูรณ์',
    value: reservationSummary.final,
    suffix: 'ใบ',
    icon: FileCheck,
    trend: 5.2,
    sparkData: [20, 25, 22, 30, 35, 40, 45],
    color: 'hsl(var(--success))',
    bgClass: 'bg-success/10',
    iconClass: 'text-success',
  },
  {
    title: 'รอดำเนินการ',
    value: reservationSummary.draft,
    suffix: 'ใบ',
    icon: Clock,
    trend: -3.1,
    sparkData: [15, 18, 22, 20, 17, 14, 12],
    color: 'hsl(var(--warning))',
    bgClass: 'bg-warning/10',
    iconClass: 'text-warning',
  },
];

// Bar chart data
const barChartData = [
  { month: 'ม.ค.', reservations: 45, amount: 28.5 },
  { month: 'ก.พ.', reservations: 52, amount: 32.8 },
  { month: 'มี.ค.', reservations: 59, amount: 38.2 },
  { month: 'เม.ย.', reservations: 48, amount: 30.1 },
  { month: 'พ.ค.', reservations: 63, amount: 41.5 },
  { month: 'มิ.ย.', reservations: 55, amount: 35.7 },
];

const barChartConfig: ChartConfig = {
  reservations: { label: 'จำนวนใบจอง', color: 'hsl(var(--primary))' },
  amount: { label: 'มูลค่า (ล้านบาท)', color: 'hsl(var(--accent))' },
};

// Pie chart data
const pieData = [
  { name: 'รถยนต์นั่ง', value: 45, color: 'hsl(var(--primary))' },
  { name: 'รถ SUV/PPV', value: 25, color: 'hsl(var(--accent))' },
  { name: 'รถกระบะ', value: 20, color: 'hsl(var(--success))' },
  { name: 'รถ EV', value: 10, color: 'hsl(var(--warning))' },
];

// Recent activity from mock reservations
const recentActivity = mockReservations.slice(0, 5).map((r) => ({
  id: r.draftNo,
  customer: `${r.bookingCustomer.firstName} ${r.bookingCustomer.lastName}`,
  model: r.vehicleModelName,
  amount: r.finalVehiclePrice,
  status: r.documentStatus,
  date: new Date(r.createdAt).toLocaleDateString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  }),
}));

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  final: { label: 'สมบูรณ์', variant: 'default' },
  draft: { label: 'ร่าง', variant: 'secondary' },
  cancelled: { label: 'ยกเลิก', variant: 'destructive' },
  pending: { label: 'รอดำเนินการ', variant: 'outline' },
};

export default function Dashboard() {
  const { selectedCompany } = useOutletContext<{ selectedCompany: string }>();
  const company = companies.find((c) => c.id === selectedCompany);

  return (
    <>
      <Header
        title={`แดชบอร์ด - ${company?.name || ''}`}
        subtitle="ภาพรวมระบบใบจองรถยนต์"
      />

      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
          {/* Top Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-foreground">สรุปภาพรวม</h2>
              <p className="text-sm text-muted-foreground">ข้อมูลอัปเดตล่าสุด: วันนี้</p>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiCards.map((kpi) => (
              <Card key={kpi.title} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold text-foreground">
                          {kpi.value}
                        </span>
                        {kpi.suffix && (
                          <span className="text-sm text-muted-foreground">{kpi.suffix}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {kpi.trend > 0 ? (
                          <TrendingUp className="w-3.5 h-3.5 text-success" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                        )}
                        <span
                          className={`text-xs font-medium ${
                            kpi.trend > 0 ? 'text-success' : 'text-destructive'
                          }`}
                        >
                          {kpi.trend > 0 ? '+' : ''}
                          {kpi.trend}%
                        </span>
                        <span className="text-xs text-muted-foreground">vs เดือนก่อน</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`p-2.5 rounded-lg ${kpi.bgClass}`}>
                        <kpi.icon className={`w-5 h-5 ${kpi.iconClass}`} />
                      </div>
                      <Sparkline data={kpi.sparkData} color={kpi.color} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bar Chart */}
            <Card className="lg:col-span-2 border-border/50 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">สถิติใบจองรายเดือน</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={barChartConfig} className="h-[300px] w-full">
                  <BarChart data={barChartData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="reservations"
                      fill="var(--color-reservations)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="amount"
                      fill="var(--color-amount)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">สัดส่วนตามประเภทรถ</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-2 w-full">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="ml-auto font-medium text-foreground">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>


          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'สร้างใบจอง', icon: Plus, href: '/reservations/create' },
              { label: 'รายการใบจอง', icon: FileText, href: '/reservations' },
              { label: 'ลูกค้า', icon: Users, href: '/settings/customers' },
              { label: 'รายงาน', icon: Car, href: '/reports/monthly' },
            ].map((action) => (
              <Card
                key={action.label}
                className="border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
              >
                <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                  <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <action.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{action.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
