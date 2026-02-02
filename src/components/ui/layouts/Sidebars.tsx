import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  ShoppingCart,
  UtensilsCrossed,
  LayoutGrid,
  Users,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { clearAuthTokens } from '@/api/apiClient';
import { toast } from 'sonner';
import { useI18n, type I18nKey } from '@/lib/i18n';

const menuItems: Array<{
  titleKey: I18nKey;
  descriptionKey: I18nKey;
  href: string;
  icon: any;
}> = [
  {
    titleKey: 'sidebar.dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    descriptionKey: 'sidebar.desc.dashboard',
  },
  {
    titleKey: 'sidebar.pos',
    href: '/pos',
    icon: Store,
    descriptionKey: 'sidebar.desc.pos',
  },
  {
    titleKey: 'sidebar.orders',
    href: '/orders',
    icon: ShoppingCart,
    descriptionKey: 'sidebar.desc.orders',
  },
  {
    titleKey: 'sidebar.products',
    href: '/products',
    icon: UtensilsCrossed,
    descriptionKey: 'sidebar.desc.products',
  },
  {
    titleKey: 'sidebar.inventory',
    href: '/inventory',
    icon: Package,
    descriptionKey: 'sidebar.desc.inventory',
  },
  {
    titleKey: 'sidebar.tables',
    href: '/tables',
    icon: LayoutGrid,
    descriptionKey: 'sidebar.desc.tables',
  },
  {
    titleKey: 'sidebar.users',
    href: '/users',
    icon: Users,
    descriptionKey: 'sidebar.desc.users',
  },
  {
    titleKey: 'sidebar.reports',
    href: '/reports',
    icon: BarChart3,
    descriptionKey: 'sidebar.desc.reports',
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleLogout = () => {
    clearAuthTokens();
    toast.success(t('toast.logged_out'));
    navigate('/login');
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-[#0f172a] border-r border-slate-800 transition-all duration-300',
        collapsed ? 'w-20' : 'w-72',
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center justify-between px-6">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
                <UtensilsCrossed className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                POS Admin
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive =
                location.pathname === item.href ||
                location.pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      'flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200 group',
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100',
                    )}
                    title={collapsed ? t(item.titleKey) : undefined}
                  >
                    <item.icon className={cn(
                      "h-6 w-6 shrink-0 transition-colors",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-100"
                    )} />
                    {!collapsed && (
                      <div className="flex flex-col">
                        <span className="leading-none">{t(item.titleKey)}</span>
                        <span className={cn(
                          "mt-1 text-[11px] font-normal opacity-60",
                          isActive ? "text-blue-100" : "text-slate-500"
                        )}>
                          {t(item.descriptionKey)}
                        </span>
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-800/50">
          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              'flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-400 transition-all hover:bg-slate-800/50 hover:text-white group',
            )}
            title={collapsed ? t('account.logout') : undefined}
          >
            <LogOut className="h-6 w-6 shrink-0 text-slate-400 group-hover:text-white" />
            {!collapsed && <span>{t('account.logout')}</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
