import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { testCases, type TestCase, type Priority, type TestStatus } from '@/data/testCases';
import {
  Download, Search, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle, Clock, Filter,
  ClipboardList, BarChart3,
} from 'lucide-react';
import * as XLSX from 'xlsx';

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  critical: { label: 'Critical', className: 'bg-destructive/10 text-destructive border-destructive/30 border' },
  high: { label: 'High', className: 'bg-orange-100 text-orange-700 border-orange-300 border' },
  medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-700 border-yellow-300 border' },
  low: { label: 'Low', className: 'bg-green-100 text-green-700 border-green-300 border' },
};

const statusConfig: Record<TestStatus, { label: string; icon: React.ElementType; className: string }> = {
  not_tested: { label: 'ยังไม่ทดสอบ', icon: Clock, className: 'bg-muted text-muted-foreground' },
  pass: { label: 'ผ่าน', icon: CheckCircle2, className: 'bg-green-100 text-green-700' },
  fail: { label: 'ไม่ผ่าน', icon: XCircle, className: 'bg-destructive/10 text-destructive' },
  partial: { label: 'ผ่านบางส่วน', icon: AlertTriangle, className: 'bg-yellow-100 text-yellow-700' },
};

const categories = ['ทั้งหมด', 'Workflow หลัก', 'Workflow ยกเลิก', 'Master Data', 'Reports', 'เอกสาร/ฟอร์ม', 'ระบบพื้นฐาน'];

