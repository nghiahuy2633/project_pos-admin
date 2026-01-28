import { Bell, Search, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function Header({ title, description, children }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between px-8 bg-[#0b1120]/80 backdrop-blur-md border-b border-slate-800/50">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
        {description && (
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            type="search"
            placeholder="Tìm kiếm..."
            className="w-80 h-11 bg-slate-900/50 border-slate-800 rounded-xl pl-11 text-sm text-slate-200 placeholder:text-slate-600 focus:ring-2 focus:ring-blue-600/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          {children}
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative h-11 w-11 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-4 w-4 bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-[#0b1120]">
              3
            </span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-11 flex items-center gap-3 px-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:bg-slate-800 transition-all">
                <Avatar className="h-8 w-8 rounded-lg border border-blue-600/30">
                  <AvatarImage src="/avatars/admin.png" alt="Admin" />
                  <AvatarFallback className="bg-blue-600 text-white font-bold text-xs rounded-lg">
                    AD
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left xl:block">
                  <p className="text-sm font-bold text-white leading-none">Admin</p>
                  <p className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-wider">Quản trị viên</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-slate-900 border-slate-800 p-2 rounded-xl">
              <DropdownMenuLabel className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Tài khoản của tôi</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-800" />
              <DropdownMenuItem className="rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer transition-colors">
                <User className="mr-3 h-4 w-4 text-blue-500" />
                Hồ sơ
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer transition-colors">
                Cài đặt
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-800" />
              <DropdownMenuItem className="rounded-lg px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-400 cursor-pointer transition-colors">
                <LogOut className="mr-3 h-4 w-4" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
