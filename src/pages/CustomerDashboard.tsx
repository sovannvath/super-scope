import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardApi, orderApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingCart,
  Package,
  Clock,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Calendar,
  Eye,
} from "lucide-react";

interface CustomerDashboardData {
  total_orders?: number;
  pending_orders?: number;
  completed_orders?: number;
  total_spent?: number;
  recent_orders?: Array<{
    id: number;
    status: string;
    total: number;
    created_at: string;
    items_count?: number;
  }>;
  favorite_categories?: Array<{
    name: string;
    count: number;
  }>;
}

const CustomerDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] =
    useState<CustomerDashboardData | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadDashboard();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  const loadDashboard = async () => {
    // Check if user is authenticated before making API call
    if (!isAuthenticated || !user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log("🔄 Loading customer dashboard data...");

      const response = await dashboardApi.customer();
      console.log("📊 Customer dashboard response:", response);

      if (response.status === 200 && response.data) {
        setDashboardData(response.data);
        console.log("✅ Customer dashboard data loaded successfully");
      } else {
        throw new Error(`Dashboard API returned status ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Customer dashboard error:", error);
      setDashboardData(null);

      toast({
        title: "Dashboard Error",
        description:
          "Failed to load dashboard data. Please try logging in again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "Pending", variant: "destructive" as const },
      processing: { label: "Processing", variant: "secondary" as const },
      shipped: { label: "Shipped", variant: "default" as const },
      delivered: { label: "Delivered", variant: "outline" as const },
      cancelled: { label: "Cancelled", variant: "destructive" as const },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      label: status,
      variant: "default" as const,
    };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="mx-auto h-16 w-16 text-metallic-light mb-4" />
        <h3 className="text-lg font-semibold text-metallic-primary mb-2">
          Please Log In
        </h3>
        <p className="text-metallic-tertiary mb-4">
          You need to be logged in to access your customer dashboard.
        </p>
        <Button onClick={() => navigate("/login")}>Go to Login</Button>
      </div>
    );
  }

  if (user.role !== "customer") {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="mx-auto h-16 w-16 text-metallic-light mb-4" />
        <h3 className="text-lg font-semibold text-metallic-primary mb-2">
          Customer Access Only
        </h3>
        <p className="text-metallic-tertiary mb-4">
          This dashboard is only available for customers.
        </p>
        <Button onClick={() => navigate("/")}>Go to Homepage</Button>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-metallic-primary">
            Welcome back, {user.name}!
          </h1>
          <p className="text-metallic-tertiary">
            Here's what's happening with your orders
          </p>
        </div>
        <Button
          onClick={loadDashboard}
          variant="outline"
          className="border-metallic-light"
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.total_orders || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Orders
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {dashboardData?.pending_orders || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Orders
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {dashboardData?.completed_orders || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${dashboardData?.total_spent?.toLocaleString() || "0"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.recent_orders &&
            dashboardData.recent_orders.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recent_orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Package className="h-8 w-8 text-metallic-secondary" />
                      <div>
                        <div className="font-medium">Order #{order.id}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                        {order.items_count && (
                          <div className="text-xs text-muted-foreground">
                            {order.items_count} items
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      {getStatusBadge(order.status)}
                      <div className="font-medium">${order.total}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No orders yet</p>
                <p className="text-sm text-muted-foreground">
                  Start shopping to see your orders here
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Favorite Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Shopping Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.favorite_categories &&
            dashboardData.favorite_categories.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-medium">Favorite Categories</h4>
                {dashboardData.favorite_categories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{category.name}</span>
                    <Badge variant="outline">{category.count} orders</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No insights yet</p>
                <p className="text-sm text-muted-foreground">
                  Shop more to see your preferences
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button
              className="h-auto p-4 flex-col space-y-2"
              variant="outline"
              onClick={() => (window.location.href = "/")}
            >
              <ShoppingCart className="h-6 w-6" />
              <span>Continue Shopping</span>
            </Button>
            <Button
              className="h-auto p-4 flex-col space-y-2"
              variant="outline"
              onClick={() => (window.location.href = "/orders")}
            >
              <Eye className="h-6 w-6" />
              <span>View All Orders</span>
            </Button>
            <Button
              className="h-auto p-4 flex-col space-y-2"
              variant="outline"
              onClick={() => (window.location.href = "/cart")}
            >
              <Package className="h-6 w-6" />
              <span>View Cart</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerDashboard;
