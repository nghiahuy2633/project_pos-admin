import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/ui/layouts/Sidebars';
import { cn } from '@/lib/utils';

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className={cn("transition-all duration-300", collapsed ? "pl-20" : "pl-72")}>
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
