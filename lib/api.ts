import type {
  Product,
  Order,
  User,
  AuthResponse,
  CodEligibilityResponse,
  PaymentOrderResponse,
  CartResponse,
  Address,
  ShippingAddress,
  OrderItem,
  PaymentMethod,
  OrderStatus,
  WishlistItem,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(err.message || "Request failed");
  }

  return res.json();
}

type BackendProduct = Omit<
  Partial<Product>,
  "images" | "price" | "quantity"
> & {
  id: string;
  name?: string | null;
  description?: string | null;
  category?: string | null;
  price?: number | string | null;
  images?: unknown;
  quantity?: number | string | null;
  status?: string | null;
};

type BackendOrder = Omit<
  Partial<Order>,
  | "shippingAddress"
  | "items"
  | "subtotal"
  | "shippingCost"
  | "gst"
  | "gstAmount"
  | "discountAmount"
  | "total"
  | "paymentMethod"
  | "status"
> & {
  id: string;
  customerName?: string | null;
  customerEmail?: string | null;
  email?: string | null;
  phone?: string | null;
  shippingAddress?: unknown;
  pinCode?: string | null;
  city?: string | null;
  state?: string | null;
  items?: unknown;
  subtotal?: number | string | null;
  shippingCost?: number | string | null;
  gst?: number | string | null;
  gstAmount?: number | string | null;
  discountAmount?: number | string | null;
  total?: number | string | null;
  paymentMethod?: string | null;
  status?: string | null;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  paymentId?: string | null;
  awbNumber?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeImages(images: unknown): string[] {
  if (Array.isArray(images)) {
    return images.filter((image): image is string => typeof image === "string");
  }

  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images) as unknown;
      return normalizeImages(parsed);
    } catch {
      return images ? [images] : [];
    }
  }

  return [];
}

function normalizeProduct(product: BackendProduct): Product {
  const price = toNumber(product.price);
  const stockQuantity = toNumber(product.stockQuantity ?? product.quantity);
  const status =
    product.status || (product.inStock === false ? "INACTIVE" : "ACTIVE");

  return {
    ...product,
    id: product.id,
    name: product.name || "",
    description: product.description || "",
    category: product.category || "",
    price,
    images: normalizeImages(product.images),
    isHandloom: product.isHandloom ?? true,
    quantity: stockQuantity,
    status,
    stockQuantity,
    inStock: product.inStock ?? (status === "ACTIVE" && stockQuantity > 0),
  };
}

function normalizeOrderItems(items: unknown): OrderItem[] {
  if (!Array.isArray(items)) return [];

  return items.map((item, index) => {
    const raw =
      item && typeof item === "object" ? (item as Record<string, unknown>) : {};

    return {
      id: typeof raw.id === "string" ? raw.id : undefined,
      productId:
        typeof raw.productId === "string" ? raw.productId : `item-${index}`,
      name: typeof raw.name === "string" ? raw.name : "Product",
      category: typeof raw.category === "string" ? raw.category : null,
      price: toNumber(raw.price),
      quantity: toNumber(raw.quantity, 1),
      fallPico: Boolean(raw.fallPico),
      fallPicoPrice: toNumber(raw.fallPicoPrice),
      gstRate: raw.gstRate === undefined ? undefined : toNumber(raw.gstRate),
      gstAmount:
        raw.gstAmount === undefined ? undefined : toNumber(raw.gstAmount),
    };
  });
}

function normalizeShippingAddress(order: BackendOrder): ShippingAddress {
  const raw = order.shippingAddress;

  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const address = raw as Partial<ShippingAddress>;
    return {
      name: address.name || order.customerName || "",
      email: address.email || order.email || order.customerEmail || "",
      phone: address.phone || order.phone || "",
      address: address.address || "",
      pinCode: address.pinCode || order.pinCode || "",
      city: address.city || order.city || undefined,
      state: address.state || order.state || undefined,
    };
  }

  return {
    name: order.customerName || "",
    email: order.email || order.customerEmail || "",
    phone: order.phone || "",
    address: typeof raw === "string" ? raw : "",
    pinCode: order.pinCode || "",
    city: order.city || undefined,
    state: order.state || undefined,
  };
}

