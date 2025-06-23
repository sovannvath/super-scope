import { apiClient, makeApiCall, ApiResponse } from "@/lib/api";
import { Product } from "./products";

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  subtotal: number;
  product?: Product;
}

export interface Order {
  id: number;
  user_id: number;
  order_number: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  payment_method?: string;
  total_amount: number;
  shipping_address: string;
  billing_address: string;
  notes?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateOrderData {
  payment_method: string;
  shipping_address: string;
  billing_address: string;
  notes?: string;
}

export interface OrderFilters {
  status?: string;
  payment_status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface OrdersResponse {
  data: Order[];
  meta: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
  };
}

export const ordersApi = {
  getAll: async (
    filters?: OrderFilters,
  ): Promise<ApiResponse<OrdersResponse>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const queryString = params.toString();
    const url = queryString ? `/orders?${queryString}` : "/orders";
    return makeApiCall(() => apiClient.get(url));
  },

  getById: async (id: number): Promise<ApiResponse<Order>> =>
    makeApiCall(() => apiClient.get(`/orders/${id}`)),

  create: async (orderData: CreateOrderData): Promise<ApiResponse<Order>> =>
    makeApiCall(() => apiClient.post("/orders", orderData)),

  updateStatus: async (
    id: number,
    status: string,
  ): Promise<ApiResponse<Order>> =>
    makeApiCall(() => apiClient.put(`/orders/${id}/status`, { status })),

  updatePaymentStatus: async (
    id: number,
    paymentData: {
      payment_status: string;
      payment_method?: string;
      transaction_id?: string;
    },
  ): Promise<ApiResponse<Order>> =>
    makeApiCall(() => apiClient.put(`/orders/${id}/payment`, paymentData)),

  getPaymentMethods: async (): Promise<
    ApiResponse<{ id: string; name: string; description?: string }[]>
  > => makeApiCall(() => apiClient.get("/payment-methods")),
};
