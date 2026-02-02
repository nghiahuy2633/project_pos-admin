import { useEffect, useMemo, useRef, useState } from 'react';
import { Header } from '@/components/ui/layouts/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Search, Eye, MoreHorizontal, Filter, Loader2, Trash2, Plus, XCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { orderApi, tableApi, productApi, getApiErrorMessage } from '@/api/apiClient';
import type { OrderResponse, ProductResponse } from '@/types/api';
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [tablesMap, setTablesMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Detail Dialog State
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Add Item State
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantityInput, setQuantityInput] = useState<string>('1');
  const [note, setNote] = useState('');
  const [isProductsLoading, setIsProductsLoading] = useState(false);

  const quantity = parseInt(quantityInput) || 1;

  const selectedOrderId = selectedOrder?.orderId as string | undefined;

  const didMountRef = useRef(false);

  const selectedOrderItemIdByIndex = useMemo(() => {
    const items = selectedOrder?.items || [];
    if (!Array.isArray(items)) return [] as string[];
    return items.map((item: any) => item?.id || item?.orderItemId || '');
  }, [selectedOrder?.items]);

  const fetchProducts = async () => {
    if (products.length > 0) return;
    try {
      setIsProductsLoading(true);
      const res = await productApi.getProducts({ page: 0, size: 100 });
      // @ts-ignore
      const data = res.data || res;
      const list = data.items || data.content || [];
      const normalized = Array.isArray(list)
        ? list
            .map((p: any) => ({
              id: p.id ?? p.productId,
              name: p.name ?? p.productName ?? '',
              price: typeof p.price === 'number' ? p.price : Number(p.price ?? 0),
              imageUrl: typeof p.imageUrl === 'string' ? p.imageUrl.trim() : undefined,
            }))
            .filter((p: any) => !!p.id)
            .sort((a: any, b: any) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base', numeric: true }))
        : [];
      setProducts(normalized as any);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsProductsLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!selectedProduct || !selectedOrder?.orderId) return;
    try {
      await orderApi.addItemToOrder(selectedOrder.orderId, {
        productId: selectedProduct,
        quantity: quantity,
        notes: note,
      });
      setSelectedProduct('');
      setQuantityInput('1');
      setNote('');
      setIsAddingItem(false);
      handleViewDetail(selectedOrder.orderId);
    } catch (error) {
      console.error('Add item failed:', error);
    }
  };

  const handleDeleteItem = async (orderId: string, orderItemId: string) => {
    if (!orderId || !orderItemId || !confirm('Bạn có chắc muốn hủy món này?')) return;
    try {
      await orderApi.cancelOrderItem(orderId, orderItemId);
      await handleViewDetail(orderId);
    } catch (error) {
      console.error('Delete item failed:', error);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!orderId || !confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    try {
      await orderApi.cancelOrder(orderId as any);
      setIsDetailOpen(false);
      setSelectedOrder(null);
      fetchOrdersAndTables();
    } catch (error) {
      console.error('Cancel order failed:', error);
      toast.error(getApiErrorMessage(error, 'Không thể hủy đơn'));
    }
  };

  const fetchOrdersAndTables = async () => {
    try {
      setIsLoading(true);
      const [ordersRes, tablesRes] = await Promise.all([
        orderApi.getOrders({ page: 0, size: 100 }),
        tableApi.getTables({ page: 0, size: 1000 }),
      ]);

      const tMap: Record<string, string> = {};
      // @ts-ignore
      const tableData = tablesRes.data || tablesRes;
      const tableList = tableData.items || tableData.content || [];
      
      if (Array.isArray(tableList)) {
        tableList.forEach((t: any) => {
          if (t.id && (t.tableCode || t.number)) {
            tMap[t.id] = t.tableCode || `Bàn ${t.number}`;
          }
        });
      }
      setTablesMap(tMap);

      // @ts-ignore
      const orderData = ordersRes.data || ordersRes;
      const orderList = orderData.items || orderData.content || (Array.isArray(ordersRes) ? ordersRes : []) || [];
      
      if (Array.isArray(orderList)) {
        setOrders(orderList);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndTables();
  }, []);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    if (!isDetailOpen && !isAddingItem) {
      fetchOrdersAndTables();
    }
  }, [isDetailOpen, isAddingItem]);

  const formatVNTime = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch (e) {
      return dateStr;
    }
  };

  const handleViewDetail = async (orderId: string) => {
    try {
      setIsDetailLoading(true);
      setIsDetailOpen(true);
      // @ts-ignore
      const detail = await orderApi.getOrderDetail(orderId);
      // @ts-ignore
      const finalDetail = detail.data || detail;
      setSelectedOrder(finalDetail);
      return finalDetail;
    } catch (error) {
      console.error('Failed to fetch order detail:', error);
      return null;
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleOpenAddItemFromRow = async (orderId: string) => {
    const detail = await handleViewDetail(orderId);
    if (!detail) return;
    setIsAddingItem(true);
    fetchProducts();
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;
    
    const tableName = order.tableId ? (tablesMap[order.tableId] || 'Không xác định') : 'Tại quầy';
    const orderId = order.orderId || '';
    const displayId = orderId.length >= 5 ? `ORD-${orderId.substring(0, 5).toUpperCase()}` : `ORD-${orderId}`;
    
    const matchesSearch =
      displayId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tableName.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: orders.length,
    OPEN: orders.filter((o) => o.status === 'OPEN').length,
    PAID: orders.filter((o) => o.status === 'PAID').length,
    CANCELLED: orders.filter((o) => o.status === 'CANCELLED').length,
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0b1120]">
      <Header
        title="Quản lý Đơn hàng"
        description="Xem và quản lý tất cả đơn hàng trong hệ thống"
      />
      
      <main className="flex-1 p-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-[#1e293b]/50 border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm">
            <CardContent className="p-8">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Tổng đơn</p>
              <h3 className="text-5xl font-black text-white">{statusCounts.all}</h3>
            </CardContent>
          </Card>
          
          <Card className="bg-[#1e293b]/50 border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm">
            <CardContent className="p-8">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Đang xử lý</p>
              <h3 className="text-5xl font-black text-amber-500">{statusCounts.OPEN}</h3>
            </CardContent>
          </Card>
          
          <Card className="bg-[#1e293b]/50 border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm">
            <CardContent className="p-8">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Đã thanh toán</p>
              <h3 className="text-5xl font-black text-emerald-500">{statusCounts.PAID}</h3>
            </CardContent>
          </Card>
          
          <Card className="bg-[#1e293b]/50 border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm">
            <CardContent className="p-8">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Đã hủy</p>
              <h3 className="text-5xl font-black text-rose-500">{statusCounts.CANCELLED}</h3>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section */}
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <Input
              placeholder="Tìm theo mã đơn, bàn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 bg-slate-900/50 border-slate-800 rounded-2xl pl-12 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-600/20 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="flex items-center gap-2 px-4 h-14 bg-slate-900/50 border border-slate-800 rounded-2xl">
              <Filter className="h-5 w-5 text-slate-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-44 border-none bg-transparent text-white font-bold focus:ring-0">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 rounded-xl">
                  <SelectItem value="all">Tất cả ({statusCounts.all})</SelectItem>
                  <SelectItem value="OPEN">Đang xử lý ({statusCounts.OPEN})</SelectItem>
                  <SelectItem value="PAID">Đã thanh toán ({statusCounts.PAID})</SelectItem>
                  <SelectItem value="CANCELLED">Đã hủy ({statusCounts.CANCELLED})</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={fetchOrdersAndTables}
              className="h-14 w-14 rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
              variant="ghost"
            >
              <Loader2 className={cn("h-6 w-6", isLoading && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Orders Table */}
        <Card className="bg-slate-900/40 border-slate-800 rounded-[32px] overflow-hidden backdrop-blur-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800/50 hover:bg-transparent h-16">
                <TableHead className="pl-8 text-xs font-bold text-slate-500 uppercase tracking-widest">Mã đơn</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bàn</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-widest">Món</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Tổng tiền</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-widest">Trạng thái</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-widest">Thời gian</TableHead>
                <TableHead className="pr-8 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 text-slate-500">
                      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                      <p className="font-bold uppercase tracking-widest text-xs">Đang đồng bộ dữ liệu...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                      <p className="font-bold uppercase tracking-widest text-xs">Không có dữ liệu phù hợp</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.orderId} className="border-slate-800/50 hover:bg-slate-800/30 transition-colors h-20">
                    <TableCell className="pl-8 font-bold text-white">
                      ORD-{order.orderId?.substring(0, 5).toUpperCase()}
                    </TableCell>
                    <TableCell className="text-slate-300 font-medium">
                      {order.tableId ? (tablesMap[order.tableId] || 'Unknown') : 'Quầy'}
                    </TableCell>
                    <TableCell className="text-slate-400 font-medium">
                      {order.totalQuantity || 0} món
                    </TableCell>
                    <TableCell className="text-right font-bold text-white">
                      {order.totalAmount?.toLocaleString('vi-VN')} VNĐ
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          'rounded-lg px-3 py-1 text-[11px] font-black uppercase tracking-wider border-0',
                          statusConfig[order.status as string]?.className || 'bg-slate-800 text-slate-400'
                        )}
                      >
                        {statusConfig[order.status as string]?.label || order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-xs font-medium">
                      {formatVNTime(order.createdAt || '')}
                    </TableCell>
                    <TableCell className="pr-8 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-700/50 text-slate-500 hover:text-white transition-all">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 rounded-xl p-1 w-48">
                          <DropdownMenuItem 
                            onClick={() => order.orderId && handleViewDetail(order.orderId)}
                            className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer"
                          >
                            <Eye className="mr-3 h-4 w-4 text-blue-500" />
                            Xem chi tiết
                          </DropdownMenuItem>

                          {order.status === 'OPEN' && (
                            <>
                              <DropdownMenuItem
                                onClick={() => order.orderId && handleOpenAddItemFromRow(order.orderId)}
                                className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer"
                              >
                                <Plus className="mr-3 h-4 w-4 text-emerald-500" />
                                Thêm món
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => order.orderId && handleCancelOrder(order.orderId)}
                                className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer"
                              >
                                <XCircle className="mr-3 h-4 w-4 text-rose-500" />
                                Hủy đơn
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </main>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 sm:max-w-[700px] rounded-[32px] p-8 gap-8">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-3xl font-black text-white">
                  Đơn hàng #{selectedOrder?.orderId?.substring(0, 5).toUpperCase()}
                </DialogTitle>
                <DialogDescription className="text-slate-500 font-medium uppercase tracking-widest text-[10px]">
                  ID: {selectedOrder?.orderId}
                </DialogDescription>
              </div>
              <Badge className={cn(
                'rounded-xl px-4 py-1.5 text-xs font-black uppercase tracking-widest border-0',
                statusConfig[selectedOrder?.status as string]?.className || 'bg-slate-800 text-slate-400'
              )}>
                {statusConfig[selectedOrder?.status as string]?.label || selectedOrder?.status}
              </Badge>
            </div>
          </DialogHeader>
          
          {isDetailLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Đang tải chi tiết...</p>
            </div>
          ) : selectedOrder ? (
            <div className="space-y-8">
               <div className="grid grid-cols-2 gap-8 bg-slate-800/30 rounded-2xl p-6 border border-slate-800/50">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vị trí</p>
                    <p className="text-white font-bold">
                      {selectedOrder.tableId 
                        ? (tablesMap[selectedOrder.tableId] || 'Không xác định') 
                        : 'Tại quầy'}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Thời gian tạo</p>
                    <p className="text-white font-bold">
                      {formatVNTime(selectedOrder.createdAt)}
                    </p>
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Danh sách món ăn</h4>
                  <div className="rounded-[24px] border border-slate-800 overflow-hidden bg-slate-900/50">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-800/50 hover:bg-transparent h-12">
                           <TableHead className="pl-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Sản phẩm</TableHead>
                           <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">SL</TableHead>
                           <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Đơn giá</TableHead>
                           <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Thành tiền</TableHead>
                           <TableHead className="pr-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                         {selectedOrder.items && selectedOrder.items.length > 0 ? (
                           selectedOrder.items.map((item: any, index: number) => (
                             <TableRow key={index} className="border-slate-800/50 hover:bg-slate-800/20 transition-colors h-16">
                               <TableCell className="pl-6">
                                 <p className="font-bold text-white">{item.productName || 'Sản phẩm #' + (index + 1)}</p>
                                 {(item.notes || item.note) && (
                                   <p className="text-[10px] text-slate-500 font-medium mt-0.5 italic">{item.notes || item.note}</p>
                                 )}
                               </TableCell>
                               <TableCell className="text-center font-bold text-slate-300">{item.quantity}</TableCell>
                               <TableCell className="text-right font-medium text-slate-400">{(item.unitPrice || item.price)?.toLocaleString('vi-VN')}</TableCell>
                               <TableCell className="text-right font-bold text-white">{(item.totalPrice || ((item.unitPrice || item.price) * item.quantity))?.toLocaleString('vi-VN')}</TableCell>
                               <TableCell className="pr-6 text-right">
                                 {selectedOrder.status === 'OPEN' && (item.status || '').toUpperCase() !== 'CANCELLED' ? (
                                   <Button
                                     onClick={() => handleDeleteItem(selectedOrderId || '', selectedOrderItemIdByIndex[index])}
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
                           ))
                         ) : (
                           <TableRow>
                             <TableCell colSpan={5} className="text-center py-12">
                               <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Chưa có thông tin món ăn</p>
                             </TableCell>
                           </TableRow>
                         )}
                      </TableBody>
                    </Table>
                  </div>
               </div>
               
               <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-800">
                 <div className="space-y-1 text-center sm:text-left">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tổng thanh toán</p>
                    <p className="text-4xl font-black text-blue-500">
                      {selectedOrder.totalAmount?.toLocaleString('vi-VN')} <span className="text-lg">VNĐ</span>
                    </p>
                 </div>
                 
                 {selectedOrder.status === 'OPEN' && (
                   <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                     <Button
                      onClick={() => { setIsAddingItem(true); fetchProducts(); }}
                      className="h-14 px-8 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
                     >
                       <Plus className="mr-3 h-5 w-5" /> Thêm món mới
                     </Button>
                     <Button
                      onClick={() => handleCancelOrder(selectedOrderId || '')}
                      variant="destructive"
                      className="h-14 px-8 rounded-2xl font-bold"
                     >
                       <XCircle className="mr-3 h-5 w-5" /> Hủy đơn
                     </Button>
                   </div>
                 )}
               </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Lỗi khi tải dữ liệu đơn hàng</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
        <DialogContent className="bg-slate-900 border-slate-800 sm:max-w-[520px] rounded-[32px] p-8 gap-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-white">Thêm món vào đơn</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              Đơn: {selectedOrderId ? `#${selectedOrderId.substring(0, 5).toUpperCase()}` : '-'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sản phẩm</p>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="w-full h-14 bg-slate-900/50 border-slate-800 rounded-2xl text-white font-bold focus:ring-2 focus:ring-blue-600/20 justify-between overflow-hidden whitespace-nowrap">
                  <SelectValue placeholder={isProductsLoading ? 'Đang tải sản phẩm...' : 'Chọn sản phẩm'} />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 rounded-xl max-h-[320px]">
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} {typeof p.price === 'number' ? `- ${p.price.toLocaleString('vi-VN')}đ` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Ghi chú</p>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: ít đá, không hành..."
                  className="h-14 bg-slate-900/50 border-slate-800 rounded-2xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-600/20 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setIsAddingItem(false)}
                className="h-12 px-5 rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Hủy
              </Button>
              <Button
                onClick={handleAddItem}
                disabled={!selectedProduct || !selectedOrderId}
                className="h-12 px-6 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600"
              >
                <Plus className="mr-2 h-4 w-4" /> Lưu
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
