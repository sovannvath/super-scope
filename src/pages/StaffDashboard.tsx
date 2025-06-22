import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { orderApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Package,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Truck,
  CreditCard,
  Users,
  ShoppingCart,
  AlertCircle,
  Eye,
  Edit,
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

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product: {
    name: string;
    description: string;
  };
}

interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method: string;
  shipping_address: string;
  order_items: OrderItem[];
  created_at: string;
  updated_at: string;
  customer: {
    name: string;
    email: string;
  };
}

const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [stats, setStats] = useState({
    total_orders: 0,
    pending_orders: 0,
    processing_orders: 0,
    shipped_orders: 0,
    completed_orders: 0,
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const response = await orderApi.adminIndex();

      if (response.status === 200) {
        const ordersList = response.data || [];
        setOrders(ordersList);

        // Calculate stats
        const stats = {
          total_orders: ordersList.length,
          pending_orders: ordersList.filter(
            (o: Order) => o.status === "pending",
          ).length,
          processing_orders: ordersList.filter(
            (o: Order) => o.status === "processing",
          ).length,
          shipped_orders: ordersList.filter(
            (o: Order) => o.status === "shipped",
          ).length,
          completed_orders: ordersList.filter(
            (o: Order) => o.status === "completed",
          ).length,
        };
        setStats(stats);
      } else {
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders",
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
        loadOrders(); // Reload data
      } else {
        toast({
          title: "Error",
          description: "Failed to update order status",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
        label: "Pending",
      },
      processing: {
        color: "bg-blue-100 text-blue-800",
        icon: RefreshCw,
        label: "Processing",
      },
      shipped: {
        color: "bg-purple-100 text-purple-800",
        icon: Truck,
        label: "Shipped",
      },
      completed: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        label: "Completed",
      },
      cancelled: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        label: "Cancelled",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: "bg-gray-100 text-gray-800",
      icon: AlertCircle,
      label: status,
    };

    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const isPaid = paymentStatus === "paid" || paymentStatus === "completed";
    return (
      <Badge
        className={
          isPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }
      >
        <CreditCard className="mr-1 h-3 w-3" />
        {isPaid ? "Paid" : "Pending"}
      </Badge>
    );
  };

  const canApprove = (order: Order) =>
    order.status === "pending" && order.payment_status === "paid";
  const canShip = (order: Order) => order.status === "processing";
  const canComplete = (order: Order) => order.status === "shipped";

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
            Staff Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.name}! Process customer orders and manage
            deliveries.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_orders}</div>
              <p className="text-xs text-muted-foreground">All orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pending_orders}
              </div>
              <p className="text-xs text-muted-foreground">Need approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <RefreshCw className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.processing_orders}
              </div>
              <p className="text-xs text-muted-foreground">
                Ready for shipping
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shipped</CardTitle>
              <Truck className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.shipped_orders}
              </div>
              <p className="text-xs text-muted-foreground">In delivery</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.completed_orders}
              </div>
              <p className="text-xs text-muted-foreground">Delivered</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Customer Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters and Search */}
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
              <Button onClick={loadOrders} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>

            {/* Orders Table */}
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
                              {order.customer.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.customer.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {order.order_items.length} item(s)
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold">
                            ${order.total_amount.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.payment_method}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getPaymentStatusBadge(order.payment_status)}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
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
                                  <Eye className="h-3 w-3" />
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
                                      <p>{order.customer.name}</p>
                                      <p className="text-sm text-gray-500">
                                        {order.customer.email}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold">
                                        Shipping Address
                                      </h4>
                                      <p className="text-sm">
                                        {order.shipping_address}
                                      </p>
                                    </div>
                                  </div>
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
                                              {item.product.name}
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
                                  <div className="border-t pt-4">
                                    <div className="flex justify-between font-semibold text-lg">
                                      <span>Total</span>
                                      <span>
                                        ${order.total_amount.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            {canApprove(order) && (
                              <Button
                                size="sm"
                                onClick={() => handleApproveOrder(order.id)}
                                className="bg-green-600 hover:bg-green-700"
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
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Complete
                              </Button>
                            )}

                            {order.status === "pending" && (
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
