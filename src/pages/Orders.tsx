import { useEffect, useState } from 'react';
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
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Search, Eye, MoreHorizontal, Filter, Loader2, Trash2, Plus, Save } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { orderApi, tableApi, productApi } from '@/api/apiClient';
import type { OrderResponse, OrderStatus, ProductResponse } from '@/types/api';

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
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [isProductsLoading, setIsProductsLoading] = useState(false);

  const fetchProducts = async () => {
    if (products.length > 0) return;
    try {
      setIsProductsLoading(true);
      const res = await productApi.getProducts({ page: 0, size: 100 });
      // @ts-ignore
      const items = res.data?.items || res.items || res.content || [];
      setProducts(items);
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
        notes: note
      });
      setSelectedProduct('');
      setQuantity(1);
      setNote('');
      setIsAddingItem(false);
      handleViewDetail(selectedOrder.orderId);
    } catch (error) {
      console.error('Add item failed:', error);
    }
  };

  const handleDeleteItem = async (orderItemId: string) => {
    if (!selectedOrder?.orderId || !confirm('Bạn có chắc muốn xóa món này?')) return;
    try {
      await orderApi.cancelOrderItem(selectedOrder.orderId, orderItemId);
      handleViewDetail(selectedOrder.orderId);
    } catch (error) {
      console.error('Delete item failed:', error);
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

  const handleViewDetail = async (orderId: string) => {
    try {
      setIsDetailLoading(true);
      setIsDetailOpen(true);
      // @ts-ignore
      const detail = await orderApi.getOrderDetail(orderId);
      // @ts-ignore
      const finalDetail = detail.data || detail;
      setSelectedOrder(finalDetail);
    } catch (error) {
      console.error('Failed to fetch order detail:', error);
    } finally {
      setIsDetailLoading(false);
    }
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
              placeholder="Tìm theo mã đơn, khách hàng, bàn..."
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
                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-widest">Khách hàng</TableHead>
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
                  <TableCell colSpan={8} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 text-slate-500">
                      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                      <p className="font-bold uppercase tracking-widest text-xs">Đang đồng bộ dữ liệu...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-64 text-center">
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
                    <TableCell className="text-slate-300 font-medium">
                      {/* Assuming no customer info in basic OrderResponse, placeholder for now */}
                      Khách vãng lai
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
                      {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : '-'}
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
                      {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('vi-VN') : '-'}
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
                           <TableHead className="pr-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Thành tiền</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                         {selectedOrder.items && selectedOrder.items.length > 0 ? (
                           selectedOrder.items.map((item: any, index: number) => (
                             <TableRow key={index} className="border-slate-800/50 hover:bg-slate-800/20 transition-colors h-16">
                               <TableCell className="pl-6">
                                 <p className="font-bold text-white">{item.productName || 'Sản phẩm #' + (index + 1)}</p>
                                 {item.notes && <p className="text-[10px] text-slate-500 font-medium mt-0.5 italic">{item.notes}</p>}
                               </TableCell>
                               <TableCell className="text-center font-bold text-slate-300">{item.quantity}</TableCell>
                               <TableCell className="text-right font-medium text-slate-400">{(item.unitPrice || item.price)?.toLocaleString('vi-VN')}</TableCell>
                               <TableCell className="pr-6 text-right font-bold text-white">{(item.totalPrice || ((item.unitPrice || item.price) * item.quantity))?.toLocaleString('vi-VN')}</TableCell>
                             </TableRow>
                           ))
                         ) : (
                           <TableRow>
                             <TableCell colSpan={4} className="text-center py-12">
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
                   <Button 
                    onClick={() => { setIsAddingItem(true); fetchProducts(); }}
                    className="h-14 px-8 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
                   >
                     <Plus className="mr-3 h-5 w-5" /> Thêm món mới
                   </Button>
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
    </div>
  );
}
