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
  },
  timeout: 10000, // 10 second timeout
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

// Initialize token on app start
const token = getToken();
if (token) {
  apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
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

// Product interface
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
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
  role: string;
  created_at: string;
  updated_at: string;
}

// Generic API call wrapper
async function makeApiCall<T>(
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

    if (error.response) {
      // Server responded with error status
      return {
        status: error.response.status,
        data: error.response.data,
        message: error.response.data?.message || error.message,
        errors: error.response.data?.errors,
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

  me: async () => makeApiCall(() => apiClient.get("/me")),

  refreshToken: async () => makeApiCall(() => apiClient.post("/refresh")),
};

// Product API
export const productApi = {
  // Get all products
  index: async () => makeApiCall(() => apiClient.get("/products")),

  // Alternative list endpoint
  list: async () => makeApiCall(() => apiClient.get("/products")),

  // Get single product
  show: async (id: number) =>
    makeApiCall(() => apiClient.get(`/products/${id}`)),

  // Create new product
  create: async (productData: Partial<Product>) =>
    makeApiCall(() => apiClient.post("/products", productData)),

  // Update product
  update: async (id: number, productData: Partial<Product>) =>
    makeApiCall(() => apiClient.put(`/products/${id}`, productData)),

  // Delete product
  delete: async (id: number) =>
    makeApiCall(() => apiClient.delete(`/products/${id}`)),

  // Get low stock products
  lowStock: async () => makeApiCall(() => apiClient.get("/products/low-stock")),

  // Alternative low stock endpoint
  getLowStock: async () =>
    makeApiCall(() => apiClient.get("/products/low-stock")),

  // Search products
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
    makeApiCall(() => apiClient.post("/cart/items", data)),

  // Update cart item quantity
  updateItem: async (itemId: number, quantity: number) =>
    makeApiCall(() => apiClient.put(`/cart/items/${itemId}`, { quantity })),

  // Remove item from cart
  removeItem: async (itemId: number) =>
    makeApiCall(() => apiClient.delete(`/cart/items/${itemId}`)),

  // Clear entire cart
  clear: async () => makeApiCall(() => apiClient.delete("/cart")),

  // Get cart total
  getTotal: async () => makeApiCall(() => apiClient.get("/cart/total")),
};

// Dashboard API
export const dashboardApi = {
  // Get dashboard statistics
  stats: async () => makeApiCall(() => apiClient.get("/dashboard/stats")),

  // Get dashboard data
  index: async () => makeApiCall(() => apiClient.get("/dashboard")),

  // Get recent activities
  activities: async () =>
    makeApiCall(() => apiClient.get("/dashboard/activities")),

  // Get analytics data
  analytics: async (period?: string) =>
    makeApiCall(() =>
      apiClient.get(`/dashboard/analytics${period ? `?period=${period}` : ""}`),
    ),
};

// Request Order API (for inventory requests)
export const requestOrderApi = {
  // Get all request orders
  index: async () => makeApiCall(() => apiClient.get("/request-orders")),

  // Create new request order
  create: async (orderData: any) =>
    makeApiCall(() => apiClient.post("/request-orders", orderData)),

  // Update request order
  update: async (id: number, orderData: any) =>
    makeApiCall(() => apiClient.put(`/request-orders/${id}`, orderData)),

  // Delete request order
  delete: async (id: number) =>
    makeApiCall(() => apiClient.delete(`/request-orders/${id}`)),

  // Approve request order
  approve: async (id: number) =>
    makeApiCall(() => apiClient.post(`/request-orders/${id}/approve`)),

  // Reject request order
  reject: async (id: number, reason?: string) =>
    makeApiCall(() =>
      apiClient.post(`/request-orders/${id}/reject`, { reason }),
    ),
};

// Order API
export const orderApi = {
  // Get all orders
  index: async () => makeApiCall(() => apiClient.get("/orders")),

  // Get single order
  show: async (id: number) => makeApiCall(() => apiClient.get(`/orders/${id}`)),

  // Create new order
  create: async (orderData: any) =>
    makeApiCall(() => apiClient.post("/orders", orderData)),

  // Update order status
  updateStatus: async (id: number, status: string) =>
    makeApiCall(() => apiClient.put(`/orders/${id}/status`, { status })),
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

// Export the axios instance for custom requests
export { apiClient };

// Export base URL for reference
export { BASE_URL };
