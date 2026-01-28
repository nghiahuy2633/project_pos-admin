import { useRef, useState, useEffect } from 'react';
import { Header } from '@/components/ui/layouts/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus, Edit2, Trash2, UtensilsCrossed, Loader2, ImagePlus, X } from 'lucide-react';
import { productApi, categoryApi, uploadApi } from '@/api/apiClient';
import type { ProductResponse, CategoryResponse } from '@/types/api';
import { toast } from 'sonner';

const statusConfig = {
  available: {
    label: 'Còn hàng',
    className: 'bg-success/20 text-success border-success/30',
  },
  unavailable: {
    label: 'Hết hàng',
    className: 'bg-destructive/20 text-destructive border-destructive/30',
  },
} as const;

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);
  const [form, setForm] = useState<{ name: string; categoryId: string; price: number | string }>({
    name: '',
    categoryId: '',
    price: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCreateDialog = () => {
    setEditingProduct(null);
    setForm({ name: '', categoryId: '', price: '' });
    setIsDialogOpen(true);
  };

  const handleEdit = (product: ProductResponse) => {
    setEditingProduct(product);
    setForm({ name: product.name, categoryId: product.categoryId, price: product.price });
    setIsDialogOpen(true);
  };

  const reloadProducts = async () => {
    try {
      setIsLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        productApi.getProducts({ page: 0, size: 100 }),
        categoryApi.getCategories({ page: 0, size: 100 }),
      ]);
      const rawProducts = (productsRes as any)?.data?.items ?? (productsRes as any)?.items ?? (productsRes as any)?.content ?? [];
      const normalizedProducts = rawProducts.map((p: any) => ({
        id: p.id ?? p.productId,
        name: p.name ?? '',
        price: Number(p.price ?? 0),
        imageUrl: typeof p.imageUrl === 'string' ? p.imageUrl.trim() : undefined,
        categoryId: p.categoryId ?? '',
      }));
      setProducts(normalizedProducts);
      const rawCategories = (categoriesRes as any)?.data?.items ?? (categoriesRes as any)?.items ?? (categoriesRes as any)?.content ?? [];
      const normalizedCategories = rawCategories.map((c: any) => ({ id: c.id ?? c.categoryId, name: c.name ?? '' }));
      setCategories(normalizedCategories);
    } catch (e) {
      console.error('Reload failed', e);
      toast.error('Không thể tải danh sách');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      if (!form.name || !form.categoryId) {
        toast.error('Vui lòng nhập tên món và chọn danh mục');
        return;
      }
      
      const priceValue = typeof form.price === 'string' ? (Number(form.price) || 0) : form.price;

      if (editingProduct) {
        const updatedProduct = await productApi.updateProduct(editingProduct.id, { name: form.name, categoryId: form.categoryId, price: priceValue });
        setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p)));
        toast.success('Cập nhật món ăn thành công');
      } else {
        await productApi.createProduct({ name: form.name, categoryId: form.categoryId, price: priceValue });
        toast.success('Tạo món ăn thành công');
        await reloadProducts(); // Create vẫn cần reload vì API trả về void
      }
      setIsDialogOpen(false);
    } catch (e) {
      console.error('Save failed', e);
      toast.error('Thao tác thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (product: ProductResponse) => {
    try {
      await productApi.deleteProduct(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      toast.success('Xóa món ăn thành công');
    } catch (e) {
      console.error('Delete failed', e);
      toast.error('Xóa món ăn thất bại');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, product: ProductResponse) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const uploadRes: any = await uploadApi.uploadFile(file);
      console.log('DEBUG: Upload Response', uploadRes); // Log để kiểm tra structure
      
      const returnedUrl = 
        uploadRes?.imageUrl ?? 
        uploadRes?.url ?? 
        uploadRes?.data?.url ?? 
        uploadRes?.secure_url ?? 
        uploadRes?.path ?? 
        uploadRes?.Location ??
        uploadRes?.result?.url ??
        uploadRes?.fileDownloadUri ?? 
        uploadRes?.link ??
        (typeof uploadRes === 'string' ? uploadRes : undefined) ??
        (typeof uploadRes?.data === 'string' ? uploadRes.data : undefined);

      if (!returnedUrl) {
        throw new Error(`Không tìm thấy URL trong phản hồi: ${JSON.stringify(uploadRes)}`);
      }
      const cleanUrl = typeof returnedUrl === 'string' ? returnedUrl.trim() : String(returnedUrl);
      await productApi.attachImage(product.id, { imageUrl: cleanUrl });
      const updated = await productApi.getProductById(product.id);
      const finalUrl = typeof (updated as any)?.imageUrl === 'string' ? (updated as any).imageUrl.trim() : cleanUrl;
      const bustUrl = `${finalUrl}${finalUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, imageUrl: bustUrl } : p)));
      toast.success('Đính ảnh thành công');
    } catch (e) {
      console.error('Upload failed', e);
      toast.error('Tải ảnh thất bại');
    } finally {
      setIsUploading(false);
      setProductToUpload(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileUpload = (product: ProductResponse) => {
    // Store the product we want to attach image to in a temp state or use closure
    // Simpler: Just force click the hidden input and manage state
    // But we need to know WHICH product. 
    // Let's use a state for 'productToUpload'
    setProductToUpload(product);
    setTimeout(() => fileInputRef.current?.click(), 0);
  };
  
  const [productToUpload, setProductToUpload] = useState<ProductResponse | null>(null);

  const handleRemoveImage = async (product: ProductResponse) => {
    try {
      await productApi.removeImage(product.id);
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, imageUrl: undefined } : p)));
      toast.success('Xóa ảnh thành công');
    } catch (e) {
      console.error('Remove image failed', e);
      toast.error('Xóa ảnh thất bại');
    }
  };

  useEffect(() => {
    reloadProducts();
  }, []);

  const filteredProducts = (products ?? []).filter((product) => {
    const matchesCategory =
      selectedCategory === 'all' || product.categoryId === selectedCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => a.name.localeCompare(b.name));

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Chưa phân loại';
  };

  return (
    <div className="flex flex-col">
      <Header
        title="Quản lý Thực đơn"
        description="Quản lý các món ăn và danh mục"
      />
      <div className="flex-1 space-y-6 p-6">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => productToUpload && handleFileUpload(e, productToUpload)}
        />
        {/* Filters & Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm món ăn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-secondary pl-9 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px] bg-secondary text-foreground">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {(categories ?? []).map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Thêm món mới
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Cập nhật món ăn' : 'Thêm món ăn mới'}</DialogTitle>
                <DialogDescription>
                  {editingProduct ? 'Chỉnh sửa thông tin món ăn.' : 'Tạo món ăn mới vào thực đơn.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Tên món</Label>
                  <Input
                    id="name"
                    placeholder="Ví dụ: Phở bò"
                    className="col-span-3"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">Danh mục</Label>
                  <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {(categories ?? []).map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">Giá bán</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0"
                    className="col-span-3"
                    step="1000"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                <Button onClick={handleSave} disabled={isSubmitting}>
                  {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-muted-foreground">
            <UtensilsCrossed className="mb-2 h-8 w-8 opacity-50" />
            <p>Không tìm thấy món ăn nào</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden border-border bg-card transition-colors hover:bg-accent/5"
              >
                <div className="relative aspect-video w-full bg-muted object-cover group">
                  {/* Placeholder image logic since API might not return image yet */}
                  {product.imageUrl ? (
                    <>
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute top-1 right-1 opacity-0 transition-opacity group-hover:opacity-100">
                         <Button
                            variant="destructive"
                            size="icon"
                            className="h-6 w-6 rounded-full shadow-md"
                            onClick={() => handleRemoveImage(product)}
                            title="Xóa ảnh"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <UtensilsCrossed className="h-10 w-10 opacity-20" />
                    </div>
                  )}
                </div>
                <CardHeader className="p-4 pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="line-clamp-1 text-base font-medium">
                        {product.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {getCategoryName(product.categoryId)}
                      </p>
                    </div>
                    <Badge variant="outline" className={statusConfig.available.className}>
                      {statusConfig.available.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      {Number(product.price ?? 0).toLocaleString('vi-VN')} đ
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(product)}
                        title="Xóa món ăn"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => triggerFileUpload(product)}
                        title={product.imageUrl ? "Đổi ảnh" : "Đính ảnh"}
                        disabled={isUploading}
                      >
                        {isUploading && productToUpload?.id === product.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ImagePlus className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
