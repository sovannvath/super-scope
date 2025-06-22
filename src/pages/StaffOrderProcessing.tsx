import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { orderApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  RefreshCw,
  Eye,
} from "lucide-react";

interface Order {
  id: number;
  user_id: number;
  status: string;
  payment_status: string;
  total: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  items?: Array<{
    id: number;
    product_id: number;
    quantity: number;
    price: number;
    product?: {
      id: number;
      name: string;
      description: string;
    };
  }>;
}

const StaffOrderProcessing: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isProcessingDialogOpen, setIsProcessingDialogOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const response = await orderApi.index();

      if (response.status === 200) {
        let ordersArray: Order[] = [];
        if (Array.isArray(response.data)) {
          ordersArray = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          ordersArray = response.data.data;
        }

        setOrders(ordersArray);
      } else {
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Orders error:", error);
      toast({
        title: "Error",
        description: "Failed to connect to orders service",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      setIsSubmitting(true);
      const response = await orderApi.updateStatus(orderId, {
        status: newStatus,
        tracking_number: newStatus === "shipped" ? trackingNumber : undefined,
      });

      if (response.status === 200) {
        toast({
          title: "Success",
          description: `Order status updated to ${newStatus}`,
        });

        // Update local state
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order,
          ),
        );

        setIsProcessingDialogOpen(false);
        setTrackingNumber("");
      } else {
        toast({
          title: "Error",
          description: "Failed to update order status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "all") return true;
    return order.status === statusFilter;
  });

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

      {/* Status Filter */}
      <div className="flex items-center space-x-4">
        <Label>Filter by Status:</Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {order.user?.name || "Unknown"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {order.user?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.payment_status === "paid"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {order.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${order.total}
                    </TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsProcessingDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Process
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Processing Dialog */}
      <Dialog
        open={isProcessingDialogOpen}
        onOpenChange={setIsProcessingDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Process Order #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Customer</Label>
                  <p className="font-medium">{selectedOrder.user?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.user?.email}
                  </p>
                </div>
                <div>
                  <Label>Current Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                </div>
              </div>

              <div>
                <Label>Items</Label>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                  {selectedOrder.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-2 bg-muted rounded"
                    >
                      <div>
                        <span className="font-medium">
                          {item.product?.name}
                        </span>
                        <span className="text-muted-foreground">
                          {" "}
                          x{item.quantity}
                        </span>
                      </div>
                      <span>${item.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.status === "processing" && (
                <div>
                  <Label htmlFor="tracking">
                    Tracking Number (for shipping)
                  </Label>
                  <Input
                    id="tracking"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsProcessingDialogOpen(false)}
            >
              Cancel
            </Button>

            {selectedOrder?.status === "pending" && (
              <Button
                onClick={() =>
                  handleStatusUpdate(selectedOrder.id, "processing")
                }
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? "Processing..." : "Start Processing"}
              </Button>
            )}

            {selectedOrder?.status === "processing" && (
              <Button
                onClick={() => handleStatusUpdate(selectedOrder.id, "shipped")}
                disabled={isSubmitting || !trackingNumber}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Shipping..." : "Mark as Shipped"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffOrderProcessing;
