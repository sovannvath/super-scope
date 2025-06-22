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
  DialogTrigger,
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
import { useAuth } from "@/contexts/AuthContext";
import { productApi, requestOrderApi, Product } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  Package,
  ShoppingCart,
  RefreshCw,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

interface RestockRequest {
  id: number;
  productId: number;
  productName: string;
  currentStock: number;
  requestedQuantity: number;
  status: "pending" | "approved" | "rejected";
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

const LowStockAlerts: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [restockRequests, setRestockRequests] = useState<RestockRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [requestQuantity, setRequestQuantity] = useState("");
  const [requestNotes, setRequestNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadLowStockData();
  }, []);

  const loadLowStockData = async () => {
    try {
      // Mock data for low stock products
      const mockLowStockProducts: Product[] = [
        {
          id: 2,
          name: "Wireless Headphones",
          description: "Noise-cancelling wireless headphones",
          price: 199.99,
          quantity: 3,
          low_stock_threshold: 10,
          status: true,
          created_at: "2024-01-01",
          updated_at: "2024-01-01",
        },
        {
          id: 4,
          name: "Gaming Mouse",
          description: "Professional gaming mouse with RGB lighting",
          price: 79.99,
          quantity: 2,
          low_stock_threshold: 5,
          status: true,
          created_at: "2024-01-01",
          updated_at: "2024-01-01",
        },
        {
          id: 8,
          name: "USB-C Cable",
          description: "High-speed USB-C charging cable",
          price: 24.99,
          quantity: 1,
          low_stock_threshold: 15,
          status: true,
          created_at: "2024-01-01",
          updated_at: "2024-01-01",
        },
      ];

      // Mock restock requests
      const mockRestockRequests: RestockRequest[] = [
        {
          id: 1,
          productId: 2,
          productName: "Wireless Headphones",
          currentStock: 3,
          requestedQuantity: 25,
          status: "pending",
          requestedBy: "Admin User",
          requestedAt: "2024-01-22T10:30:00Z",
          notes: "High demand product, need immediate restocking",
        },
        {
          id: 2,
          productId: 4,
          productName: "Gaming Mouse",
          currentStock: 2,
          requestedQuantity: 15,
          status: "approved",
          requestedBy: "Admin User",
          requestedAt: "2024-01-21T14:20:00Z",
          approvedBy: "Warehouse Manager",
          approvedAt: "2024-01-21T16:45:00Z",
          notes: "Gaming season approaching",
        },
        {
          id: 3,
          productId: 8,
          productName: "USB-C Cable",
          currentStock: 1,
          requestedQuantity: 50,
          status: "rejected",
          requestedBy: "Staff User",
          requestedAt: "2024-01-20T09:15:00Z",
          approvedBy: "Warehouse Manager",
          approvedAt: "2024-01-20T11:30:00Z",
          notes: "Supplier unavailable",
        },
      ];

      setLowStockProducts(mockLowStockProducts);
      setRestockRequests(mockRestockRequests);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load low stock data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestRestock = (product: Product) => {
    setSelectedProduct(product);
    setRequestQuantity((product.low_stock_threshold * 2).toString());
    setRequestNotes("");
    setIsRequestDialogOpen(true);
  };

  const submitRestockRequest = async () => {
    if (!selectedProduct) return;

    setIsSubmitting(true);
    try {
      const newRequest: RestockRequest = {
        id: Date.now(),
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        currentStock: selectedProduct.quantity,
        requestedQuantity: parseInt(requestQuantity),
        status: "pending",
        requestedBy: user?.name || "Unknown User",
        requestedAt: new Date().toISOString(),
        notes: requestNotes,
      };

      setRestockRequests((prev) => [newRequest, ...prev]);

      toast({
        title: "Restock Request Submitted",
        description: `Request for ${requestQuantity} units of ${selectedProduct.name} has been sent to the warehouse.`,
      });

      setIsRequestDialogOpen(false);
      setSelectedProduct(null);
      setRequestQuantity("");
      setRequestNotes("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit restock request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStockLevel = (product: Product) => {
    const percentage = (product.quantity / product.low_stock_threshold) * 100;
    if (percentage <= 20) return { level: "critical", color: "bg-red-500" };
    if (percentage <= 50) return { level: "low", color: "bg-orange-500" };
    return { level: "warning", color: "bg-yellow-500" };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary" as const;
      case "approved":
        return "default" as const;
      case "rejected":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  if (!user || (user.role !== "admin" && user.role !== "warehouse")) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-16 w-16 text-metallic-light mb-4" />
        <h3 className="text-lg font-semibold text-metallic-primary mb-2">
          Access Denied
        </h3>
        <p className="text-metallic-tertiary">
          You don't have permission to view stock alerts.
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
            Low Stock Alerts
          </h1>
          <p className="text-metallic-tertiary">
            Monitor and manage inventory levels
          </p>
        </div>
        <Button
          onClick={loadLowStockData}
          variant="outline"
          className="border-metallic-light"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">
              Critical Stock
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {
                lowStockProducts.filter(
                  (p) => (p.quantity / p.low_stock_threshold) * 100 <= 20,
                ).length
              }
            </div>
            <p className="text-xs text-red-600">Items below 20% threshold</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">
              Low Stock
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {
                lowStockProducts.filter(
                  (p) =>
                    (p.quantity / p.low_stock_threshold) * 100 > 20 &&
                    (p.quantity / p.low_stock_threshold) * 100 <= 50,
                ).length
              }
            </div>
            <p className="text-xs text-orange-600">Items below 50% threshold</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">
              Pending Requests
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {restockRequests.filter((r) => r.status === "pending").length}
            </div>
            <p className="text-xs text-yellow-600">
              Awaiting warehouse approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5 text-red-500" />
            Low Stock Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : lowStockProducts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-metallic-primary mb-2">
                All Stock Levels Good
              </h3>
              <p className="text-metallic-tertiary">
                No products are currently below their stock thresholds.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Threshold</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stock Level</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockProducts.map((product) => {
                    const stockLevel = getStockLevel(product);
                    const percentage =
                      (product.quantity / product.low_stock_threshold) * 100;

                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-metallic-tertiary">
                              ${product.price}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-red-600">
                            {product.quantity}
                          </span>
                        </TableCell>
                        <TableCell>{product.low_stock_threshold}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              stockLevel.level === "critical"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {stockLevel.level.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${stockLevel.color}`}
                                style={{
                                  width: `${Math.min(percentage, 100)}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-metallic-tertiary">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRequestRestock(product)}
                            className="border-metallic-secondary text-metallic-secondary hover:bg-metallic-secondary hover:text-white"
                          >
                            <ShoppingCart className="mr-1 h-3 w-3" />
                            Request Restock
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restock Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <RefreshCw className="mr-2 h-5 w-5 text-metallic-secondary" />
            Restock Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Requested Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {restockRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.productName}
                    </TableCell>
                    <TableCell>{request.currentStock}</TableCell>
                    <TableCell className="font-medium text-metallic-primary">
                      {request.requestedQuantity}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(request.status)}
                        <Badge variant={getStatusBadgeVariant(request.status)}>
                          {request.status.toUpperCase()}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{request.requestedBy}</TableCell>
                    <TableCell>
                      {new Date(request.requestedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-metallic-tertiary">
                        {request.notes || "No notes"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Request Restock Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Restock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-metallic-primary">
                {selectedProduct?.name}
              </h4>
              <div className="text-sm text-metallic-tertiary mt-1">
                Current stock: {selectedProduct?.quantity} units
                <br />
                Threshold: {selectedProduct?.low_stock_threshold} units
              </div>
            </div>
            <div>
              <Label htmlFor="quantity">Requested Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={requestQuantity}
                onChange={(e) => setRequestQuantity(e.target.value)}
                placeholder="Enter quantity needed"
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={requestNotes}
                onChange={(e) => setRequestNotes(e.target.value)}
                placeholder="Reason for restock request"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRequestDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={submitRestockRequest}
              disabled={isSubmitting || !requestQuantity}
              className="bg-metallic-primary hover:bg-metallic-primary/90"
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LowStockAlerts;
