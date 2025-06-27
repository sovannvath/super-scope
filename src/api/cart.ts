import { apiClient, makeApiCall, ApiResponse } from "@/lib/api";
import { Product } from "./products";

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  price?: number;
  subtotal?: number;
  created_at: string;
  updated_at: string;
  product: Product;
}

export interface Cart {
  id: number;
  user_id: number;
  cart_items: CartItem[];
  items?: CartItem[];
  created_at: string;
  updated_at: string;
}

export interface CartResponse {
  message?: string;
  cart: Cart;
  total_amount: number;
}

export interface Order {
  id: number;
  user_id: number;
  payment_method_id: number;
  total: number;
  order_status: string;
  payment_status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderResponse {
  message?: string;
  order: Order;
}

export interface PaymentMethod {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface AddToCartData {
  product_id: number;
  quantity: number;
}

export interface UpdateCartItemData {
  quantity: number;
}

export interface CheckoutData {
  payment_method_id: number;
  notes?: string;
}

const cartApiWithRetry = async <T>(
  apiCall: () => Promise<any>,
  retries: number = 2,
): Promise<ApiResponse<T>> => {
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const result = await makeApiCall(apiCall);

      if (result.status >= 200 && result.status < 300) {
        return result;
      }

      if (result.status >= 500 && attempt <= retries) {
        console.log(
          `🔄 Cart API retry ${attempt}/${retries} due to server error`,
        );
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        continue;
      }

      return result;
    } catch (error) {
      if (attempt <= retries) {
        console.log(
          `🔄 Cart API retry ${attempt}/${retries} due to error:`,
          error,
        );
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      throw error;
    }
  }

  return { status: 500, message: "Max retries exceeded" };
};

export const cartApi = {
  get: async (): Promise<ApiResponse<CartResponse>> => {
    console.log("🛒 CartAPI: Fetching cart data...");
    return cartApiWithRetry(() => apiClient.get("/cart"));
  },

  addItem: async (data: AddToCartData): Promise<ApiResponse<CartResponse>> => {
    console.log("🛒 CartAPI: Adding item to cart:", data);
    return cartApiWithRetry(() => apiClient.post("/cart/add", data));
  },

  updateItem: async (
    itemId: number,
    data: UpdateCartItemData,
  ): Promise<ApiResponse<CartResponse>> => {
    console.log("🛒 CartAPI: Updating cart item:", itemId, data);
    return cartApiWithRetry(() => apiClient.put(`/cart/items/${itemId}`, data));
  },

  removeItem: async (itemId: number): Promise<ApiResponse<CartResponse>> => {
    console.log("🛒 CartAPI: Removing cart item:", itemId);
    return cartApiWithRetry(() => apiClient.delete(`/cart/items/${itemId}`));
  },

  clear: async (): Promise<ApiResponse<void>> => {
    console.log("🛒 CartAPI: Clearing entire cart");
    try {
      return cartApiWithRetry(() => apiClient.delete("/cart/clear"));
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log(
          "🛒 CartAPI: Clear endpoint not available, clearing items individually",
        );
        const cartResponse = await cartApi.get();
        if (cartResponse.status === 200 && cartResponse.data?.cart) {
          const items =
            cartResponse.data.cart.cart_items ||
            cartResponse.data.cart.items ||
            [];
          if (items.length > 0) {
            const removePromises = items.map((item) =>
              cartApi.removeItem(item.id),
            );
            await Promise.all(removePromises);
          }
          return { status: 200, message: "Cart cleared successfully" };
        }
      }
      throw error;
    }
  },

  checkout: async (data: CheckoutData): Promise<ApiResponse<OrderResponse>> => {
    console.log("🛒 CartAPI: Initiating checkout:", data);
    return cartApiWithRetry(async () => {
      const cartResponse = await cartApi.get();
      if (cartResponse.status === 200 && (!cartResponse.data.cart.cart_items || cartResponse.data.cart.cart_items.length === 0)) {
        throw new Error("Cannot checkout with an empty cart");
      }
      try {
        const response = await apiClient.post("/orders", data);
        if (response.status >= 200 && response.status < 300) {
          console.log("🛒 CartAPI: Checkout successful, clearing cart...");
          await cartApi.clear();
        }
        return response;
      } catch (error: any) {
        console.error("Checkout API error:", error.response?.data || error.message);
        throw error;
      }
    });
  },

  getPaymentMethods: async (): Promise<ApiResponse<PaymentMethod[]>> => {
    console.log("🛒 CartAPI: Fetching payment methods...");
    return cartApiWithRetry(async () => {
      const response = await apiClient.get("/payment-methods");
      if (response.status === 200 && (!response.data || response.data.length === 0)) {
        console.warn("🛒 CartAPI: No payment methods available");
        return { ...response, data: [], message: "No payment methods available" };
      }
      return response;
    });
  },

  refresh: async (): Promise<ApiResponse<CartResponse>> => {
    console.log("🛒 CartAPI: Force refreshing cart data...");
    return cartApiWithRetry(() => apiClient.get("/cart?_t=" + Date.now()));
  },

  index: async (): Promise<ApiResponse<CartResponse>> => {
    return cartApi.get();
  },
};