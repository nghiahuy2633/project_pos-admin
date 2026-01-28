import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <Outlet />
    </div>
  );
}
