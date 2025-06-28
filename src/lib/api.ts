// lib/api.ts
import axios, { AxiosResponse } from "axios";

// Base API URL for Laravel backend
const BASE_URL = "https://laravel-wtc.onrender.com/api";

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest", // Required by Laravel for API validation
  },
  timeout: 30000, // 30 second timeout for cold starts
});

// Token management
export const setToken = (token: string) => {
  localStorage.setItem("auth_token", token);
  apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

export const getToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

export const removeToken = () => {
  localStorage.removeItem("auth_token");
  delete apiClient.defaults.headers.common["Authorization"];
};

// Aliases for backward compatibility
export const saveToken = setToken;
export const clearAuth = removeToken;

// Initialize token on app start
const token = getToken();
if (token) {
  apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};
    config.headers["Content-Type"] = "application/json";
    config.headers["Accept"] = "application/json";
    config.headers["X-Requested-With"] = "XMLHttpRequest";

    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
      {
        baseURL: config.baseURL,
        headers: config.headers,
        data: config.data,
      },
    );

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`,
      {
        status: response.status,
        data: response.data,
      },
    );
    return response;
  },
  (error) => {
    console.error(
      `❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
      {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        fullResponse: error.response,
      },
    );

    if (error.response?.data) {
      console.error(
        "📋 Error Response Data:",
        JSON.stringify(error.response.data, null, 2),
      );
    }

    if (error.response?.status === 401) {
      removeToken();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Standard API response interface
export interface ApiResponse<T = any> {
  status: number;
  data?: T;
  message?: string;
  errors?: any;
}

// Category interface
export interface Category {
  id: number;
  name: string;
  description: string | null;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
  pivot?: {
    product_id: number;
    category_id: number;
  };
}

// Product interface
export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  quantity: number;
  low_stock_threshold: number;
  image: string;
  status: boolean;
  created_at: string;
  updated_at: string;
  categories: Category[];
}

// Cart item interface
export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product?: Product;
}

// Order item interface
export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product: {
    name: string;
    description: string;
  };
}

// Order interface
export interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method: string;
  shipping_address: string;
  order_items: OrderItem[];
  created_at: string;
  updated_at: string;
  customer: {
    name: string;
    email: string;
  };
}

// User interface
export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  role_id?: number;
  created_at: string;
  updated_at: string;
}

// Dashboard data interface
export interface DashboardData {
  totalIncome?: number;
  totalProducts?: number;
  totalOrders?: number;
  totalCustomers?: number;
  pendingOrders?: Order[];
  lowStockAlerts?: Product[];
  recentOrders?: Order[];
}

// Request order interface
export interface RequestOrder {
  id: number;
  product_id: number;
  quantity: number;
  admin_notes?: string;
  admin_approval_status?: string;
  warehouse_approval_status?: string;
  created_at: string;
  updated_at: string;
}

// Payment method interface
export interface PaymentMethod {
  id: number;
  name: string;
  description?: string;
}

