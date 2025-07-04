import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { productApi, Product } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Package, ChevronLeft, ChevronRight } from "lucide-react";

const ProductManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    low_stock_threshold: "5", // Default threshold
    image: "", // Add image field
    status: "true", // Boolean string for form
  });

  useEffect(() => {
    loadProducts();
    // Test backend connectivity
    testBackendConnection();
  }, []);

  const testBackendConnection = async () => {
    try {
      console.log("🔍 Testing backend connection...");
      const response = await fetch(
        "https://laravel-wtc.onrender.com/api/products",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        },
      );
      console.log("🌐 Backend test response:", {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      });

      // If we can get products, let's analyze the structure
      if (response.ok) {
        const data = await response.json();
        console.log("📊 Existing product structure sample:", data);
        if (Array.isArray(data) && data.length > 0) {
          console.log(
            "🏗️ Product schema from existing data:",
            Object.keys(data[0]),
          );
        } else if (
          data.data &&
          Array.isArray(data.data) &&
          data.data.length > 0
        ) {
          console.log(
            "🏗️ Product schema from existing data:",
            Object.keys(data.data[0]),
          );
        }
      }
    } catch (error) {
      console.error("🚨 Backend connection test failed:", error);
    }
  };

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      console.log("🔄 Loading products...");

      const response = await productApi.index();
      console.log("📡 API response:", response);

      if (response.status === 200) {
        let productsArray: Product[] = [];

        // Handle different response structures from Laravel
        if (Array.isArray(response.data)) {
          productsArray = response.data;
        } else if (response.data && Array.isArray(response.data.products)) {
          productsArray = response.data.products;
        } else if (response.data && Array.isArray(response.data.data)) {
          productsArray = response.data.data;
        }

        console.log("✅ Loaded products:", productsArray.length);
        setProducts(productsArray);

        if (productsArray.length === 0) {
          toast({
            title: "No Products",
            description: "No products found in the database",
          });
        }
      } else if (response.status === 0) {
        // Timeout or network error
        toast({
          title: "Loading...",
          description: "Server is starting up, please wait",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load products",
          variant: "destructive",
        });
        // Set empty products array on error
        setProducts([]);
      }
    } catch (error: any) {
      console.error("❌ Error loading products:", error);

      // Always set empty array on error to prevent infinite loading
      setProducts([]);

      // Handle timeout errors gracefully
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        toast({
          title: "Loading...",
          description: "Server is starting up, please wait and try again",
        });
      } else {
        toast({
          title: "Connection Error",
          description: "Failed to connect to server. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      // Always stop loading
      setIsLoading(false);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      quantity: "",
      low_stock_threshold: "5",
      image: "",
      status: "true",
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data
      if (
        !formData.name.trim() ||
        !formData.description.trim() ||
        !formData.price ||
        !formData.quantity ||
        !formData.low_stock_threshold
      ) {
        toast({
          title: "Validation Error",
          description:
            "Please fill in all required fields (Name, Description, Price, Quantity, Low Stock Threshold)",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Validate numeric fields
      if (parseFloat(formData.price) <= 0) {
        toast({
          title: "Validation Error",
          description: "Price must be greater than 0",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (parseInt(formData.quantity) < 0) {
        toast({
          title: "Validation Error",
          description: "Quantity cannot be negative",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: formData.price, // Keep as string to match API expectation
        quantity: parseInt(formData.quantity),
        low_stock_threshold: parseInt(formData.low_stock_threshold) || 5,
        image: formData.image.trim() || undefined, // Include image if provided
        status: formData.status === "true", // Convert to boolean
      };

      console.log("🔄 Creating product:", productData);
      console.log("🔐 User auth:", {
        user: user?.name,
        role: user?.role,
        hasToken: !!localStorage.getItem("auth_token"),
        tokenPreview:
          localStorage.getItem("auth_token")?.substring(0, 20) + "...",
      });
      console.log("🌐 API Config:", {
        baseURL: "https://laravel-wtc.onrender.com/api",
        endpoint: "/products",
        method: "POST",
        fullURL: "https://laravel-wtc.onrender.com/api/products",
      });
      console.log("📝 Form Data Types:", {
        name: typeof productData.name + " - " + productData.name,
        description:
          typeof productData.description + " - " + productData.description,
        price: typeof productData.price + " - " + productData.price,
        quantity: typeof productData.quantity + " - " + productData.quantity,
        low_stock_threshold:
          typeof productData.low_stock_threshold +
          " - " +
          productData.low_stock_threshold,
      });

      const response = await productApi.create(productData);
      console.log("📡 Create response:", {
        status: response.status,
        data: response.data,
        message: response.message,
        errors: response.errors,
      });

      // Log validation errors in detail if present
      if (response.status === 422) {
        console.error(
          "🚫 Validation Errors:",
          JSON.stringify(response.errors, null, 2),
        );
        console.error(
          "🚫 Response Data:",
          JSON.stringify(response.data, null, 2),
        );

        // Try to understand what fields are required by testing minimal data
        console.log("🧪 Testing minimal product data...");
        const minimalProduct = {
          name: "Test Product",
          description: "Test Description",
          price: 10.0,
        };

        try {
          const minimalResponse = await productApi.create(minimalProduct);
          console.log("🧪 Minimal test response:", minimalResponse);
        } catch (minError) {
          console.log("🧪 Minimal test also failed:", minError);
        }
      }

      if (response.status === 200 || response.status === 201) {
        toast({
          title: "Success!",
          description: `Product "${productData.name}" created successfully`,
        });
        setIsCreateDialogOpen(false);
        resetForm();
        // Refresh the product list
        await loadProducts();
      } else {
        // Handle specific error cases
        let errorMessage = "Failed to create product";

        if (response.status === 422) {
          // Validation errors
          console.log("🔍 Processing validation errors:", {
            errors: response.errors,
            dataErrors: response.data?.errors,
            fullResponse: response,
          });

          let validationErrors = response.errors || response.data?.errors;

          if (validationErrors) {
            if (typeof validationErrors === "object") {
              const errorDetails = Object.entries(validationErrors)
                .map(([field, messages]) => {
                  const messageArray = Array.isArray(messages)
                    ? messages
                    : [messages];
                  return `${field}: ${messageArray.join(", ")}`;
                })
                .join("\n");
              errorMessage = `Validation Errors:\n${errorDetails}`;
            } else {
              errorMessage = `Validation Error: ${validationErrors}`;
            }
          } else {
            errorMessage = `Validation failed. Please check your input data.`;
          }
        } else if (response.status === 401) {
          errorMessage = "Authentication required. Please log in again.";
        } else if (response.status === 403) {
          errorMessage = "Permission denied. Admin access required.";
        } else if (response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (response.data?.message) {
          errorMessage = response.data.message;
        } else if (response.message) {
          errorMessage = response.message;
        }

        toast({
          title: "Create Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("❌ Create error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity.toString(),
      low_stock_threshold: product.low_stock_threshold.toString(),
      image: product.image || "",
      status: product.status ? "true" : "false",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsSubmitting(true);
    try {
      const updateData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: formData.price, // Keep as string to match API expectation
        quantity: parseInt(formData.quantity),
        low_stock_threshold: parseInt(formData.low_stock_threshold) || 5,
        image: formData.image.trim() || undefined, // Include image if provided
        status: formData.status === "true", // Convert to boolean
      };

      console.log("🔄 Updating product:", selectedProduct.id, updateData);
      const response = await productApi.update(selectedProduct.id, updateData);
      console.log("📡 Update response:", response);

      if (response.status === 200) {
        toast({
          title: "Success!",
          description: `Product "${updateData.name}" updated successfully`,
        });
        setIsEditDialogOpen(false);
        resetForm();
        setSelectedProduct(null);
        // Refresh the product list
        await loadProducts();
      } else {
        toast({
          title: "Update Failed",
          description:
            response.data?.message ||
            response.message ||
            "Failed to update product",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("❌ Update error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setIsViewDialogOpen(true);
  };

  const handleDelete = async (productId: number) => {
    try {
      console.log("🔄 Deleting product:", productId);
      const response = await productApi.delete(productId);
      console.log("📡 Delete response:", response);

      if (response.status === 200) {
        toast({
          title: "Success!",
          description: "Product deleted successfully",
        });
        // Refresh the product list
        await loadProducts();
      } else {
        toast({
          title: "Delete Failed",
          description:
            response.data?.message ||
            response.message ||
            "Failed to delete product",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("❌ Delete error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  // Show loading state
  if (isLoading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              setIsLoading(false);
              loadProducts();
            }}
          >
            Cancel / Retry
          </Button>
        </div>
      </div>
    );
  }

  // Check permissions - allow both admin and any authenticated user for now
  if (user && user.role !== "admin") {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Admin Access Required</h3>
        <p className="text-gray-600">
          Only administrators can manage products.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Current role: {user.role} | User: {user.name}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Products List</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
              Create New
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="threshold">Low Stock Threshold</Label>
                <Input
                  id="threshold"
                  type="number"
                  value={formData.low_stock_threshold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      low_stock_threshold: e.target.value,
                    })
                  }
                  placeholder="Default: 5"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  type="url"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Paste a direct image URL from the web
                </p>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                Image
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                Name
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                Stock
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                Price
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading products...
                </TableCell>
              </TableRow>
            ) : currentProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              currentProducts.map((product, index) => (
                <TableRow
                  key={product.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <TableCell className="px-6 py-4">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-md border"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-900">
                    {product.name}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-600">
                    {product.quantity}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-600">
                    ${parseFloat(product.price).toFixed(2)}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs rounded"
                        onClick={() => handleEdit(product)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs rounded"
                        onClick={() => handleView(product)}
                      >
                        Show
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs rounded"
                          >
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Product</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{product.name}"?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(product.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="ghost"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="ghost"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Product Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-price">Price</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-quantity">Quantity</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-threshold">Low Stock Threshold</Label>
              <Input
                id="edit-threshold"
                type="number"
                value={formData.low_stock_threshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    low_stock_threshold: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-image">Image URL</Label>
              <Input
                id="edit-image"
                type="url"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Paste a direct image URL from the web
              </p>
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div>
                <Label className="font-medium">Name:</Label>
                <p className="text-gray-600">{selectedProduct.name}</p>
              </div>
              <div>
                <Label className="font-medium">Description:</Label>
                <p className="text-gray-600">{selectedProduct.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Price:</Label>
                  <p className="text-gray-600">${selectedProduct.price}</p>
                </div>
                <div>
                  <Label className="font-medium">Quantity:</Label>
                  <p className="text-gray-600">{selectedProduct.quantity}</p>
                </div>
              </div>
              <div>
                <Label className="font-medium">Low Stock Threshold:</Label>
                <p className="text-gray-600">
                  {selectedProduct.low_stock_threshold}
                </p>
              </div>
              <div>
                <Label className="font-medium">Status:</Label>
                <p className="text-gray-600">
                  {selectedProduct.status ? "Active" : "Inactive"}
                </p>
              </div>
              {selectedProduct.image && (
                <div>
                  <Label className="font-medium">Image:</Label>
                  <div className="mt-2">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-full h-32 object-cover rounded-md border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1 break-all">
                      {selectedProduct.image}
                    </p>
                  </div>
                </div>
              )}
              <div>
                <Label className="font-medium">Created:</Label>
                <p className="text-gray-600">
                  {new Date(selectedProduct.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagement;
