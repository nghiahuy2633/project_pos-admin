import { Header } from '@/components/ui/layouts/Header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Utensils,
} from 'lucide-react';

const monthlyData = [
  { name: 'T1', revenue: 85_000_000, orders: 1_200 },
  { name: 'T2', revenue: 92_000_000, orders: 1_350 },
  { name: 'T3', revenue: 78_000_000, orders: 1_100 },
  { name: 'T4', revenue: 115_000_000, orders: 1_650 },
  { name: 'T5', revenue: 142_000_000, orders: 1_950 },
  { name: 'T6', revenue: 168_000_000, orders: 2_300 },
  { name: 'T7', revenue: 155_000_000, orders: 2_100 },
  { name: 'T8', revenue: 178_000_000, orders: 2_450 },
  { name: 'T9', revenue: 165_000_000, orders: 2_250 },
  { name: 'T10', revenue: 189_000_000, orders: 2_600 },
  { name: 'T11', revenue: 195_000_000, orders: 2_700 },
  { name: 'T12', revenue: 220_000_000, orders: 3_000 },
];

const categoryData = [
  { name: 'Phở & Bún', value: 35, color: 'oklch(0.546 0.245 262.881)' },
  { name: 'Cơm', value: 25, color: 'oklch(0.696 0.17 162.48)' },
  { name: 'Bánh', value: 15, color: 'oklch(0.769 0.188 70.08)' },
  { name: 'Đồ uống', value: 18, color: 'oklch(0.627 0.265 303.9)' },
  { name: 'Khai vị', value: 7, color: 'oklch(0.645 0.246 16.439)' },
];

const formatVND = (value: number) => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(0)}M`;
  }
  return `${(value / 1_000).toFixed(0)}K`;
};

export default function ReportsPage() {
  return (
    <div className="flex flex-col">
      <Header
        title="Báo cáo & Thống kê"
        description="Phân tích dữ liệu kinh doanh"
      />
      <div className="flex-1 space-y-6 p-6">
        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Select defaultValue="2024">
              <SelectTrigger className="w-32 bg-secondary text-foreground">
                <SelectValue placeholder="Năm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-40 bg-secondary text-foreground">
                <SelectValue placeholder="Khoảng thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Cả năm</SelectItem>
                <SelectItem value="q1">Quý 1</SelectItem>
                <SelectItem value="q2">Quý 2</SelectItem>
                <SelectItem value="q3">Quý 3</SelectItem>
                <SelectItem value="q4">Quý 4</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            className="border-border text-foreground bg-transparent"
          >
            <Download className="mr-2 h-4 w-4" />
            Xuất báo cáo
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng doanh thu
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">1.78 tỷ VNĐ</p>
              <div className="flex items-center gap-1 text-success">
                <TrendingUp className="h-3 w-3" />
                <span className="text-xs">+15.2% so với năm trước</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng đơn hàng
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">24,650</p>
              <div className="flex items-center gap-1 text-success">
                <TrendingUp className="h-3 w-3" />
                <span className="text-xs">+12.8% so với năm trước</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Khách hàng mới
              </CardTitle>
              <Users className="h-4 w-4 text-chart-3" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">3,245</p>
              <div className="flex items-center gap-1 text-destructive">
                <TrendingDown className="h-3 w-3" />
                <span className="text-xs">-3.1% so với năm trước</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Giá trị TB/đơn
              </CardTitle>
              <Utensils className="h-4 w-4 text-chart-4" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">72,200 VNĐ</p>
              <div className="flex items-center gap-1 text-success">
                <TrendingUp className="h-3 w-3" />
                <span className="text-xs">+2.1% so với năm trước</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue Chart */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">
                Doanh thu theo tháng
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Biểu đồ doanh thu 12 tháng gần nhất
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={monthlyData}>
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
                      formatter={(value: number) => [
                        `${value.toLocaleString('vi-VN')} VNĐ`,
                        'Doanh thu',
                      ]}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="oklch(0.546 0.245 262.881)"
                      radius={[4, 4, 0, 0]}
                    />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">
                Phân bố theo danh mục
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Tỷ lệ doanh thu theo từng danh mục món ăn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                      labelLine={false}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(0.208 0.042 265.755)',
                        border: '1px solid oklch(0.279 0.041 260.031)',
                        borderRadius: '8px',
                        color: 'oklch(0.968 0.007 247.858)',
                      }}
                      formatter={(value: number) => [`${value}%`, 'Tỷ lệ']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-4">
                {categoryData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Orders Trend */}
          <Card className="border-border bg-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-foreground">
                Xu hướng đơn hàng
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Số lượng đơn hàng theo tháng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
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
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(0.208 0.042 265.755)',
                        border: '1px solid oklch(0.279 0.041 260.031)',
                        borderRadius: '8px',
                        color: 'oklch(0.968 0.007 247.858)',
                      }}
                      formatter={(value: number) => [`${value} đơn`, 'Đơn hàng']}
                    />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="oklch(0.696 0.17 162.48)"
                      strokeWidth={2}
                      dot={{
                        fill: 'oklch(0.696 0.17 162.48)',
                        strokeWidth: 2,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
