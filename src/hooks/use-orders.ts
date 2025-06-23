import { useState, useEffect, useCallback } from "react";
import {
  ordersApi,
  Order,
  OrderFilters,
  OrdersResponse,
  CreateOrderData,
} from "@/api/orders";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  meta: OrdersResponse["meta"] | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  createOrder: (data: CreateOrderData) => Promise<Order | null>;
}

export function useOrders(filters?: OrderFilters): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<OrdersResponse["meta"] | null>(null);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const fetchOrders = useCallback(
    async (loadMore = false) => {
      if (!isAuthenticated) {
        setOrders([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(!loadMore);
        setError(null);

        const currentPage = loadMore ? (meta?.current_page || 0) + 1 : 1;
        const response = await ordersApi.getAll({
          ...filters,
          page: currentPage,
        });

        if (response.status === 200 && response.data) {
          setOrders((prev) =>
            loadMore ? [...prev, ...response.data.data] : response.data.data,
          );
          setMeta(response.data.meta);
        } else {
          throw new Error(response.message || "Failed to fetch orders");
        }
      } catch (error: any) {
        setError(error.message || "Failed to fetch orders");
        if (!loadMore) {
          toast({
            title: "Error",
            description: error.message || "Failed to fetch orders",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, filters, meta, toast],
  );

  const createOrder = useCallback(
    async (data: CreateOrderData): Promise<Order | null> => {
      try {
        const response = await ordersApi.create(data);

        if (response.status === 200 || response.status === 201) {
          toast({
            title: "Order Created",
            description: "Your order has been successfully created",
          });
          await fetchOrders(false); // Refresh orders
          return response.data;
        } else {
          throw new Error(response.message || "Failed to create order");
        }
      } catch (error: any) {
        toast({
          title: "Order Failed",
          description: error.message || "Failed to create order",
          variant: "destructive",
        });
        return null;
      }
    },
    [fetchOrders, toast],
  );

  const refetch = useCallback(() => fetchOrders(false), [fetchOrders]);
  const loadMore = useCallback(() => fetchOrders(true), [fetchOrders]);

  const hasMore = meta ? meta.current_page < meta.last_page : false;

  useEffect(() => {
    fetchOrders(false);
  }, [
    isAuthenticated,
    filters?.status,
    filters?.payment_status,
    filters?.date_from,
    filters?.date_to,
  ]);

  return {
    orders,
    loading,
    error,
    meta,
    refetch,
    loadMore,
    hasMore,
    createOrder,
  };
}

export interface UseOrderReturn {
  order: Order | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateStatus: (status: string) => Promise<boolean>;
  cancel: (reason?: string) => Promise<boolean>;
}

export function useOrder(id: number): UseOrderReturn {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchOrder = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await ordersApi.getById(id);

      if (response.status === 200 && response.data) {
        setOrder(response.data);
      } else {
        throw new Error(response.message || "Order not found");
      }
    } catch (error: any) {
      setError(error.message || "Failed to fetch order");
      toast({
        title: "Error",
        description: error.message || "Failed to fetch order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  const updateStatus = useCallback(
    async (status: string): Promise<boolean> => {
      if (!order) return false;

      try {
        const response = await ordersApi.updateStatus(order.id, status);

        if (response.status === 200) {
          setOrder(response.data);
          toast({
            title: "Order Updated",
            description: "Order status has been updated",
          });
          return true;
        } else {
          throw new Error(response.message || "Failed to update order");
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to update order",
          variant: "destructive",
        });
        return false;
      }
    },
    [order, toast],
  );

  const cancel = useCallback(
    async (reason?: string): Promise<boolean> => {
      if (!order) return false;

      try {
        const response = await ordersApi.cancel(order.id, reason);

        if (response.status === 200) {
          setOrder(response.data);
          toast({
            title: "Order Cancelled",
            description: "Order has been successfully cancelled",
          });
          return true;
        } else {
          throw new Error(response.message || "Failed to cancel order");
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to cancel order",
          variant: "destructive",
        });
        return false;
      }
    },
    [order, toast],
  );

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return {
    order,
    loading,
    error,
    refetch: fetchOrder,
    updateStatus,
    cancel,
  };
}
