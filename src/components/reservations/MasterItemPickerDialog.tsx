import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Loader2 } from 'lucide-react';

export type MasterItemType = 'freebies' | 'accessories' | 'benefits';

interface MasterItem {
  id: string;
  no: number;
  description: string;
  price: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: MasterItemType;
  companyId: string;
  onSelect: (item: { name: string; value: number }) => void;
}

const TITLE_MAP: Record<MasterItemType, string> = {
  freebies: 'ค้นหาของแถม',
  accessories: 'ค้นหาอุปกรณ์ตกแต่ง',
  benefits: 'ค้นหาสิทธิประโยชน์',
};

export function MasterItemPickerDialog({ open, onOpenChange, type, companyId, onSelect }: Props) {
  const [items, setItems] = useState<MasterItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open || !companyId) return;
    setSearch('');
    const fetchItems = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from(type)
          .select('id, no, description, price')
          .eq('company_id', companyId)
          .eq('status', 'active')
          .order('no', { ascending: true });
        if (error) throw error;
        setItems((data as MasterItem[]) || []);
      } catch (e) {
        console.error('Error fetching master items:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [open, companyId, type]);

  const filtered = useMemo(() => {
    const k = search.trim().toLowerCase();
    if (!k) return items;
    return items.filter((i) => i.description.toLowerCase().includes(k));
  }, [items, search]);

  const handlePick = (item: MasterItem) => {
    onSelect({ name: item.description, value: Number(item.price) || 0 });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{TITLE_MAP[type]}</DialogTitle>
          <DialogDescription>พิมพ์คีย์เวิร์ดเพื่อค้นหา แล้วคลิกเลือกรายการ</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="ค้นหาตามชื่อรายการ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="border border-border rounded-lg max-h-[420px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead className="w-16">ลำดับ</TableHead>
                <TableHead>รายการ</TableHead>
                <TableHead className="w-32 text-right">มูลค่า</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin inline" />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    ไม่พบข้อมูล
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => handlePick(item)}
                  >
                    <TableCell>{item.no}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">
                      {Number(item.price).toLocaleString('th-TH')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
