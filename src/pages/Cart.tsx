import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { cartApi } from "@/api/cart";
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
  price: number; // API returns price as number
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
  items: CartItem[];
  total_items: number;
  total_amount: number; // API returns total_amount as number
  created_at: string; // Added to match API response
  updated_at: string; // Added to match API response
}

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchCart();
  }, [isAuthenticated, navigate]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🛒 Fetching cart from API...");
      console.log(
        "📍 Full API URL:",
        "https://laravel-wtc.onrender.com/api/cart",
      );

      const response = await cartApi.get();
      console.log("📡 Cart API Response:", response);

      if (response.status === 200 && response.data) {
        console.log("✅ Cart data received:", response.data);
        // Ensure items is an array, even if empty
        const cartData: Cart = {
          ...response.data,
          items: Array.isArray(response.data.items) ? response.data.items : [],
        };
        setCart(cartData);
        setLastUpdated(new Date());

        // Store cart summary in localStorage for persistence
        localStorage.setItem(
          "cart_summary",
          JSON.stringify({
            itemCount: cartData.total_items,
            totalAmount: cartData.total_amount,
            lastUpdated: new Date().toISOString(),
          }),
        );
      } else if (response.status === 404) {
        // No cart exists yet
        setCart({
          id: 0,
          user_id: 0,
          items: [],
          total_items: 0,
          total_amount: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        localStorage.removeItem("cart_summary");
      } else {
        throw new Error(response.message || "Failed to fetch cart");
      }
    } catch (error: any) {
      console.error("❌ Cart fetch error:", error.message, error);
      setError(error.message || "Failed to load cart");

      // Try to load from localStorage as fallback
      const cachedSummary = localStorage.getItem("cart_summary");
      if (cachedSummary) {
        try {
          const summary = JSON.parse(cachedSummary);
          toast({
            title: "Working Offline",
            description:
              "Showing cached cart data. Some features may be limited.",
            variant: "default",
          });
          setCart({
            id: 0,
            user_id: 0,
            items: [],
            total_items: summary.itemCount || 0,
            total_amount: summary.totalAmount || 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } catch (parseError) {
          console.error("❌ Failed to parse cached cart:", parseError);
          localStorage.removeItem("cart_summary");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }

    try {
      setUpdatingItems((prev) => new Set(prev).add(itemId));
      const response = await cartApi.updateItem(itemId, {
        quantity: newQuantity,
      });

      if (response.status === 200) {
        await fetchCart(); // Refresh cart
        toast({
          title: "Cart Updated",
          description: "Item quantity has been updated",
        });
      } else {
        throw new Error(response.message || "Failed to update item");
      }
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update item quantity",
        variant: "destructive",
      });
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      setUpdatingItems((prev) => new Set(prev).add(itemId));
      const response = await cartApi.removeItem(itemId);

      if (response.status === 200) {
        await fetchCart(); // Refresh cart
        toast({
          title: "Item Removed",
          description: "Item has been removed from your cart",
        });
      } else {
        throw new Error(response.message || "Failed to remove item");
      }
    } catch (error: any) {
      toast({
        title: "Remove Failed",
        description: error.message || "Failed to remove item",
        variant: "destructive",
      });
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      const response = await cartApi.clear();

      if (response.status === 200) {
        await fetchCart(); // Refresh cart
        toast({
          title: "Cart Cleared",
          description: "All items have been removed from your cart",
        });
      } else {
        throw new Error(response.message || "Failed to clear cart");
      }
    } catch (error: any) {
      toast({
        title: "Clear Failed",
        description: error.message || "Failed to clear cart",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
          action={<Button onClick={fetchCart}>Try Again</Button>}
        />
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <EmptyCart />
        <div className="text-center mt-6">
          <Button onClick={() => navigate("/products")}>
            Continue Shopping
          </Button>
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
            {cart.total_items} items
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
            onClick={fetchCart}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700"
          >
            {loading ? <LoadingSpinner size="sm" /> : "Refresh"}
          </Button>
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
                onClick={clearCart}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.items.map((item) => (
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
                      ${item.price.toFixed(2)} each
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
                      ${item.subtotal.toFixed(2)}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
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
                  <span>Items ({cart.total_items}):</span>
                  <span>${cart.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${(cart.total_amount * 0.1).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${(cart.total_amount * 1.1).toFixed(2)}</span>
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
