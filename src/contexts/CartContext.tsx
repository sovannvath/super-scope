import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { useCart, UseCartReturn } from "@/hooks/use-cart";
import { useAuth } from "@/contexts/AuthContext";

interface CartContextType extends UseCartReturn {
  isCartEmpty: boolean;
  hasItems: boolean;
  cartSummary: {
    itemCount: number;
    totalAmount: number;
    lastUpdated: string | null;
  };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const cartState = useCart();
  const { isAuthenticated } = useAuth();

  // Enhanced cart state - use correct item count calculation
  const actualItemCount =
    (cartState.cart?.cart_items || cartState.cart?.items || []).reduce(
      (total, item) => total + item.quantity,
      0,
    ) || 0;
  const isCartEmpty = actualItemCount === 0;
  const hasItems = actualItemCount > 0;

  const cartSummary = {
    itemCount: actualItemCount,
    totalAmount: cartState.totalAmount,
    lastUpdated: cartState.cart?.updated_at || null,
  };

  // Auto-sync cart when authentication changes (simplified to prevent loops)
  useEffect(() => {
    console.log("🛒 CartContext: Authentication state changed", {
      isAuthenticated,
    });

    if (isAuthenticated && cartState.refetch) {
      console.log("🛒 CartContext: Refetching cart data due to auth change...");
      // Add a small delay to ensure auth is fully settled
      const timer = setTimeout(() => {
        cartState.refetch();
      }, 500);
      return () => clearTimeout(timer);
    } else if (!isAuthenticated) {
      console.log(
        "🛒 CartContext: User not authenticated, clearing cart state",
      );
      // Cart state will be cleared by the useCart hook
    }
  }, [isAuthenticated]); // Simplified dependencies

  // Persist cart summary to localStorage
  useEffect(() => {
    if (hasItems && isAuthenticated) {
      localStorage.setItem(
        "cart_summary",
        JSON.stringify({
          ...cartSummary,
          timestamp: new Date().toISOString(),
        }),
      );
    } else if (!isAuthenticated) {
      localStorage.removeItem("cart_summary");
    }
  }, [cartSummary, hasItems, isAuthenticated]);

  // Auto-refresh cart periodically when items exist
  useEffect(() => {
    if (!hasItems || !isAuthenticated) return;

    const interval = setInterval(
      () => {
        if (cartState.refetch) {
          cartState.refetch();
        }
      },
      5 * 60 * 1000,
    ); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [hasItems, isAuthenticated]); // Removed cartState.refetch from dependencies

  const enhancedCartState: CartContextType = {
    ...cartState,
    isCartEmpty,
    hasItems,
    cartSummary,
  };

  return (
    <CartContext.Provider value={enhancedCartState}>
      {children}
    </CartContext.Provider>
  );
};
