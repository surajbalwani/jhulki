export interface ProductStock {
  id?: string;
  productId?: string;
  size: string;
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number | null;
  images: string[];
  categoryId: string;
  category?: Category;
  isFeatured: boolean;
  isNewArrival?: boolean;
  stock?: ProductStock[];
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
  avatarUrl?: string;
}

export interface Address {
  id: string;
  userId: string;
  title: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  size: string;
  quantity: number;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  size: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  shippingName: string;
  shippingStreet: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  shippingPhone: string;
  paymentMethod: string;
  items: OrderItem[];
  createdAt: string;
}
