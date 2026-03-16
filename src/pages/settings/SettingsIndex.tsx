import { Link } from 'react-router-dom';
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
  ArrowRight,
  User,
  Users,
  Building2,
  type LucideIcon
} from 'lucide-react';

interface SettingsItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  description: string;
  color: string;
  bgColor: string;
}

const settingsItems: SettingsItem[] = [
  { 
    id: 'vehicle-types', 
    label: 'ชนิดรถยนต์', 
    icon: Car, 
    path: '/settings/vehicle-types',
    description: 'จัดการประเภทรถยนต์ เช่น รถเก๋ง, SUV, กระบะ',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 group-hover:bg-blue-600'
  },
  { 
    id: 'models', 
    label: 'รุ่น (Model)', 
    icon: Layers, 
    path: '/settings/models',
    description: 'จัดการรุ่นรถยนต์ เช่น Kicks, Almera, D-Max',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100 group-hover:bg-indigo-600'
  },
  { 
    id: 'submodels', 
    label: 'รุ่นย่อย (Sub Model)', 
    icon: Layers, 
    path: '/settings/submodels',
    description: 'จัดการรุ่นย่อย เช่น e-POWER V, VL',
    color: 'text-violet-600',
    bgColor: 'bg-violet-100 group-hover:bg-violet-600'
  },
  { 
    id: 'colors', 
    label: 'สี', 
    icon: Palette, 
    path: '/settings/colors',
    description: 'จัดการสีรถยนต์ พร้อมแสดงตัวอย่างสี',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100 group-hover:bg-pink-600'
  },
  { 
    id: 'engine-sizes', 
    label: 'ขนาด/กำลังเครื่องยนต์', 
    icon: Gauge, 
    path: '/settings/engine-sizes',
    description: 'จัดการขนาดเครื่องยนต์ เช่น 1.5L, 2.0L',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 group-hover:bg-orange-600'
  },
  { 
    id: 'fuel-types', 
    label: 'ประเภทเชื้อเพลิง', 
    icon: Fuel, 
    path: '/settings/fuel-types',
    description: 'จัดการประเภทเชื้อเพลิง เช่น เบนซิน, ดีเซล, EV',
    color: 'text-green-600',
    bgColor: 'bg-green-100 group-hover:bg-green-600'
  },
  { 
    id: 'standard-prices', 
    label: 'ราคามาตรฐานตามรุ่นรถ', 
    icon: DollarSign, 
    path: '/settings/standard-prices',
    description: 'กำหนดราคามาตรฐานสำหรับแต่ละรุ่น',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 group-hover:bg-emerald-600'
  },
  { 
    id: 'freebies', 
    label: 'ของแถม', 
    icon: Gift, 
    path: '/settings/freebies',
    description: 'จัดการของแถมพิเศษ เช่น ฟิล์ม, เคลือบแก้ว',
    color: 'text-red-600',
    bgColor: 'bg-red-100 group-hover:bg-red-600'
  },
  { 
    id: 'accessories', 
    label: 'อุปกรณ์ติดตั้งเพิ่มเติม', 
    icon: Wrench, 
    path: '/settings/accessories',
    description: 'จัดการอุปกรณ์ตกแต่ง เช่น ชุดแต่ง, สปอยเลอร์',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 group-hover:bg-amber-600'
  },
  { 
    id: 'benefits', 
    label: 'สิทธิ์ประโยชน์อื่นๆ', 
    icon: Award, 
    path: '/settings/benefits',
    description: 'จัดการสิทธิประโยชน์ เช่น ฟรีค่าแรง, ดอกเบี้ย 0%',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100 group-hover:bg-yellow-600'
  },
  { 
    id: 'surnames', 
    label: 'คำนำหน้าชื่อ', 
    icon: User, 
    path: '/settings/surnames',
    description: 'จัดการคำนำหน้าชื่อ เช่น นาย, นาง, นางสาว',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100 group-hover:bg-cyan-600'
  },
  { 
    id: 'customers', 
    label: 'ข้อมูลลูกค้า', 
    icon: Users, 
    path: '/settings/customers',
    description: 'จัดการข้อมูลลูกค้า ชื่อ ที่อยู่ เบอร์ติดต่อ',
    color: 'text-teal-600',
    bgColor: 'bg-teal-100 group-hover:bg-teal-600'
  },
];

export default function SettingsIndex() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ตั้งค่าระบบ</h1>
        <p className="text-muted-foreground">จัดการข้อมูลหลักของระบบ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingsItems.map(item => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              to={item.path}
              className="group bg-card rounded-xl border border-border p-5 hover:border-primary/50 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${item.bgColor} transition-colors`}>
                  <Icon className={`w-6 h-6 ${item.color} group-hover:text-white transition-colors`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {item.label}
                    </h3>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
