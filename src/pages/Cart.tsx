import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useCartContext } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import {
  LoadingSpinner,
  EmptyCart,
  ErrorState,
} from "@/components/atoms/LoadingStates";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Package,
  ArrowRight,
} from "lucide-react";

// Define interfaces to match API response
interface Product {
  id: number;
  name: string;
  description: string;
  price: string; // API returns price as string
  image: string; // Match field from /api/products and /api/products/:id
}

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number; // API returns price as number
  subtotal: number; // API returns subtotal as number
  product: Product;
}

interface Cart {
  id: number;
  user_id: number; // Added to match API response
  cart_items: CartItem[]; // Backend uses cart_items
  created_at: string; // Added to match API response
  updated_at: string; // Added to match API response
}

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cart, loading, error, updateItem, removeItem, clearCart, refetch } =
    useCartContext();
  const { toast } = useToast();

  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    console.log(
      "🛒 Cart page: User authenticated, cart will be fetched by context",
    );

    // Force refresh cart when cart page is visited (only once)
    if (refetch && !loading) {
      console.log("🛒 Cart page: Force refreshing cart on page visit");
      const timer = setTimeout(() => {
        refetch();
      }, 500); // Small delay to ensure context is ready

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate]); // Removed refetch and loading from dependencies

  // Update last updated timestamp when cart changes
  useEffect(() => {
    if (cart && cart.updated_at) {
      setLastUpdated(new Date(cart.updated_at));
    }
  }, [cart]);

  // Debug logging for cart state changes
  useEffect(() => {
    console.log("🛒 Cart page state updated:", {
      cart,
      loading,
      error,
      hasItems: cart?.items?.length > 0,
      totalItems: cart?.total_items,
      totalAmount: cart?.total_amount,
    });
  }, [cart, loading, error]);

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }

    try {
      setUpdatingItems((prev) => new Set(prev).add(itemId));
      const success = await updateItem(itemId, newQuantity);

      if (!success) {
        // Error is already handled by the context
        console.log("❌ Update quantity failed");
      }
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      setUpdatingItems((prev) => new Set(prev).add(itemId));
      const success = await removeItem(itemId);

      if (!success) {
        // Error is already handled by the context
        console.log("❌ Remove item failed");
      }
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleClearCart = async () => {
    const success = await clearCart();

    if (!success) {
      // Error is already handled by the context
      console.log("❌ Clear cart failed");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <ErrorState
          description={error}
          action={<Button onClick={refetch}>Try Again</Button>}
        />
      </div>
    );
  }

  // Debug logging for cart state
  const cartItems = cart?.cart_items || cart?.items || [];
  console.log("🛒 Cart page render state:", {
    hasCart: !!cart,
    cartItems: cartItems,
    itemsLength: cartItems.length,
    totalItems: cart?.total_items,
    cartFromAPI: cart,
    isEmptyByItems: cartItems.length === 0,
    isEmptyByTotalItems: cart?.total_items === 0,
  });

  // Check if cart is truly empty
  const isEmptyCart = !cart || cartItems.length === 0;

  if (isEmptyCart) {
    return (
      <div className="container mx-auto py-8 px-4">
        <EmptyCart />
        <div className="text-center mt-6 space-y-4">
          <Button onClick={() => navigate("/products")}>
            Continue Shopping
          </Button>
          <div className="text-center">
            <Button
              onClick={async () => {
                console.log("🛒 Manual cart refresh triggered");
                await refetch();
              }}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="sm" /> : "Refresh Cart"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <ShoppingCart className="h-8 w-8 mr-3" />
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <Badge variant="secondary" className="ml-3">
            {cartItems.length} items
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              console.log("🛒 Manual cart refresh triggered");
              await refetch();
            }}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700"
          >
            {loading ? <LoadingSpinner size="sm" /> : "Refresh"}
          </Button>
          {error && (
            <span className="text-sm text-red-500">Error loading cart</span>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Cart Items</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCart}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 p-4 border rounded-lg"
                >
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package className="h-8 w-8 text-gray-400" />
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {item.product.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {item.product.description}
                    </p>
                    <p className="font-medium text-lg">
                      $
                      {(
                        item.price ||
                        parseFloat(item.product.price) ||
                        0
                      ).toFixed(2)}{" "}
                      each
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={
                        updatingItems.has(item.id) || item.quantity <= 1
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">
                      {updatingItems.has(item.id) ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        item.quantity
                      )}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={updatingItems.has(item.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Subtotal and Remove */}
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      $
                      {(
                        item.subtotal ||
                        (item.price || parseFloat(item.product.price) || 0) *
                          item.quantity
                      ).toFixed(2)}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={updatingItems.has(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Items ({cartItems.length}):</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${(totalAmount * 0.1).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${(totalAmount * 1.1).toFixed(2)}</span>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => navigate("/checkout")}
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Proceed to Checkout
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/products")}
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;