export default function TestCasesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ทั้งหมด');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedTC, setSelectedTC] = useState<TestCase | null>(null);

  const filtered = useMemo(() => {
    return testCases.filter(tc => {
      const matchSearch = searchTerm === '' ||
        tc.testCaseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tc.testTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tc.functionName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = filterCategory === 'ทั้งหมด' || tc.category === filterCategory;
      const matchPriority = filterPriority === 'all' || tc.priority === filterPriority;
      return matchSearch && matchCategory && matchPriority;
    });
  }, [searchTerm, filterCategory, filterPriority]);

  const stats = useMemo(() => {
    const total = testCases.length;
    const byCat = categories.slice(1).map(cat => ({
      name: cat,
      count: testCases.filter(t => t.category === cat).length,
    }));
    const byPriority = {
      critical: testCases.filter(t => t.priority === 'critical').length,
      high: testCases.filter(t => t.priority === 'high').length,
      medium: testCases.filter(t => t.priority === 'medium').length,
      low: testCases.filter(t => t.priority === 'low').length,
    };
    return { total, byCat, byPriority };
  }, []);

  const exportToExcel = () => {
    const data = testCases.map(tc => ({
      'Test Case ID': tc.testCaseId,
      'Function No.': tc.functionNo || '-',
      'Function Name': tc.functionName,
      'Category': tc.category,
      'Test Title': tc.testTitle,
      'Priority': priorityConfig[tc.priority].label,
      'Responsible': tc.responsible,
      'Precondition': tc.precondition,
      'Steps': tc.steps.replace(/\n/g, '\r\n'),
      'Expected Result': tc.expectedResult,
      'Status': statusConfig[tc.status].label,
      'Remark': tc.remark,
    }));

    const ws = XLSX.utils.json_to_sheet(data);

    // Set column widths
    ws['!cols'] = [
      { wch: 14 }, { wch: 10 }, { wch: 28 }, { wch: 18 },
      { wch: 35 }, { wch: 10 }, { wch: 18 }, { wch: 30 },
      { wch: 50 }, { wch: 40 }, { wch: 14 }, { wch: 20 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Test Cases');

    // Summary sheet
    const summaryData = [
      { 'หมวดหมู่': 'รวมทั้งหมด', 'จำนวน Test Case': stats.total },
      ...stats.byCat.map(c => ({ 'หมวดหมู่': c.name, 'จำนวน Test Case': c.count })),
      { 'หมวดหมู่': '', 'จำนวน Test Case': '' },
      { 'หมวดหมู่': 'Priority', 'จำนวน Test Case': 'จำนวน' },
      { 'หมวดหมู่': 'Critical', 'จำนวน Test Case': stats.byPriority.critical },
      { 'หมวดหมู่': 'High', 'จำนวน Test Case': stats.byPriority.high },
      { 'หมวดหมู่': 'Medium', 'จำนวน Test Case': stats.byPriority.medium },
      { 'หมวดหมู่': 'Low', 'จำนวน Test Case': stats.byPriority.low },
    ];
    const ws2 = XLSX.utils.json_to_sheet(summaryData);
    ws2['!cols'] = [{ wch: 25 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws2, 'Summary');

    XLSX.writeFile(wb, 'TestCases_BookingSystem.xlsx');
  };

  return (
    <div className="space-y-6">
      <Header
        title="Test Cases"
        subtitle="รายการ Test Case ทั้งหมดของระบบบันทึกจอง พร้อม Export Excel"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="col-span-2 md:col-span-1 border-primary/20">
          <CardContent className="p-4 text-center">
            <ClipboardList className="mx-auto h-6 w-6 text-primary mb-1" />
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Test Cases ทั้งหมด</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-destructive">{stats.byPriority.critical}</p>
            <p className="text-xs text-muted-foreground">Critical</p>
          </CardContent>
        </Card>
        <Card className="border-orange-300">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.byPriority.high}</p>
            <p className="text-xs text-muted-foreground">High</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-300">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.byPriority.medium}</p>
            <p className="text-xs text-muted-foreground">Medium</p>
          </CardContent>
        </Card>
        <Card className="border-green-300">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.byPriority.low}</p>
            <p className="text-xs text-muted-foreground">Low</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="p-4 text-center">
            <BarChart3 className="mx-auto h-6 w-6 text-primary mb-1" />
            <p className="text-2xl font-bold text-primary">{stats.byCat.length}</p>
            <p className="text-xs text-muted-foreground">หมวดหมู่</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Export */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหา Test Case ID, ชื่อ Test, ชื่อ Function..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุก Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportToExcel} className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs by category */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="all">ทั้งหมด ({filtered.length})</TabsTrigger>
          {categories.slice(1).map(cat => {
            const count = filtered.filter(t => t.category === cat).length;
            return (
              <TabsTrigger key={cat} value={cat}>{cat} ({count})</TabsTrigger>
            );
          })}
        </TabsList>

        {['all', ...categories.slice(1)].map(tab => {
          const items = tab === 'all' ? filtered : filtered.filter(t => t.category === tab);
          return (
            <TabsContent key={tab} value={tab}>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[120px]">Test Case ID</TableHead>
                          <TableHead className="w-[80px]">F.No</TableHead>
                          <TableHead className="min-w-[180px]">ชื่อ Function</TableHead>
                          <TableHead className="min-w-[250px]">ชื่อ Test Case</TableHead>
                          <TableHead className="w-[100px]">Priority</TableHead>
                          <TableHead className="w-[140px]">ผู้รับผิดชอบ</TableHead>
                          <TableHead className="w-[120px]">สถานะ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              ไม่พบ Test Case ที่ตรงกับเงื่อนไข
                            </TableCell>
                          </TableRow>
                        ) : items.map(tc => {
                          const StatusIcon = statusConfig[tc.status].icon;
                          return (
                            <TableRow
                              key={tc.id}
                              className="cursor-pointer hover:bg-accent/50"
                              onClick={() => setSelectedTC(tc)}
                            >
                              <TableCell className="font-mono text-xs font-medium">{tc.testCaseId}</TableCell>
                              <TableCell className="text-center">{tc.functionNo || '-'}</TableCell>
                              <TableCell className="text-sm">{tc.functionName}</TableCell>
                              <TableCell className="text-sm font-medium">{tc.testTitle}</TableCell>
                              <TableCell>
                                <Badge className={priorityConfig[tc.priority].className}>
                                  {priorityConfig[tc.priority].label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">{tc.responsible}</TableCell>
                              <TableCell>
                                <Badge className={statusConfig[tc.status].className}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {statusConfig[tc.status].label}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={!!selectedTC} onOpenChange={() => setSelectedTC(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedTC && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{selectedTC.testCaseId}</span>
                  <span>{selectedTC.testTitle}</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Function</p>
                    <p className="text-sm font-medium">{selectedTC.functionName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">หมวดหมู่</p>
                    <p className="text-sm">{selectedTC.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Priority</p>
                    <Badge className={priorityConfig[selectedTC.priority].className}>
                      {priorityConfig[selectedTC.priority].label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">ผู้รับผิดชอบ</p>
                    <p className="text-sm">{selectedTC.responsible}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Precondition</p>
                  <p className="text-sm bg-muted p-3 rounded-lg">{selectedTC.precondition}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">ขั้นตอนการทดสอบ</p>
                  <div className="text-sm bg-muted p-3 rounded-lg whitespace-pre-line">
                    {selectedTC.steps}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">ผลลัพธ์ที่คาดหวัง</p>
                  <p className="text-sm bg-green-50 border border-green-200 p-3 rounded-lg text-green-800">
                    {selectedTC.expectedResult}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
