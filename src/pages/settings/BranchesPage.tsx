import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Branch {
  id: string;
  no: number;
  branch_id: string;
  branch_name: string;
  status: string;
  company_id: string;
}

export default function BranchesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    branch_id: "",
    branch_name: "",
    status: "active",
  });

  const fetchBranches = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .order('no', { ascending: true });

    if (error) {
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      console.error('Error fetching branches:', error);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const filteredItems = items.filter(
    (item) =>
      item.branch_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.branch_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ branch_id: "", branch_name: "", status: "active" });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Branch) => {
    setEditingItem(item);
    setFormData({
      branch_id: item.branch_id,
      branch_name: item.branch_name,
      status: item.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("คุณต้องการลบรายการนี้หรือไม่?")) {
      const { error } = await supabase.from('branches').delete().eq('id', id);
      if (error) {
        toast.error('เกิดข้อผิดพลาดในการลบข้อมูล');
      } else {
        toast.success("ลบข้อมูลสำเร็จ");
        fetchBranches();
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.branch_id.trim()) {
      toast.error("กรุณากรอก Branch ID");
      return;
    }
    if (!/^[A-Za-z0-9]{3}$/.test(formData.branch_id.trim())) {
      toast.error("Branch ID ต้องเป็นตัวอักษรหรือตัวเลข 3 ตัวเท่านั้น");
      return;
    }
    if (!formData.branch_name.trim()) {
      toast.error("กรุณากรอก Branch Name");
      return;
    }

    if (editingItem) {
      const { error } = await supabase
        .from('branches')
        .update({
          branch_id: formData.branch_id.toUpperCase().trim(),
          branch_name: formData.branch_name.trim(),
          status: formData.status,
        })
        .eq('id', editingItem.id);

      if (error) {
        toast.error('เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
        console.error(error);
      } else {
        toast.success("แก้ไขข้อมูลสำเร็จ");
        fetchBranches();
      }
    } else {
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user?.id)
        .single();

      if (!profile?.company_id) {
        toast.error('ไม่พบข้อมูล Company');
        return;
      }

      const { error } = await supabase
        .from('branches')
        .insert({
          branch_id: formData.branch_id.toUpperCase().trim(),
          branch_name: formData.branch_name.trim(),
          company_id: profile.company_id,
          status: formData.status,
        } as any);

      if (error) {
        if (error.code === '23505') {
          toast.error('Branch ID นี้มีอยู่แล้วในบริษัทนี้');
        } else {
          toast.error('เกิดข้อผิดพลาดในการเพิ่มข้อมูล');
        }
        console.error(error);
      } else {
        toast.success("เพิ่มข้อมูลสำเร็จ");
        fetchBranches();
      }
    }

    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">สาขา</h1>
          <p className="text-muted-foreground">จัดการข้อมูลสาขาของบริษัท</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มสาขา
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
              <TableHead className="w-[80px]">No.</TableHead>
              <TableHead className="w-[120px]">Branch ID</TableHead>
              <TableHead>Branch Name</TableHead>
              <TableHead className="w-[140px]">Doc Prefix</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[120px] text-center">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  กำลังโหลด...
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.no}</TableCell>
                  <TableCell className="font-mono">{item.branch_id}</TableCell>
                  <TableCell>{item.branch_name}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">{item.doc_prefix || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                      {item.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
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
              {editingItem ? "แก้ไขสาขา" : "เพิ่มสาขา"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="branch_id">Branch ID (3 ตัวอักษร)</Label>
              <Input
                id="branch_id"
                value={formData.branch_id}
                onChange={(e) => setFormData({ ...formData, branch_id: e.target.value.toUpperCase().slice(0, 3) })}
                placeholder="เช่น LAC, BPK"
                maxLength={3}
                className="font-mono uppercase"
                disabled={!!editingItem}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch_name">Branch Name</Label>
              <Input
                id="branch_name"
                value={formData.branch_name}
                onChange={(e) => setFormData({ ...formData, branch_name: e.target.value.slice(0, 100) })}
                placeholder="กรอกชื่อสาขา"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc_prefix">Document Prefix (สำหรับ Generate เลขที่เอกสาร)</Label>
              <Input
                id="doc_prefix"
                value={formData.doc_prefix}
                onChange={(e) => setFormData({ ...formData, doc_prefix: e.target.value.toUpperCase() })}
                placeholder="เช่น BPKRS, LRARS"
                className="font-mono uppercase"
              />
              <p className="text-xs text-muted-foreground">
                ใช้เป็น Prefix ในการ Generate เลขที่เอกสาร เช่น LRARS-260300001
              </p>
            </div>
            <div className="space-y-3">
              <Label>Status</Label>
              <RadioGroup
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="status-active" />
                  <Label htmlFor="status-active" className="font-normal cursor-pointer">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inactive" id="status-inactive" />
                  <Label htmlFor="status-inactive" className="font-normal cursor-pointer">Inactive</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleSubmit}>{editingItem ? "บันทึก" : "เพิ่ม"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
