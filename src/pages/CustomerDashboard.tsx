import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { orderApi, productApi } from "@/lib/api";
import {
  ShoppingCart,
  Package,
  DollarSign,
  Clock,
  Truck,
  Star,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface CustomerStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSpent: number;
  favoriteProducts: number;
}

interface RecentOrder {
  id: number;
  order_number: string;
  total: string;
  status: string;
  created_at: string;
  items_count: number;
}

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<CustomerStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
    favoriteProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("🔄 CustomerDashboard - Current user:", user);
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Load recent orders
      const ordersResponse = await orderApi.index();
      if (ordersResponse.status === 200 && ordersResponse.data) {
        const orders = Array.isArray(ordersResponse.data)
          ? ordersResponse.data
          : ordersResponse.data.data || [];

        setRecentOrders(orders.slice(0, 5)); // Show last 5 orders

        // Calculate stats from orders
        const totalOrders = orders.length;
        const pendingOrders = orders.filter((order) =>
          ["pending", "processing"].includes(order.status?.toLowerCase()),
        ).length;
        const completedOrders = orders.filter(
          (order) => order.status?.toLowerCase() === "delivered",
        ).length;
        const totalSpent = orders.reduce(
          (sum, order) => sum + parseFloat(order.total || "0"),
          0,
        );

        setStats({
          totalOrders,
          pendingOrders,
          completedOrders,
          totalSpent,
          favoriteProducts: 8, // Placeholder - you might want to implement this
        });
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const greeting =
      hour < 12
        ? "Good morning"
        : hour < 18
          ? "Good afternoon"
          : "Good evening";
    return `${greeting}, ${user?.name}!`;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    color?: string;
  }> = ({ title, value, icon, trend, color = "text-blue-600" }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className={color}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {trend && <p className="text-xs text-gray-500 mt-1">{trend}</p>}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Debug Info - Remove in production */}
        <AuthDebug />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Customer Dashboard
          </h1>
          <p className="text-gray-600">{getWelcomeMessage()}</p>
          <div className="mt-2">
            <span className="text-sm text-gray-500">User Role: </span>
            <span className="text-sm font-medium text-blue-600 capitalize">
              {user?.role || "Customer"}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<ShoppingCart className="h-5 w-5" />}
            trend={`${stats.completedOrders} completed`}
            color="text-blue-600"
          />
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders}
            icon={<Clock className="h-5 w-5" />}
            trend="In progress"
            color="text-yellow-600"
          />
          <StatCard
            title="Total Spent"
            value={`$${stats.totalSpent.toFixed(2)}`}
            icon={<DollarSign className="h-5 w-5" />}
            trend="All time"
            color="text-green-600"
          />
          <StatCard
            title="Favorites"
            value={stats.favoriteProducts}
            icon={<Star className="h-5 w-5" />}
            trend="Saved items"
            color="text-purple-600"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Link to="/products">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 text-center">
                <Package className="h-8 w-8 mx-auto mb-3 text-blue-600 group-hover:text-blue-700" />
                <h3 className="font-semibold text-gray-900 mb-1">
                  Browse Products
                </h3>
                <p className="text-sm text-gray-600">Discover new items</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/cart">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 text-center">
                <ShoppingCart className="h-8 w-8 mx-auto mb-3 text-green-600 group-hover:text-green-700" />
                <h3 className="font-semibold text-gray-900 mb-1">My Cart</h3>
                <p className="text-sm text-gray-600">Review items to buy</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/orders">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 text-center">
                <Truck className="h-8 w-8 mx-auto mb-3 text-purple-600 group-hover:text-purple-700" />
                <h3 className="font-semibold text-gray-900 mb-1">
                  Track Orders
                </h3>
                <p className="text-sm text-gray-600">Check order status</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/purchase-history">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 mx-auto mb-3 text-orange-600 group-hover:text-orange-700" />
                <h3 className="font-semibold text-gray-900 mb-1">
                  Order History
                </h3>
                <p className="text-sm text-gray-600">View past purchases</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold">
              Recent Orders
            </CardTitle>
            <Link to="/orders">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <ShoppingCart className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Order #{order.order_number || order.id}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.items_count || 1} item
                          {(order.items_count || 1) !== 1 ? "s" : ""} •
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${parseFloat(order.total || "0").toFixed(2)}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}
                      >
                        {order.status?.charAt(0).toUpperCase() +
                          order.status?.slice(1) || "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No orders yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Start shopping to see your orders here
                </p>
                <Link to="/products">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Start Shopping
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerDashboard;