function normalizeOrder(order: BackendOrder): Order {
  const shippingAddress = normalizeShippingAddress(order);
  const gst = toNumber(order.gst ?? order.gstAmount);
  const paymentId = order.razorpayPaymentId || order.paymentId || null;

  return {
    ...order,
    id: order.id,
    userId: order.userId ?? null,
    customerName: order.customerName || shippingAddress.name,
    customerEmail: order.customerEmail || order.email || shippingAddress.email,
    email: order.email || shippingAddress.email,
    phone: order.phone || shippingAddress.phone,
    shippingAddress,
    pinCode: order.pinCode || shippingAddress.pinCode,
    city: order.city || shippingAddress.city || null,
    state: order.state || shippingAddress.state || null,
    items: normalizeOrderItems(order.items),
    paymentMethod: (order.paymentMethod || "RAZORPAY") as PaymentMethod,
    subtotal: toNumber(order.subtotal),
    shippingCost: toNumber(order.shippingCost),
    gst,
    gstAmount: toNumber(order.gstAmount ?? gst),
    discountAmount: toNumber(order.discountAmount),
    total: toNumber(order.total),
    status: (order.status || "PENDING") as OrderStatus,
    razorpayOrderId: order.razorpayOrderId || null,
    razorpayPaymentId: paymentId,
    paymentId,
    awbNumber: order.awbNumber || null,
    createdAt: order.createdAt || new Date().toISOString(),
    updatedAt: order.updatedAt,
  };
}

export async function getProducts(category?: string): Promise<Product[]> {
  const url = category
    ? `${API_URL}/products?category=${encodeURIComponent(category)}`
    : `${API_URL}/products`;

  const products = await apiFetch<BackendProduct[]>(url, { cache: "no-store" });
  return products.map(normalizeProduct);
}

export async function getProductById(id: string): Promise<Product> {
  const product = await apiFetch<BackendProduct>(`${API_URL}/products/${id}`, {
    cache: "no-store",
  });
  return normalizeProduct(product);
}

