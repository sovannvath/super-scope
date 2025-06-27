import { apiClient, makeApiCall, ApiResponse } from "@/lib/api";
import { Product } from "./products";

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  subtotal: number;
  product?: Product;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: number;
  user_id: number;
  items: CartItem[];
  total_items: number;
  total_amount: number;
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

// Enhanced cart API with retry logic and better error handling
const cartApiWithRetry = async <T>(
  apiCall: () => Promise<any>,
  retries: number = 2,
): Promise<ApiResponse<T>> => {
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const result = await makeApiCall(apiCall);

      // If successful, return the result
      if (result.status >= 200 && result.status < 300) {
        return result;
      }

      // If it's a server error and we have retries left, try again
      if (result.status >= 500 && attempt <= retries) {
        console.log(
          `🔄 Cart API retry ${attempt}/${retries} due to server error`,
        );
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        continue;
      }

      return result;
    } catch (error) {
      if (attempt <= retries) {
        console.log(
          `🔄 Cart API retry ${attempt}/${retries} due to error:`,
          error,
        );
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        continue;
      }
      throw error;
    }
  }

  // This should never be reached, but just in case
  return { status: 500, message: "Max retries exceeded" };
};

export const cartApi = {
  get: async (): Promise<ApiResponse<Cart>> => {
    console.log("🛒 CartAPI: Fetching cart data...");
    return cartApiWithRetry(() => apiClient.get("/cart"));
  },

  addItem: async (data: AddToCartData): Promise<ApiResponse<CartItem>> => {
    console.log("🛒 CartAPI: Adding item to cart:", data);
    return cartApiWithRetry(() => apiClient.post("/cart/add", data));
  },

  updateItem: async (
    itemId: number,
    data: UpdateCartItemData,
  ): Promise<ApiResponse<CartItem>> => {
    console.log("🛒 CartAPI: Updating cart item:", itemId, data);
    return cartApiWithRetry(() => apiClient.put(`/cart/items/${itemId}`, data));
  },

  removeItem: async (itemId: number): Promise<ApiResponse<void>> => {
    console.log("🛒 CartAPI: Removing cart item:", itemId);
    return cartApiWithRetry(() => apiClient.delete(`/cart/items/${itemId}`));
  },

  clear: async (): Promise<ApiResponse<void>> => {
    console.log("🛒 CartAPI: Clearing entire cart");
    return cartApiWithRetry(() => apiClient.delete("/cart/clear"));
  },

  // Force refresh cart data (bypasses cache)
  refresh: async (): Promise<ApiResponse<Cart>> => {
    console.log("🛒 CartAPI: Force refreshing cart data...");
    return cartApiWithRetry(() => apiClient.get("/cart?_t=" + Date.now()));
  },

  // Aliases for backward compatibility
  index: async (): Promise<ApiResponse<Cart>> => {
    return cartApi.get();
  },
};
