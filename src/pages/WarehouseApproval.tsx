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
  CheckCircle,
  XCircle,
  Clock,
  Package,
  User,
  Calendar,
  FileText,
  TrendingUp,
  AlertTriangle,
  Truck,
} from "lucide-react";

interface RestockRequest {
  id: number;
  productId: number;
  productName: string;
  productDescription: string;
  currentStock: number;
  requestedQuantity: number;
  status: "pending" | "approved" | "rejected";
  priority: "low" | "medium" | "high" | "urgent";
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  warehouseNotes?: string;
  adminNotes?: string;
  estimatedCost: number;
  supplierInfo?: string;
}

const WarehouseApproval: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<RestockRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RestockRequest | null>(
    null,
  );
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">(
    "approve",
  );
  const [warehouseNotes, setWarehouseNotes] = useState("");
  const [adjustedQuantity, setAdjustedQuantity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    loadRestockRequests();
  }, []);

  const loadRestockRequests = async () => {
    try {
      // Mock restock requests data
      const mockRequests: RestockRequest[] = [
        {
          id: 1,
          productId: 2,
          productName: "Wireless Headphones",
          productDescription: "Noise-cancelling wireless headphones",
          currentStock: 3,
          requestedQuantity: 25,
          status: "pending",
          priority: "high",
          requestedBy: "Admin User",
          requestedAt: "2024-01-22T10:30:00Z",
          adminNotes: "High demand product, customers asking frequently",
          estimatedCost: 2499.75,
          supplierInfo: "TechSupplier Co. - 2-3 days delivery",
        },
        {
          id: 2,
          productId: 4,
          productName: "Gaming Mouse",
          productDescription: "Professional gaming mouse with RGB lighting",
          currentStock: 2,
          requestedQuantity: 15,
          status: "pending",
          priority: "medium",
          requestedBy: "Staff User",
          requestedAt: "2024-01-21T14:20:00Z",
          adminNotes: "Gaming season approaching, need inventory",
          estimatedCost: 1199.85,
          supplierInfo: "GameGear Ltd. - 1 week delivery",
        },
        {
          id: 3,
          productId: 8,
          productName: "USB-C Cable",
          productDescription: "High-speed USB-C charging cable",
          currentStock: 1,
          requestedQuantity: 50,
          status: "approved",
          priority: "urgent",
          requestedBy: "Admin User",
          requestedAt: "2024-01-20T09:15:00Z",
          approvedBy: "Warehouse Manager",
          approvedAt: "2024-01-20T11:30:00Z",
          warehouseNotes: "Approved with reduced quantity due to budget",
          adminNotes: "Essential accessory, very popular",
          estimatedCost: 624.5,
          supplierInfo: "CablePro Inc. - Next day delivery",
        },
        {
          id: 4,
          productId: 1,
          productName: "Premium Laptop",
          productDescription: "High-performance laptop with latest processor",
          currentStock: 5,
          requestedQuantity: 10,
          status: "rejected",
          priority: "low",
          requestedBy: "Staff User",
          requestedAt: "2024-01-19T16:45:00Z",
          approvedBy: "Warehouse Manager",
          approvedAt: "2024-01-19T18:20:00Z",
          warehouseNotes: "Budget constraints, current stock sufficient",
          adminNotes: "Stock running low but manageable",
          estimatedCost: 12999.9,
          supplierInfo: "LaptopTech Corp. - 1-2 weeks delivery",
        },
        {
          id: 5,
          productId: 5,
          productName: "4K Monitor",
          productDescription: "Ultra-high definition monitor",
          currentStock: 12,
          requestedQuantity: 8,
          status: "pending",
          priority: "urgent",
          requestedBy: "Admin User",
          requestedAt: "2024-01-22T08:15:00Z",
          adminNotes: "Corporate order coming next week",
          estimatedCost: 4399.92,
          supplierInfo: "DisplayMaster - 5 days delivery",
        },
      ];

      setRequests(mockRequests);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load restock requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovalAction = (
    request: RestockRequest,
    action: "approve" | "reject",
  ) => {
    setSelectedRequest(request);
    setApprovalAction(action);
    setAdjustedQuantity(request.requestedQuantity.toString());
    setWarehouseNotes("");
    setIsApprovalDialogOpen(true);
  };

  const submitApproval = async () => {
    if (!selectedRequest) return;

    setIsSubmitting(true);
    try {
      const updatedRequest: RestockRequest = {
        ...selectedRequest,
        status: approvalAction === "approve" ? "approved" : "rejected",
        approvedBy: user?.name || "Warehouse Manager",
        approvedAt: new Date().toISOString(),
        warehouseNotes: warehouseNotes,
        requestedQuantity:
          approvalAction === "approve"
            ? parseInt(adjustedQuantity)
            : selectedRequest.requestedQuantity,
      };

      setRequests((prev) =>
        prev.map((req) =>
          req.id === selectedRequest.id ? updatedRequest : req,
        ),
      );

      toast({
        title: `Request ${approvalAction === "approve" ? "Approved" : "Rejected"}`,
        description: `Restock request for ${selectedRequest.productName} has been ${approvalAction}d.`,
        variant: approvalAction === "approve" ? "default" : "destructive",
      });

      setIsApprovalDialogOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process approval",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return (
          <Badge className="bg-red-600 text-white">
            <AlertTriangle className="mr-1 h-3 w-3" />
            URGENT
          </Badge>
        );
      case "high":
        return (
          <Badge className="bg-orange-600 text-white">
            <TrendingUp className="mr-1 h-3 w-3" />
            HIGH
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            MEDIUM
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Package className="mr-1 h-3 w-3" />
            LOW
          </Badge>
        );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredRequests = requests.filter((request) => {
    if (filterStatus === "all") return true;
    return request.status === filterStatus;
  });

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;
  const totalValue = requests
    .filter((r) => r.status === "approved")
    .reduce((sum, r) => sum + r.estimatedCost, 0);

  if (!user || user.role !== "warehouse") {
    return (
      <div className="text-center py-12">
        <Truck className="mx-auto h-16 w-16 text-metallic-light mb-4" />
        <h3 className="text-lg font-semibold text-metallic-primary mb-2">
          Access Denied
        </h3>
        <p className="text-metallic-tertiary">
          Only warehouse managers can access this page.
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
            Warehouse Approval
          </h1>
          <p className="text-metallic-tertiary">
            Review and approve restock requests
          </p>
        </div>
        <Badge className="bg-metallic-primary text-white">
          {pendingCount} Pending Reviews
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Requests
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingCount}
            </div>
            <p className="text-xs text-metallic-tertiary">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Approved This Month
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {approvedCount}
            </div>
            <p className="text-xs text-metallic-tertiary">
              Successfully approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rejected Requests
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {rejectedCount}
            </div>
            <p className="text-xs text-metallic-tertiary">Declined requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Approved Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-metallic-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-metallic-primary">
              ${totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-metallic-tertiary">Total investment</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Restock Requests</CardTitle>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading requests...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-metallic-light mb-4" />
              <h3 className="text-lg font-semibold text-metallic-primary mb-2">
                No Requests Found
              </h3>
              <p className="text-metallic-tertiary">
                No restock requests match the current filter.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Stock Info</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {request.productName}
                          </div>
                          <div className="text-sm text-metallic-tertiary">
                            {request.productDescription}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(request.priority)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>
                            Current:{" "}
                            <span className="font-medium text-red-600">
                              {request.currentStock}
                            </span>
                          </div>
                          <div>
                            Requested:{" "}
                            <span className="font-medium text-metallic-primary">
                              {request.requestedQuantity}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="mr-1 h-3 w-3 text-metallic-tertiary" />
                          {request.requestedBy}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3 text-metallic-tertiary" />
                          {new Date(request.requestedAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-metallic-primary">
                          ${request.estimatedCost.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(request.status)}
                          <Badge
                            variant={
                              request.status === "approved"
                                ? "default"
                                : request.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {request.status.toUpperCase()}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {request.status === "pending" && (
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleApprovalAction(request, "approve")
                              }
                              className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleApprovalAction(request, "reject")
                              }
                              className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        {request.status !== "pending" && (
                          <div className="text-sm text-metallic-tertiary">
                            {request.approvedBy}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog
        open={isApprovalDialogOpen}
        onOpenChange={setIsApprovalDialogOpen}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {approvalAction === "approve" ? "Approve" : "Reject"} Restock
              Request
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-metallic-light/20 p-4 rounded-lg">
              <h4 className="font-medium text-metallic-primary">
                {selectedRequest?.productName}
              </h4>
              <div className="text-sm text-metallic-tertiary mt-1">
                Current stock: {selectedRequest?.currentStock} units
                <br />
                Requested: {selectedRequest?.requestedQuantity} units
                <br />
                Estimated cost: $
                {selectedRequest?.estimatedCost.toLocaleString()}
                <br />
                Supplier: {selectedRequest?.supplierInfo}
              </div>
              {selectedRequest?.adminNotes && (
                <div className="mt-2 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                  <p className="text-sm text-blue-700">
                    <strong>Admin Notes:</strong> {selectedRequest.adminNotes}
                  </p>
                </div>
              )}
            </div>

            {approvalAction === "approve" && (
              <div>
                <Label htmlFor="adjusted-quantity">
                  Approved Quantity (Optional Adjustment)
                </Label>
                <Input
                  id="adjusted-quantity"
                  type="number"
                  value={adjustedQuantity}
                  onChange={(e) => setAdjustedQuantity(e.target.value)}
                  placeholder="Adjust quantity if needed"
                  min="1"
                />
              </div>
            )}

            <div>
              <Label htmlFor="warehouse-notes">
                Warehouse Notes {approvalAction === "reject" && "(Required)"}
              </Label>
              <Textarea
                id="warehouse-notes"
                value={warehouseNotes}
                onChange={(e) => setWarehouseNotes(e.target.value)}
                placeholder={
                  approvalAction === "approve"
                    ? "Optional notes about the approval..."
                    : "Please provide a reason for rejection..."
                }
                required={approvalAction === "reject"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApprovalDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={submitApproval}
              disabled={
                isSubmitting ||
                (approvalAction === "reject" && !warehouseNotes.trim())
              }
              className={
                approvalAction === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {isSubmitting
                ? "Processing..."
                : approvalAction === "approve"
                  ? "Approve Request"
                  : "Reject Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WarehouseApproval;
