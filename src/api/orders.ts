import { apiClient, makeApiCall, ApiResponse } from "@/lib/api";

export interface Order {
  id: number;
  order_number: string;
  created_at: string;
  order_status: string;
  payment_status: string;
  payment_method: { id: number; name: string } | string;
  total_amount: string;
  shipping_address: string | { street: string; city: string; state: string; zip_code: string; country: string };
  billing_address: string;
  notes?: string;
  order_items: Array<{
    id: number;
    product_id: number;
    quantity: number;
    price: string;
    subtotal: string;
    product?: {
      id: number;
      name: string;
      description: string;
      image?: string;
    };
  }>;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

const orderApiWithRetry = async <T>(
  apiCall: () => Promise<any>,
  retries: number = 2,
): Promise<ApiResponse<T>> => {
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const result = await makeApiCall(apiCall);
      console.log("🛒 OrdersAPI: Raw response:", JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error(`🛒 OrdersAPI: Attempt ${attempt}/${retries} failed:`, error);
      if (attempt <= retries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      throw error;
    }
  }
  return { status: 500, message: "Max retries exceeded" };
};

export const ordersApi = {
  getAll: async (): Promise<ApiResponse<Order[]>> => {
    console.log("🛒 OrdersAPI: Fetching orders...");
    return orderApiWithRetry(async () => {
      const response = await apiClient.get("/orders");
      return response;
    });
  },
  getById: async (id: number): Promise<ApiResponse<Order>> => {
    console.log(`🛒 OrdersAPI: Fetching order ${id}...`);
    return orderApiWithRetry(async () => {
      const response = await apiClient.get(`/orders/${id}`);
      return response;
    });
  },
};