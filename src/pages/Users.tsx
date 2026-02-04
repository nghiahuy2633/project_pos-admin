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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Search, Plus, MoreHorizontal, UserCog, Ban, CheckCircle, Users, UserCheck, UserX, UserPlus, Loader2, Eye, EyeOff } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { userApi } from '@/api/apiClient';
import type { UserResponse, CreateUserRequest, UpdateUserRequest } from '@/types/api';
import { toast } from 'sonner';
import { API_CONFIG, UI_MESSAGES, ROLES, USER_STATUS } from '@/constants/app';

const statusConfig = {
  ACTIVE: {
    label: USER_STATUS.ACTIVE,
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  BANNED: {
    label: USER_STATUS.BANNED,
    className: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
} as const;

const roleConfig: Record<string, string> = ROLES;

const roleColors: Record<string, string> = {
  ADMIN: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  MANAGER: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  STAFF: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  CASHIER: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  CHEF: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    roleCode: 'STAFF',
    status: 'ACTIVE',
  });
  const [passwordVisibility, setPasswordVisibility] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res: any = await userApi.getUsers({ page: 0, size: API_CONFIG.PAGINATION.MAX_SIZE });
      const rawUsers = res?.data?.items ?? res?.items ?? res?.content ?? [];
      
      const normalizedUsers = Array.isArray(rawUsers) ? rawUsers.map((u: any) => ({
        id: u.id ?? u.userId,
        firstName: u.firstName ?? '',
        lastName: u.lastName ?? '',
        fullName: u.fullName ?? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
        username: u.username ?? '',
        email: u.email ?? '',
        phone: u.phone ?? '',
        roleCode: String(u.roleCode ?? u.role ?? 'STAFF').toUpperCase(),
        status: (u.status ?? 'ACTIVE').toUpperCase(),
      })) : [];

      setUsers(normalizedUsers);
    } catch (e) {
      console.error('Fetch users failed', e);
      toast.error(UI_MESSAGES.ERROR.LOAD_FAILED);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenDialog = (user?: UserResponse) => {
    if (user) {
      setEditingUser(user);
      setForm({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        fullName: user.fullName ?? '',
        username: user.username ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
        password: '',
        confirmPassword: '',
        roleCode: user.roleCode ?? 'STAFF',
        status: user.status ?? 'ACTIVE',
      });
    } else {
      setEditingUser(null);
      setForm({
        firstName: '',
        lastName: '',
        fullName: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        roleCode: 'STAFF',
        status: 'ACTIVE',
      });
      setPasswordVisibility(false);
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      
      // Basic validation
      if (!form.username || !form.firstName || !form.lastName) {
        toast.error(UI_MESSAGES.ERROR.MISSING_INPUT);
        return;
      }

      if (editingUser) {
        // Update
        const updateData: UpdateUserRequest = {
            firstName: form.firstName,
            lastName: form.lastName,
            fullName: form.fullName || `${form.firstName} ${form.lastName}`,
            username: form.username,
            phone: form.phone
        };
        await userApi.updateUser(editingUser.id, updateData);
        toast.success(UI_MESSAGES.SUCCESS.UPDATE);
      } else {
        // Create
        if (form.password !== form.confirmPassword) {
            toast.error(UI_MESSAGES.ERROR.PASSWORD_MISMATCH);
            return;
        }
        const createData: CreateUserRequest = {
            ...form,
            fullName: form.fullName || `${form.firstName} ${form.lastName}`,
            status: form.status as any,
            roleCode: form.roleCode, // Only send roleCode on create
        };
        await userApi.createUser(createData);
        toast.success(UI_MESSAGES.SUCCESS.CREATE);
      }
      
      setIsDialogOpen(false);
      fetchUsers();
    } catch (e) {
      console.error('Save user failed', e);
      toast.error(UI_MESSAGES.ERROR.ACTION_FAILED);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: UserResponse) => {
    try {
      if (user.status === 'ACTIVE') {
        await userApi.banUser(user.id);
        toast.success(UI_MESSAGES.SUCCESS.ACTION);
      } else {
        await userApi.activateUser(user.id);
        toast.success(UI_MESSAGES.SUCCESS.ACTION);
      }
      // Optimistic update
      setUsers(prev => prev.map(u => u.id === user.id ? {
        ...u,
        status: user.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE'
      } : u));
    } catch (e) {
      console.error('Toggle status failed', e);
      toast.error(UI_MESSAGES.ERROR.ACTION_FAILED);
    }
  };

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logic
  const filteredUsers = users.filter((user) => {
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.roleCode === roleFilter;
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery);
    return matchesStatus && matchesRole && matchesSearch;
  });

  // Stats logic
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'ACTIVE').length,
    banned: users.filter(u => u.status === 'BANNED').length,
    new: 0
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Quản lý nhân viên"
        description="Quản lý đội ngũ và phân quyền hệ thống"
      />

      <div className="flex-1 space-y-8 p-6 lg:p-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-md rounded-[32px] overflow-hidden border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Tổng nhân sự</p>
                  <h3 className="text-3xl font-bold mt-1 text-white">{stats.total}</h3>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-emerald-500/5 border-emerald-500/10 backdrop-blur-md rounded-[32px] overflow-hidden border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-400/80">Đang làm việc</p>
                  <h3 className="text-3xl font-bold mt-1 text-emerald-400">{stats.active}</h3>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-500/5 border-red-500/10 backdrop-blur-md rounded-[32px] overflow-hidden border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-400/80">Tài khoản bị khóa</p>
                  <h3 className="text-3xl font-bold mt-1 text-red-400">{stats.banned}</h3>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                  <UserX className="h-6 w-6 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-500/5 border-amber-500/10 backdrop-blur-md rounded-[32px] overflow-hidden border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-400/80">Nhân sự mới</p>
                  <h3 className="text-3xl font-bold mt-1 text-amber-400">{stats.new}</h3>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/40 backdrop-blur-md p-6 rounded-[32px] border-2 border-slate-800">
          <div className="flex flex-1 flex-wrap items-center gap-4 w-full">
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Tìm nhân viên theo tên, email, sđt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 bg-slate-800/50 border-slate-700 rounded-2xl h-12 text-white placeholder:text-slate-500 focus:ring-blue-500/20"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-slate-800/50 border-slate-700 rounded-2xl h-12 text-white">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-white">
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                <SelectItem value="BANNED">Bị khóa</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px] bg-slate-800/50 border-slate-700 rounded-2xl h-12 text-white">
                <SelectValue placeholder="Chức vụ" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-white">
                <SelectItem value="all">Tất cả chức vụ</SelectItem>
                {Object.entries(roleConfig).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={() => handleOpenDialog()}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl px-6 h-12 shadow-lg shadow-blue-600/20 w-full md:w-auto transition-all active:scale-95"
          >
            <Plus className="mr-2 h-5 w-5" />
            Thêm nhân viên
          </Button>
        </div>

        {/* Table Section */}
        <div className="bg-slate-900/40 backdrop-blur-md rounded-[32px] border-2 border-slate-800 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-800/30">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400 font-bold h-16 px-6">NHÂN VIÊN</TableHead>
                <TableHead className="text-slate-400 font-bold h-16 px-6">LIÊN HỆ</TableHead>
                <TableHead className="text-slate-400 font-bold h-16 px-6">VAI TRÒ</TableHead>
                <TableHead className="text-slate-400 font-bold h-16 px-6 text-center">TRẠNG THÁI</TableHead>
                <TableHead className="w-[80px] px-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-500 mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center text-slate-500">
                    Không tìm thấy nhân viên nào phù hợp
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400 font-bold">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white text-base">{user.fullName}</div>
                          <div className="text-sm text-slate-500">@{user.username}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="text-sm text-slate-300 font-medium">{user.email}</div>
                      <div className="text-sm text-slate-500">{user.phone}</div>
                    </TableCell>
                    <TableCell className="px-6">
                        <Badge variant="outline" className={cn("rounded-lg px-3 py-1 font-bold border-2", roleColors[user.roleCode] || roleColors.STAFF)}>
                          {roleConfig[user.roleCode] || user.roleCode}
                        </Badge>
                    </TableCell>
                    <TableCell className="px-6 text-center">
                      <Badge
                        className={cn('rounded-full px-3 py-1 font-bold border-2', statusConfig[user.status as keyof typeof statusConfig]?.className)}
                        variant="outline"
                      >
                        {statusConfig[user.status as keyof typeof statusConfig]?.label || user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-800">
                            <MoreHorizontal className="h-5 w-5 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-white rounded-2xl p-2 min-w-[180px]">
                          <DropdownMenuItem onClick={() => handleOpenDialog(user)} className="rounded-xl focus:bg-slate-800 cursor-pointer py-2.5">
                            <UserCog className="mr-3 h-4 w-4 text-blue-400" />
                            <span>Chỉnh sửa thông tin</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(user)} className="rounded-xl focus:bg-slate-800 cursor-pointer py-2.5">
                             {user.status === 'ACTIVE' ? (
                                <>
                                    <Ban className="mr-3 h-4 w-4 text-red-400" />
                                    <span className="text-red-400 font-medium">Khóa tài khoản</span>
                                </>
                             ) : (
                                <>
                                    <CheckCircle className="mr-3 h-4 w-4 text-emerald-400" />
                                    <span className="text-emerald-400 font-medium">Kích hoạt tài khoản</span>
                                </>
                             )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white rounded-[32px] max-w-2xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{editingUser ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
             <div className="space-y-2">
                <Label className="text-slate-400 text-sm font-medium">Họ</Label>
                <Input 
                    value={form.firstName} 
                    onChange={e => setForm({...form, firstName: e.target.value})} 
                    placeholder="Ví dụ: Nguyễn"
                    className="bg-slate-800/50 border-slate-700 rounded-2xl h-12 text-white focus:ring-blue-500/20"
                />
             </div>
             <div className="space-y-2">
                <Label className="text-slate-400 text-sm font-medium">Tên</Label>
                <Input 
                    value={form.lastName} 
                    onChange={e => setForm({...form, lastName: e.target.value})} 
                    placeholder="Ví dụ: Văn A"
                    className="bg-slate-800/50 border-slate-700 rounded-2xl h-12 text-white focus:ring-blue-500/20"
                />
             </div>
             <div className="space-y-2 md:col-span-2">
                <Label className="text-slate-400 text-sm font-medium">Họ và tên đầy đủ (Hiển thị)</Label>
                <Input 
                    value={form.fullName} 
                    onChange={e => setForm({...form, fullName: e.target.value})} 
                    placeholder="Nguyễn Văn A"
                    className="bg-slate-800/50 border-slate-700 rounded-2xl h-12 text-white focus:ring-blue-500/20"
                />
             </div>
             <div className="space-y-2">
                <Label className="text-slate-400 text-sm font-medium">Tên đăng nhập</Label>
                <Input 
                    value={form.username} 
                    onChange={e => setForm({...form, username: e.target.value})} 
                    placeholder="username"
                    className="bg-slate-800/50 border-slate-700 rounded-2xl h-12 text-white focus:ring-blue-500/20"
                />
             </div>
             <div className="space-y-2">
                <Label className="text-slate-400 text-sm font-medium">Số điện thoại</Label>
                <Input 
                    value={form.phone} 
                    onChange={e => setForm({...form, phone: e.target.value})} 
                    placeholder="09..."
                    className="bg-slate-800/50 border-slate-700 rounded-2xl h-12 text-white focus:ring-blue-500/20"
                />
             </div>
             <div className="space-y-2">
                <Label className="text-slate-400 text-sm font-medium">Email liên hệ</Label>
                <Input 
                    value={form.email} 
                    onChange={e => setForm({...form, email: e.target.value})} 
                    type="email"
                    disabled={!!editingUser}
                    className="bg-slate-800/50 border-slate-700 rounded-2xl h-12 text-white focus:ring-blue-500/20 disabled:opacity-50"
                />
             </div>
             <div className="space-y-2">
                <Label className="text-slate-400 text-sm font-medium">Vai trò hệ thống</Label>
                 <Select 
                    value={form.roleCode} 
                    onValueChange={v => setForm({...form, roleCode: v})}
                    disabled={!!editingUser}
                 >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 rounded-2xl h-12 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                    <SelectItem value="MANAGER">Quản lý</SelectItem>
                    <SelectItem value="STAFF">Nhân viên</SelectItem>
                    <SelectItem value="CASHIER">Thu ngân</SelectItem>
                    <SelectItem value="CHEF">Đầu bếp</SelectItem>
                  </SelectContent>
                </Select>
             </div>
             {!editingUser && (
                <>
                    <div className="space-y-2">
                        <Label className="text-slate-400 text-sm font-medium">Mật khẩu</Label>
                        <div className="relative">
                            <Input 
                                value={form.password} 
                                onChange={e => setForm({...form, password: e.target.value})} 
                                type={passwordVisibility ? "text" : "password"}
                                className="bg-slate-800/50 border-slate-700 rounded-2xl h-12 text-white focus:ring-blue-500/20 pr-12"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn("absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-400 hover:text-white")}
                                onClick={() => setPasswordVisibility(!passwordVisibility)}
                            >
                                {passwordVisibility ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-slate-400 text-sm font-medium">Xác nhận mật khẩu</Label>
                        <Input 
                            value={form.confirmPassword} 
                            onChange={e => setForm({...form, confirmPassword: e.target.value})} 
                            type={passwordVisibility ? "text" : "password"}
                            className="bg-slate-800/50 border-slate-700 rounded-2xl h-12 text-white focus:ring-blue-500/20"
                        />
                    </div>
                </>
             )}
          </div>
          <DialogFooter className="gap-3 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)} 
              disabled={isSubmitting}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 rounded-2xl px-6 h-12"
            >
              Hủy bỏ
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl px-8 h-12 shadow-lg shadow-blue-600/20"
            >
                {isSubmitting ? 'Đang xử lý...' : (editingUser ? 'Cập nhật nhân viên' : 'Thêm nhân viên')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
