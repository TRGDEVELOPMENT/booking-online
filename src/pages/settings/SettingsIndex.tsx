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
  ArrowRight
} from 'lucide-react';

const settingsItems = [
  { 
    id: 'vehicle-types', 
    label: 'ชนิดรถยนต์', 
    icon: Car, 
    path: '/settings/vehicle-types',
    description: 'จัดการประเภทรถยนต์ เช่น รถเก๋ง, SUV, กระบะ'
  },
  { 
    id: 'models', 
    label: 'รุ่น (Model)', 
    icon: Layers, 
    path: '/settings/models',
    description: 'จัดการรุ่นรถยนต์ เช่น Kicks, Almera, D-Max'
  },
  { 
    id: 'submodels', 
    label: 'รุ่นย่อย (Sub Model)', 
    icon: Layers, 
    path: '/settings/submodels',
    description: 'จัดการรุ่นย่อย เช่น e-POWER V, VL'
  },
  { 
    id: 'colors', 
    label: 'สี', 
    icon: Palette, 
    path: '/settings/colors',
    description: 'จัดการสีรถยนต์ พร้อมแสดงตัวอย่างสี'
  },
  { 
    id: 'engine-sizes', 
    label: 'ขนาด/กำลังเครื่องยนต์', 
    icon: Gauge, 
    path: '/settings/engine-sizes',
    description: 'จัดการขนาดเครื่องยนต์ เช่น 1.5L, 2.0L'
  },
  { 
    id: 'fuel-types', 
    label: 'ประเภทเชื้อเพลิง', 
    icon: Fuel, 
    path: '/settings/fuel-types',
    description: 'จัดการประเภทเชื้อเพลิง เช่น เบนซิน, ดีเซล, EV'
  },
  { 
    id: 'standard-prices', 
    label: 'ราคามาตรฐานตามรุ่นรถ', 
    icon: DollarSign, 
    path: '/settings/standard-prices',
    description: 'กำหนดราคามาตรฐานสำหรับแต่ละรุ่น'
  },
  { 
    id: 'freebies', 
    label: 'ของแถม', 
    icon: Gift, 
    path: '/settings/freebies',
    description: 'จัดการของแถมพิเศษ เช่น ฟิล์ม, เคลือบแก้ว'
  },
  { 
    id: 'accessories', 
    label: 'อุปกรณ์ติดตั้งเพิ่มเติม', 
    icon: Wrench, 
    path: '/settings/accessories',
    description: 'จัดการอุปกรณ์ตกแต่ง เช่น ชุดแต่ง, สปอยเลอร์'
  },
  { 
    id: 'benefits', 
    label: 'สิทธิ์ประโยชน์อื่นๆ', 
    icon: Award, 
    path: '/settings/benefits',
    description: 'จัดการสิทธิประโยชน์ เช่น ฟรีค่าแรง, ดอกเบี้ย 0%'
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
                <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="w-6 h-6" />
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
