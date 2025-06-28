import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardApi, productApi, Product } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Package,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
  Search,
  Filter,
  Warehouse,
  TrendingUp,
  BarChart3,
  ShoppingCart,
  PackageOpen,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface RequestOrder {
  id: number;
  product_id: number;
  quantity: number;
  admin_approval_status: string;
  warehouse_approval_status: string;
  created_at: string;
  updated_at: string;
  product: Product;
  requestedBy: {
    id: number;
    name: string;
    email: string;
  };
}

interface InventorySummary {
  total_products: number;
  low_stock_count: number;
  out_of_stock_count: number;
}

interface WarehouseDashboardData {
  pending_approvals: RequestOrder[];
  low_stock_products: Product[];
  recent_approved_requests: RequestOrder[];
  inventory_summary: InventorySummary;
}

const WarehouseDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState<WarehouseDashboardData>({
    pending_approvals: [],
    low_stock_products: [],
    recent_approved_requests: [],
    inventory_summary: {
      total_products: 0,
      low_stock_count: 0,
      out_of_stock_count: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<RequestOrder | null>(
    null,
  );

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await dashboardApi.warehouse();
      console.log("Warehouse Dashboard API Response:", response);

      if (response.status === 200 && response.data) {
        setDashboardData({
          pending_approvals: response.data.pending_approvals || [],
          low_stock_products: response.data.low_stock_products || [],
          recent_approved_requests:
            response.data.recent_approved_requests || [],
          inventory_summary: response.data.inventory_summary || {
            total_products: 0,
            low_stock_count: 0,
            out_of_stock_count: 0,
          },
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load dashboard data",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Failed to load dashboard data:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: number) => {
    try {
      // Assuming we have an API endpoint for warehouse approval
      const response = await fetch(
        `/api/request-orders/${requestId}/warehouse-approval`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify({
            warehouse_approval_status: "Approved",
          }),
        },
      );

      if (response.ok) {
        toast({
          title: "Request Approved",
          description: "Request has been approved successfully",
        });
        loadDashboardData();
      } else {
        toast({
          title: "Error",
          description: "Failed to approve request",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve request",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      // Assuming we have an API endpoint for warehouse approval
      const response = await fetch(
        `/api/request-orders/${requestId}/warehouse-approval`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify({
            warehouse_approval_status: "Rejected",
          }),
        },
      );

      if (response.ok) {
        toast({
          title: "Request Rejected",
          description: "Request has been rejected",
        });
        loadDashboardData();
      } else {
        toast({
          title: "Error",
          description: "Failed to reject request",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      {
        color: string;
        Icon: React.ComponentType<{ className?: string }>;
        label: string;
      }
    > = {
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        Icon: Clock,
        label: "Pending",
      },
      approved: {
        color: "bg-green-100 text-green-800",
        Icon: CheckCircle,
        label: "Approved",
      },
      rejected: {
        color: "bg-red-100 text-red-800",
        Icon: XCircle,
        label: "Rejected",
      },
    };

    const { color, Icon, label } = statusConfig[status.toLowerCase()] || {
      color: "bg-gray-100 text-gray-800",
      Icon: Clock,
      label: status,
    };

    return (
      <Badge className={color}>
        <Icon className="mr-1 h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getPriorityLevel = (product: Product) => {
    const stockLevel = product.quantity;
    const threshold = product.low_stock_threshold;

    if (stockLevel === 0) {
      return {
        level: "Critical",
        color: "bg-red-600",
        textColor: "text-white",
      };
    } else if (stockLevel < threshold * 0.5) {
      return { level: "High", color: "bg-orange-500", textColor: "text-white" };
    } else if (stockLevel < threshold) {
      return {
        level: "Medium",
        color: "bg-yellow-500",
        textColor: "text-white",
      };
    }
    return { level: "Low", color: "bg-blue-500", textColor: "text-white" };
  };

  const filteredRequests = dashboardData.pending_approvals.filter((request) => {
    const matchesSearch = request.product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Warehouse Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.name}! Manage inventory approvals and stock
            levels.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Approvals
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {dashboardData.pending_approvals.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Requires your action
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {dashboardData.inventory_summary.low_stock_count}
              </div>
              <p className="text-xs text-muted-foreground">
                Products need restocking
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Out of Stock
              </CardTitle>
              <PackageOpen className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {dashboardData.inventory_summary.out_of_stock_count}
              </div>
              <p className="text-xs text-muted-foreground">
                Urgent attention needed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Products
              </CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {dashboardData.inventory_summary.total_products}
              </div>
              <p className="text-xs text-muted-foreground">
                In inventory system
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Approvals */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Warehouse className="mr-2 h-5 w-5" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button onClick={loadDashboardData} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Requested Qty</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">
                          No pending approvals found
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <div className="font-semibold">
                              {request.product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {request.product.id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="mr-2">
                              {request.product.quantity}
                            </span>
                            {request.product.quantity <
                              request.product.low_stock_threshold && (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            Threshold: {request.product.low_stock_threshold}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-blue-600">
                            {request.quantity}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-semibold">
                              {request.requestedBy.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.requestedBy.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(request.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveRequest(request.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectRequest(request.id)}
                              className="border-red-600 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="mr-1 h-3 w-3" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Products */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-orange-600" />
              Low Stock Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Threshold</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData.low_stock_products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
                        <p className="text-gray-500">
                          All products are well stocked!
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    dashboardData.low_stock_products.map((product) => {
                      const priority = getPriorityLevel(product);
                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div>
                              <div className="font-semibold">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {product.id}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-red-600">
                              {product.quantity}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span>{product.low_stock_threshold}</span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`${priority.color} ${priority.textColor}`}
                            >
                              {priority.level}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {product.status ? (
                              <Badge className="bg-green-100 text-green-800">
                                Active
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800">
                                Inactive
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Approved Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
              Recent Approved Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Approved Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData.recent_approved_requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">
                          No recent approved requests
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    dashboardData.recent_approved_requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <div className="font-semibold">
                              {request.product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {request.product.id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-green-600">
                            {request.quantity}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(request.updated_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(request.warehouse_approval_status)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WarehouseDashboard;
