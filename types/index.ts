export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  isHandloom: boolean;
  sku?: string | null;
  quantity?: number;
  status?: string;
  fabric?: string;
  weaveType?: string;
  color?: string;
  occasion?: string;
  blouseIncluded?: boolean;
  weight?: string;
  length?: string;
  inStock: boolean;
  stockQuantity?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  fallPico: boolean;
  fallPicoPrice: number;
  isHandloom?: boolean;
  itemTotal?: number;
}

export interface ServerCartItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    quantity: number;
    isHandloom: boolean;
  };
  quantity: number;
  fallPico: boolean;
  fallPicoPrice: number;
  itemTotal: number;
}

export interface CartResponse {
  id: string;
  items: ServerCartItem[];
  itemCount: number;
  subtotal: number;
  gst: number;
  shippingCost: number;
  total: number;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  addressLine: string;
  city?: string;
  state?: string;
  pinCode: string;
  isDefault: boolean;
  createdAt: string;
}

export interface ShippingAddress {
  name: string;
  email: string;
  phone: string;
  address: string;
  pinCode: string;
  city?: string;
  state?: string;
}

export type PaymentMethod = "RAZORPAY" | "COD";

export interface OrderItem {
  id?: string;
  productId: string;
  name: string;
  category?: string | null;
  price: number;
  quantity: number;
  fallPico: boolean;
  fallPicoPrice: number;
  gstRate?: number;
  gstAmount?: number;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export interface Order {
  id: string;
  userId?: string | null;
  customerName?: string;
  customerEmail: string;
  email?: string;
  phone?: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  pinCode?: string;
  city?: string | null;
  state?: string | null;
  paymentMethod: PaymentMethod;
  subtotal: number;
  shippingCost?: number;
  gst: number;
  gstAmount?: number;
  discountAmount?: number;
  total: number;
  status: OrderStatus;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  paymentId?: string | null;
  awbNumber?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CodEligibilityResponse {
  available: boolean;
  reason?: string;
}

export interface PaymentOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}

export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  addedAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: AuthResponse) => void;
  logout: () => void;
  mounted: boolean;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, fallPico?: boolean) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  toggleFallPico: (cartItemId: string, enabled: boolean) => void;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  itemCount: number;
  subtotal: number;
  gst: number;
  shippingCost: number;
  total: number;
}

export interface WishlistContextType {
  items: WishlistItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}
