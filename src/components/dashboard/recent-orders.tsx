import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const recentOrders = [
  {
    id: 'ORD-001',
    table: 'Bàn 5',
    items: 4,
    total: 485_000,
    status: 'OPEN',
    time: '5 phút trước',
  },
  {
    id: 'ORD-002',
    table: 'Bàn 12',
    items: 2,
    total: 210_000,
    status: 'PAID',
    time: '12 phút trước',
  },
  {
    id: 'ORD-003',
    table: 'Bàn 3',
    items: 6,
    total: 720_000,
    status: 'OPEN',
    time: '18 phút trước',
  },
  {
    id: 'ORD-004',
    table: 'Bàn 8',
    items: 3,
    total: 350_000,
    status: 'CANCELLED',
    time: '25 phút trước',
  },
  {
    id: 'ORD-005',
    table: 'Bàn 1',
    items: 5,
    total: 580_000,
    status: 'PAID',
    time: '32 phút trước',
  },
];

const statusConfig = {
  OPEN: {
    label: 'Đang xử lý',
    className: 'bg-warning/20 text-warning border-warning/30',
  },
  PAID: {
    label: 'Đã thanh toán',
    className: 'bg-success/20 text-success border-success/30',
  },
  CANCELLED: {
    label: 'Đã hủy',
    className: 'bg-destructive/20 text-destructive border-destructive/30',
  },
} as const;

export function RecentOrders() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Đơn hàng gần đây</CardTitle>
        <CardDescription className="text-muted-foreground">
          5 đơn hàng mới nhất trong hệ thống
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-4"
            >
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-medium text-foreground">{order.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.table} - {order.items} món
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium text-foreground">
                    {order.total.toLocaleString('vi-VN')} VNĐ
                  </p>
                  <p className="text-xs text-muted-foreground">{order.time}</p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'border',
                    statusConfig[order.status as keyof typeof statusConfig]
                      .className,
                  )}
                >
                  {statusConfig[order.status as keyof typeof statusConfig]
                    .label}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
