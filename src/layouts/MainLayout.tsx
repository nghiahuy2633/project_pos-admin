import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/ui/layouts/Sidebars';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64 transition-all duration-300">
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
