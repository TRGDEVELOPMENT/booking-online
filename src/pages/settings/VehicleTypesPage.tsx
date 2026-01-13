import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface VehicleType {
  id: string;
  no: number;
  description: string;
  company_id: string;
}

export default function VehicleTypesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VehicleType | null>(null);
  const [formData, setFormData] = useState({
    description: "",
  });

  // Fetch data from database
  const fetchVehicleTypes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('vehicle_types')
      .select('*')
      .order('no', { ascending: true });
    
    if (error) {
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      console.error('Error fetching vehicle types:', error);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVehicleTypes();
  }, []);

  const filteredItems = items.filter(
    (item) =>
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ description: "" });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: VehicleType) => {
    setEditingItem(item);
    setFormData({ description: item.description });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("คุณต้องการลบรายการนี้หรือไม่?")) {
      const { error } = await supabase
        .from('vehicle_types')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast.error('เกิดข้อผิดพลาดในการลบข้อมูล');
        console.error('Error deleting vehicle type:', error);
      } else {
        toast.success("ลบข้อมูลสำเร็จ");
        fetchVehicleTypes();
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.description.trim()) {
      toast.error("กรุณากรอกรายละเอียด");
      return;
    }

    if (editingItem) {
      // Update existing
      const { error } = await supabase
        .from('vehicle_types')
        .update({ description: formData.description })
        .eq('id', editingItem.id);
      
      if (error) {
        toast.error('เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
        console.error('Error updating vehicle type:', error);
      } else {
        toast.success("แก้ไขข้อมูลสำเร็จ");
        fetchVehicleTypes();
      }
    } else {
      // Get user's company_id from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user?.id)
        .single();

      if (!profile?.company_id) {
        toast.error('ไม่พบข้อมูล Company');
        return;
      }

      // Insert new
      const { error } = await supabase
        .from('vehicle_types')
        .insert({ 
          description: formData.description,
          company_id: profile.company_id
        });
      
      if (error) {
        toast.error('เกิดข้อผิดพลาดในการเพิ่มข้อมูล');
        console.error('Error inserting vehicle type:', error);
      } else {
        toast.success("เพิ่มข้อมูลสำเร็จ");
        fetchVehicleTypes();
      }
    }

    setIsDialogOpen(false);
    setFormData({ description: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ชนิดรถยนต์</h1>
          <p className="text-muted-foreground">จัดการข้อมูลชนิดรถยนต์</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มชนิดรถยนต์
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">No.</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[120px] text-center">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  กำลังโหลด...
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.no}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "แก้ไขชนิดรถยนต์" : "เพิ่มชนิดรถยนต์"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ description: e.target.value })
                }
                placeholder="กรอกรายละเอียดชนิดรถยนต์"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleSubmit}>
              {editingItem ? "บันทึก" : "เพิ่ม"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
