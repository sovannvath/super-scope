import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { ordersApi } from "@/api/orders";
import { useToast } from "@/hooks/use-toast";
import {
  LoadingSpinner,
  ErrorState,
  EmptyState,
} from "@/components/atoms/LoadingStates";
import {
  ShoppingBag,
  Package,
  Calendar,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  ArrowLeft,
  Eye,
} from "lucide-react";
import { formatDate } from "@/utils/api-helpers";

interface Order {
  id: number;
  order_number: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  payment_method: string;
  total_amount: number;
  shipping_address: string | { street: string; city: string; state: string; zipCode: string; country: string };
  billing_address: string;
  notes?: string;
  items: Array<{
    id: number;
    product_id: number;
    quantity: number;
    price: number;
    subtotal: number;
    product?: {
      id: number;
      name: string;
      description: string;
      image?: string;
    };
  }>;
  created_at: string;
  updated_at: string;
}

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("🛒 Orders: User:", user); // Debug user
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (id) {
      fetchSingleOrder(parseInt(id));
    } else {
      fetchOrders();
    }

    if (location.state?.orderPlaced) {
      toast({
        title: "Order Placed Successfully! 🎉",
        description: "Thank you for your purchase. Your order is being processed.",
      });
    }
  }, [isAuthenticated, id, navigate, location.state]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ordersApi.getAll();
      console.log("🛒 Orders API response:", response);
      console.log("🛒 Orders API response.data:", JSON.stringify(response.data, null, 2));

      if (response.status === 200) {
        const ordersData = Array.isArray(response.data.orders)
          ? response.data.orders
          : Array.isArray(response.data)
          ? response.data
          : [];
        setOrders(
          ordersData.map((order: any) => ({
            id: order.id,
            order_number: order.order_number || `ORD-${order.id}`,
            status: order.order_status || "pending",
            payment_status: order.payment_status || "pending",
            payment_method: order.payment_method?.name || order.payment_method || "Unknown",
            total_amount: parseFloat(order.total_amount || order.total || order.subtotal || "0"),
            shipping_address: order.shipping_address || "",
            billing_address: order.billing_address || order.shipping_address || "",
            notes: order.notes,
            items: (order.order_items || order.items || []).map((item: any) => ({
              id: item.id,
              product_id: item.product_id || item.productId,
              quantity: item.quantity || 1,
              price: parseFloat(item.price || item.unitPrice || "0"),
              subtotal: parseFloat(item.subtotal || item.totalPrice || item.price * item.quantity || "0"),
              product: item.product
                ? {
                    id: item.product.id,
                    name: item.product.name || "Unknown Product",
                    description: item.product.description || "",
                    image: item.product.image,
                  }
                : { id: item.product_id, name: "Unknown Product", description: "" },
            })),
            created_at: order.created_at || new Date().toISOString(),
            updated_at: order.updated_at || new Date().toISOString(),
          })),
        );
        if (ordersData.length === 0) {
          console.warn("🛒 No orders found in response");
        }
      } else {
        throw new Error(response.message || "Failed to fetch orders");
      }
    } catch (error: any) {
      setError(error.message || "Failed to load orders");
      console.error("🛒 Orders fetch error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSingleOrder = async (orderId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ordersApi.getById(orderId);
      console.log("🛒 Single Order API response:", response);
      console.log("🛒 Single Order API response.data:", JSON.stringify(response.data, null, 2));

      if (response.status === 200 && response.data) {
        const order = response.data.order || response.data;
        setSelectedOrder({
          id: order.id,
          order_number: order.order_number || `ORD-${order.id}`,
          status: order.order_status || "pending",
          payment_status: order.payment_status || "pending",
          payment_method: order.payment_method?.name || order.payment_method || "Unknown",
          total_amount: parseFloat(order.total_amount || order.total || order.subtotal || "0"),
          shipping_address: order.shipping_address || "",
          billing_address: order.billing_address || order.shipping_address || "",
          notes: order.notes,
          items: (order.order_items || order.items || []).map((item: any) => ({
            id: item.id,
            product_id: item.product_id || item.productId,
            quantity: item.quantity || 1,
            price: parseFloat(item.price || item.unitPrice || "0"),
            subtotal: parseFloat(item.subtotal || item.totalPrice || item.price * item.quantity || "0"),
            product: item.product
              ? {
                  id: item.product.id,
                  name: item.product.name || "Unknown Product",
                  description: item.product.description || "",
                  image: item.product.image,
                }
              : { id: item.product_id, name: "Unknown Product", description: "" },
          })),
          created_at: order.created_at || new Date().toISOString(),
          updated_at: order.updated_at || new Date().toISOString(),
        });
      } else {
        throw new Error(response.message || "Order not found");
      }
    } catch (error: any) {
      setError(error.message || "Failed to load order");
      console.error("🛒 Order fetch error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "processing":
        return <Package className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
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
          action={
            <Button
              onClick={id ? () => fetchSingleOrder(parseInt(id)) : fetchOrders}
            >
              Try Again
            </Button>
          }
        />
      </div>
    );
  }

  // Single Order View
  if (selectedOrder) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/orders")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <ShoppingBag className="h-8 w-8 mr-3" />
          <h1 className="text-3xl font-bold">
            Order #{selectedOrder.order_number || selectedOrder.id}
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Order Date</span>
                    <p className="font-medium">
                      {formatDate(selectedOrder.created_at)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">
                      Payment Method
                    </span>
                    <p className="font-medium capitalize">
                      {selectedOrder.payment_method.replace("_", " ")}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Badge
                    className={`${getStatusColor(selectedOrder.status)} border`}
                  >
                    {getStatusIcon(selectedOrder.status)}
                    <span className="ml-1 capitalize">
                      {selectedOrder.status}
                    </span>
                  </Badge>
                  <Badge
                    className={getPaymentStatusColor(
                      selectedOrder.payment_status,
                    )}
                  >
                    <CreditCard className="h-3 w-3 mr-1" />
                    {selectedOrder.payment_status.charAt(0).toUpperCase() +
                      selectedOrder.payment_status.slice(1)}
                  </Badge>
                </div>

                {selectedOrder.notes && (
                  <div>
                    <span className="text-sm text-gray-600">Order Notes</span>
                    <p className="mt-1">{selectedOrder.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedOrder.items.length === 0 ? (
                  <p className="text-gray-600">No items found for this order.</p>
                ) : (
                  selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 p-4 border rounded-lg"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        {item.product?.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {item.product?.name || "Unknown Product"}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {item.product?.description || "No description available"}
                        </p>
                        <p className="text-sm">
                          ${item.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${item.subtotal.toFixed(2)}</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line">
                    {typeof selectedOrder.shipping_address === "string"
                      ? selectedOrder.shipping_address
                      : `${selectedOrder.shipping_address.street}, ${selectedOrder.shipping_address.city}, ${selectedOrder.shipping_address.state} ${selectedOrder.shipping_address.zipCode}, ${selectedOrder.shipping_address.country}`}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Billing Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line">
                    {selectedOrder.billing_address}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${selectedOrder.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>
                      ${(selectedOrder.total_amount * 0.1).toFixed(2)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>
                      ${(selectedOrder.total_amount * 1.1).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <EmptyState
          icon={ShoppingBag}
          title="No Orders Yet"
          description="You haven't placed any orders yet. Start shopping to see your orders here!"
          action={
            <Button onClick={() => navigate("/products")}>
              Start Shopping
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <ShoppingBag className="h-8 w-8 mr-3" />
          <h1 className="text-3xl font-bold">My Orders</h1>
          <Badge variant="secondary" className="ml-3">
            {orders.length} orders
          </Badge>
        </div>
        <Button onClick={() => navigate("/products")} variant="outline">
          Continue Shopping
        </Button>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    Order #{order.order_number || order.id}
                  </h3>
                  <p className="text-gray-600 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">
                    ${(order.total_amount * 1.1).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.items.length} items
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Badge className={`${getStatusColor(order.status)} border`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1 capitalize">{order.status}</span>
                  </Badge>
                  <Badge
                    className={getPaymentStatusColor(order.payment_status)}
                  >
                    <CreditCard className="h-3 w-3 mr-1" />
                    {order.payment_status.charAt(0).toUpperCase() +
                      order.payment_status.slice(1)}
                  </Badge>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Orders;