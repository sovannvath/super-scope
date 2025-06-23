import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { ordersApi } from "@/api/orders";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/atoms/LoadingStates";
import {
  CheckCircle,
  Package,
  CreditCard,
  Truck,
  ArrowRight,
  Download,
  Share2,
  Home,
  ShoppingBag,
} from "lucide-react";
import { formatDate } from "@/utils/api-helpers";

interface Order {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  total_amount: number;
  shipping_address: string;
  billing_address: string;
  items: Array<{
    id: number;
    product_id: number;
    quantity: number;
    price: number;
    subtotal: number;
    product: {
      id: number;
      name: string;
      description: string;
    };
  }>;
  created_at: string;
  updated_at: string;
}

const OrderSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (orderId) {
      fetchOrder(parseInt(orderId));
    } else {
      setError("Order ID is required");
      setLoading(false);
    }

    // Show success animation/confetti effect
    setTimeout(() => {
      toast({
        title: "🎉 Order Placed Successfully!",
        description: "Thank you for your purchase. We're preparing your order.",
        duration: 5000,
      });
    }, 500);
  }, [isAuthenticated, orderId, navigate, toast]);

  const fetchOrder = async (id: number) => {
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
      setError(error.message || "Failed to load order");
      console.error("Order fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!order) return;

    // Create a simple receipt text
    const receiptContent = `
ORDER RECEIPT
=============

Order #: ${order.order_number || order.id}
Date: ${formatDate(order.created_at)}
Status: ${order.status}
Payment: ${order.payment_status} (${order.payment_method})

ITEMS:
${order.items
  .map(
    (item) =>
      `${item.product.name} x${item.quantity} - $${item.subtotal.toFixed(2)}`,
  )
  .join("\n")}

Subtotal: $${order.total_amount.toFixed(2)}
Tax: $${(order.total_amount * 0.1).toFixed(2)}
Total: $${(order.total_amount * 1.1).toFixed(2)}

Shipping Address:
${order.shipping_address}
    `;

    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt-${order.order_number || order.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Receipt Downloaded",
      description: "Your receipt has been downloaded successfully",
    });
  };

  const handleShareOrder = async () => {
    if (!order) return;

    const shareData = {
      title: `Order #${order.order_number || order.id}`,
      text: `I just placed an order for $${(order.total_amount * 1.1).toFixed(2)}!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `${shareData.text} ${shareData.url}`,
        );
        toast({
          title: "Link Copied",
          description: "Order link copied to clipboard",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
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

  if (error || !order) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Card className="text-center">
          <CardContent className="p-8">
            <div className="text-red-500 mb-4">
              <Package className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
            <p className="text-gray-600 mb-6">
              {error || "We couldn't find the order you're looking for."}
            </p>
            <div className="space-x-4">
              <Button onClick={() => navigate("/orders")}>
                View All Orders
              </Button>
              <Button variant="outline" onClick={() => navigate("/")}>
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-green-700 mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          Thank you for your purchase. Your order is being processed.
        </p>
        <div className="flex justify-center space-x-4">
          <Badge variant="outline" className="px-4 py-2 text-lg">
            Order #{order.order_number || order.id}
          </Badge>
          <Badge variant="secondary" className="px-4 py-2 text-lg">
            {formatDate(order.created_at)}
          </Badge>
        </div>
      </div>

      {/* Order Timeline */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Order Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center text-center flex-1">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium">Order Placed</span>
              <span className="text-xs text-gray-500">
                {formatDate(order.created_at)}
              </span>
            </div>
            <div className="flex-1 h-px bg-gray-200 mx-4"></div>
            <div className="flex flex-col items-center text-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  order.payment_status === "paid"
                    ? "bg-green-500"
                    : "bg-gray-200"
                }`}
              >
                <CreditCard
                  className={`h-5 w-5 ${
                    order.payment_status === "paid"
                      ? "text-white"
                      : "text-gray-400"
                  }`}
                />
              </div>
              <span className="text-sm font-medium">Payment</span>
              <span className="text-xs capitalize text-gray-500">
                {order.payment_status}
              </span>
            </div>
            <div className="flex-1 h-px bg-gray-200 mx-4"></div>
            <div className="flex flex-col items-center text-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  ["processing", "shipped", "delivered"].includes(order.status)
                    ? "bg-green-500"
                    : "bg-gray-200"
                }`}
              >
                <Package
                  className={`h-5 w-5 ${
                    ["processing", "shipped", "delivered"].includes(
                      order.status,
                    )
                      ? "text-white"
                      : "text-gray-400"
                  }`}
                />
              </div>
              <span className="text-sm font-medium">Processing</span>
              <span className="text-xs text-gray-500">In progress</span>
            </div>
            <div className="flex-1 h-px bg-gray-200 mx-4"></div>
            <div className="flex flex-col items-center text-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  ["shipped", "delivered"].includes(order.status)
                    ? "bg-green-500"
                    : "bg-gray-200"
                }`}
              >
                <Truck
                  className={`h-5 w-5 ${
                    ["shipped", "delivered"].includes(order.status)
                      ? "text-white"
                      : "text-gray-400"
                  }`}
                />
              </div>
              <span className="text-sm font-medium">Shipped</span>
              <span className="text-xs text-gray-500">Pending</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product.name}</h4>
                    <p className="text-sm text-gray-600">
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${item.subtotal.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {/* Order Total */}
          <Card>
            <CardHeader>
              <CardTitle>Order Total</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${order.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${(order.total_amount * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${(order.total_amount * 1.1).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              className="w-full"
              onClick={() => navigate(`/orders/${order.id}`)}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              View Order Details
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleDownloadReceipt}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleShareOrder}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Order
            </Button>
          </div>

          <Separator />

          <div className="space-y-3">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigate("/products")}
            >
              Continue Shopping
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/")}
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      {/* What's Next */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>What happens next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium mb-2">Payment Processing</h3>
              <p className="text-sm text-gray-600">
                Your payment is being processed and you'll receive a
                confirmation email.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium mb-2">Order Preparation</h3>
              <p className="text-sm text-gray-600">
                We'll prepare your items for shipping and notify you when ready.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Truck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium mb-2">Shipping & Delivery</h3>
              <p className="text-sm text-gray-600">
                Track your package and receive updates until it reaches you.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderSuccess;
