import { DollarSign, ShoppingCart, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const stats = [
  {
    title: 'Doanh thu hôm nay',
    value: '12,450,000',
    unit: 'VNĐ',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
  },
  {
    title: 'Đơn hàng',
    value: '156',
    unit: 'đơn',
    change: '+8.2%',
    trend: 'up',
    icon: ShoppingCart,
  },
  {
    title: 'Khách hàng mới',
    value: '42',
    unit: 'người',
    change: '-2.4%',
    trend: 'down',
    icon: Users,
  },
  {
    title: 'Giá trị TB/đơn',
    value: '79,800',
    unit: 'VNĐ',
    change: '+5.1%',
    trend: 'up',
    icon: TrendingUp,
  },
];

export function StatsCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <stat.icon className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground">
                {stat.value}
              </span>
              <span className="text-sm text-muted-foreground">{stat.unit}</span>
            </div>
            <div className="mt-1 flex items-center gap-1">
              {stat.trend === 'up' ? (
                <TrendingUp className="h-3 w-3 text-success" />
              ) : (
                <TrendingDown className="h-3 w-3 text-destructive" />
              )}
              <span
                className={cn(
                  'text-xs font-medium',
                  stat.trend === 'up' ? 'text-success' : 'text-destructive',
                )}
              >
                {stat.change}
              </span>
              <span className="text-xs text-muted-foreground">
                so với hôm qua
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
