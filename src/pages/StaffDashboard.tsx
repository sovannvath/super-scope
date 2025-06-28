import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardApi, orderApi, Order } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  Truck,
  CreditCard,
  ShoppingCart,
  User,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface StaffDashboardData {
  pending_orders: Order[];
  processed_orders: Order[];
  ready_for_delivery: Order[];
}

const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState<StaffDashboardData>({
    pending_orders: [],
    processed_orders: [],
    ready_for_delivery: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedPaymentStatus, setSelectedPaymentStatus] =
    useState<string>("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await dashboardApi.staff();
      console.log("Staff Dashboard API Response:", response);

      if (response.status === 200 && response.data) {
        // Map backend field names to frontend expectations
        const mapOrder = (order: any) => ({
          ...order,
          status: order.order_status || order.status,
          customer: order.user || order.customer,
          order_items: order.order_items || [],
          payment_method: order.payment_method_id
            ? `Payment Method ${order.payment_method_id}`
            : "Unknown",
        });

        setDashboardData({
          pending_orders: (response.data.pending_orders || []).map(mapOrder),
          processed_orders: (response.data.processed_orders || []).map(
            mapOrder,
          ),
          ready_for_delivery: (response.data.ready_for_delivery || []).map(
            mapOrder,
          ),
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

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await orderApi.updateStatus(orderId, newStatus);

      if (response.status === 200) {
        toast({
          title: "Order Updated",
          description: `Order status changed to ${newStatus}`,
        });
        loadDashboardData();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update order status",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const updatePaymentStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await orderApi.updatePaymentStatus(orderId, newStatus);

      if (response.status === 200) {
        toast({
          title: "Payment Status Updated",
          description: `Payment status changed to ${newStatus}`,
        });
        loadDashboardData();
        setSelectedPaymentStatus("");
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update payment status",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update payment status",
        variant: "destructive",
      });
    }
  };

  const handleApproveOrder = async (orderId: number) => {
    await updateOrderStatus(orderId, "processing");
  };

  const handleShipOrder = async (orderId: number) => {
    await updateOrderStatus(orderId, "shipped");
  };

  const handleCompleteOrder = async (orderId: number) => {
    await updateOrderStatus(orderId, "completed");
  };

  const handleRejectOrder = async (orderId: number) => {
    await updateOrderStatus(orderId, "cancelled");
  };

  const handleUpdatePaymentStatus = async (orderId: number) => {
    if (!selectedPaymentStatus) {
      toast({
        title: "Error",
        description: "Please select a payment status",
        variant: "destructive",
      });
      return;
    }
    await updatePaymentStatus(orderId, selectedPaymentStatus);
  };

  // Combine all orders for filtering
  const allOrders = [
    ...dashboardData.pending_orders,
    ...dashboardData.processed_orders,
    ...dashboardData.ready_for_delivery,
  ];

  const filteredOrders = allOrders.filter((order) => {
    const matchesSearch =
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm) ||
      order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status?.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
      processing: {
        color: "bg-blue-100 text-blue-800",
        Icon: RefreshCw,
        label: "Processing",
      },
      shipped: {
        color: "bg-purple-100 text-purple-800",
        Icon: Truck,
        label: "Shipped",
      },
      completed: {
        color: "bg-green-100 text-green-800",
        Icon: CheckCircle,
        label: "Completed",
      },
      cancelled: {
        color: "bg-red-100 text-red-800",
        Icon: XCircle,
        label: "Cancelled",
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

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      pending: { color: "bg-red-100 text-red-800", label: "Pending" },
      paid: { color: "bg-green-100 text-green-800", label: "Paid" },
      failed: { color: "bg-red-100 text-red-800", label: "Failed" },
      refunded: { color: "bg-yellow-100 text-yellow-800", label: "Refunded" },
    };

    const { color, label } = statusConfig[paymentStatus.toLowerCase()] || {
      color: "bg-gray-100 text-gray-800",
      label: paymentStatus,
    };

    return (
      <Badge className={color}>
        <CreditCard className="mr-1 h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const canApprove = (order: Order) =>
    order.status?.toLowerCase() === "pending";
  const canShip = (order: Order) =>
    order.status?.toLowerCase() === "processing";
  const canComplete = (order: Order) =>
    order.status?.toLowerCase() === "shipped";

  const stats = {
    pending_orders: dashboardData.pending_orders.length,
    processed_orders: dashboardData.processed_orders.length,
    ready_for_delivery: dashboardData.ready_for_delivery.length,
    total_orders: allOrders.length,
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Staff Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.name || "Staff"}! Process customer orders and
            manage deliveries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Orders
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pending_orders}
              </div>
              <p className="text-xs text-muted-foreground">
                Need staff approval
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Processed Orders
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.processed_orders}
              </div>
              <p className="text-xs text-muted-foreground">Processed by you</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ready for Delivery
              </CardTitle>
              <Truck className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.ready_for_delivery}
              </div>
              <p className="text-xs text-muted-foreground">Ready to ship</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.total_orders}
              </div>
              <p className="text-xs text-muted-foreground">All orders</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Customer Orders - Approval & Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by customer name, email, or order ID..."
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
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={loadDashboardData} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">No orders found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div className="font-semibold">#{order.id}</div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-semibold">
                              {order.customer?.name || "N/A"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.customer?.email || "N/A"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {order.order_items?.length || 0} item(s)
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold">
                            ${parseFloat(order.total_amount || "0").toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.payment_method || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getPaymentStatusBadge(
                            order.payment_status || "pending",
                          )}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(order.status || "pending")}
                        </TableCell>
                        <TableCell>
                          {new Date(order.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  <Package className="h-3 w-3" />
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>
                                    Order Details #{order.id}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold">
                                        Customer
                                      </h4>
                                      <p>{order.customer?.name || "N/A"}</p>
                                      <p className="text-sm text-gray-500">
                                        {order.customer?.email || "N/A"}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold">
                                        Shipping Address
                                      </h4>
                                      <p className="text-sm">
                                        {order.shipping_address || "N/A"}
                                      </p>
                                    </div>
                                  </div>
                                  {order.order_items &&
                                    order.order_items.length > 0 && (
                                      <div>
                                        <h4 className="font-semibold mb-2">
                                          Order Items
                                        </h4>
                                        <div className="space-y-2">
                                          {order.order_items.map((item) => (
                                            <div
                                              key={item.id}
                                              className="flex justify-between items-center p-2 bg-gray-50 rounded"
                                            >
                                              <div>
                                                <div className="font-semibold">
                                                  {item.product?.name || "N/A"}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                  Qty: {item.quantity} × $
                                                  {item.price}
                                                </div>
                                              </div>
                                              <div className="font-semibold">
                                                $
                                                {(
                                                  item.quantity * item.price
                                                ).toFixed(2)}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  <div className="border-t pt-4">
                                    <div className="flex justify-between font-semibold text-lg">
                                      <span>Total</span>
                                      <span>
                                        $
                                        {parseFloat(
                                          order.total_amount || "0",
                                        ).toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="border-t pt-4">
                                    <h4 className="font-semibold mb-2">
                                      Update Payment Status
                                    </h4>
                                    <div className="flex gap-4">
                                      <Select
                                        value={selectedPaymentStatus}
                                        onValueChange={setSelectedPaymentStatus}
                                      >
                                        <SelectTrigger className="w-48">
                                          <SelectValue placeholder="Select payment status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="pending">
                                            Pending
                                          </SelectItem>
                                          <SelectItem value="paid">
                                            Paid
                                          </SelectItem>
                                          <SelectItem value="failed">
                                            Failed
                                          </SelectItem>
                                          <SelectItem value="refunded">
                                            Refunded
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <Button
                                        onClick={() =>
                                          handleUpdatePaymentStatus(order.id)
                                        }
                                        className="bg-blue-600 hover:bg-blue-700"
                                      >
                                        Update Payment Status
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="flex gap-2 pt-4">
                                    {canApprove(order) && (
                                      <Button
                                        onClick={() =>
                                          handleApproveOrder(order.id)
                                        }
                                        className="bg-blue-600 hover:bg-blue-700"
                                      >
                                        <CheckCircle className="mr-1 h-3 w-3" />
                                        Approve Order
                                      </Button>
                                    )}
                                    {canShip(order) && (
                                      <Button
                                        onClick={() =>
                                          handleShipOrder(order.id)
                                        }
                                        className="bg-purple-600 hover:bg-purple-700"
                                      >
                                        <Truck className="mr-1 h-3 w-3" />
                                        Ship Order
                                      </Button>
                                    )}
                                    {canComplete(order) && (
                                      <Button
                                        onClick={() =>
                                          handleCompleteOrder(order.id)
                                        }
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <CheckCircle className="mr-1 h-3 w-3" />
                                        Complete Order
                                      </Button>
                                    )}
                                    {order.status?.toLowerCase() ===
                                      "pending" && (
                                      <Button
                                        variant="outline"
                                        onClick={() =>
                                          handleRejectOrder(order.id)
                                        }
                                        className="border-red-600 text-red-600 hover:bg-red-50"
                                      >
                                        <XCircle className="mr-1 h-3 w-3" />
                                        Cancel Order
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            {canApprove(order) && (
                              <Button
                                size="sm"
                                onClick={() => handleApproveOrder(order.id)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Approve
                              </Button>
                            )}
                            {canShip(order) && (
                              <Button
                                size="sm"
                                onClick={() => handleShipOrder(order.id)}
                                className="bg-purple-600 hover:bg-purple-700"
                              >
                                <Truck className="mr-1 h-3 w-3" />
                                Ship
                              </Button>
                            )}
                            {canComplete(order) && (
                              <Button
                                size="sm"
                                onClick={() => handleCompleteOrder(order.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Complete
                              </Button>
                            )}
                            {order.status?.toLowerCase() === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectOrder(order.id)}
                                className="border-red-600 text-red-600 hover:bg-red-50"
                              >
                                <XCircle className="mr-1 h-3 w-3" />
                                Cancel
                              </Button>
                            )}
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
      </div>
    </div>
  );
};

export default StaffDashboard;
