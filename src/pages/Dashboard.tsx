import { Header } from '@/components/ui/layouts/Header';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { SalesChart } from '@/components/dashboard/sales-chart';
import { RecentOrders } from '@/components/dashboard/recent-orders';
import { TopProducts } from '@/components/dashboard/top-products';

export default function DashboardPage() {
  return (
    <div className="flex flex-col">
      <Header
        title="Dashboard"
        description="Tổng quan hoạt động kinh doanh hôm nay"
      />
      <div className="flex-1 space-y-6 p-6">
        <StatsCards />
        <div className="grid gap-6 lg:grid-cols-2">
          <SalesChart />
          <TopProducts />
        </div>
        <RecentOrders />
      </div>
    </div>
  );
}
