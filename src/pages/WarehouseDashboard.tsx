import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { requestOrderApi, productApi } from "@/lib/api";
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

interface ReorderRequest {
  id: number;
  product_id: number;
  quantity: number;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
  admin_approved: boolean;
  warehouse_approved: boolean | null;
  product: {
    id: number;
    name: string;
    description: string;
    current_stock: number;
    low_stock_threshold: number;
  };
  admin: {
    name: string;
  };
}

const WarehouseDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reorderRequests, setReorderRequests] = useState<ReorderRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    total_requests: 0,
    pending_requests: 0,
    approved_requests: 0,
    rejected_requests: 0,
  });

  useEffect(() => {
    loadReorderRequests();
  }, []);

  const loadReorderRequests = async () => {
    try {
      setIsLoading(true);
      const response = await requestOrderApi.index();

      if (response.status === 200) {
        const requests = response.data || [];
        setReorderRequests(requests);

        // Calculate stats
        const stats = {
          total_requests: requests.length,
          pending_requests: requests.filter(
            (r: ReorderRequest) =>
              r.admin_approved && r.warehouse_approved === null,
          ).length,
          approved_requests: requests.filter(
            (r: ReorderRequest) => r.warehouse_approved === true,
          ).length,
          rejected_requests: requests.filter(
            (r: ReorderRequest) => r.warehouse_approved === false,
          ).length,
        };
        setStats(stats);
      } else {
        toast({
          title: "Error",
          description: "Failed to load reorder requests",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to load reorder requests:", error);
      toast({
        title: "Error",
        description: "Failed to load reorder requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: number) => {
    try {
      const response = await requestOrderApi.warehouseApproval(requestId, true);

      if (response.status === 200) {
        toast({
          title: "Request Approved",
          description:
            "Reorder request has been approved and inventory will be updated",
        });
        loadReorderRequests(); // Reload data
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
      const response = await requestOrderApi.warehouseApproval(
        requestId,
        false,
      );

      if (response.status === 200) {
        toast({
          title: "Request Rejected",
          description: "Reorder request has been rejected",
        });
        loadReorderRequests(); // Reload data
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

  const filteredRequests = reorderRequests.filter((request) => {
    const matchesSearch = request.product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" &&
        request.admin_approved &&
        request.warehouse_approved === null) ||
      (statusFilter === "approved" && request.warehouse_approved === true) ||
      (statusFilter === "rejected" && request.warehouse_approved === false) ||
      (statusFilter === "admin_pending" && !request.admin_approved);

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (request: ReorderRequest) => {
    if (!request.admin_approved) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <Clock className="mr-1 h-3 w-3" />
          Admin Pending
        </Badge>
      );
    }

    if (request.warehouse_approved === null) {
      return (
        <Badge className="bg-blue-100 text-blue-800">
          <Clock className="mr-1 h-3 w-3" />
          Warehouse Pending
        </Badge>
      );
    }

    if (request.warehouse_approved === true) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="mr-1 h-3 w-3" />
          Approved
        </Badge>
      );
    }

    return (
      <Badge className="bg-red-100 text-red-800">
        <XCircle className="mr-1 h-3 w-3" />
        Rejected
      </Badge>
    );
  };

  const getPriorityLevel = (request: ReorderRequest) => {
    const stockLevel = request.product.current_stock;
    const threshold = request.product.low_stock_threshold;

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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Warehouse Manager Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.name}! Manage reorder requests and inventory.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Requests
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_requests}</div>
              <p className="text-xs text-muted-foreground">
                All reorder requests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Approval
              </CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.pending_requests}
              </div>
              <p className="text-xs text-muted-foreground">
                Requires your action
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.approved_requests}
              </div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                Processed successfully
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.rejected_requests}
              </div>
              <p className="text-xs text-muted-foreground">
                Not approved for reorder
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Warehouse className="mr-2 h-5 w-5" />
              Reorder Requests
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="admin_pending">Admin Pending</SelectItem>
                  <SelectItem value="pending">Warehouse Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={loadReorderRequests} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>

            {/* Requests Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Requested Qty</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">
                          No reorder requests found
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => {
                      const priority = getPriorityLevel(request);
                      return (
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
                                {request.product.current_stock}
                              </span>
                              {request.product.current_stock <
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
                            <Badge
                              className={`${priority.color} ${priority.textColor}`}
                            >
                              {priority.level}
                            </Badge>
                          </TableCell>
                          <TableCell>{request.admin?.name}</TableCell>
                          <TableCell>{getStatusBadge(request)}</TableCell>
                          <TableCell>
                            {new Date(request.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {request.admin_approved &&
                            request.warehouse_approved === null ? (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleApproveRequest(request.id)
                                  }
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleRejectRequest(request.id)
                                  }
                                  className="border-red-600 text-red-600 hover:bg-red-50"
                                >
                                  <XCircle className="mr-1 h-3 w-3" />
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">
                                No action required
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {request.notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-700 mb-1">
                  Notes:
                </h4>
                <p className="text-sm text-gray-600">{request.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WarehouseDashboard;
