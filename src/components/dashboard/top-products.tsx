import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const topProducts = [
  { name: 'Phở Bò Tái Nạm', sold: 145, percentage: 100 },
  { name: 'Bún Chả Hà Nội', sold: 128, percentage: 88 },
  { name: 'Cơm Tấm Sườn Bì', sold: 112, percentage: 77 },
  { name: 'Bánh Mì Thịt Nướng', sold: 98, percentage: 68 },
  { name: 'Gỏi Cuốn Tôm Thịt', sold: 85, percentage: 59 },
];

export function TopProducts() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Món bán chạy</CardTitle>
        <CardDescription className="text-muted-foreground">
          Top 5 món ăn được đặt nhiều nhất hôm nay
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topProducts.map((product, index) => (
            <div key={product.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {product.name}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.sold} phần
                </span>
              </div>
              <Progress value={product.percentage} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
