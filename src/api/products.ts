import { apiClient, makeApiCall, ApiResponse } from "@/lib/api";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  low_stock_threshold: number;
  status: string;
  category?: string;
  image_url?: string;
  sku?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  page?: number;
  per_page?: number;
  sort_by?: "name" | "price" | "created_at";
  sort_order?: "asc" | "desc";
}

export interface ProductsResponse {
  data: Product[];
  meta: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
  };
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  quantity: number;
  low_stock_threshold: number;
  category?: string;
  sku?: string;
}

export const productsApi = {
  getAll: async (
    filters?: ProductFilters,
  ): Promise<ApiResponse<ProductsResponse>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const queryString = params.toString();
    const url = queryString ? `/products?${queryString}` : "/products";
    return makeApiCall(() => apiClient.get(url));
  },

  getById: async (id: number): Promise<ApiResponse<Product>> =>
    makeApiCall(() => apiClient.get(`/products/${id}`)),

  create: async (
    productData: CreateProductData,
  ): Promise<ApiResponse<Product>> =>
    makeApiCall(() => apiClient.post("/products", productData)),

  update: async (
    id: number,
    productData: Partial<CreateProductData>,
  ): Promise<ApiResponse<Product>> =>
    makeApiCall(() => apiClient.put(`/products/${id}`, productData)),

  delete: async (id: number): Promise<ApiResponse<void>> =>
    makeApiCall(() => apiClient.delete(`/products/${id}`)),

  search: async (query: string): Promise<ApiResponse<Product[]>> =>
    makeApiCall(() =>
      apiClient.get(`/products/search?q=${encodeURIComponent(query)}`),
    ),

  getLowStock: async (): Promise<ApiResponse<Product[]>> =>
    makeApiCall(() => apiClient.get("/products/low-stock")),

  getCategories: async (): Promise<ApiResponse<string[]>> =>
    makeApiCall(() => apiClient.get("/products/categories")),

  updateStock: async (
    id: number,
    quantity: number,
  ): Promise<ApiResponse<Product>> =>
    makeApiCall(() => apiClient.put(`/products/${id}/stock`, { quantity })),

  bulkUpdate: async (
    updates: Array<{ id: number; quantity: number }>,
  ): Promise<ApiResponse<Product[]>> =>
    makeApiCall(() => apiClient.put("/products/bulk-update", { updates })),
};
