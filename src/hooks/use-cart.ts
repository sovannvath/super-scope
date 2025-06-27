import { useState, useEffect, useCallback } from "react";
import {
  cartApi,
  Cart,
  CartItem,
  AddToCartData,
  CartResponse,
} from "@/api/cart";
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

// Internal cart state that includes total_amount
interface CartState {
  cart: Cart | null;
  total_amount: number;
}

export function useCart(): UseCartReturn {
  const [cart, setCart] = useState<Cart | null>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false); // Start as false, only load when authenticated
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const fetchCart = useCallback(async () => {
    // Double check authentication before making API call
    if (!isAuthenticated || authLoading) {
      setCart(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("🛒 Fetching cart from API...");

      const response = await cartApi.get();
      console.log("🛒 Cart API Response:", response);

      if (response.status === 200 && response.data) {
        console.log("✅ Cart data received:", response.data);

        // Extract cart and total_amount from backend response
        const { cart: cartData, total_amount } = response.data;

        // Ensure cart_items is an array even if empty
        const processedCart = {
          ...cartData,
          cart_items: Array.isArray(cartData.cart_items)
            ? cartData.cart_items
            : [],
        };

        setCart(processedCart);
        setTotalAmount(total_amount || 0);

        // Cache cart data for offline usage
        localStorage.setItem(
          "cart_cache",
          JSON.stringify({
            data: { cart: processedCart, total_amount },
            timestamp: Date.now(),
          }),
        );
      } else if (response.status === 404) {
        console.log("ℹ️ No cart exists yet, creating empty cart");
        // No cart exists yet, create empty cart
        const emptyCart = {
          id: 0,
          user_id: 0,
          cart_items: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setCart(emptyCart);
        setTotalAmount(0);
        localStorage.setItem(
          "cart_cache",
          JSON.stringify({
            data: { cart: emptyCart, total_amount: 0 },
            timestamp: Date.now(),
          }),
        );
      } else {
        throw new Error(response.message || "Failed to fetch cart");
      }
    } catch (error: any) {
      console.error("❌ Cart fetch error:", error);

      // Try to load from cache as fallback
      const cachedCart = localStorage.getItem("cart_cache");
      if (cachedCart) {
        try {
          const cached = JSON.parse(cachedCart);
          const cacheAge = Date.now() - cached.timestamp;
          // Use cache if it's less than 5 minutes old
          if (cacheAge < 5 * 60 * 1000) {
            console.log("📦 Using cached cart data");
            if (cached.data.cart) {
              // New cache format
              setCart(cached.data.cart);
              setTotalAmount(cached.data.total_amount || 0);
            } else {
              // Old cache format - convert to new structure
              setCart({
                ...cached.data,
                cart_items: cached.data.items || cached.data.cart_items || [],
              });
              setTotalAmount(cached.data.total_amount || 0);
            }
            setError(null);
            return;
          }
        } catch (parseError) {
          console.error("❌ Failed to parse cached cart:", parseError);
          localStorage.removeItem("cart_cache");
        }
      }

      // Graceful degradation for cart functionality
      console.log("⚠️ Cart not available, showing empty cart");
      const fallbackCart = {
        id: 0,
        user_id: 0,
        cart_items: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setCart(fallbackCart);
      setTotalAmount(0);
      setError(null); // Don't show error state
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

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
        console.log("🛒 Adding item to cart:", data);
        const response = await cartApi.addItem(data);
        console.log("🛒 Add to cart response:", response);

        if (response.status === 200 || response.status === 201) {
          console.log("✅ Item added successfully, refreshing cart...");
          await fetchCart(); // Refresh cart immediately
          toast({
            title: "Added to Cart",
            description: "Product has been added to your cart",
          });
          return true;
        } else {
          throw new Error(response.message || "Failed to add to cart");
        }
      } catch (error: any) {
        console.error("❌ Add to cart error:", error);

        // Check if it's a network/server error
        if (error.code === "ECONNABORTED" || error.response?.status >= 500) {
          toast({
            title: "Server Unavailable",
            description:
              "Cart service is temporarily unavailable. Please try again later.",
            variant: "destructive",
          });
        } else if (error.response?.status === 401) {
          toast({
            title: "Authentication Error",
            description: "Please log in again to add items to your cart",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Add to Cart Failed",
            description:
              error.message || "Failed to add item to cart. Please try again.",
            variant: "destructive",
          });
        }
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
    if (!authLoading) {
      if (isAuthenticated) {
        console.log("🛒 useCart: User authenticated, fetching cart...");
        fetchCart();
      } else {
        console.log("🛒 useCart: User not authenticated, clearing cart state");
        // Clear cart state completely when not authenticated
        setCart({
          id: 0,
          user_id: 0,
          cart_items: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setTotalAmount(0);
        setLoading(false);
        setError(null);
        // Clear cached cart data when user logs out
        localStorage.removeItem("cart_cache");
        localStorage.removeItem("cart_summary");
      }
    }
  }, [authLoading, isAuthenticated]); // Removed fetchCart from dependencies to prevent loops

  const itemCount =
    cart?.cart_items?.reduce((total, item) => total + item.quantity, 0) || 0;

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
