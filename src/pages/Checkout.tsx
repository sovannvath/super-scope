import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { cartApi, ordersApi } from "@/api/cart";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/atoms/LoadingStates";
import {
  CreditCard,
  Truck,
  MapPin,
  ShoppingBag,
  ArrowLeft,
  Check,
} from "lucide-react";

interface PaymentMethod {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

interface OrderData {
  payment_method: string;
  shipping_address: string;
  billing_address: string;
  notes?: string;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [cart, setCart] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [orderData, setOrderData] = useState<OrderData>({
    payment_method: "",
    shipping_address: "",
    billing_address: "",
    notes: "",
  });

  const [sameAsShipping, setSameAsShipping] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    initializeCheckout();
  }, [isAuthenticated, navigate]);

  const initializeCheckout = async () => {
    try {
      setLoading(true);

      // Fetch cart and payment methods in parallel
      const [cartResponse, paymentResponse] = await Promise.all([
        cartApi.get(),
        ordersApi.getPaymentMethods(),
      ]);

      if (cartResponse.status === 200 && cartResponse.data) {
        setCart(cartResponse.data);

        // Redirect if cart is empty
        if (!cartResponse.data.items || cartResponse.data.items.length === 0) {
          toast({
            title: "Empty Cart",
            description: "Your cart is empty. Add some items first!",
            variant: "destructive",
          });
          navigate("/cart");
          return;
        }
      }

      if (paymentResponse.status === 200 && paymentResponse.data) {
        setPaymentMethods(paymentResponse.data);
        // Set first payment method as default
        if (paymentResponse.data.length > 0) {
          setOrderData((prev) => ({
            ...prev,
            payment_method: paymentResponse.data[0].id,
          }));
        }
      } else {
        // Fallback payment methods if API doesn't return them
        const fallbackMethods = [
          {
            id: "credit_card",
            name: "Credit Card",
            description: "Visa, MasterCard, American Express",
          },
          {
            id: "debit_card",
            name: "Debit Card",
            description: "Direct bank payment",
          },
          {
            id: "paypal",
            name: "PayPal",
            description: "Pay with your PayPal account",
          },
          {
            id: "bank_transfer",
            name: "Bank Transfer",
            description: "Direct bank transfer",
          },
        ];
        setPaymentMethods(fallbackMethods);
        setOrderData((prev) => ({ ...prev, payment_method: "credit_card" }));
      }
    } catch (error: any) {
      toast({
        title: "Checkout Error",
        description: "Failed to load checkout data",
        variant: "destructive",
      });
      navigate("/cart");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof OrderData, value: string) => {
    setOrderData((prev) => ({ ...prev, [field]: value }));

    // Auto-copy shipping to billing if same address is checked
    if (field === "shipping_address" && sameAsShipping) {
      setOrderData((prev) => ({ ...prev, billing_address: value }));
    }
  };

  const handleSameAsShippingChange = (checked: boolean) => {
    setSameAsShipping(checked);
    if (checked) {
      setOrderData((prev) => ({
        ...prev,
        billing_address: prev.shipping_address,
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!orderData.payment_method) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method",
        variant: "destructive",
      });
      return false;
    }

    if (!orderData.shipping_address.trim()) {
      toast({
        title: "Shipping Address Required",
        description: "Please enter your shipping address",
        variant: "destructive",
      });
      return false;
    }

    if (!orderData.billing_address.trim()) {
      toast({
        title: "Billing Address Required",
        description: "Please enter your billing address",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const response = await ordersApi.create(orderData);

      if (response.status === 200 || response.status === 201) {
        toast({
          title: "Order Placed Successfully!",
          description: `Your order #${response.data.order_number || response.data.id} has been placed`,
        });

        // Redirect to order confirmation
        navigate(`/orders/${response.data.id}`, {
          state: { orderPlaced: true },
        });
      } else {
        throw new Error(response.message || "Failed to place order");
      }
    } catch (error: any) {
      toast({
        title: "Order Failed",
        description:
          error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
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

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/cart")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cart
        </Button>
        <ShoppingBag className="h-8 w-8 mr-3" />
        <h1 className="text-3xl font-bold">Checkout</h1>
      </div>

      <form onSubmit={handleSubmitOrder}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shipping">Shipping Address *</Label>
                  <Textarea
                    id="shipping"
                    placeholder="Enter your full shipping address..."
                    value={orderData.shipping_address}
                    onChange={(e) =>
                      handleInputChange("shipping_address", e.target.value)
                    }
                    required
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Billing Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Billing Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="same-as-shipping"
                    checked={sameAsShipping}
                    onChange={(e) =>
                      handleSameAsShippingChange(e.target.checked)
                    }
                    className="rounded"
                  />
                  <Label htmlFor="same-as-shipping">
                    Same as shipping address
                  </Label>
                </div>

                {!sameAsShipping && (
                  <div className="space-y-2">
                    <Label htmlFor="billing">Billing Address *</Label>
                    <Textarea
                      id="billing"
                      placeholder="Enter your billing address..."
                      value={orderData.billing_address}
                      onChange={(e) =>
                        handleInputChange("billing_address", e.target.value)
                      }
                      required
                      rows={3}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={orderData.payment_method}
                  onValueChange={(value) =>
                    handleInputChange("payment_method", value)
                  }
                  className="space-y-4"
                >
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label
                        htmlFor={method.id}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">{method.name}</div>
                        {method.description && (
                          <div className="text-sm text-gray-600">
                            {method.description}
                          </div>
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Order Notes (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add any special instructions for your order..."
                  value={orderData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={3}
                />
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
                {cart && (
                  <>
                    <div className="space-y-2">
                      {cart.items.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm"
                        >
                          <span>
                            {item.product.name} × {item.quantity}
                          </span>
                          <span>${item.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
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
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Placing Order...
                        </>
                      ) : (
                        <>
                          <Check className="h-5 w-5 mr-2" />
                          Place Order
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
