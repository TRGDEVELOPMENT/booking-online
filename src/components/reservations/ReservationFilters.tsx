import { Search, Filter, Calendar, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { branches } from '@/data/mockData';
import { WorkflowStageLabels, DocumentStatusLabels } from '@/types/reservation';

interface ReservationFiltersProps {
  selectedCompany: string;
  filters: {
    branch: string;
    status: string;
    stage: string;
    search: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
}

export function ReservationFilters({ 
  selectedCompany, 
  filters, 
  onFilterChange, 
  onClearFilters 
}: ReservationFiltersProps) {
  const companyBranches = branches.filter(b => b.companyId === selectedCompany);
  const hasActiveFilters = Object.values(filters).some(v => v && v !== 'all');

  return (
    <div className="bg-card rounded-xl border border-border/50 p-4 shadow-card space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="ค้นหาเลขที่เอกสาร, ชื่อผู้จอง, เบอร์โทร, รุ่นรถ..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="pl-10 h-11 bg-muted/30 border-transparent focus:border-primary input-focus"
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>กรอง:</span>
        </div>

        <Select value={filters.branch} onValueChange={(v) => onFilterChange('branch', v)}>
          <SelectTrigger className="w-[180px] bg-muted/30">
            <SelectValue placeholder="เลือกสาขา" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกสาขา</SelectItem>
            {companyBranches.map(branch => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={(v) => onFilterChange('status', v)}>
          <SelectTrigger className="w-[160px] bg-muted/30">
            <SelectValue placeholder="สถานะเอกสาร" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกสถานะ</SelectItem>
            {Object.entries(DocumentStatusLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.stage} onValueChange={(v) => onFilterChange('stage', v)}>
          <SelectTrigger className="w-[200px] bg-muted/30">
            <SelectValue placeholder="ขั้นตอน Workflow" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกขั้นตอน</SelectItem>
            {Object.entries(WorkflowStageLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="w-4 h-4" />
          ช่วงวันที่
        </Button>

        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="w-4 h-4 mr-1" />
            ล้างตัวกรอง
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.branch && filters.branch !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              สาขา: {companyBranches.find(b => b.id === filters.branch)?.name}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => onFilterChange('branch', 'all')} 
              />
            </Badge>
          )}
          {filters.status && filters.status !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              สถานะ: {DocumentStatusLabels[filters.status as keyof typeof DocumentStatusLabels]}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => onFilterChange('status', 'all')} 
              />
            </Badge>
          )}
          {filters.stage && filters.stage !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              ขั้นตอน: {WorkflowStageLabels[filters.stage as keyof typeof WorkflowStageLabels]}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => onFilterChange('stage', 'all')} 
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