export async function createProduct(
  data: Record<string, unknown>,
): Promise<Product> {
  const product = await apiFetch<BackendProduct>(`${API_URL}/products`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return normalizeProduct(product);
}

export async function updateProduct(
  id: string,
  data: Record<string, unknown>,
): Promise<Product> {
  const product = await apiFetch<BackendProduct>(`${API_URL}/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return normalizeProduct(product);
}

export async function deleteProduct(id: string): Promise<Product> {
  const product = await apiFetch<BackendProduct>(`${API_URL}/products/${id}`, {
    method: "DELETE",
  });
  return normalizeProduct(product);
}

export async function checkCodEligibility(
  pinCode: string,
  orderValue: number,
): Promise<CodEligibilityResponse> {
  return apiFetch<CodEligibilityResponse>(
    `${API_URL}/logistics/check-cod?pinCode=${pinCode}&orderValue=${orderValue}`,
  );
}

export async function getUserOrders(): Promise<Order[]> {
  const orders = await apiFetch<BackendOrder[]>(
    `${API_URL}/orders`,
    { cache: "no-store" },
  );
  return orders.map(normalizeOrder);
}

export async function cancelOrder(id: string): Promise<Order> {
  const order = await apiFetch<BackendOrder>(`${API_URL}/orders/${id}/cancel`, {
    method: "PATCH",
  });
  return normalizeOrder(order);
}

export async function getAllOrders(): Promise<Order[]> {
  const orders = await apiFetch<BackendOrder[]>(`${API_URL}/orders`, {
    cache: "no-store",
  });
  return orders.map(normalizeOrder);
}

export async function getOrderById(id: string): Promise<Order> {
  const order = await apiFetch<BackendOrder>(`${API_URL}/orders/${id}`, {
    cache: "no-store",
  });
  return normalizeOrder(order);
}

export async function createOrder(
  orderData: Record<string, unknown>,
): Promise<Order> {
  const order = await apiFetch<BackendOrder>(`${API_URL}/orders`, {
    method: "POST",
    body: JSON.stringify(orderData),
  });
  return normalizeOrder(order);
}

export async function updateOrderStatus(
  id: string,
  status: string,
): Promise<Order> {
  const order = await apiFetch<BackendOrder>(`${API_URL}/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return normalizeOrder(order);
}

export async function createPaymentOrder(
  amount: number,
): Promise<PaymentOrderResponse> {
  return apiFetch<PaymentOrderResponse>(`${API_URL}/payments/create-order`, {
    method: "POST",
    body: JSON.stringify({ amount, receipt: `receipt_${Date.now()}` }),
  });
}

export async function verifyPayment(data: {
  paymentId: string;
  orderId: string;
  signature: string;
}): Promise<boolean> {
  return apiFetch<boolean>(`${API_URL}/payments/verify`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function loginUser(credentials: {
  identifier: string;
  password: string;
}): Promise<AuthResponse> {
  return apiFetch<AuthResponse>(`${API_URL}/auth/login`, {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function registerUser(userData: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}): Promise<{ message: string; user: User }> {
  return apiFetch<{ message: string; user: User }>(`${API_URL}/auth/register`, {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function adminLogin(credentials: {
  identifier: string;
  password: string;
}): Promise<AuthResponse> {
  return apiFetch<AuthResponse>(`${API_URL}/auth/admin/login`, {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function submitContactForm(data: {
  name: string;
  email: string;
  message: string;
}): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>(`${API_URL}/contact`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function subscribeNewsletter(
  email: string,
): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>(
    `${API_URL}/newsletter/subscribe`,
    {
      method: "POST",
      body: JSON.stringify({ email }),
    },
  );
}

export async function getUserProfile(): Promise<User> {
  return apiFetch<User>(`${API_URL}/users/profile`, { cache: "no-store" });
}

export async function updateUserProfile(
  data: Record<string, unknown>,
): Promise<User> {
  return apiFetch<User>(`${API_URL}/users/profile`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function getUserDashboardStats(): Promise<{
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSpent: number;
  recentOrders: Order[];
}> {
  return apiFetch<{
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalSpent: number;
    recentOrders: Order[];
  }>(`${API_URL}/users/dashboard/stats`, {
    cache: "no-store",
  });
}

export async function getAdminDashboardStats(): Promise<{
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  recentOrders: Order[];
  ordersByCategory: Record<string, { count: number; revenue: number }>;
  topProducts: { name: string; count: number; revenue: number }[];
  revenueChartData: { date: string; revenue: number }[];
}> {
  return apiFetch<{
    totalProducts: number;
    totalOrders: number;
    pendingOrders: number;
    confirmedOrders: number;
    processingOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    recentOrders: Order[];
    ordersByCategory: Record<string, { count: number; revenue: number }>;
    topProducts: { name: string; count: number; revenue: number }[];
    revenueChartData: { date: string; revenue: number }[];
  }>(`${API_URL}/admin/dashboard/stats`, {
    cache: "no-store",
  });
}

export async function getCart(): Promise<CartResponse> {
  return apiFetch<CartResponse>(`${API_URL}/cart`, { cache: "no-store" });
}

export async function addToCart(
  productId: string,
  quantity: number,
  fallPico: boolean,
): Promise<CartResponse> {
  return apiFetch<CartResponse>(`${API_URL}/cart/items`, {
    method: "POST",
    body: JSON.stringify({ productId, quantity, fallPico }),
  });
}

export async function updateCartItem(
  cartItemId: string,
  quantity?: number,
  fallPico?: boolean,
): Promise<CartResponse> {
  const body: Record<string, unknown> = {};
  if (quantity !== undefined) body.quantity = quantity;
  if (fallPico !== undefined) body.fallPico = fallPico;
  return apiFetch<CartResponse>(`${API_URL}/cart/items/${cartItemId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function removeCartItem(
  cartItemId: string,
): Promise<CartResponse> {
  return apiFetch<CartResponse>(`${API_URL}/cart/items/${cartItemId}`, {
    method: "DELETE",
  });
}

export async function clearCart(): Promise<CartResponse> {
  return apiFetch<CartResponse>(`${API_URL}/cart/clear`, {
    method: "DELETE",
  });
}

export async function mergeCartItems(
  items: { productId: string; quantity: number; fallPico: boolean }[],
): Promise<CartResponse> {
  return apiFetch<CartResponse>(`${API_URL}/cart/merge`, {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}

export async function validateCart(): Promise<CartResponse> {
  return apiFetch<CartResponse>(`${API_URL}/cart/validate`, {
    method: "POST",
  });
}

export async function getAddresses(): Promise<Address[]> {
  return apiFetch<Address[]>(`${API_URL}/addresses`, { cache: "no-store" });
}

export async function getDefaultAddress(): Promise<Address | null> {
  return apiFetch<Address | null>(`${API_URL}/addresses/default`, {
    cache: "no-store",
  });
}

export async function createAddress(data: {
  name: string;
  phone: string;
  addressLine: string;
  city?: string;
  state?: string;
  pinCode: string;
  isDefault?: boolean;
}): Promise<Address> {
  return apiFetch<Address>(`${API_URL}/addresses`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAddress(
  id: string,
  data: {
    name?: string;
    phone?: string;
    addressLine?: string;
    city?: string;
    state?: string;
    pinCode?: string;
    isDefault?: boolean;
  },
): Promise<Address> {
  return apiFetch<Address>(`${API_URL}/addresses/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteAddress(id: string): Promise<Address> {
  return apiFetch<Address>(`${API_URL}/addresses/${id}`, {
    method: "DELETE",
  });
}

export async function sendOtp(
  email: string,
): Promise<{ message: string; expiresIn: number }> {
  return apiFetch<{ message: string; expiresIn: number }>(
    `${API_URL}/otp/send`,
    {
      method: "POST",
      body: JSON.stringify({ email }),
    },
  );
}

export async function verifyOtp(
  email: string,
  otp: string,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>(`${API_URL}/auth/verify-email`, {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
}

export async function resendOtp(
  email: string,
): Promise<{ message: string; expiresIn: number }> {
  return apiFetch<{ message: string; expiresIn: number }>(
    `${API_URL}/otp/resend`,
    {
      method: "POST",
      body: JSON.stringify({ email }),
    },
  );
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export async function searchProducts(params: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort?: string;
}): Promise<PaginatedProducts> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.search) searchParams.set('search', params.search);
  if (params.category) searchParams.set('category', params.category);
  if (params.sort) searchParams.set('sort', params.sort);

  const result = await apiFetch<{ data: BackendProduct[]; total: number; page: number; totalPages: number }>(
    `${API_URL}/products?${searchParams.toString()}`,
    { cache: "no-store" },
  );
  return {
    ...result,
    data: result.data.map(normalizeProduct),
  };
}

export async function getWishlist(): Promise<WishlistItem[]> {
  try {
    const items = await apiFetch<{ id: string; productId: string; product: { id: string; name: string; price: number; images: string[] }; createdAt: string }[]>(
      `${API_URL}/wishlist`,
      { cache: "no-store" },
    );
    return items.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.images?.[0] || '',
      addedAt: item.createdAt,
    }));
  } catch {
    return [];
  }
}

export async function addToWishlist(productId: string): Promise<void> {
  await apiFetch(`${API_URL}/wishlist`, {
    method: "POST",
    body: JSON.stringify({ productId }),
  });
}

export async function removeFromWishlist(productId: string): Promise<void> {
  await apiFetch(`${API_URL}/wishlist/${productId}`, {
    method: "DELETE",
  });
}

export async function checkWishlistItem(productId: string): Promise<{ inWishlist: boolean }> {
  return apiFetch<{ inWishlist: boolean }>(`${API_URL}/wishlist/check/${productId}`);
}

export async function forgotPassword(email: string): Promise<{ message: string; token?: string }> {
  return apiFetch<{ message: string; token?: string }>(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(data: { email: string; token: string; newPassword: string }): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`${API_URL}/auth/reset-password`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
