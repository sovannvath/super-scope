import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardApi, productApi, requestOrderApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Eye,
  Plus,
  Settings,
  BarChart3,
  Bell,
  Filter,
  Calendar,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  total_products: number;
  total_customers: number;
  low_stock_products: any[];
  recent_orders: any[];
  pending_reorders: any[];
}

interface ReorderRequest {
  id: number;
  product_id: number;
  quantity: number;
  status: string;
  created_at: string;
  product: {
    name: string;
  };
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reorderRequests, setReorderRequests] = useState<ReorderRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [totalProducts, setTotalProducts] = useState<number>(0);
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Load dashboard stats
      const statsResponse = await dashboardApi.admin();
      if (statsResponse.status === 200 && statsResponse.data) {
        setStats(statsResponse.data);
      } else {
        console.warn("Dashboard stats API failed:", statsResponse);
        setStats(null);
      }

      // Fallback: Fetch total products count directly from products API
      await loadTotalProducts();

      // Load reorder requests
      const reorderResponse = await requestOrderApi.index();
      if (reorderResponse.status === 200 && reorderResponse.data) {
        // Ensure it's an array
        const reorderData = Array.isArray(reorderResponse.data)
          ? reorderResponse.data
          : reorderResponse.data?.data || [];
        setReorderRequests(reorderData);
      } else {
        console.warn("Reorder requests API failed:", reorderResponse);
        setReorderRequests([]);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);

      // Reset all state to safe defaults
      setStats(null);
      setReorderRequests([]);
      setHasError(true);

      toast({
        title: "Error",
        description:
          "Failed to load dashboard data. Some features may not work.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveReorder = async (requestId: number) => {
    try {
      const response = await requestOrderApi.adminApproval(requestId, true);
      if (response.status === 200) {
        toast({
          title: "Request Approved",
          description: "Reorder request has been approved",
        });
        loadDashboardData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve request",
        variant: "destructive",
      });
    }
  };

  const handleRejectReorder = async (requestId: number) => {
    try {
      const response = await requestOrderApi.adminApproval(requestId, false);
      if (response.status === 200) {
        toast({
          title: "Request Rejected",
          description: "Reorder request has been rejected",
        });
        loadDashboardData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (hasError && !stats && !Array.isArray(reorderRequests)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Failed to Load Dashboard
          </h2>
          <p className="text-gray-600 mb-6">
            There was an error connecting to the server. Please try again.
          </p>
          <Button
            onClick={() => {
              setHasError(false);
              loadDashboardData();
            }}
            className="mr-4"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link to="/admin/products">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Package className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold">Manage Products</h3>
                <p className="text-sm text-gray-600">
                  Add, edit, delete products
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/reorder-requests">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <RefreshCw className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold">Reorder Requests</h3>
                <p className="text-sm text-gray-600">Manage reorder requests</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/purchase-history">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-semibold">Sales Reports</h3>
                <p className="text-sm text-gray-600">View sales analytics</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats?.total_revenue?.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +20.1% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.total_orders?.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.total_products?.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Customers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.total_customers?.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +8% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Reorder Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <RefreshCw className="mr-2 h-5 w-5 text-blue-600" />
                Reorder Requests
                {reorderRequests.length > 0 && (
                  <Badge className="ml-2 bg-blue-100 text-blue-800">
                    {reorderRequests.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {!Array.isArray(reorderRequests) ||
              reorderRequests.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No reorder requests
                </p>
              ) : (
                <div className="space-y-4">
                  {reorderRequests.map((request) => (
                    <div key={request.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">
                          {request.product?.name}
                        </h4>
                        <Badge
                          className={
                            request.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : request.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {request.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Quantity: {request.quantity} | Date:{" "}
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                      {request.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveReorder(request.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectReorder(request.id)}
                            className="border-red-600 text-red-600 hover:bg-red-50"
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Recent Orders
              </span>
              <Button variant="outline" size="sm" asChild>
                <Link to="/purchase-history">
                  <Eye className="mr-1 h-3 w-3" />
                  View All
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recent_orders &&
            Array.isArray(stats.recent_orders) &&
            stats.recent_orders.length > 0 ? (
              <div className="space-y-3">
                {stats.recent_orders
                  .slice(0, 5)
                  .map((order: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <h4 className="font-semibold">Order #{order.id}</h4>
                        <p className="text-sm text-gray-600">
                          Customer: {order.customer_name} | $
                          {order.total_amount}
                        </p>
                      </div>
                      <Badge
                        className={
                          order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No recent orders</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
