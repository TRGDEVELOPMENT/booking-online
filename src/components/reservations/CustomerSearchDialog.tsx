import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus, User, Building2, Loader2 } from 'lucide-react';
import { CustomerFormDialog } from './CustomerFormDialog';

export interface Customer {
  id: string;
  customer_id: string;
  tax_id: string;
  customer_type: string;
  surname_id: string | null;
  first_name: string;
  last_name: string;
  mobile_phone: string | null;
  telephone: string | null;
  email: string | null;
  address1: string | null;
  address2: string | null;
  district: string | null;
  province: string | null;
  postal_code: string | null;
  surnames?: { id: string; description: string } | null;
}

interface CustomerSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (customer: Customer) => void;
  companyId: string;
  customerType?: 'individual' | 'corporate';
}

export function CustomerSearchDialog({
  open,
  onOpenChange,
  onSelect,
  companyId,
  customerType,
}: CustomerSearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Reset state when dialog opens/closes and load all customers on open
  useEffect(() => {
    if (open) {
      setSearchTerm('');
      setHasSearched(false);
      // Load all customers when dialog opens
      handleSearch('');
    } else {
      setSearchTerm('');
      setSearchResults([]);
      setHasSearched(false);
    }
  }, [open]);

  // Debounced search
  const handleSearch = useCallback(async (term: string) => {
    if (!companyId) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      let query = supabase
        .from('customers')
        .select('*, surnames(id, description)')
        .eq('company_id', companyId)
        .eq('status', 'active')
        .order('customer_id', { ascending: true })
        .limit(50);

      if (term.trim()) {
        query = query.or(`tax_id.ilike.%${term}%,first_name.ilike.%${term}%,last_name.ilike.%${term}%`);
      }

      if (customerType) {
        query = query.eq('customer_type', customerType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error searching customers:', error);
        setSearchResults([]);
      } else {
        setSearchResults((data as Customer[]) || []);
      }
    } catch (error) {
      console.error('Error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [companyId, customerType]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, handleSearch]);

  const handleSelectCustomer = (customer: Customer) => {
    onSelect(customer);
    onOpenChange(false);
  };

  const handleCustomerCreated = (newCustomer: Customer) => {
    onSelect(newCustomer);
    setIsCreateDialogOpen(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              ค้นหาลูกค้า
            </DialogTitle>
          </DialogHeader>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาด้วย Tax ID, ชื่อ, นามสกุล..."
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Search Results */}
          <ScrollArea className="flex-1 min-h-[200px] max-h-[400px]">
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">กำลังค้นหา...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2 pr-4">
                <p className="text-sm text-muted-foreground mb-3">
                  พบ {searchResults.length} รายการ
                </p>
                {searchResults.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => handleSelectCustomer(customer)}
                    className="w-full text-left p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                            {customer.customer_id}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {customer.tax_id}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {customer.customer_type === 'corporate' ? (
                            <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className="font-medium truncate">
                            {customer.surnames?.description || ''}{customer.first_name} {customer.last_name}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {customer.mobile_phone || customer.telephone || '-'}
                          {customer.email && ` | ${customer.email}`}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : hasSearched && searchTerm.trim() ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  ไม่พบลูกค้าที่ตรงกับคำค้นหา "{searchTerm}"
                </p>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  สร้างลูกค้าใหม่
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>พิมพ์เพื่อค้นหาลูกค้า</p>
                <p className="text-sm mt-1">ค้นหาได้ด้วย Tax ID, ชื่อ หรือนามสกุล</p>
              </div>
            )}
          </ScrollArea>

          {/* Create New Button (always visible at bottom) */}
          <div className="pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(true)}
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              สร้างลูกค้าใหม่
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Customer Dialog */}
      <CustomerFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCustomerCreated}
        companyId={companyId}
        initialTaxId={hasSearched && searchResults.length === 0 ? searchTerm : undefined}
      />
    </>
  );
}
