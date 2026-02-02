import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/ui/layouts/Sidebars';
import { cn } from '@/lib/utils';

const SIDEBAR_COLLAPSED_KEY = 'pos_admin_sidebar_collapsed';
const UI_EVENT = 'pos-admin:ui';

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1');

  useEffect(() => {
    const sync = () => setCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1');
    window.addEventListener(UI_EVENT, sync);
    return () => window.removeEventListener(UI_EVENT, sync);
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0');
    window.dispatchEvent(new Event(UI_EVENT));
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={toggleCollapsed} />
      <div className={cn("transition-all duration-300", collapsed ? "pl-20" : "pl-72")}>
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
