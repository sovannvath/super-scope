import { useState, useEffect, useCallback } from "react";
import {
  productsApi,
  Product,
  ProductFilters,
  ProductsResponse,
} from "@/api/products";
import { useToast } from "@/hooks/use-toast";

export interface UseProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  meta: ProductsResponse["meta"] | null;
}

export interface UseProductsReturn extends UseProductsState {
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export function useProducts(filters?: ProductFilters): UseProductsReturn {
  const [state, setState] = useState<UseProductsState>({
    products: [],
    loading: true,
    error: null,
    meta: null,
  });

  const { toast } = useToast();

  const fetchProducts = useCallback(
    async (loadMore = false) => {
      try {
        setState((prev) => ({
          ...prev,
          loading: !loadMore,
          error: null,
        }));

        const currentPage = loadMore ? (state.meta?.current_page || 0) + 1 : 1;
        const response = await productsApi.getAll({
          ...filters,
          page: currentPage,
        });

        if (response.status === 200 && response.data) {
          setState((prev) => ({
            ...prev,
            products: loadMore
              ? [...prev.products, ...response.data.data]
              : response.data.data,
            meta: response.data.meta,
            loading: false,
          }));
        } else {
          throw new Error(response.message || "Failed to fetch products");
        }
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || "Failed to fetch products",
        }));

        // Only show toast for non-timeout errors to avoid spam
        if (!loadMore && !error.message?.includes("timeout")) {
          toast({
            title: "Products Unavailable",
            description: "Unable to load products at the moment",
            variant: "default",
          });
        }
      }
    },
    [filters, state.meta, toast],
  );

  const refetch = useCallback(() => fetchProducts(false), [fetchProducts]);
  const loadMore = useCallback(() => fetchProducts(true), [fetchProducts]);

  const hasMore = state.meta
    ? state.meta.current_page < state.meta.last_page
    : false;

  useEffect(() => {
    fetchProducts(false);
  }, [
    filters?.search,
    filters?.category,
    filters?.sort_by,
    filters?.sort_order,
  ]);

  return {
    ...state,
    refetch,
    loadMore,
    hasMore,
  };
}

export interface UseProductReturn {
  product: Product | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProduct(id: number): UseProductReturn {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productsApi.getById(id);

      if (response.status === 200 && response.data) {
        setProduct(response.data);
      } else {
        throw new Error(response.message || "Product not found");
      }
    } catch (error: any) {
      setError(error.message || "Failed to fetch product");
      toast({
        title: "Error",
        description: error.message || "Failed to fetch product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id, fetchProduct]);

  return {
    product,
    loading,
    error,
    refetch: fetchProduct,
  };
}

export interface UseLowStockProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useLowStockProducts(): UseLowStockProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchLowStockProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productsApi.getLowStock();

      if (response.status === 200 && response.data) {
        setProducts(response.data);
      } else {
        throw new Error(
          response.message || "Failed to fetch low stock products",
        );
      }
    } catch (error: any) {
      setError(error.message || "Failed to fetch low stock products");
      toast({
        title: "Error",
        description: error.message || "Failed to fetch low stock products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchLowStockProducts();
  }, [fetchLowStockProducts]);

  return {
    products,
    loading,
    error,
    refetch: fetchLowStockProducts,
  };
}
