import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { productApi } from "@/lib/api";
import { cartApi } from "@/api/cart";
import { ProductImage } from "@/components/atoms/ProductImage";
import {
  ShoppingCart,
  Search,
  Star,
  Heart,
  Package,
  Filter,
  Grid3X3,
  List,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { testApi } from "@/utils/api-test";

// Define interfaces to match API response
interface Category {
  id: number;
  name: string;
  description: string | null;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
  pivot: {
    product_id: number;
    category_id: number;
  };
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: string; // API returns price as string
  quantity: number;
  low_stock_threshold: number;
  image: string;
  status: boolean;
  created_at: string;
  updated_at: string;
  categories: Category[];
}

const Products: React.FC = () => {
  console.log("🟢 Products component is rendering!");
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    loadProducts();

    // Run API test for debugging
    console.log("🧪 Running API test...");
    testApi();
  }, []);

  const loadProducts = async () => {
    console.log("🔄 Loading products from API...");
    console.log("📍 API Base URL:", "https://laravel-wtc.onrender.com/api");
    console.log(
      "📍 Full API URL:",
      "https://laravel-wtc.onrender.com/api/products",
    );

    try {
      const response = await productApi.index();
      console.log("📡 API Response:", response);

      if (response.status === 200) {
        // Handle Laravel API response structure
        let productsArray: Product[] = [];

        // Check for the `products` key in the response
        if (response.data && Array.isArray(response.data.products)) {
          productsArray = response.data.products;
        } else if (Array.isArray(response.data)) {
          productsArray = response.data;
        } else {
          console.warn("⚠️ Unexpected API response structure:", response.data);
          productsArray = [];
        }

        console.log("✅ Products loaded:", productsArray.length);
        setProducts(productsArray);
      } else {
        console.error("❌ API Error:", response.status);
        setProducts([]);
        toast({
          title: "Failed to Load Products",
          description: `API Error: ${response.status}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ API connection failed:", error);
      setProducts([]);

      toast({
        title: "Backend Connection Error",
        description:
          "Cannot connect to Laravel API. Please check if your backend server is running.",
        variant: "destructive",
      });

      console.log(
        "💡 Tip: Ensure your Laravel backend is running and accessible at https://laravel-wtc.onrender.com/api",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = Array.isArray(products)
    ? products.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()),
      )
    : [];

  const handleAddToCart = async (productId: number) => {
    console.log("🛒 Add to cart clicked for product:", productId);

    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items to your cart",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    try {
      console.log("🔄 Adding item to cart...");
      const response = await cartApi.addItem({
        product_id: productId,
        quantity: 1,
      });

      console.log("📡 Cart API Response:", response);

      if (response.status === 200 || response.status === 201) {
        toast({
          title: "Added to Cart ✅",
          description: "Product has been added to your cart",
        });
        console.log("✅ Item added to cart successfully");
      } else {
        console.error("❌ Cart API Error:", response);
        // toast({
        //   title: "Error",
        //   description:
        //     response.data?.message ||
        //     response.message ||
        //     "Failed to add to cart",
        //   variant: "destructive",
        // });
      }
    } catch (error: any) {
      console.error("❌ Cart add error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  const viewProduct = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-metallic-background/30 to-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-metallic-primary mb-2">
              All Products
            </h1>
            <p className="text-metallic-tertiary">
              Browse our complete product catalog
            </p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-metallic-tertiary" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 border-metallic-light"
              />
            </div>
            <div className="flex border border-metallic-light rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-metallic-primary"></div>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && (
          <div
            className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
          >
            {filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Package className="mx-auto h-16 w-16 text-metallic-light mb-4" />
                <h3 className="text-lg font-semibold text-metallic-primary mb-2">
                  No Products Found
                </h3>
                <p className="text-metallic-tertiary">
                  Try adjusting your search criteria
                </p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className={`hover:shadow-lg transition-all duration-300 border-metallic-light/20 ${viewMode === "list" ? "flex flex-row" : ""}`}
                >
                  <div
                    className="relative cursor-pointer"
                    onClick={() => viewProduct(product.id)}
                  >
                    <ProductImage
                      src={product.image}
                      alt={product.name}
                      className={viewMode === "list" ? "w-32 h-32" : "h-48"}
                      fallbackClassName="bg-gradient-to-br from-metallic-light to-metallic-background"
                    />
                    {product.quantity < product.low_stock_threshold && (
                      <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
                        Low Stock
                      </Badge>
                    )}
                  </div>
                  <div className={`${viewMode === "list" ? "flex-1" : ""}`}>
                    <CardContent className="p-4">
                      <h3
                        className="font-semibold text-metallic-primary mb-2 cursor-pointer hover:text-metallic-secondary transition-colors"
                        onClick={() => viewProduct(product.id)}
                      >
                        {product.name}
                      </h3>
                      <p className="text-metallic-tertiary text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      <div
                        className={`flex items-center ${viewMode === "list" ? "justify-between" : "justifyრ჌justify-between"} mb-3`}
                      >
                        <span className="text-lg font-bold text-metallic-primary">
                          ${parseFloat(product.price).toFixed(2)}
                        </span>
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-metallic-tertiary">
                            4.5
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="text-xs">
                          Stock: {product.quantity}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => viewProduct(product.id)}
                          className="text-metallic-secondary hover:text-metallic-primary"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        className={`${viewMode === "list" ? "w-32" : "w-full"} bg-metallic-secondary hover:bg-metallic-secondary/90`}
                        onClick={() => handleAddToCart(product.id)}
                      >
                        <ShoppingCart className="mr-1 h-3 w-3" />
                        Add to Cart
                      </Button>
                    </CardContent>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="border-metallic-light"
          >
            Back to Homepage
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Products;
