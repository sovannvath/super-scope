// API Configuration and functions for Laravel backend
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

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    // Ensure required headers are always present
    config.headers = config.headers || {};
    config.headers["Content-Type"] = "application/json";
    config.headers["Accept"] = "application/json";
    config.headers["X-Requested-With"] = "XMLHttpRequest";

    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Debug logging for API requests
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

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    // Debug logging for successful responses
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
    // Debug logging for error responses
    console.error(
      `❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
      {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        fullResponse: error.response,
      },
    );

    // Also log the response data separately for better visibility
    if (error.response?.data) {
      console.error(
        "📋 Error Response Data:",
        JSON.stringify(error.response.data, null, 2),
      );
    }

    if (error.response?.status === 401) {
      // Token expired or invalid
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

// Category interface for products
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

// Product interface - Updated to match API response format
export interface Product {
  id: number;
  name: string;
  description: string;
  price: string; // API returns price as string
  quantity: number;
  low_stock_threshold: number;
  image: string; // Added image field
  status: boolean;
  created_at: string;
  updated_at: string;
  categories: Category[]; // Added categories field
}

// Cart item interface
export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product?: Product;
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
      // Timeout error - backend might be cold starting
      return {
        status: 0,
        message: "Server is starting up, please wait a moment and try again",
      };
    } else if (error.response) {
      // Server responded with error status
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
      // Network error
      return {
        status: 0,
        message: "Network error - please check your connection",
      };
    } else {
      // Other error
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

  user: async () => makeApiCall(() => apiClient.get("/user")),

  me: async () => makeApiCall(() => apiClient.get("/user")), // Alias for compatibility
};

// Product API - Aligned with Laravel backend routes
export const productApi = {
  // GET /products - Get all products (public route)
  index: async () => makeApiCall(() => apiClient.get("/products")),

  // GET /products/{id} - Get single product (public route)
  show: async (id: number) =>
    makeApiCall(() => apiClient.get(`/products/${id}`)),

  // POST /products - Create new product (protected route)
  create: async (productData: Partial<Product>) =>
    makeApiCall(() => apiClient.post("/products", productData)),

  // PUT /products/{id} - Update product (protected route)
  update: async (id: number, productData: Partial<Product>) =>
    makeApiCall(() => apiClient.put(`/products/${id}`, productData)),

  // DELETE /products/{id} - Delete product (protected route)
  delete: async (id: number) =>
    makeApiCall(() => apiClient.delete(`/products/${id}`)),

  // DELETE alias for destroy method
  destroy: async (id: number) =>
    makeApiCall(() => apiClient.delete(`/products/${id}`)),

  // Alternative list endpoint (alias for index)
  list: async () => makeApiCall(() => apiClient.get("/products")),

  // Search products (if backend supports it)
  search: async (query: string) =>
    makeApiCall(() =>
      apiClient.get(`/products/search?q=${encodeURIComponent(query)}`),
    ),
};

// Cart API
export const cartApi = {
  // Get cart items
  index: async () => makeApiCall(() => apiClient.get("/cart")),

  // Add item to cart
  addItem: async (data: { product_id: number; quantity: number }) =>
    makeApiCall(() => apiClient.post("/cart/add", data)),

  // Update cart item quantity
  updateItem: async (itemId: number, quantity: number) =>
    makeApiCall(() => apiClient.put(`/cart/items/${itemId}`, { quantity })),

  // Remove item from cart
  removeItem: async (itemId: number) =>
    makeApiCall(() => apiClient.delete(`/cart/items/${itemId}`)),

  // Clear entire cart
  clear: async () => makeApiCall(() => apiClient.delete("/cart/clear")),
};

// Dashboard API
export const dashboardApi = {
  // Role-specific dashboards
  customer: async () => makeApiCall(() => apiClient.get("/dashboard/customer")),
  admin: async () => makeApiCall(() => apiClient.get("/dashboard/admin")),
  warehouse: async () =>
    makeApiCall(() => apiClient.get("/dashboard/warehouse")),
  staff: async () => makeApiCall(() => apiClient.get("/dashboard/staff")),

  // Generic dashboard (for compatibility)
  index: async () => makeApiCall(() => apiClient.get("/dashboard/customer")),
};

// Request Order API (for inventory requests)
export const requestOrderApi = {
  // Get all request orders
  index: async () => makeApiCall(() => apiClient.get("/request-orders")),

  // Get single request order
  show: async (id: number) =>
    makeApiCall(() => apiClient.get(`/request-orders/${id}`)),

  // Create new request order
  create: async (orderData: any) =>
    makeApiCall(() => apiClient.post("/request-orders", orderData)),

  // Alias for create method for backward compatibility
  store: async (orderData: any) =>
    makeApiCall(() => apiClient.post("/request-orders", orderData)),

  // Admin approval
  adminApproval: async (id: number, data: any) =>
    makeApiCall(() =>
      apiClient.put(`/request-orders/${id}/admin-approval`, data),
    ),

  // Warehouse approval
  warehouseApproval: async (id: number, data: any) =>
    makeApiCall(() =>
      apiClient.put(`/request-orders/${id}/warehouse-approval`, data),
    ),
};

// Order API
export const orderApi = {
  // Get all orders
  index: async () => makeApiCall(() => apiClient.get("/orders")),

  // Get single order
  show: async (id: number) => makeApiCall(() => apiClient.get(`/orders/${id}`)),

  // Create new order
  store: async (orderData: any) =>
    makeApiCall(() => apiClient.post("/orders", orderData)),

  // Get payment methods
  getPaymentMethods: async () =>
    makeApiCall(() => apiClient.get("/payment-methods")),

  // Update order status
  updateStatus: async (id: number, status: string) =>
    makeApiCall(() => apiClient.put(`/orders/${id}/status`, { status })),

  // Update payment status
  updatePaymentStatus: async (id: number, paymentData: any) =>
    makeApiCall(() => apiClient.put(`/orders/${id}/payment`, paymentData)),
};

// User API
export const userApi = {
  // Get all users (admin only)
  index: async () => makeApiCall(() => apiClient.get("/users")),

  // Get single user
  show: async (id: number) => makeApiCall(() => apiClient.get(`/users/${id}`)),

  // Update user profile
  update: async (id: number, userData: Partial<User>) =>
    makeApiCall(() => apiClient.put(`/users/${id}`, userData)),

  // Delete user
  delete: async (id: number) =>
    makeApiCall(() => apiClient.delete(`/users/${id}`)),
};

// Health check API
export const healthApi = {
  check: async () => makeApiCall(() => apiClient.get("/health")),

  ping: async () => makeApiCall(() => apiClient.get("/ping")),
};

// Notification API
export const notificationApi = {
  // Get all notifications
  index: async () => makeApiCall(() => apiClient.get("/notifications")),

  // Get unread notifications
  unread: async () => makeApiCall(() => apiClient.get("/notifications/unread")),

  // Mark notification as read
  markAsRead: async (id: number) =>
    makeApiCall(() => apiClient.put(`/notifications/${id}/read`)),

  // Mark all notifications as read
  markAllAsRead: async () =>
    makeApiCall(() => apiClient.put("/notifications/read-all")),

  // Delete notification
  destroy: async (id: number) =>
    makeApiCall(() => apiClient.delete(`/notifications/${id}`)),
};

// CSRF Token handling (in case Laravel requires it)
export const csrfApi = {
  // Get CSRF cookie (for Laravel Sanctum)
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
