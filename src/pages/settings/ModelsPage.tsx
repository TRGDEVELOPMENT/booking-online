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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Model {
  id: string;
  no: number;
  description: string;
  status: string;
  company_id: string;
}

export default function ModelsPage() {
  const { user } = useAuth();
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [formData, setFormData] = useState({
    description: "",
    status: "active",
  });
  const [saving, setSaving] = useState(false);

  const fetchModels = async () => {
    try {
      const { data, error } = await supabase
        .from("models")
        .select("*")
        .order("no", { ascending: true });

      if (error) throw error;
      setModels(data || []);
    } catch (error: any) {
      toast.error("ไม่สามารถโหลดข้อมูลได้: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const filteredModels = models.filter(
    (model) =>
      model.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingModel(null);
    setFormData({ description: "", status: "active" });
    setDialogOpen(true);
  };

  const handleEdit = (model: Model) => {
    setEditingModel(model);
    setFormData({
      description: model.description,
      status: model.status,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("คุณต้องการลบรายการนี้หรือไม่?")) {
      try {
        const { error } = await supabase.from("models").delete().eq("id", id);

        if (error) throw error;

        setModels(models.filter((m) => m.id !== id));
        toast.success("ลบข้อมูลเรียบร้อยแล้ว");
      } catch (error: any) {
        toast.error("ไม่สามารถลบข้อมูลได้: " + error.message);
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.description.trim()) {
      toast.error("กรุณากรอกรายละเอียดรุ่น");
      return;
    }

    setSaving(true);

    try {
      if (editingModel) {
        // Update existing
        const { error } = await supabase
          .from("models")
          .update({
            description: formData.description,
            status: formData.status,
          })
          .eq("id", editingModel.id);

        if (error) throw error;

        setModels(
          models.map((m) =>
            m.id === editingModel.id
              ? { ...m, description: formData.description, status: formData.status }
              : m
          )
        );
        toast.success("อัปเดตข้อมูลเรียบร้อยแล้ว");
      } else {
        // Get user's company_id
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("company_id")
          .eq("user_id", user?.id)
          .single();

        if (profileError) throw profileError;

        // Add new
        const { data, error } = await supabase
          .from("models")
          .insert({
            description: formData.description,
            status: formData.status,
            company_id: profileData.company_id,
          })
          .select()
          .single();

        if (error) throw error;

        setModels([...models, data]);
        toast.success("เพิ่มข้อมูลเรียบร้อยแล้ว");
      }

      setDialogOpen(false);
    } catch (error: any) {
      toast.error("ไม่สามารถบันทึกข้อมูลได้: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">รุ่น (Model)</h1>
        <p className="text-muted-foreground">จัดการข้อมูลรุ่นรถยนต์</p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ค้นหา..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          เพิ่มรายการ
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">No.</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-24 text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredModels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              filteredModels.map((model) => (
                <TableRow key={model.id}>
                  <TableCell>{model.no}</TableCell>
                  <TableCell>{model.description}</TableCell>
                  <TableCell>
                    <Badge variant={model.status === "active" ? "default" : "secondary"}>
                      {model.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(model)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(model.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingModel ? "แก้ไขรุ่น" : "เพิ่มรุ่นใหม่"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="กรอกรายละเอียดรุ่น"
              />
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
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingModel ? "บันทึก" : "เพิ่ม"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
