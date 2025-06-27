import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardApi, productApi, requestOrderApi } from "@/lib/api";
import { ordersApi } from "@/api/orders"; // Correct import from PurchaseHistory.tsx
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Package, Users, ShoppingCart, AlertTriangle, RefreshCw, TrendingUp, Eye } from "lucide-react";

interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  total_products: number;
  total_customers: number;
  low_stock_products: any[];
  recent_orders: any[];
  pending_reorders: any[];
}

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [reorderRequests, setReorderRequests] = useState<ReorderRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [totalProducts, setTotalProducts] = useState<number>(0);

  const loadTotalProducts = async () => {
    try {
      console.log("🔄 Fetching total products count...");
      const response = await productApi.index();
      if (response.status === 200 && response.data) {
        let productsArray = Array.isArray(response.data)
          ? response.data
          : response.data.products || response.data.data || [];
        const count = productsArray.length;
        setTotalProducts(count);
        console.log(`✅ Total products: ${count}`);
      } else {
        console.warn("Failed to fetch products for count:", response);
        setTotalProducts(0);
      }
    } catch (error) {
      console.error("❌ Error fetching total products:", error);
      setTotalProducts(0);
    }
  };

  const loadOrders = async () => {
    try {
      console.log("🛒 AdminDashboard: ordersApi object:", ordersApi); // Debug log
      const response = await ordersApi.getAll(); // Use ordersApi.getAll()
      console.log("🛒 AdminDashboard: Orders API response:", JSON.stringify(response, null, 2));
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
    }
  };

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const statsResponse = await dashboardApi.admin();
      console.log("📊 DashboardAPI: Raw response:", JSON.stringify(statsResponse, null, 2));
      if (statsResponse.status === 200 && statsResponse.data) {
        setStats(statsResponse.data);
      } else if (statsResponse.status === 401) {
        console.warn("Dashboard API: Authentication required, using fallback data");
        const fallbackStats = {
          total_revenue: 0,
          total_orders: orders.length,
          total_products: totalProducts || 0,
          total_customers: 0,
          recent_orders: [],
          pending_reorders: [],
        };
        setStats(fallbackStats);
      } else {
        console.warn("Dashboard stats API failed:", statsResponse);
        setStats(null);
      }

      await loadTotalProducts();
      await loadOrders();
      const reorderResponse = await requestOrderApi.index();
      if (reorderResponse.status === 200 && reorderResponse.data) {
        const reorderData = Array.isArray(reorderResponse.data)
          ? reorderResponse.data
          : reorderResponse.data?.data || [];
        setReorderRequests(reorderData);
      } else if (reorderResponse.status === 401) {
        console.warn("Reorder requests API: Authentication required, using empty array");
        setReorderRequests([]);
      } else {
        console.warn("Reorder requests API failed:", reorderResponse);
        setReorderRequests([]);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      const fallbackStats = {
        total_revenue: 0,
        total_orders: orders.length,
        total_products: totalProducts || 0,
        total_customers: 0,
        recent_orders: [],
        pending_reorders: [],
      };
      setStats(fallbackStats);
      setReorderRequests([]);
      setHasError(true);
      toast({
        title: "Limited Mode",
        description: "Dashboard running with limited data due to connectivity issues.",
        variant: "default",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

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

  if (hasError && !stats && !Array.isArray(reorderRequests) && orders.length === 0) {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
          {stats?.total_revenue === 0 && orders.length === 0 && (
            <div className="mt-2 text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-md inline-flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Limited Mode: Some features may be unavailable
            </div>
          )}
        </div>

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
                <Eye className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-semibold">Purchase History</h3>
                <p className="text-sm text-gray-600">View all orders</p>
              </CardContent>
            </Card>
          </Link>
        </div>

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
                {stats?.total_orders?.toLocaleString() || orders.length.toLocaleString()}
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
                {stats?.total_products?.toLocaleString() ||
                  totalProducts.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                {totalProducts > 0
                  ? `${totalProducts} products available`
                  : "+5% from last month"}
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
              {!Array.isArray(reorderRequests) || reorderRequests.length === 0 ? (
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
              {orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <h4 className="font-semibold">Order #{order.order_number}</h4>
                        <p className="text-sm text-gray-600">
                          Customer: {order.user.name} ({order.user.email}) | $
                          {order.total_amount}
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
                <p className="text-center text-gray-500 py-8">No recent orders</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;