import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ordersApi } from "@/api/orders";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

interface Order {
  id: number;
  order_number: string;
  created_at: string;
  order_status: string;
  payment_status: string;
  total_amount: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  order_items: Array<{
    id: number;
    product_id: number;
    quantity: number;
    price: string;
    subtotal: string;
    product: {
      id: number;
      name: string;
      description: string;
      image?: string;
    };
  }>;
}

const PurchaseHistory: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrders = async () => {
    try {
      console.log("🛒 PurchaseHistory: ordersApi object:", ordersApi);
      const response = await ordersApi.getAll();
      console.log("🛒 PurchaseHistory: Orders API response:", JSON.stringify(response, null, 2));
      if (response.status === 200 && response.data) {
        const ordersData = Array.isArray(response.data.orders)
          ? response.data.orders
          : Array.isArray(response.data)
          ? response.data
          : [];
        setOrders(
          ordersData.map((order: any) => ({
            id: order.id,
            order_number: order.order_number || `ORD-${order.id}`,
            created_at: order.created_at || new Date().toISOString(),
            order_status: order.order_status || "pending",
            payment_status: order.payment_status || "pending",
            total_amount: order.total_amount || order.total || order.subtotal || "0.00",
            user: {
              id: order.user?.id || 0,
              name: order.user?.name || "Unknown",
              email: order.user?.email || "",
            },
            order_items: (order.order_items || order.items || []).map((item: any) => ({
              id: item.id,
              product_id: item.product_id || item.productId,
              quantity: item.quantity || 1,
              price: item.price || item.unit_price || "0.00",
              subtotal: item.subtotal || item.total_price || (parseFloat(item.price || "0") * item.quantity).toFixed(2),
              product: item.product
                ? {
                    id: item.product.id,
                    name: item.product.name || "Unknown Product",
                    description: item.product.description || "",
                    image: item.product.image,
                  }
                : { id: item.product_id, name: "Unknown Product", description: "" },
            })),
          })),
        );
      } else {
        throw new Error(response.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("❌ Error fetching orders:", error);
      setOrders([]);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchase History</h1>
        <p className="text-gray-600 mb-8">Welcome back, {user?.name}!</p>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" />
              All Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h4 className="font-semibold">Order #{order.order_number}</h4>
                      <p className="text-sm text-gray-600">
                        Customer: {order.user.name} ({order.user.email}) | ${order.total_amount}
                      </p>
                      <p className="text-sm text-gray-600">
                        Items: {order.order_items.map((item) => item.product.name).join(", ")}
                      </p>
                    </div>
                    <Badge
                      className={
                        order.order_status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : order.order_status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.order_status === "shipped"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }
                    >
                      {order.order_status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No orders found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PurchaseHistory;