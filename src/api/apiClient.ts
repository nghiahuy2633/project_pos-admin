import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type {
  ChangePasswordRequest,
  CreateProductRequest,
  CreateUserRequest,
  LoginRequest,
  LoginResponse,
  OrderResponse,
  PageResponse,
  PageResponseOrderResponse,
  ProductImageRequest,
  ProductResponse,
  UpdateProductRequest,
  UpdateUserRequest,
  UserResponse,
  CategoryResponse,
  TableResponse,
  UUID,
  OrderStatus,
  LocalDate
} from '@/types/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('token') ||
    sessionStorage.getItem('token') ||
    localStorage.getItem('access_token') ||
    sessionStorage.getItem('access_token') ||
    localStorage.getItem('jwt') ||
    sessionStorage.getItem('jwt');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Data extraction and 401 handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      localStorage.removeItem('access_token');
      sessionStorage.removeItem('access_token');
      localStorage.removeItem('jwt');
      sessionStorage.removeItem('jwt');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error: unknown, fallback = 'Thao tác thất bại'): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data: any = error.response?.data;
    const serverMessage =
      data?.message ||
      data?.error ||
      data?.detail ||
      data?.title ||
      (typeof data === 'string' ? data : undefined);

    if (status === 401) return 'Email hoặc mật khẩu không đúng';
    if (serverMessage && typeof serverMessage === 'string') return serverMessage;
    if (error.message) return error.message;
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

/**
 * API Groups
 */

export const authApi = {
  login: (data: LoginRequest): Promise<LoginResponse> => 
    apiClient.post('/auth/login', data),
};

export const categoryApi = {
  getCategories: (params?: { page?: number; size?: number }): Promise<PageResponse<CategoryResponse>> => 
    apiClient.get('/category', { params }),
  
  getProductsByCategory: (id: UUID, params?: { page?: number; size?: number }): Promise<PageResponse<ProductResponse>> => 
    apiClient.get(`/category/${id}/products`, { params }),
};

export const productApi = {
  getProducts: (params?: { page?: number; size?: number }): Promise<PageResponse<ProductResponse>> => 
    apiClient.get('/products', { params }),
    
  createProduct: (data: CreateProductRequest): Promise<void> => 
    apiClient.post('/products', data),
    
  getProductById: (id: UUID): Promise<ProductResponse> => 
    apiClient.get(`/products/${id}`),
    
  updateProduct: (id: UUID, data: UpdateProductRequest): Promise<ProductResponse> => 
    apiClient.put(`/products/${id}`, data),
    
  deleteProduct: (id: UUID): Promise<void> => 
    apiClient.delete(`/products/${id}`),
    
  attachImage: (id: UUID, data: ProductImageRequest): Promise<void> => 
    apiClient.put(`/products/${id}/image`, data),
    
  removeImage: (id: UUID): Promise<void> => 
    apiClient.delete(`/products/${id}/image`),
};

export const uploadApi = {
  uploadFile: (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const orderApi = {
  getOrders: (params?: { 
    page?: number; 
    size?: number; 
    status?: OrderStatus; 
    fromDate?: LocalDate; 
    toDate?: LocalDate 
  }): Promise<PageResponseOrderResponse> => 
    apiClient.get('/orders', { params }),
    
  getActiveOrderByTable: (tableId: UUID): Promise<OrderResponse> => 
    apiClient.get(`/orders/tables/${tableId}/active`),
    
  openTable: (tableId: UUID): Promise<void> => 
    apiClient.post(`/orders/tables/${tableId}/open`),
    
  getOrderDetail: (orderId: UUID): Promise<OrderResponse> => 
    apiClient.get(`/orders/${orderId}`),
    
  confirmOrder: (orderId: UUID): Promise<void> => 
    apiClient.post(`/orders/${orderId}/confirm`),
    
  addItemToOrder: (orderId: UUID, data: { productId: UUID; quantity: number; notes?: string }): Promise<void> => 
    apiClient.post(`/orders/${orderId}/items`, data),
    
  cancelOrderItem: (orderId: UUID, orderItemId: UUID): Promise<void> => 
    apiClient.delete(`/orders/${orderId}/items/${orderItemId}`),
    
  payOrder: (orderId: UUID): Promise<void> => 
    apiClient.post(`/orders/${orderId}/pay`),
};

export const tableApi = {
  getTables: (params?: { page?: number; size?: number }): Promise<PageResponse<TableResponse>> => 
    apiClient.get('/tables', { params }),
    
  getTableById: (id: UUID): Promise<TableResponse> => 
    apiClient.get(`/tables/${id}`),

  createTable: (data: any): Promise<void> => 
    apiClient.post('/tables', data),

  updateTable: (id: UUID, data: any): Promise<void> => 
    apiClient.put(`/tables/${id}`, data),

  deleteTable: (id: UUID): Promise<void> => 
    apiClient.delete(`/tables/${id}`),
};

export const userApi = {
  getUsers: (params?: { page?: number; size?: number }): Promise<PageResponse<UserResponse>> => 
    apiClient.get('/users', { params }),
    
  createUser: (data: CreateUserRequest): Promise<void> => 
    apiClient.post('/users', data),
    
  getMyProfile: (): Promise<UserResponse> => 
    apiClient.get('/users/me'),
    
  updateMyProfile: (data: UpdateUserRequest): Promise<void> => 
    apiClient.put('/users/me', data),
    
  changePassword: (data: ChangePasswordRequest): Promise<void> => 
    apiClient.patch('/users/me/change-password', data),
    
  getUserById: (id: UUID): Promise<UserResponse> => 
    apiClient.get(`/users/${id}`),
    
  updateUser: (id: UUID, data: UpdateUserRequest): Promise<void> => 
    apiClient.put(`/users/${id}`, data),
    
  activateUser: (id: UUID): Promise<void> => 
    apiClient.put(`/users/${id}/active`),
    
  banUser: (id: UUID): Promise<void> => 
    apiClient.put(`/users/${id}/ban`),
};



export default apiClient;
