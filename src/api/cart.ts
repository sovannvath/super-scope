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

export const cartApi = {
  get: async (): Promise<ApiResponse<Cart>> =>
    makeApiCall(() => apiClient.get("/cart")),

  addItem: async (data: AddToCartData): Promise<ApiResponse<CartItem>> =>
    makeApiCall(() => apiClient.post("/cart/add", data)),

  updateItem: async (
    itemId: number,
    data: UpdateCartItemData,
  ): Promise<ApiResponse<CartItem>> =>
    makeApiCall(() => apiClient.put(`/cart/items/${itemId}`, data)),

  removeItem: async (itemId: number): Promise<ApiResponse<void>> =>
    makeApiCall(() => apiClient.delete(`/cart/items/${itemId}`)),

  clear: async (): Promise<ApiResponse<void>> =>
    makeApiCall(() => apiClient.delete("/cart/clear")),

  getCount: async (): Promise<ApiResponse<{ count: number }>> =>
    makeApiCall(() => apiClient.get("/cart/count")),

  applyCoupon: async (couponCode: string): Promise<ApiResponse<Cart>> =>
    makeApiCall(() => apiClient.post("/cart/coupon", { code: couponCode })),

  removeCoupon: async (): Promise<ApiResponse<Cart>> =>
    makeApiCall(() => apiClient.delete("/cart/coupon")),

  validateItems: async (): Promise<
    ApiResponse<{ valid: boolean; issues?: string[] }>
  > => makeApiCall(() => apiClient.get("/cart/validate")),
};
