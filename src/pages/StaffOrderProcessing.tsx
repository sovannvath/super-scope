import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  Package,
  Clock,
  CheckCircle,
  Truck,
  User,
  MapPin,
  Calendar,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Phone,
  Mail,
  PackageCheck,
  ArrowRight,
} from "lucide-react";

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  packed: boolean;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

interface Order {
  id: number;
  orderNumber: string;
  customer: Customer;
  date: string;
  status: "pending" | "processing" | "ready" | "shipped" | "delivered";
  priority: "low" | "normal" | "high" | "urgent";
  paymentStatus: "pending" | "paid" | "failed";
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
  staffNotes?: string;
  customerNotes?: string;
  processedBy?: string;
  processedAt?: string;
  shippedBy?: string;
  shippedAt?: string;
}

const StaffOrderProcessing: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isProcessingDialogOpen, setIsProcessingDialogOpen] = useState(false);
  const [isShippingDialogOpen, setIsShippingDialogOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [staffNotes, setStaffNotes] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await orderApi.list();
      if (response.status === 200) {
        let ordersArray: any[] = [];
        if (Array.isArray(response.data)) {
          ordersArray = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          ordersArray = response.data.data;
        }

        // Format order data to match interface
        const formattedOrders: Order[] = ordersArray.map((order: any) => ({
          id: order.id,
          orderNumber: order.order_number || `ORD-${order.id}`,
          customer: {
            id: order.user?.id || 0,
            name: order.user?.name || 'Unknown Customer',
            email: order.user?.email || '',
            phone: order.user?.phone,
          },
          date: order.created_at,
          status: order.order_status || 'pending',
          priority: order.priority || 'normal',
          paymentStatus: order.payment_status || 'pending',
          paymentMethod: order.payment_method?.name || 'Unknown',
          subtotal: parseFloat(order.subtotal || '0'),
          shipping: parseFloat(order.shipping || '0'),
          tax: parseFloat(order.tax || '0'),
          total: parseFloat(order.total || '0'),
          items: (order.items || []).map((item: any) => ({
            id: item.id,
            productId: item.product_id,
            productName: item.product?.name || 'Unknown Product',
            quantity: item.quantity,
            unitPrice: parseFloat(item.price || '0'),
            totalPrice: parseFloat(item.price || '0') * item.quantity,
            packed: false, // Default to unpacked
          })),
          shippingAddress: order.shipping_address || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
          },
          trackingNumber: order.tracking_number,
          estimatedDelivery: order.estimated_delivery,
          staffNotes: order.staff_notes,
          customerNotes: order.customer_notes,
          processedBy: order.processed_by,
          processedAt: order.processed_at,
          shippedBy: order.shipped_by,
          shippedAt: order.shipped_at,
        }));

        setOrders(formattedOrders);
      } else {
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive",
        });
      }
      // Mock orders data
      /* const mockOrders: Order[] = [
        {
          id: 1,
          orderNumber: "ORD-2024-001",
          customer: {
            id: 1,
            name: "John Smith",
            email: "john.smith@email.com",
            phone: "+1 (555) 123-4567",
          },
          date: "2024-01-22T14:30:00Z",
          status: "pending",
          priority: "urgent",
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
              packed: false,
            },
            {
              id: 2,
              productId: 2,
              productName: "Wireless Headphones",
              quantity: 1,
              unitPrice: 199.99,
              totalPrice: 199.99,
              packed: false,
            },
          ],
          shippingAddress: {
            street: "123 Main Street",
            city: "New York",
            state: "NY",
            zipCode: "10001",
            country: "USA",
          },
          customerNotes: "Please call before delivery",
        },
        {
          id: 2,
          orderNumber: "ORD-2024-002",
          customer: {
            id: 2,
            name: "Sarah Johnson",
            email: "sarah.j@email.com",
            phone: "+1 (555) 987-6543",
          },
          date: "2024-01-22T10:15:00Z",
          status: "processing",
          priority: "high",
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
              packed: true,
            },
            {
              id: 4,
              productId: 4,
              productName: "Gaming Mouse",
              quantity: 1,
              unitPrice: 79.99,
              totalPrice: 79.99,
              packed: true,
            },
          ],
          shippingAddress: {
            street: "456 Oak Avenue",
            city: "Los Angeles",
            state: "CA",
            zipCode: "90210",
            country: "USA",
          },
          processedBy: "Staff User",
          processedAt: "2024-01-22T11:00:00Z",
          staffNotes: "All items verified and packed",
        },
        {
          id: 3,
          orderNumber: "ORD-2024-003",
          customer: {
            id: 3,
            name: "Mike Davis",
            email: "mike.davis@email.com",
          },
          date: "2024-01-21T16:45:00Z",
          status: "ready",
          priority: "normal",
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
              packed: true,
            },
          ],
          shippingAddress: {
            street: "789 Pine Road",
            city: "Chicago",
            state: "IL",
            zipCode: "60601",
            country: "USA",
          },
          processedBy: "Staff User",
          processedAt: "2024-01-21T18:20:00Z",
          staffNotes: "Ready for pickup",
        },
        {
          id: 4,
          orderNumber: "ORD-2024-004",
          customer: {
            id: 4,
            name: "Lisa Wilson",
            email: "lisa.w@email.com",
            phone: "+1 (555) 456-7890",
          },
          date: "2024-01-21T12:20:00Z",
          status: "shipped",
          priority: "normal",
          paymentStatus: "paid",
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
              packed: true,
            },
          ],
          shippingAddress: {
            street: "321 Elm Street",
            city: "Miami",
            state: "FL",
            zipCode: "33101",
            country: "USA",
          },
          trackingNumber: "TRK123456789",
          estimatedDelivery: "2024-01-25",
          processedBy: "Staff User",
          processedAt: "2024-01-21T14:30:00Z",
          shippedBy: "Staff User",
          shippedAt: "2024-01-21T16:45:00Z",
          staffNotes: "Expedited shipping requested",
        },
        {
          id: 5,
          orderNumber: "ORD-2024-005",
          customer: {
            id: 5,
            name: "Robert Chen",
            email: "robert.chen@email.com",
          },
          date: "2024-01-20T09:30:00Z",
          status: "pending",
          priority: "low",
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
              packed: false,
            },
          ],
          shippingAddress: {
            street: "654 Maple Drive",
            city: "Seattle",
            state: "WA",
            zipCode: "98101",
            country: "USA",
          },
        },
      ];

      setOrders(mockOrders);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge className="bg-red-600 text-white">URGENT</Badge>;
      case "high":
        return <Badge className="bg-orange-600 text-white">HIGH</Badge>;
      case "normal":
        return <Badge variant="secondary">NORMAL</Badge>;
      default:
        return <Badge variant="outline">LOW</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "processing":
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      case "ready":
        return <PackageCheck className="h-4 w-4 text-purple-600" />;
      case "shipped":
        return <Truck className="h-4 w-4 text-green-600" />;
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
      case "ready":
        return "secondary" as const;
      case "shipped":
        return "default" as const;
      default:
        return "outline" as const;
    }
  };

  const handleStartProcessing = (order: Order) => {
    setSelectedOrder(order);
    setStaffNotes("");
    setIsProcessingDialogOpen(true);
  };

  const handleMarkReady = (order: Order) => {
    setSelectedOrder(order);
    setStaffNotes("");
    setIsShippingDialogOpen(false);
    submitStatusUpdate("ready");
  };

  const handleShipOrder = (order: Order) => {
    setSelectedOrder(order);
    setTrackingNumber("");
    setEstimatedDelivery("");
    setStaffNotes("");
    setIsShippingDialogOpen(true);
  };

  const submitStatusUpdate = async (newStatus: string) => {
    if (!selectedOrder) return;

    setIsSubmitting(true);
    try {
      // Update order status via API
      const statusData = { order_status: newStatus };
      const response = await orderApi.updateStatus(selectedOrder.id, statusData);

      if (response.status === 200) {
        // If shipping, also update tracking info (you might need a separate endpoint)
        if (newStatus === "shipped" && trackingNumber) {
          // Add tracking number and delivery date logic here if your API supports it
          // This might require a separate API call or additional fields in the status update
        }

        toast({
          title: "Order Updated",
          description: `Order ${selectedOrder.orderNumber} has been marked as ${newStatus}.`,
        });

        setIsProcessingDialogOpen(false);
        setIsShippingDialogOpen(false);
        setSelectedOrder(null);
        loadOrders(); // Reload orders from server
      } else {
        toast({
          title: "Error",
          description: response.data?.message || "Failed to update order status",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleItemPacked = (orderId: number, itemId: number) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              items: order.items.map((item) =>
                item.id === itemId ? { ...item, packed: !item.packed } : item,
              ),
            }
          : order,
      ),
    );
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || order.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const processingCount = orders.filter(
    (o) => o.status === "processing",
  ).length;
  const readyCount = orders.filter((o) => o.status === "ready").length;
  const shippedToday = orders.filter(
    (o) =>
      o.status === "shipped" &&
      o.shippedAt &&
      new Date(o.shippedAt).toDateString() === new Date().toDateString(),
  ).length;

  if (!user || (user.role !== "staff" && user.role !== "admin")) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-16 w-16 text-metallic-light mb-4" />
        <h3 className="text-lg font-semibold text-metallic-primary mb-2">
          Access Denied
        </h3>
        <p className="text-metallic-tertiary">
          Only staff members can access order processing.
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
            Order Processing
          </h1>
          <p className="text-metallic-tertiary">
            Process and fulfill customer orders
          </p>
        </div>
        <Button
          onClick={loadOrders}
          variant="outline"
          className="border-metallic-light"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Orders
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Orders
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingCount}
            </div>
            <p className="text-xs text-metallic-tertiary">
              Awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {processingCount}
            </div>
            <p className="text-xs text-metallic-tertiary">Being processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready to Ship</CardTitle>
            <PackageCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {readyCount}
            </div>
            <p className="text-xs text-metallic-tertiary">Packed and ready</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipped Today</CardTitle>
            <Truck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {shippedToday}
            </div>
            <p className="text-xs text-metallic-tertiary">Orders dispatched</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Order Queue</CardTitle>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
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
              <Package className="mx-auto h-12 w-12 text-metallic-light mb-4" />
              <h3 className="text-lg font-semibold text-metallic-primary mb-2">
                No Orders Found
              </h3>
              <p className="text-metallic-tertiary">
                No orders match the current filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card
                  key={order.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-lg text-metallic-primary">
                              {order.orderNumber}
                            </h3>
                            {getPriorityBadge(order.priority)}
                          </div>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-metallic-tertiary">
                            <div className="flex items-center">
                              <User className="mr-1 h-3 w-3" />
                              {order.customer.name}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {new Date(order.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="mr-1 h-3 w-3" />$
                              {order.total.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.status)}
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {order.status.toUpperCase()}
                          </Badge>
                        </div>
                        {order.status === "pending" && (
                          <Button
                            onClick={() => handleStartProcessing(order)}
                            className="bg-metallic-primary hover:bg-metallic-primary/90"
                          >
                            Start Processing
                          </Button>
                        )}
                        {order.status === "processing" && (
                          <Button
                            onClick={() => handleMarkReady(order)}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Mark Ready
                          </Button>
                        )}
                        {order.status === "ready" && (
                          <Button
                            onClick={() => handleShipOrder(order)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Ship Order
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium text-metallic-primary mb-2">
                          Customer Information
                        </h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center">
                            <Mail className="mr-2 h-3 w-3 text-metallic-tertiary" />
                            {order.customer.email}
                          </div>
                          {order.customer.phone && (
                            <div className="flex items-center">
                              <Phone className="mr-2 h-3 w-3 text-metallic-tertiary" />
                              {order.customer.phone}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-metallic-primary mb-2">
                          Shipping Address
                        </h4>
                        <div className="text-sm space-y-1">
                          <div className="flex items-start">
                            <MapPin className="mr-2 h-3 w-3 text-metallic-tertiary mt-0.5" />
                            <div>
                              <div>{order.shippingAddress.street}</div>
                              <div>
                                {order.shippingAddress.city},{" "}
                                {order.shippingAddress.state}{" "}
                                {order.shippingAddress.zipCode}
                              </div>
                              <div>{order.shippingAddress.country}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h4 className="font-medium text-metallic-primary mb-2">
                        Order Items ({order.items.length})
                      </h4>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 bg-metallic-light/10 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-metallic-light to-metallic-background rounded flex items-center justify-center">
                                <Package className="h-4 w-4 text-metallic-primary/40" />
                              </div>
                              <div>
                                <div className="font-medium">
                                  {item.productName}
                                </div>
                                <div className="text-sm text-metallic-tertiary">
                                  Qty: {item.quantity} × $
                                  {item.unitPrice.toFixed(2)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="text-right">
                                <div className="font-medium">
                                  ${item.totalPrice.toFixed(2)}
                                </div>
                              </div>
                              {order.status === "processing" && (
                                <Button
                                  variant={item.packed ? "default" : "outline"}
                                  size="sm"
                                  onClick={() =>
                                    toggleItemPacked(order.id, item.id)
                                  }
                                  className={
                                    item.packed
                                      ? "bg-green-600 hover:bg-green-700"
                                      : ""
                                  }
                                >
                                  {item.packed ? (
                                    <CheckCircle className="h-3 w-3" />
                                  ) : (
                                    "Pack"
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notes and Tracking */}
                    {(order.customerNotes ||
                      order.staffNotes ||
                      order.trackingNumber) && (
                      <div className="mt-4 space-y-2">
                        {order.customerNotes && (
                          <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                            <p className="text-sm">
                              <strong>Customer Note:</strong>{" "}
                              {order.customerNotes}
                            </p>
                          </div>
                        )}
                        {order.staffNotes && (
                          <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                            <p className="text-sm">
                              <strong>Staff Note:</strong> {order.staffNotes}
                            </p>
                          </div>
                        )}
                        {order.trackingNumber && (
                          <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-400">
                            <p className="text-sm">
                              <strong>Tracking:</strong> {order.trackingNumber}{" "}
                              {order.estimatedDelivery && (
                                <span>
                                  | Est. Delivery:{" "}
                                  {new Date(
                                    order.estimatedDelivery,
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processing Dialog */}
      <Dialog
        open={isProcessingDialogOpen}
        onOpenChange={setIsProcessingDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Processing Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-metallic-light/20 p-4 rounded-lg">
              <h4 className="font-medium text-metallic-primary">
                {selectedOrder?.orderNumber}
              </h4>
              <p className="text-sm text-metallic-tertiary">
                Customer: {selectedOrder?.customer.name}
              </p>
            </div>
            <div>
              <Label htmlFor="processing-notes">Processing Notes</Label>
              <Textarea
                id="processing-notes"
                value={staffNotes}
                onChange={(e) => setStaffNotes(e.target.value)}
                placeholder="Add any notes about this order..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsProcessingDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => submitStatusUpdate("processing")}
              disabled={isSubmitting}
              className="bg-metallic-primary hover:bg-metallic-primary/90"
            >
              {isSubmitting ? "Starting..." : "Start Processing"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shipping Dialog */}
      <Dialog
        open={isShippingDialogOpen}
        onOpenChange={setIsShippingDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ship Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-metallic-light/20 p-4 rounded-lg">
              <h4 className="font-medium text-metallic-primary">
                {selectedOrder?.orderNumber}
              </h4>
              <p className="text-sm text-metallic-tertiary">
                Customer: {selectedOrder?.customer.name}
              </p>
            </div>
            <div>
              <Label htmlFor="tracking">Tracking Number</Label>
              <Input
                id="tracking"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                required
              />
            </div>
            <div>
              <Label htmlFor="delivery-date">Estimated Delivery Date</Label>
              <Input
                id="delivery-date"
                type="date"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="shipping-notes">Shipping Notes</Label>
              <Textarea
                id="shipping-notes"
                value={staffNotes}
                onChange={(e) => setStaffNotes(e.target.value)}
                placeholder="Any special shipping instructions..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsShippingDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => submitStatusUpdate("shipped")}
              disabled={isSubmitting || !trackingNumber}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Shipping..." : "Ship Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffOrderProcessing;