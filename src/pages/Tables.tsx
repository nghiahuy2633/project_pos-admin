import { useEffect, useState } from 'react';
import { Header } from '@/components/ui/layouts/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Users, Edit2, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { tableApi } from '@/api/apiClient';
import type { TableResponse } from '@/types/api';
import { toast } from 'sonner';

const statusConfig = {
  AVAILABLE: {
    label: 'Trống',
    className: 'border-slate-800 bg-slate-900/40 hover:bg-slate-800/60',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    iconColor: 'text-emerald-400',
    shadow: 'hover:shadow-emerald-500/5'
  },
  OCCUPIED: {
    label: 'Đang phục vụ',
    className: 'border-blue-500/30 bg-blue-600/10 hover:bg-blue-600/20',
    badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    iconColor: 'text-blue-400',
    shadow: 'shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30'
  },
  RESERVED: {
    label: 'Đã đặt trước',
    className: 'border-amber-500/30 bg-amber-600/10 hover:bg-amber-600/20',
    badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    iconColor: 'text-amber-400',
    shadow: 'shadow-lg shadow-amber-600/10 hover:shadow-amber-600/20'
  },
} as const;

export default function TablesPage() {
  const [tables, setTables] = useState<TableResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTable, setEditingTable] = useState<TableResponse | null>(null);
  const [form, setForm] = useState({ tableCode: '', capacity: 4 });

  const fetchTables = async () => {
    try {
      setIsLoading(true);
      const res: any = await tableApi.getTables({ page: 0, size: 100 });
      const rawTables = res?.data ?? res?.items ?? res?.content ?? [];
      const normalizedTables = Array.isArray(rawTables) ? rawTables.map((t: any) => ({
        id: t.id ?? t.tableId,
        tableCode: t.tableCode ?? t.number ?? t.name ?? `Bàn ${t.id}`,
        capacity: Number(t.capacity ?? 4),
        status: (t.status ?? 'AVAILABLE').toUpperCase(),
      })) : [];
      
      normalizedTables.sort((a: any, b: any) => {
        const numA = parseInt(a.tableCode.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.tableCode.replace(/\D/g, '')) || 0;
        return numA - numB || a.tableCode.localeCompare(b.tableCode);
      });

      setTables(normalizedTables);
    } catch (e) {
      console.error('Fetch tables failed', e);
      toast.error('Không thể tải danh sách bàn');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleOpenDialog = (table?: TableResponse) => {
    if (table) {
      setEditingTable(table);
      setForm({ tableCode: table.tableCode ?? '', capacity: table.capacity ?? 4 });
    } else {
      setEditingTable(null);
      setForm({ tableCode: '', capacity: 4 });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.tableCode) {
      toast.error('Vui lòng nhập tên/số bàn');
      return;
    }
    try {
      setIsSubmitting(true);
      if (editingTable) {
        await tableApi.updateTable(editingTable.id, { ...form });
        toast.success('Cập nhật bàn thành công');
        setTables(prev => prev.map(t => t.id === editingTable.id ? { ...t, ...form } : t));
      } else {
        await tableApi.createTable({ ...form });
        toast.success('Thêm bàn thành công');
        await fetchTables();
      }
      setIsDialogOpen(false);
    } catch (e) {
      console.error('Save table failed', e);
      toast.error('Thao tác thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bàn này?')) return;
    try {
      await tableApi.deleteTable(id);
      setTables(prev => prev.filter(t => t.id !== id));
      toast.success('Xóa bàn thành công');
    } catch (e) {
      console.error('Delete table failed', e);
      toast.error('Xóa bàn thất bại');
    }
  };

  const statusCounts = {
    available: tables.filter((t) => t.status === 'AVAILABLE').length,
    occupied: tables.filter((t) => t.status === 'OCCUPIED').length,
    reserved: tables.filter((t) => t.status === 'RESERVED').length,
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Sơ đồ bàn"
        description="Theo dõi và quản lý trạng thái phục vụ tại bàn"
      />
      
      <div className="flex-1 space-y-8 p-6 lg:p-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-md rounded-[32px] overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Tổng số bàn</p>
                  <h3 className="text-3xl font-bold mt-1 text-white">{tables.length}</h3>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-slate-800/50 flex items-center justify-center">
                  <Users className="h-6 w-6 text-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-emerald-500/5 border-emerald-500/10 backdrop-blur-md rounded-[32px] overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-400/80">Bàn trống</p>
                  <h3 className="text-3xl font-bold mt-1 text-emerald-400">{statusCounts.available}</h3>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-500/5 border-blue-500/10 backdrop-blur-md rounded-[32px] overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-400/80">Đang phục vụ</p>
                  <h3 className="text-3xl font-bold mt-1 text-blue-400">{statusCounts.occupied}</h3>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-500/5 border-amber-500/10 backdrop-blur-md rounded-[32px] overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-400/80">Đã đặt trước</p>
                  <h3 className="text-3xl font-bold mt-1 text-amber-400">{statusCounts.reserved}</h3>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Danh sách khu vực</h2>
          <Button 
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl px-6 h-12 shadow-lg shadow-blue-600/20 transition-all duration-300 active:scale-95" 
            onClick={() => handleOpenDialog()}
          >
            <Plus className="mr-2 h-5 w-5" />
            Thêm bàn mới
          </Button>
        </div>

        {/* Tables Grid */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {tables.map((table) => {
              const status = statusConfig[table.status as keyof typeof statusConfig] || statusConfig.AVAILABLE;
              return (
                <Card
                  key={table.id}
                  className={cn(
                    'group relative cursor-pointer border-2 backdrop-blur-md rounded-[32px] transition-all duration-300',
                    status.className,
                    status.shadow
                  )}
                >
                  <CardContent className="p-6">
                    <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl bg-slate-800/80 hover:bg-slate-700" onClick={(e) => { e.stopPropagation(); handleOpenDialog(table); }}>
                        <Edit2 className="h-4 w-4 text-slate-300" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400" onClick={(e) => { e.stopPropagation(); handleDelete(table.id); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex flex-col items-center text-center py-4">
                      <div className={cn(
                        "w-16 h-16 rounded-2xl mb-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                        table.status === 'OCCUPIED' ? 'bg-blue-500/20' : 'bg-slate-800/50'
                      )}>
                        <h3 className={cn("text-2xl font-bold", status.iconColor)}>
                          {(table.tableCode ?? '').replace(/\D/g, '') || table.tableCode || table.number || '-'}
                        </h3>
                      </div>
                      
                      <h4 className="text-lg font-semibold text-white mb-1">
                        {table.tableCode || table.number || '-'}
                      </h4>
                      
                      <div className="flex items-center gap-1.5 text-slate-400 mb-4">
                        <Users className="h-3.5 w-3.5" />
                        <span className="text-sm font-medium">{table.capacity ?? 0} chỗ</span>
                      </div>

                      <span
                        className={cn(
                          'rounded-xl px-3 py-1 text-xs font-bold tracking-wide uppercase border',
                          status.badgeClass
                        )}
                      >
                        {status.label}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white rounded-[32px] max-w-md p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{editingTable ? 'Cập nhật thông tin bàn' : 'Thêm bàn mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label className="text-slate-400 text-sm font-medium">Tên hoặc Số bàn</Label>
              <Input 
                value={form.tableCode} 
                onChange={(e) => setForm({ ...form, tableCode: e.target.value })} 
                placeholder="Ví dụ: Bàn 01" 
                className="bg-slate-800/50 border-slate-700 rounded-2xl h-12 text-white placeholder:text-slate-600 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-400 text-sm font-medium">Số ghế (Sức chứa)</Label>
              <Input 
                type="number"
                value={form.capacity} 
                onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} 
                className="bg-slate-800/50 border-slate-700 rounded-2xl h-12 text-white focus:ring-blue-500/20"
              />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 rounded-2xl px-6 h-12"
            >
              Hủy bỏ
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl px-8 h-12 shadow-lg shadow-blue-600/20"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingTable ? 'Cập nhật' : 'Thêm bàn'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
