import { useState, useEffect, useCallback } from "react";
import { cartApi, Cart, CartItem, AddToCartData } from "@/api/cart";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface UseCartReturn {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  itemCount: number;
  totalAmount: number;
  addItem: (data: AddToCartData) => Promise<boolean>;
  updateItem: (itemId: number, quantity: number) => Promise<boolean>;
  removeItem: (itemId: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useCart(): UseCartReturn {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await cartApi.get();

      if (response.status === 200 && response.data) {
        setCart(response.data);
      } else if (response.status === 404) {
        // No cart exists yet, create empty cart
        setCart({
          id: 0,
          user_id: 0,
          items: [],
          total_items: 0,
          total_amount: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } else {
        throw new Error(response.message || "Failed to fetch cart");
      }
    } catch (error: any) {
      setError(error.message || "Failed to fetch cart");
      console.error("Cart fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const addItem = useCallback(
    async (data: AddToCartData): Promise<boolean> => {
      if (!isAuthenticated) {
        toast({
          title: "Authentication Required",
          description: "Please log in to add items to your cart",
          variant: "destructive",
        });
        return false;
      }

      try {
        const response = await cartApi.addItem(data);

        if (response.status === 200 || response.status === 201) {
          await fetchCart(); // Refresh cart
          toast({
            title: "Added to Cart",
            description: "Product has been added to your cart",
          });
          return true;
        } else {
          throw new Error(response.message || "Failed to add item to cart");
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to add item to cart",
          variant: "destructive",
        });
        return false;
      }
    },
    [isAuthenticated, fetchCart, toast],
  );

  const updateItem = useCallback(
    async (itemId: number, quantity: number): Promise<boolean> => {
      try {
        const response = await cartApi.updateItem(itemId, { quantity });

        if (response.status === 200) {
          await fetchCart(); // Refresh cart
          toast({
            title: "Cart Updated",
            description: "Item quantity has been updated",
          });
          return true;
        } else {
          throw new Error(response.message || "Failed to update item");
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to update item",
          variant: "destructive",
        });
        return false;
      }
    },
    [fetchCart, toast],
  );

  const removeItem = useCallback(
    async (itemId: number): Promise<boolean> => {
      try {
        const response = await cartApi.removeItem(itemId);

        if (response.status === 200) {
          await fetchCart(); // Refresh cart
          toast({
            title: "Item Removed",
            description: "Item has been removed from your cart",
          });
          return true;
        } else {
          throw new Error(response.message || "Failed to remove item");
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to remove item",
          variant: "destructive",
        });
        return false;
      }
    },
    [fetchCart, toast],
  );

  const clearCart = useCallback(async (): Promise<boolean> => {
    try {
      const response = await cartApi.clear();

      if (response.status === 200) {
        await fetchCart(); // Refresh cart
        toast({
          title: "Cart Cleared",
          description: "All items have been removed from your cart",
        });
        return true;
      } else {
        throw new Error(response.message || "Failed to clear cart");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to clear cart",
        variant: "destructive",
      });
      return false;
    }
  }, [fetchCart, toast]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const itemCount = cart?.total_items || 0;
  const totalAmount = cart?.total_amount || 0;

  return {
    cart,
    loading,
    error,
    itemCount,
    totalAmount,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    refetch: fetchCart,
  };
}
