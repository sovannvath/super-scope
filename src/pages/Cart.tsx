import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { cartApi, orderApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Package,
  CreditCard,
  ArrowRight,
} from "lucide-react";

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    quantity: number;
  };
}

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
}

const Cart: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
      loadPaymentMethods();
    }
  }, [isAuthenticated]);

  const loadCart = async () => {
    try {
      setIsLoading(true);
      const response = await cartApi.index();

      if (response.status === 200) {
        let itemsArray: CartItem[] = [];
        if (Array.isArray(response.data)) {
          itemsArray = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          itemsArray = response.data.data;
        }
        setCartItems(itemsArray);
      } else {
        toast({
          title: "Error",
          description: "Failed to load cart",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Cart error:", error);
      toast({
        title: "Error",
        description: "Failed to connect to cart service",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const response = await orderApi.getPaymentMethods();
      if (response.status === 200) {
        let methodsArray: PaymentMethod[] = [];
        if (Array.isArray(response.data)) {
          methodsArray = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          methodsArray = response.data.data;
        }
        setPaymentMethods(methodsArray);
        if (methodsArray.length > 0) {
          setSelectedPaymentMethod(methodsArray[0].id);
        }
      }
    } catch (error) {
      console.error("Payment methods error:", error);
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      setIsUpdating(itemId);
      const response = await cartApi.updateItem(itemId, {
        quantity: newQuantity,
      });

      if (response.status === 200) {
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item,
          ),
        );
        toast({
          title: "Cart Updated",
          description: "Item quantity updated successfully",
        });
      } else {
        toast({
          title: "Update Failed",
          description: "Failed to update item quantity",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update cart item",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      const response = await cartApi.removeItem(itemId);

      if (response.status === 200) {
        setCartItems((prev) => prev.filter((item) => item.id !== itemId));
        toast({
          title: "Item Removed",
          description: "Item removed from cart",
        });
      } else {
        toast({
          title: "Remove Failed",
          description: "Failed to remove item from cart",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove cart item",
        variant: "destructive",
      });
    }
  };

  const clearCart = async () => {
    try {
      const response = await cartApi.clear();

      if (response.status === 200) {
        setCartItems([]);
        toast({
          title: "Cart Cleared",
          description: "All items removed from cart",
        });
      } else {
        toast({
          title: "Clear Failed",
          description: "Failed to clear cart",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      });
    }
  };

  const handleCheckout = async () => {
    if (!selectedPaymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCheckingOut(true);
      const response = await orderApi.store({
        payment_method: selectedPaymentMethod,
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      });

      if (response.status === 200 || response.status === 201) {
        toast({
          title: "Order Placed Successfully",
          description: `Order #${response.data.id} has been created`,
        });
        setCartItems([]);
        navigate("/orders");
      } else {
        toast({
          title: "Checkout Failed",
          description: response.message || "Failed to place order",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Checkout Error",
        description: "Failed to process order",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0,
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="mx-auto h-16 w-16 text-metallic-light mb-4" />
        <h3 className="text-lg font-semibold text-metallic-primary mb-2">
          Please Log In
        </h3>
        <p className="text-metallic-tertiary mb-4">
          You need to be logged in to view your cart
        </p>
        <Button onClick={() => navigate("/auth")}>Go to Login</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-metallic-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-metallic-primary">
          Shopping Cart
        </h1>
        {cartItems.length > 0 && (
          <Button variant="outline" onClick={clearCart}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Cart
          </Button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingCart className="mx-auto h-16 w-16 text-metallic-light mb-4" />
            <h3 className="text-lg font-semibold text-metallic-primary mb-2">
              Your cart is empty
            </h3>
            <p className="text-metallic-tertiary mb-4">
              Add some products to get started
            </p>
            <Button onClick={() => navigate("/")}>Continue Shopping</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-metallic-light to-metallic-background rounded-lg flex items-center justify-center">
                      <Package className="h-8 w-8 text-metallic-primary/30" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-metallic-primary">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-metallic-tertiary">
                        {item.product.description}
                      </p>
                      <p className="text-lg font-bold text-metallic-primary">
                        ${item.product.price}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1 || isUpdating === item.id}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.id, parseInt(e.target.value))
                        }
                        className="w-20 text-center"
                        min="1"
                        disabled={isUpdating === item.id}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={isUpdating === item.id}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {paymentMethods.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Method</label>
                  <select
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    {paymentMethods.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <Button
                className="w-full bg-metallic-primary hover:bg-metallic-primary/90"
                onClick={handleCheckout}
                disabled={isCheckingOut || cartItems.length === 0}
              >
                {isCheckingOut ? (
                  "Processing..."
                ) : (
                  <>
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Cart;
