import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { clearAuthTokens, userApi } from '@/api/apiClient';
import type { UserResponse } from '@/types/api';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';

interface HeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function Header({ title, description, children }: HeaderProps) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [me, setMe] = useState<UserResponse | null>(null);

  const initials = useMemo(() => {
    const name = (me?.fullName || '').trim();
    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? 'U';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
    return (first + last).toUpperCase();
  }, [me?.fullName]);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res: any = await userApi.getMyProfile();
        const data = res?.data ?? res;
        const user: UserResponse = data?.data ?? data;
        setMe(user);
      } catch {
        setMe(null);
      }
    };

    fetchMe();
  }, []);

  const handleLogout = () => {
    clearAuthTokens();
    toast.success(t('toast.logged_out'));
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between px-8 bg-[#0b1120]/80 backdrop-blur-md border-b border-slate-800/50">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
        {description && (
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-6">
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
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left xl:block">
                  <p className="text-sm font-bold text-white leading-none">{me?.fullName || 'Tài khoản'}</p>
                  <p className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-wider">{me?.roleCode || '—'}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-slate-900 border-slate-800 p-2 rounded-xl">
              <DropdownMenuLabel className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('account.label')}</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-800" />
              <DropdownMenuItem
                className="rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer transition-colors"
                onSelect={(e) => {
                  e.preventDefault();
                  navigate('/profile');
                }}
              >
                <User className="mr-3 h-4 w-4 text-blue-500" />
                {t('account.profile')}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer transition-colors"
                onSelect={(e) => {
                  e.preventDefault();
                  navigate('/settings');
                }}
              >
                {t('account.settings')}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-800" />
              <DropdownMenuItem
                className="rounded-lg px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-400 cursor-pointer transition-colors"
                onSelect={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
              >
                <LogOut className="mr-3 h-4 w-4" />
                {t('account.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
