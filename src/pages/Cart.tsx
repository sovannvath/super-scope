import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Package,
  CreditCard,
  ArrowLeft,
  ShoppingBag,
} from "lucide-react";
import { Link } from "react-router-dom";

interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  description: string;
  maxStock: number;
}

const Cart: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = async () => {
    try {
      const response = await cartApi.view();
      if (response.status === 200) {
        // Handle Laravel API response structure for cart
        const cartData = response.data;
        if (cartData && cartData.items) {
          const formattedItems: CartItem[] = cartData.items.map(
            (item: any) => ({
              id: item.id,
              productId: item.product_id || item.productId,
              name: item.product?.name || item.name,
              price: item.product?.price || item.price,
              quantity: item.quantity,
              description: item.product?.description || item.description || "",
              maxStock: item.product?.quantity || item.maxStock || 999,
            }),
          );
          setCartItems(formattedItems);
        } else {
          setCartItems([]);
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to load cart items",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      const response = await cartApi.updateItem(itemId, {
        quantity: newQuantity,
      });
      if (response.status === 200) {
        loadCartItems(); // Reload cart from server
        toast({
          title: "Cart Updated",
          description: "Item quantity has been updated",
        });
      } else {
        toast({
          title: "Error",
          description: response.data?.message || "Failed to update quantity",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update cart",
        variant: "destructive",
      });
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      const response = await cartApi.removeItem(itemId);
      if (response.status === 200) {
        loadCartItems(); // Reload cart from server
        toast({
          title: "Item Removed",
          description: "Item has been removed from your cart",
        });
      } else {
        toast({
          title: "Error",
          description: response.data?.message || "Failed to remove item",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
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
          description: "All items have been removed from your cart",
        });
      } else {
        toast({
          title: "Error",
          description: response.data?.message || "Failed to clear cart",
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
    setIsCheckingOut(true);

    try {
      // Get payment methods first (you may want to implement payment method selection)
      const paymentMethodsResponse = await orderApi.getPaymentMethods();
      let paymentMethodId = 1; // Default payment method

      if (
        paymentMethodsResponse.status === 200 &&
        paymentMethodsResponse.data.length > 0
      ) {
        paymentMethodId = paymentMethodsResponse.data[0].id;
      }

      const orderData = {
        payment_method_id: paymentMethodId,
        notes: "Order placed from cart",
      };

      const response = await orderApi.create(orderData);

      if (response.status === 200 || response.status === 201) {
        toast({
          title: "Order Placed Successfully!",
          description: `Your order has been placed successfully!`,
        });
        setCartItems([]);
      } else {
        toast({
          title: "Checkout Failed",
          description: response.data?.message || "Failed to place order",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Checkout Failed",
        description:
          "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = subtotal > 100 ? 0 : 15.99;
  const tax = subtotal * 0.08; // 8% tax
  const totalAmount = subtotal + shipping + tax;

  if (!user) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="mx-auto h-16 w-16 text-metallic-light mb-4" />
        <h3 className="text-lg font-semibold text-metallic-primary mb-2">
          Please Sign In
        </h3>
        <p className="text-metallic-tertiary mb-4">
          You need to be signed in to view your cart.
        </p>
        <Button
          asChild
          className="bg-metallic-primary hover:bg-metallic-primary/90"
        >
          <Link to="/auth">Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-metallic-primary">
            Shopping Cart
          </h1>
          <p className="text-metallic-tertiary">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in
            your cart
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-metallic-primary"></div>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="mx-auto h-16 w-16 text-metallic-light mb-4" />
          <h3 className="text-lg font-semibold text-metallic-primary mb-2">
            Your cart is empty
          </h3>
          <p className="text-metallic-tertiary mb-4">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Button
            asChild
            className="bg-metallic-primary hover:bg-metallic-primary/90"
          >
            <Link to="/">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Cart Items</CardTitle>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Clear Cart
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear Cart</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove all items from your
                        cart? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={clearCart}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Clear Cart
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 p-4 border rounded-lg"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-metallic-light to-metallic-background rounded-lg flex items-center justify-center">
                      <Package className="h-8 w-8 text-metallic-primary/30" />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-metallic-primary">
                        {item.name}
                      </h3>
                      <p className="text-sm text-metallic-tertiary">
                        {item.description}
                      </p>
                      <div className="flex items-center mt-2">
                        <span className="text-lg font-bold text-metallic-primary">
                          ${item.price.toFixed(2)}
                        </span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          Stock: {item.maxStock}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        max={item.maxStock}
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.id, parseInt(e.target.value) || 1)
                        }
                        className="w-16 text-center"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.maxStock}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold text-metallic-primary">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <Badge variant="secondary">Free</Badge>
                      ) : (
                        `$${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-metallic-primary">
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {shipping > 0 && (
                  <div className="bg-metallic-light/20 p-3 rounded-lg">
                    <p className="text-sm text-metallic-tertiary">
                      💡 Add ${(100 - subtotal).toFixed(2)} more for free
                      shipping!
                    </p>
                  </div>
                )}

                <Button
                  className="w-full bg-metallic-primary hover:bg-metallic-primary/90"
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Proceed to Checkout
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-xs text-metallic-tertiary">
                    Secure checkout powered by SSL encryption
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">We Accept</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center">
                      VISA
                    </div>
                    <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center">
                      MC
                    </div>
                    <div className="w-8 h-5 bg-blue-800 rounded text-white text-xs flex items-center justify-center">
                      AMEX
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Cash on Delivery
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
