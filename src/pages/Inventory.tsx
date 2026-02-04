import { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/ui/layouts/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Search,
  ArrowDown,
  ArrowUp,
  RefreshCw,
  Package,
  Check,
  ChevronsUpDown,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { inventoryApi, productApi } from '@/api/apiClient';
import type { InventoryResponse, ProductResponse } from '@/types/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { API_CONFIG } from '@/constants/app';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function InventoryPage() {
  const { t } = useI18n();
  const [inventories, setInventories] = useState<InventoryResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in' | 'low' | 'out'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Dialog State
  const [dialogType, setDialogType] = useState<'in' | 'out'>('in');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number | string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [isProductLocked, setIsProductLocked] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const prodRes = await productApi.getProducts({ page: 0, size: API_CONFIG.PAGINATION.MAX_SIZE });
      const rawProducts = (prodRes as any)?.data?.items ?? (prodRes as any)?.items ?? (prodRes as any)?.content ?? [];
      setProducts(Array.isArray(rawProducts) ? rawProducts : []);

      // Load Inventories
      try {
        const invRes = await inventoryApi.getInventories({ page: 0, size: API_CONFIG.PAGINATION.MAX_SIZE });
        const rawInventories =
          (invRes as any)?.data ??
          (invRes as any)?.items ??
          (invRes as any)?.content ??
          [];
        setInventories(Array.isArray(rawInventories) ? rawInventories : []);
      } catch (e: any) {
        console.error('Inventory load error:', e);
        const status = e?.response?.status;
        if (status && status !== 404) {
          toast.error('Không thể tải dữ liệu tồn kho (đang hiển thị --)');
        }
        setInventories([]);
      }
    } catch (e) {
      console.error('Failed to load data', e);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openDialog = (type: 'in' | 'out', productId?: string) => {
    setDialogType(type);
    setSelectedProductId(productId || '');
    setQuantity('');
    setIsProductLocked(Boolean(productId));
    setProductSearchOpen(false);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedProductId || !quantity || Number(quantity) <= 0) {
      toast.error('Vui lòng chọn sản phẩm và nhập số lượng hợp lệ');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        productId: selectedProductId,
        quantity: Number(quantity),
      };

      if (dialogType === 'in') {
        await inventoryApi.stockIn(payload);
        toast.success('Nhập kho thành công');
      } else {
        await inventoryApi.stockOut(payload);
        toast.success('Xuất kho thành công');
      }

      setIsDialogOpen(false);
      loadData();
    } catch (e: any) {
      console.error('Stock operation failed', e);
      const msg = e.response?.data?.message || 'Thao tác thất bại';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  type InventoryItem = InventoryResponse & {
    productName: string;
    productPrice?: number;
    hasProductInfo: boolean;
  };

  const lowStockThreshold = 5;

  const productById = useMemo(() => {
    return new Map(products.map((p: any) => [p.productId || p.id, p]));
  }, [products]);

  const hasInventoryData = inventories.length > 0;

  const displayedItems: InventoryItem[] = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    
    // Map INVENTORY items to Products (Reverse logic)
    const merged: InventoryItem[] = inventories.map((inv) => {
      const product = productById.get(inv.productId);

      return {
        ...inv,
        productName: product?.name || `Sản phẩm ẩn/đã xóa`,
        productPrice: product?.price,
        hasProductInfo: !!product,
      };
    });

    const filtered = merged.filter((item) => {
      if (query && !item.productName.toLowerCase().includes(query)) return false;

      if (statusFilter === 'all') return true;

      const availableQuantity = item.availableQuantity;
      
      if (statusFilter === 'in') return availableQuantity > 0;
      if (statusFilter === 'out') return availableQuantity === 0;
      if (statusFilter === 'low') return availableQuantity > 0 && availableQuantity <= lowStockThreshold;

      return true;
    });

    filtered.sort((a, b) => {
      // Sort by product name
      return a.productName.localeCompare(b.productName, 'vi', { sensitivity: 'base', numeric: true });
    });

    return filtered;
  }, [inventories, productById, lowStockThreshold, searchQuery, statusFilter]);

  const outOfStockCount = useMemo(() => {
    return inventories.filter((i) => i.availableQuantity === 0).length;
  }, [inventories]);

  const lowStockCount = useMemo(() => {
    return inventories.filter(
      (i) => i.availableQuantity > 0 && i.availableQuantity <= lowStockThreshold
    ).length;
  }, [inventories, lowStockThreshold]);

  const formatVnd = (value: number) => {
    return `${new Intl.NumberFormat('vi-VN').format(value)} ₫`;
  };

  const handleStatusFilterChange = (value: string) => {
    if (value === 'all' || value === 'in' || value === 'low' || value === 'out') {
      setStatusFilter(value);
    }
  };

  const sortedProducts = useMemo(() => {
    return [...products].sort((a: any, b: any) => {
      const aName = (a?.name || '').toString();
      const bName = (b?.name || '').toString();
      return aName.localeCompare(bName, 'vi', { sensitivity: 'base', numeric: true });
    });
  }, [products]);

  return (
    <div className="flex flex-col h-full">
      <Header
        title={t('sidebar.inventory')}
        description={t('sidebar.desc.inventory')}
      />
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Tổng sản phẩm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">{inventories.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Sắp hết hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">
                {typeof lowStockCount === 'number' ? lowStockCount : '--'}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Hết hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">
                {typeof outOfStockCount === 'number' ? outOfStockCount : '--'}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('app.search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-900/50 border-slate-800"
              />
            </div>

            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-full sm:w-[220px] bg-slate-900/50 border-slate-800">
                <SelectValue placeholder="Lọc trạng thái" />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="in">Còn hàng</SelectItem>
                <SelectItem value="low">Sắp hết</SelectItem>
                <SelectItem value="out">Hết hàng</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            <Button
              variant="outline"
              onClick={loadData}
              className="border-slate-800 hover:bg-slate-800"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
            <Button
              onClick={() => openDialog('in')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <ArrowDown className="h-4 w-4 mr-2" />
              Nhập kho
            </Button>
            <Button onClick={() => openDialog('out')} variant="destructive">
              <ArrowUp className="h-4 w-4 mr-2" />
              Xuất kho
            </Button>
          </div>
        </div>

        <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-100">Danh sách tồn kho</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table className="text-slate-200">
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Sản phẩm</TableHead>
                  <TableHead className="text-slate-400">Giá bán</TableHead>
                  <TableHead className="text-slate-400">Tồn kho (Bán/Thực)</TableHead>
                  <TableHead className="text-slate-400">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow className="border-slate-800">
                    <TableCell colSpan={4} className="text-slate-500 py-8 text-center">
                      Đang tải dữ liệu...
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading && displayedItems.length === 0 && (
                  <TableRow className="border-slate-800">
                    <TableCell colSpan={4} className="text-slate-500 py-10 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Package className="h-10 w-10 opacity-50" />
                        <div>Không tìm thấy sản phẩm nào</div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading &&
                  displayedItems.map((item) => {
                    const availableQuantity = item.availableQuantity;
                    const totalQuantity = item.totalQuantity;
                    // Always true since we are iterating over inventory items
                    const hasData = true; 
                    const isOut = availableQuantity === 0;
                    const isLow =
                      availableQuantity > 0 &&
                      availableQuantity <= lowStockThreshold;
                    const isIn = availableQuantity > 0 && !isLow;

                    return (
                      <TableRow key={item.id} className="border-slate-800 hover:bg-slate-900/40">
                        <TableCell className="font-medium text-slate-100">
                          <div className="max-w-[420px] truncate" title={item.productName}>
                            {item.productName}
                            {!item.hasProductInfo && (
                               <span className="ml-2 text-xs text-slate-500 italic">(Không tìm thấy SP)</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-200">
                          {typeof item.productPrice === 'number' ? formatVnd(item.productPrice) : '--'}
                        </TableCell>
                        <TableCell>
                            <div className="flex items-baseline gap-1">
                              <span className="font-semibold text-slate-100">
                                {availableQuantity}
                              </span>
                              <span className="text-slate-500">/</span>
                              <span className="text-slate-400">
                                {totalQuantity}
                              </span>
                            </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={isLow ? 'secondary' : isIn ? 'default' : 'destructive'}
                            className={cn(
                              isLow
                                  ? 'bg-amber-500/10 text-amber-400'
                                  : isIn
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : 'bg-red-500/10 text-red-500'
                            )}
                          >
                            {isLow ? 'Sắp hết' : isIn ? 'Còn hàng' : 'Hết hàng'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Stock Operation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-slate-950 border-slate-800 text-slate-200">
          <DialogHeader>
            <DialogTitle>{dialogType === 'in' ? 'Nhập kho sản phẩm' : 'Xuất kho / Điều chỉnh'}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {dialogType === 'in' 
                ? 'Thêm số lượng hàng hóa vào kho.' 
                : 'Giảm số lượng hàng hóa (bán, hỏng, hủy).'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="product">Sản phẩm</Label>
              <Popover modal open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={productSearchOpen}
                    disabled={isProductLocked}
                    className="w-full justify-between bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200"
                  >
                    <span className="truncate">
                      {selectedProductId
                        ? products.find((p) => (p.productId || p.id) === selectedProductId)?.name
                        : 'Chọn sản phẩm...'}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-slate-900 border-slate-800 rounded-xl overflow-hidden shadow-2xl z-[9999]">
                  <Command className="bg-slate-900 text-white">
                    <CommandInput placeholder="Tìm sản phẩm..." className="h-12 text-white border-none focus:ring-0" />
                    <CommandList className="max-h-[300px]">
                      <CommandEmpty className="py-6 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                        Không tìm thấy sản phẩm
                      </CommandEmpty>
                      <CommandGroup>
                        {sortedProducts.map((p) => {
                          const pId = p.productId || p.id;
                          return (
                            <CommandItem
                              key={pId}
                              value={`${p.name}@@${pId}`}
                              onSelect={(value) => {
                                const parts = value.split('@@');
                                const nextId = parts.length > 1 ? parts[parts.length - 1] : pId;
                                setSelectedProductId(nextId);
                                setProductSearchOpen(false);
                              }}
                              onMouseDown={(e) => {
                                e.preventDefault();
                              }}
                              className="text-white hover:bg-slate-800 cursor-pointer py-3 px-4 aria-selected:bg-slate-800 transition-colors"
                            >
                              <Check
                                className={cn(
                                  "mr-3 h-4 w-4 text-blue-500",
                                  selectedProductId === pId ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col flex-1 overflow-hidden">
                                <span className="font-bold truncate">{p.name}</span>
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">Số lượng</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="Nhập số lượng"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-slate-900 border-slate-800"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-800 hover:bg-slate-800">
              Hủy
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className={cn(
                dialogType === 'in' ? "bg-emerald-600 hover:bg-emerald-500" : "bg-red-600 hover:bg-red-500",
                "text-white"
              )}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