// Notification interface
export interface Notification {
  id: number;
  type: string;
  notifiable_id: number;
  notifiable_type: string;
  data: any;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

// Generic API call wrapper
export async function makeApiCall<T>(
  apiCall: () => Promise<AxiosResponse<T>>,
): Promise<ApiResponse<T>> {
  try {
    const response = await apiCall();
    return {
      status: response.status,
      data: response.data,
      message: response.statusText,
    };
  } catch (error: any) {
    console.error("API Error:", error);

    if (error.code === "ECONNABORTED" && error.message.includes("timeout")) {
      return {
        status: 0,
        message: "Server is starting up, please wait a moment and try again",
      };
    } else if (error.response) {
      console.log("🔍 Processing server error response:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });

      return {
        status: error.response.status,
        data: error.response.data,
        message:
          error.response.data?.message ||
          error.response.statusText ||
          error.message,
        errors: error.response.data?.errors || error.response.data?.error,
      };
    } else if (error.request) {
      return {
        status: 0,
        message: "Network error - please check your connection",
      };
    } else {
      return {
        status: -1,
        message: error.message || "An unexpected error occurred",
      };
    }
  }
}

// Authentication API
export const authApi = {
  login: async (credentials: { email: string; password: string }) =>
    makeApiCall(() => apiClient.post("/login", credentials)),

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => makeApiCall(() => apiClient.post("/register", userData)),

  logout: async () => makeApiCall(() => apiClient.post("/logout")),

  user: async () => makeApiCall<User>(() => apiClient.get("/user")),

  me: async () => makeApiCall<User>(() => apiClient.get("/user")),
};

// Product API
export const productApi = {
  index: async () => makeApiCall<Product[]>(() => apiClient.get("/products")),

  show: async (id: number) =>
    makeApiCall<Product>(() => apiClient.get(`/products/${id}`)),

  create: async (productData: Partial<Product>) =>
    makeApiCall(() => apiClient.post("/products", productData)),

  update: async (id: number, productData: Partial<Product>) =>
    makeApiCall(() => apiClient.put(`/products/${id}`, productData)),

  delete: async (id: number) =>
    makeApiCall(() => apiClient.delete(`/products/${id}`)),

  destroy: async (id: number) =>
    makeApiCall(() => apiClient.delete(`/products/${id}`)),

  list: async () => makeApiCall<Product[]>(() => apiClient.get("/products")),

  search: async (query: string) =>
    makeApiCall<Product[]>(() =>
      apiClient.get(`/products/search?q=${encodeURIComponent(query)}`),
    ),

  lowStock: async () =>
    makeApiCall<Product[]>(() => apiClient.get("/products/low-stock")),
};

// Cart API
export const cartApi = {
  index: async () => makeApiCall<CartItem[]>(() => apiClient.get("/cart")),

  addItem: async (data: { product_id: number; quantity: number }) =>
    makeApiCall(() => apiClient.post("/cart/add", data)),

  updateItem: async (itemId: number, quantity: number) =>
    makeApiCall(() => apiClient.put(`/cart/items/${itemId}`, { quantity })),

  removeItem: async (itemId: number) =>
    makeApiCall(() => apiClient.delete(`/cart/items/${itemId}`)),

  clear: async () => makeApiCall(() => apiClient.delete("/cart/clear")),
};

// Order API
export const orderApi = {
  index: async () => makeApiCall<Order[]>(() => apiClient.get("/orders")),

  show: async (id: number) =>
    makeApiCall<Order>(() => apiClient.get(`/orders/${id}`)),

  store: async (orderData: { payment_method_id: number; notes?: string }) =>
    makeApiCall(() => apiClient.post("/orders", orderData)),

  getPaymentMethods: async () =>
    makeApiCall<PaymentMethod[]>(() => apiClient.get("/payment-methods")),

  updateStatus: async (id: number, status: string) =>
    makeApiCall(() =>
      apiClient.put(`/orders/${id}/status`, { order_status: status }),
    ),

  updatePaymentStatus: async (id: number, status: string) =>
    makeApiCall(() =>
      apiClient.put(`/orders/${id}/payment`, {
        payment_status: status.toLowerCase(),
      }),
    ),
};

// Request Order API
export const requestOrderApi = {
  index: async () =>
    makeApiCall<RequestOrder[]>(() => apiClient.get("/request-orders")),

  show: async (id: number) =>
    makeApiCall<RequestOrder>(() => apiClient.get(`/request-orders/${id}`)),

  create: async (orderData: {
    product_id: number;
    quantity: number;
    admin_notes?: string;
  }) => makeApiCall(() => apiClient.post("/request-orders", orderData)),

  store: async (orderData: {
    product_id: number;
    quantity: number;
    admin_notes?: string;
  }) => makeApiCall(() => apiClient.post("/request-orders", orderData)),

  adminApproval: async (
    id: number,
    data: { admin_approval_status: string; admin_notes?: string },
  ) =>
    makeApiCall(() =>
      apiClient.put(`/request-orders/${id}/admin-approval`, data),
    ),

  warehouseApproval: async (
    id: number,
    data: { warehouse_approval_status: string; warehouse_notes?: string },
  ) =>
    makeApiCall(() =>
      apiClient.put(`/request-orders/${id}/warehouse-approval`, data),
    ),
};

// User API
export const userApi = {
  index: async () => makeApiCall<User[]>(() => apiClient.get("/users")),

  show: async (id: number) =>
    makeApiCall<User>(() => apiClient.get(`/users/${id}`)),

  update: async (id: number, userData: Partial<User>) =>
    makeApiCall(() => apiClient.put(`/users/${id}`, userData)),

  delete: async (id: number) =>
    makeApiCall(() => apiClient.delete(`/users/${id}`)),
};

// Dashboard API
export const dashboardApi = {
  customer: async () =>
    makeApiCall<DashboardData>(() => apiClient.get("/dashboard/customer")),

  admin: async () =>
    makeApiCall<DashboardData>(() => apiClient.get("/dashboard/admin")),

  warehouse: async () =>
    makeApiCall<DashboardData>(() => apiClient.get("/dashboard/warehouse")),

  staff: async () =>
    makeApiCall<DashboardData>(() => apiClient.get("/dashboard/staff")),

  index: async () =>
    makeApiCall<DashboardData>(() => apiClient.get("/dashboard/customer")),
};

// Health check API
export const healthApi = {
  check: async () => makeApiCall(() => apiClient.get("/health")),

  ping: async () => makeApiCall(() => apiClient.get("/ping")),
};

// Notification API
export const notificationApi = {
  index: async () =>
    makeApiCall<Notification[]>(() => apiClient.get("/notifications")),

  unread: async () =>
    makeApiCall<Notification[]>(() => apiClient.get("/notifications/unread")),

  markAsRead: async (id: number) =>
    makeApiCall(() => apiClient.put(`/notifications/${id}/read`)),

  markAllAsRead: async () =>
    makeApiCall(() => apiClient.put("/notifications/read-all")),

  destroy: async (id: number) =>
    makeApiCall(() => apiClient.delete(`/notifications/${id}`)),
};

// CSRF Token handling
export const csrfApi = {
  getCsrfCookie: async () =>
    makeApiCall(() =>
      axios.get(`${BASE_URL.replace("/api", "")}/sanctum/csrf-cookie`, {
        withCredentials: true,
      }),
    ),
};

// Export the axios instance for custom requests
export { apiClient };

// Export base URL for reference
export { BASE_URL };
