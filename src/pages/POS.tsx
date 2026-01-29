import { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/ui/layouts/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getApiErrorMessage, orderApi, productApi, tableApi } from '@/api/apiClient';
import type { OrderResponse, ProductResponse, TableResponse } from '@/types/api';
import { Loader2, Plus, Trash2, CheckCircle2, CreditCard, DoorOpen, Check, ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';

const statusConfig: Record<string, { label: string; className: string }> = {
  OPEN: {
    label: 'Đang xử lý',
    className: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    className: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
  PAID: {
    label: 'Đã thanh toán',
    className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
  CANCELLED: {
    label: 'Đã hủy',
    className: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  },
};

export default function POSPage() {
  const [tables, setTables] = useState<TableResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [activeOrder, setActiveOrder] = useState<OrderResponse | null>(null);

  const [isTablesLoading, setIsTablesLoading] = useState(false);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [isOrderLoading, setIsOrderLoading] = useState(false);

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [quantityInput, setQuantityInput] = useState<string>('1');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const quantity = parseInt(quantityInput) || 1;

  const normalizePosErrorMessage = (rawMessage: string) => {
    const msg = rawMessage.toLowerCase();
    const isOutOfStock =
      msg.includes('out of stock') ||
      msg.includes('sold out') ||
      msg.includes('hết kho') ||
      msg.includes('het kho') ||
      msg.includes('hết hàng') ||
      msg.includes('het hang');
    if (isOutOfStock) return 'Món đã hết kho';

    const isInsufficientStock =
      (msg.includes('not enough') && msg.includes('stock')) ||
      msg.includes('insufficient') ||
      msg.includes('không đủ') ||
      msg.includes('khong du');
    if (isInsufficientStock) return 'Không đủ số lượng trong kho';

    return rawMessage;
  };

  const sortedTables = useMemo(() => {
    return [...tables].sort((a: any, b: any) => {
      const aLabel = (a?.tableCode || a?.number || a?.id || '').toString();
      const bLabel = (b?.tableCode || b?.number || b?.id || '').toString();
      return aLabel.localeCompare(bLabel, 'vi', { sensitivity: 'base', numeric: true });
    });
  }, [tables]);

  const sortedProducts = useMemo(() => {
    return [...products].sort((a: any, b: any) => {
      const aName = (a?.name || '').toString();
      const bName = (b?.name || '').toString();
      return aName.localeCompare(bName, 'vi', { sensitivity: 'base', numeric: true });
    });
  }, [products]);

  const tableLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    tables.forEach((t: any) => {
      if (!t?.id) return;
      map[t.id] = t.tableCode || (t.number ? `Bàn ${t.number}` : t.id);
    });
    return map;
  }, [tables]);

  const fetchTables = async () => {
    try {
      setIsTablesLoading(true);
      const res = await tableApi.getTables({ page: 0, size: 1000 });
      // @ts-ignore
      const data = res.data || res;
      const list = data.items || data.content || [];
      const normalizedTables = Array.isArray(list)
        ? list.map((t: any) => ({
            id: t.id ?? t.tableId,
            tableCode: t.tableCode ?? t.number ?? t.name,
            number: t.number,
            status: (t.status ?? 'AVAILABLE').toUpperCase(),
            capacity: typeof t.capacity === 'number' ? t.capacity : Number(t.capacity ?? 0),
          }))
        : [];
      setTables(normalizedTables);
    } catch (e) {
      console.error('Fetch tables failed', e);
      setTables([]);
      toast.error('Không thể tải danh sách bàn');
    } finally {
      setIsTablesLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setIsProductsLoading(true);
      const res = await productApi.getProducts({ page: 0, size: 200 });
      // @ts-ignore
      const data = res.data || res;
      const list = data.items || data.content || [];
      const normalizedProducts = Array.isArray(list)
        ? list.map((p: any) => ({
            id: p.id ?? p.productId,
            name: p.name ?? '',
            price: Number(p.price ?? 0),
            imageUrl: typeof p.imageUrl === 'string' ? p.imageUrl.trim() : undefined,
            categoryId: p.categoryId ?? '',
          }))
        : [];
      setProducts(normalizedProducts);
    } catch (e) {
      console.error('Fetch products failed', e);
      setProducts([]);
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setIsProductsLoading(false);
    }
  };

  const fetchActiveOrder = async (tableId: string) => {
    if (!tableId) return;
    try {
      setIsOrderLoading(true);
      // @ts-ignore
      const res = await orderApi.getActiveOrderByTable(tableId);
      // @ts-ignore
      const data = res.data || res;
      const finalOrder = (data as any)?.data || data;
      setActiveOrder(finalOrder);
    } catch {
      setActiveOrder(null);
    } finally {
      setIsOrderLoading(false);
    }
  };

  const unwrapApiResult = <T,>(result: any): { ok: boolean; data?: T; message?: string } => {
    if (result && typeof result === 'object' && 'succeed' in result) {
      if (result.succeed === false) {
        return { ok: false, message: result.message || 'Thao tác thất bại' };
      }
      return { ok: true, data: (result.data ?? result) as T };
    }
    return { ok: true, data: result as T };
  };

  useEffect(() => {
    fetchTables();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!selectedTableId) return;
    fetchActiveOrder(selectedTableId);

    // Poll active order status every 10 seconds
    const interval = setInterval(() => fetchActiveOrder(selectedTableId), 10000);
    return () => clearInterval(interval);
  }, [selectedTableId]);

  const handleOpenTable = async () => {
    if (!selectedTableId) return;
    try {
      setIsSubmitting(true);
      const res: any = await orderApi.openTable(selectedTableId as any);
      const parsed = unwrapApiResult(res);
      if (!parsed.ok) {
        toast.error(parsed.message);
        return;
      }
      await fetchActiveOrder(selectedTableId);
      toast.success('Mở bàn thành công');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || 'Mở bàn thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddItem = async () => {
    if (!activeOrder?.orderId || !selectedProductId) return;
    try {
      setIsSubmitting(true);
      const res: any = await orderApi.addItemToOrder(activeOrder.orderId as any, {
        productId: selectedProductId,
        quantity,
        notes: notes || undefined,
      });
      const parsed = unwrapApiResult(res);
      if (!parsed.ok) {
        toast.error(normalizePosErrorMessage(parsed.message || 'Thêm món thất bại'));
        return;
      }
      setSelectedProductId('');
      setQuantityInput('1');
      setNotes('');
      await fetchActiveOrder(selectedTableId);
      toast.success('Đã thêm món');
    } catch (e: any) {
      toast.error(normalizePosErrorMessage(getApiErrorMessage(e, 'Thêm món thất bại')));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelItem = async (orderItemId: string) => {
    if (!activeOrder?.orderId || !orderItemId) return;
    if (!confirm('Bạn có chắc muốn hủy món này?')) return;
    try {
      setIsSubmitting(true);
      const res: any = await orderApi.cancelOrderItem(activeOrder.orderId as any, orderItemId as any);
      const parsed = unwrapApiResult(res);
      if (!parsed.ok) {
        toast.error(parsed.message);
        return;
      }
      await fetchActiveOrder(selectedTableId);
      toast.success('Đã hủy món');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || 'Hủy món thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!activeOrder?.orderId) return;
    if (items.length === 0) {
      toast.error('Vui lòng thêm món trước khi xác nhận');
      return;
    }
    try {
      setIsSubmitting(true);
      const res: any = await orderApi.confirmOrder(activeOrder.orderId as any);
      const parsed = unwrapApiResult(res);
      if (!parsed.ok) {
        toast.error(parsed.message);
        return;
      }
      await fetchActiveOrder(selectedTableId);
      toast.success('Đã xác nhận đơn');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || 'Xác nhận thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayOrder = async () => {
    if (!activeOrder?.orderId) return;
    try {
      setIsSubmitting(true);
      const res: any = await orderApi.payOrder(activeOrder.orderId as any);
      const parsed = unwrapApiResult(res);
      if (!parsed.ok) {
        toast.error(parsed.message);
        return;
      }
      await fetchActiveOrder(selectedTableId);
      toast.success('Thanh toán thành công');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || 'Thanh toán thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const items = Array.isArray(activeOrder?.items) ? activeOrder?.items : [];
  const status = (activeOrder?.status || (activeOrder ? 'OPEN' : undefined))?.toUpperCase();

  return (
    <div className="flex flex-col min-h-screen bg-[#0b1120]">
      <Header title="POS" description="Tạo và xử lý đơn theo bàn" />

      <main className="flex-1 p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="bg-slate-900/40 border-slate-800 rounded-[32px] overflow-hidden backdrop-blur-sm lg:col-span-1">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="text-lg font-black text-white">Chọn bàn</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bàn</p>
                <Select value={selectedTableId} onValueChange={setSelectedTableId}>
                  <SelectTrigger className="h-14 bg-slate-900/50 border-slate-800 rounded-2xl text-white font-bold focus:ring-2 focus:ring-blue-600/20">
                    <SelectValue placeholder={isTablesLoading ? 'Đang tải bàn...' : 'Chọn bàn'} />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 rounded-xl max-h-[360px]">
                    {sortedTables.map((t: any) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.tableCode || (t.number ? `Bàn ${t.number}` : t.id)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-5 space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Trạng thái đơn</p>
                {isOrderLoading ? (
                  <div className="flex items-center gap-3 text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs font-bold uppercase tracking-widest">Đang kiểm tra...</span>
                  </div>
                ) : activeOrder ? (
                  <div className="flex items-center justify-between">
                    <Badge
                      className={cn(
                        'rounded-xl px-4 py-1.5 text-xs font-black uppercase tracking-widest border-0',
                        statusConfig[status as string]?.className || 'bg-slate-800 text-slate-400',
                      )}
                    >
                      {statusConfig[status as string]?.label || status}
                    </Badge>
                    <span className="text-xs font-bold text-slate-400">#{activeOrder.orderId?.substring(0, 5).toUpperCase()}</span>
                  </div>
                ) : (
                  <p className="text-sm font-bold text-slate-400">Chưa có đơn đang hoạt động</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => fetchActiveOrder(selectedTableId)}
                  variant="ghost"
                  disabled={!selectedTableId}
                  className="h-12 px-5 rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-50"
                >
                  <Loader2 className={cn('mr-2 h-4 w-4', isOrderLoading && 'animate-spin')} />
                  Tải lại
                </Button>

                <Button
                  onClick={handleOpenTable}
                  disabled={!selectedTableId || !!activeOrder || isSubmitting}
                  className="h-12 flex-1 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-500 disabled:opacity-50"
                >
                  <DoorOpen className="mr-2 h-4 w-4" /> Mở bàn
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800 rounded-[32px] overflow-hidden backdrop-blur-sm lg:col-span-2">
            <CardHeader className="p-8 pb-0">
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-lg font-black text-white">Gọi món</CardTitle>
                {activeOrder && (
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleConfirmOrder}
                      disabled={isSubmitting || status !== 'OPEN'}
                      className="h-11 px-5 rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white disabled:opacity-50"
                      variant="ghost"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4 text-blue-500" /> Xác nhận
                    </Button>
                    <Button
                      onClick={handlePayOrder}
                      disabled={isSubmitting || status !== 'CONFIRMED'}
                      className="h-11 px-5 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 disabled:opacity-50"
                    >
                      <CreditCard className="mr-2 h-4 w-4" /> Thanh toán
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-8 space-y-8">
              {!activeOrder ? (
                <div className="rounded-3xl border border-slate-800/60 bg-slate-900/30 p-10 text-center">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Chọn bàn và mở bàn để bắt đầu</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-2 md:col-span-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sản phẩm</p>
                      <Popover modal open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={productSearchOpen}
                            className="w-full h-14 bg-slate-900/50 border-slate-800 rounded-2xl text-white font-bold justify-between hover:bg-slate-800/50 hover:text-white px-4"
                          >
                            <span className="truncate">
                              {selectedProductId
                                ? products.find((p) => p.id === selectedProductId)?.name
                                : "Chọn sản phẩm..."}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-slate-900 border-slate-800 rounded-xl overflow-hidden shadow-2xl z-[9999]">
                          <Command className="bg-slate-900 text-white">
                            <CommandInput placeholder="Tìm sản phẩm..." className="h-12 text-white border-none focus:ring-0" />
                            <CommandList className="max-h-[300px]">
                              <CommandEmpty className="py-6 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">Không tìm thấy món</CommandEmpty>
                              <CommandGroup>
                                {sortedProducts.map((p) => (
                                  <CommandItem
                                    key={p.id}
                                    value={p.name}
                                    onSelect={() => {
                                      setSelectedProductId(p.id);
                                      setProductSearchOpen(false);
                                    }}
                                    className="text-white hover:bg-slate-800 cursor-pointer py-3 px-4 aria-selected:bg-slate-800 transition-colors"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-3 h-4 w-4 text-blue-500",
                                        selectedProductId === p.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col flex-1 overflow-hidden">
                                      <span className="font-bold truncate">{p.name}</span>
                                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{p.price?.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {!isProductsLoading && products.length === 0 && (
                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">
                          Không có sản phẩm (bấm F5 hoặc kiểm tra quyền truy cập)
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Số lượng</p>
                      <Input
                        type="number"
                        min={1}
                        value={quantityInput}
                        onChange={(e) => setQuantityInput(e.target.value)}
                        onBlur={() => {
                          if (!quantityInput || parseInt(quantityInput) < 1) {
                            setQuantityInput('1');
                          }
                        }}
                        className="h-14 bg-slate-900/50 border-slate-800 rounded-2xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-600/20 transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-3">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Ghi chú</p>
                      <Input
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ví dụ: ít đá, không hành..."
                        className="h-14 bg-slate-900/50 border-slate-800 rounded-2xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-600/20 transition-all"
                      />
                    </div>
                    <div className="md:col-span-3 flex justify-end">
                      <Button
                        onClick={handleAddItem}
                        disabled={isSubmitting || status !== 'OPEN' || !selectedProductId}
                        className="h-12 px-6 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-500 disabled:opacity-50 shadow-lg shadow-blue-600/20 relative z-10"
                      >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Plus className="mr-2 h-4 w-4" /> Thêm món
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-slate-800 overflow-hidden bg-slate-900/50">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-800/50 hover:bg-transparent h-12">
                          <TableHead className="pl-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Món</TableHead>
                          <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">SL</TableHead>
                          <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Đơn giá</TableHead>
                          <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Thành tiền</TableHead>
                          <TableHead className="pr-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-12">
                              <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Chưa có món</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          items.map((item: any, idx: number) => {
                            const unitPrice = item.unitPrice || item.price;
                            const total = item.totalPrice || (unitPrice * item.quantity);
                            const itemStatus = (item.status || '').toUpperCase();
                            const orderItemId = item.id || item.orderItemId;
                            return (
                              <TableRow key={orderItemId || idx} className="border-slate-800/50 hover:bg-slate-800/20 transition-colors h-16">
                                <TableCell className="pl-6">
                                  <p className="font-bold text-white">{item.productName || `Món #${idx + 1}`}</p>
                                  {(item.notes || item.note) && (
                                    <p className="text-[10px] text-slate-500 font-medium mt-0.5 italic">{item.notes || item.note}</p>
                                  )}
                                </TableCell>
                                <TableCell className="text-center font-bold text-slate-300">{item.quantity}</TableCell>
                                <TableCell className="text-right font-medium text-slate-400">{unitPrice?.toLocaleString('vi-VN')}</TableCell>
                                <TableCell className="text-right font-bold text-white">{total?.toLocaleString('vi-VN')}</TableCell>
                                <TableCell className="pr-6 text-right">
                                  {status === 'OPEN' && itemStatus !== 'CANCELLED' ? (
                                    <Button
                                      onClick={() => handleCancelItem(orderItemId)}
                                      variant="ghost"
                                      size="icon"
                                      className="h-9 w-9 rounded-xl hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-all"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">-</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-800">
                    <div className="space-y-1 text-center sm:text-left">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bàn</p>
                      <p className="text-white font-bold">{tableLabelMap[selectedTableId] || '-'}</p>
                    </div>
                    <div className="space-y-1 text-center sm:text-right">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tổng thanh toán</p>
                      <p className="text-4xl font-black text-blue-500">
                        {activeOrder.totalAmount?.toLocaleString('vi-VN') || 0}{' '}
                        <span className="text-lg">VNĐ</span>
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
