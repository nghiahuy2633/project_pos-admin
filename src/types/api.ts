/**
 * POS API Schemas
 * Synchronized with OpenAPI 3.1.0 definition
 */

export type UUID = string;
export type LocalDate = string; // format: yyyy-MM-dd
export type LocalDateTime = string; // format: yyyy-MM-ddTHH:mm:ss

export type OrderStatus = 'OPEN' | 'CONFIRMED' | 'PAID' | 'CANCELLED';
export type UserStatus = 'ACTIVE' | 'BANNED';

// Generic Pagination Interface
export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface AddOrderItemRequest {
  productId: UUID;
  quantity?: number;
  notes?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface CreateProductRequest {
  name?: string;
  categoryId?: UUID;
  price?: number;
}

export interface CreateUserRequest {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  password: string;
  confirmPassword: string;
  status: UserStatus;
  roleCode: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface OrderItemResponse {
  id: UUID;
  productId: UUID;
  productName: string;
  quantity: number;
  price: number;
  note?: string;
  notes?: string;
  status?: string;
}

export interface OrderResponse {
  orderId?: UUID;
  tableId?: UUID;
  status?: OrderStatus;
  currentBatchNo?: number;
  totalAmount?: number;
  totalQuantity?: number;
  createdAt?: LocalDateTime;
  confirmedAt?: LocalDateTime;
  cancelledAt?: LocalDateTime;
  items?: OrderItemResponse[]; // Add items field
}

// Specific Type Alias for Paginated Orders
export type PageResponseOrderResponse = PageResponse<OrderResponse>;

export interface ProductImageRequest {
  imageUrl?: string;
}

export interface UpdateProductRequest {
  name?: string;
  categoryId?: UUID;
  price?: number;
}

export interface UpdateUserRequest {
  phone: string;
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
}

// Inferred schemas from endpoints where details were omitted in Swagger components
export interface CategoryResponse {
  id: UUID;
  name: string;
}

export interface ProductResponse {
  id: UUID;
  name: string;
  price: number;
  imageUrl?: string;
  categoryId: UUID;
}

export interface TableResponse {
  id: UUID;
  number?: string;
  tableCode?: string;
  status?: string;
  capacity?: number;
}

export interface UserResponse {
  id: UUID;
  email: string;
  phone: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  roleCode: string;
  status: UserStatus;
}

export interface LoginResponse {
  token: string;
  user: UserResponse;
}

export interface StockRequest {
  productId: UUID;
  quantity: number;
}

export interface InventoryResponse {
  id: UUID;
  productId: UUID;
  totalQuantity: number;
  availableQuantity: number;
}
