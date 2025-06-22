import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingBag,
  Calendar,
  Search,
  Package,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Download,
  RefreshCw,
} from "lucide-react";

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: number;
  orderNumber: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  items: OrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
}

const PurchaseHistory: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);

  useEffect(() => {
    loadPurchaseHistory();
  }, []);

  const loadPurchaseHistory = async () => {
    try {
      // Mock purchase history data
      const mockOrders: Order[] = [
        {
          id: 1,
          orderNumber: "ORD-2024-001",
          date: "2024-01-22T14:30:00Z",
          status: "delivered",
          paymentStatus: "paid",
          paymentMethod: "Credit Card",
          subtotal: 1499.98,
          shipping: 0,
          tax: 120,
          total: 1619.98,
          items: [
            {
              id: 1,
              productId: 1,
              productName: "Premium Laptop",
              quantity: 1,
              unitPrice: 1299.99,
              totalPrice: 1299.99,
            },
            {
              id: 2,
              productId: 2,
              productName: "Wireless Headphones",
              quantity: 1,
              unitPrice: 199.99,
              totalPrice: 199.99,
            },
          ],
          shippingAddress: {
            street: "123 Main Street",
            city: "New York",
            state: "NY",
            zipCode: "10001",
            country: "USA",
          },
          trackingNumber: "TRK123456789",
          estimatedDelivery: "2024-01-25",
          notes: "Delivered to front door",
        },
        {
          id: 2,
          orderNumber: "ORD-2024-002",
          date: "2024-01-20T10:15:00Z",
          status: "shipped",
          paymentStatus: "paid",
          paymentMethod: "PayPal",
          subtotal: 629.98,
          shipping: 15.99,
          tax: 50.4,
          total: 696.37,
          items: [
            {
              id: 3,
              productId: 5,
              productName: "4K Monitor",
              quantity: 1,
              unitPrice: 549.99,
              totalPrice: 549.99,
            },
            {
              id: 4,
              productId: 4,
              productName: "Gaming Mouse",
              quantity: 1,
              unitPrice: 79.99,
              totalPrice: 79.99,
            },
          ],
          shippingAddress: {
            street: "456 Oak Avenue",
            city: "Los Angeles",
            state: "CA",
            zipCode: "90210",
            country: "USA",
          },
          trackingNumber: "TRK987654321",
          estimatedDelivery: "2024-01-24",
        },
        {
          id: 3,
          orderNumber: "ORD-2024-003",
          date: "2024-01-18T16:45:00Z",
          status: "processing",
          paymentStatus: "paid",
          paymentMethod: "Credit Card",
          subtotal: 129.99,
          shipping: 9.99,
          tax: 10.4,
          total: 150.38,
          items: [
            {
              id: 5,
              productId: 6,
              productName: "Mechanical Keyboard",
              quantity: 1,
              unitPrice: 129.99,
              totalPrice: 129.99,
            },
          ],
          shippingAddress: {
            street: "789 Pine Road",
            city: "Chicago",
            state: "IL",
            zipCode: "60601",
            country: "USA",
          },
          estimatedDelivery: "2024-01-26",
        },
        {
          id: 4,
          orderNumber: "ORD-2024-004",
          date: "2024-01-15T12:20:00Z",
          status: "cancelled",
          paymentStatus: "refunded",
          paymentMethod: "Credit Card",
          subtotal: 399.99,
          shipping: 0,
          tax: 32,
          total: 431.99,
          items: [
            {
              id: 6,
              productId: 3,
              productName: "Smart Watch",
              quantity: 1,
              unitPrice: 399.99,
              totalPrice: 399.99,
            },
          ],
          shippingAddress: {
            street: "321 Elm Street",
            city: "Miami",
            state: "FL",
            zipCode: "33101",
            country: "USA",
          },
          notes: "Cancelled by customer request",
        },
        {
          id: 5,
          orderNumber: "ORD-2024-005",
          date: "2024-01-12T09:30:00Z",
          status: "pending",
          paymentStatus: "pending",
          paymentMethod: "Cash on Delivery",
          subtotal: 89.99,
          shipping: 12.99,
          tax: 7.2,
          total: 110.18,
          items: [
            {
              id: 7,
              productId: 8,
              productName: "Bluetooth Speaker",
              quantity: 1,
              unitPrice: 89.99,
              totalPrice: 89.99,
            },
          ],
          shippingAddress: {
            street: "654 Maple Drive",
            city: "Seattle",
            state: "WA",
            zipCode: "98101",
            country: "USA",
          },
          estimatedDelivery: "2024-01-28",
        },
      ];

      setOrders(mockOrders);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load purchase history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "processing":
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      case "shipped":
        return <Truck className="h-4 w-4 text-purple-600" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary" as const;
      case "processing":
        return "default" as const;
      case "shipped":
        return "secondary" as const;
      case "delivered":
        return "default" as const;
      case "cancelled":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-600 text-white">Paid</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "refunded":
        return <Badge className="bg-blue-600 text-white">Refunded</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) =>
        item.productName.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    const matchesDate = (() => {
      if (dateFilter === "all") return true;
      const orderDate = new Date(order.date);
      const now = new Date();

      switch (dateFilter) {
        case "last7days":
          return orderDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case "last30days":
          return (
            orderDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          );
        case "last6months":
          return (
            orderDate >= new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000)
          );
        default:
          return true;
      }
    })();

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalSpent = orders
    .filter((order) => order.paymentStatus === "paid")
    .reduce((sum, order) => sum + order.total, 0);

  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(
    (order) => order.status === "delivered",
  ).length;

  if (!user) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="mx-auto h-16 w-16 text-metallic-light mb-4" />
        <h3 className="text-lg font-semibold text-metallic-primary mb-2">
          Please Sign In
        </h3>
        <p className="text-metallic-tertiary">
          You need to be signed in to view your purchase history.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-metallic-primary">
            Purchase History
          </h1>
          <p className="text-metallic-tertiary">
            View and track your orders and purchases
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-metallic-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-metallic-primary">
              {totalOrders}
            </div>
            <p className="text-xs text-metallic-tertiary">
              {deliveredOrders} delivered successfully
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <CreditCard className="h-4 w-4 text-metallic-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-metallic-primary">
              ${totalSpent.toFixed(2)}
            </div>
            <p className="text-xs text-metallic-tertiary">Lifetime purchases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Order Value
            </CardTitle>
            <Package className="h-4 w-4 text-metallic-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-metallic-primary">
              $
              {totalOrders > 0 ? (totalSpent / totalOrders).toFixed(2) : "0.00"}
            </div>
            <p className="text-xs text-metallic-tertiary">Per order</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Order History</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-metallic-tertiary" />
                <Input
                  placeholder="Search orders or products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-full sm:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="last7days">Last 7 Days</SelectItem>
                  <SelectItem value="last30days">Last 30 Days</SelectItem>
                  <SelectItem value="last6months">Last 6 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="mx-auto h-12 w-12 text-metallic-light mb-4" />
              <h3 className="text-lg font-semibold text-metallic-primary mb-2">
                No Orders Found
              </h3>
              <p className="text-metallic-tertiary">
                {searchQuery || statusFilter !== "all" || dateFilter !== "all"
                  ? "No orders match your current filters."
                  : "You haven't placed any orders yet."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.orderNumber}</div>
                          {order.trackingNumber && (
                            <div className="text-sm text-metallic-tertiary">
                              Tracking: {order.trackingNumber}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3 text-metallic-tertiary" />
                          {new Date(order.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {order.items.length} item
                          {order.items.length !== 1 ? "s" : ""}
                          <div className="text-metallic-tertiary">
                            {order.items[0].productName}
                            {order.items.length > 1 &&
                              ` +${order.items.length - 1} more`}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.status)}
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {order.status.toUpperCase()}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-metallic-primary">
                          ${order.total.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewOrder(order)}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Order Details - {selectedOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-metallic-tertiary">
                        Order Number:
                      </span>
                      <span className="font-medium">
                        {selectedOrder.orderNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-metallic-tertiary">Date:</span>
                      <span>
                        {new Date(selectedOrder.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-metallic-tertiary">Status:</span>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(selectedOrder.status)}
                        <Badge
                          variant={getStatusBadgeVariant(selectedOrder.status)}
                        >
                          {selectedOrder.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-metallic-tertiary">Payment:</span>
                      {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-metallic-tertiary">
                        Payment Method:
                      </span>
                      <span>{selectedOrder.paymentMethod}</span>
                    </div>
                    {selectedOrder.trackingNumber && (
                      <div className="flex justify-between">
                        <span className="text-metallic-tertiary">
                          Tracking:
                        </span>
                        <span className="font-mono text-sm">
                          {selectedOrder.trackingNumber}
                        </span>
                      </div>
                    )}
                    {selectedOrder.estimatedDelivery && (
                      <div className="flex justify-between">
                        <span className="text-metallic-tertiary">
                          Est. Delivery:
                        </span>
                        <span>
                          {new Date(
                            selectedOrder.estimatedDelivery,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1">
                      <div>{selectedOrder.shippingAddress.street}</div>
                      <div>
                        {selectedOrder.shippingAddress.city},{" "}
                        {selectedOrder.shippingAddress.state}{" "}
                        {selectedOrder.shippingAddress.zipCode}
                      </div>
                      <div>{selectedOrder.shippingAddress.country}</div>
                    </div>
                    {selectedOrder.notes && (
                      <div className="mt-4 p-3 bg-metallic-light/20 rounded">
                        <p className="text-sm">
                          <strong>Notes:</strong> {selectedOrder.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-metallic-light to-metallic-background rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-metallic-primary/30" />
                          </div>
                          <div>
                            <h4 className="font-medium">{item.productName}</h4>
                            <p className="text-sm text-metallic-tertiary">
                              Quantity: {item.quantity} × $
                              {item.unitPrice.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            ${item.totalPrice.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Total */}
                  <div className="mt-6 border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>
                        {selectedOrder.shipping === 0
                          ? "Free"
                          : `$${selectedOrder.shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>${selectedOrder.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span className="text-metallic-primary">
                        ${selectedOrder.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseHistory;
