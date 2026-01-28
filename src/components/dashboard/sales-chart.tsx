import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const salesData = [
  { name: 'T2', revenue: 8_500_000, orders: 120 },
  { name: 'T3', revenue: 9_200_000, orders: 135 },
  { name: 'T4', revenue: 7_800_000, orders: 110 },
  { name: 'T5', revenue: 11_500_000, orders: 165 },
  { name: 'T6', revenue: 14_200_000, orders: 195 },
  { name: 'T7', revenue: 16_800_000, orders: 230 },
  { name: 'CN', revenue: 12_450_000, orders: 156 },
];

const formatVND = (value: number) => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  return `${(value / 1_000).toFixed(0)}K`;
};

export function SalesChart() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Doanh thu tuần này</CardTitle>
        <CardDescription className="text-muted-foreground">
          Biểu đồ doanh thu và số đơn hàng theo ngày
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="oklch(0.546 0.245 262.881)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="oklch(0.546 0.245 262.881)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.279 0.041 260.031)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="oklch(0.704 0.04 256.788)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="oklch(0.704 0.04 256.788)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatVND}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.208 0.042 265.755)',
                  border: '1px solid oklch(0.279 0.041 260.031)',
                  borderRadius: '8px',
                  color: 'oklch(0.968 0.007 247.858)',
                }}
                formatter={(value: number, name: string) => [
                  name === 'revenue'
                    ? `${value.toLocaleString('vi-VN')} VNĐ`
                    : `${value} đơn`,
                  name === 'revenue' ? 'Doanh thu' : 'Đơn hàng',
                ]}
                labelStyle={{ color: 'oklch(0.968 0.007 247.858)' }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="oklch(0.546 0.245 262.881)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
