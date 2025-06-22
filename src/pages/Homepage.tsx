import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { productApi, Product } from "@/lib/api";
import {
  ShoppingCart,
  Search,
  Star,
  Heart,
  TrendingUp,
  Package,
  Users,
  Shield,
  Truck,
  ArrowRight,
  Filter,
  Grid3X3,
  List,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ApiTest } from "@/components/ApiTest";

const Homepage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    console.log("🔄 Starting to load products from API...");
    try {
      const response = await productApi.list();
      console.log("📡 API Response:", response);
      console.log("📦 Response Data Type:", typeof response.data);
      console.log("📦 Response Data:", response.data);

      if (response.status === 200) {
        // Handle different possible response structures
        let productsArray: Product[] = [];

        if (Array.isArray(response.data)) {
          // Direct array
          productsArray = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          // Nested in data property
          productsArray = response.data.data;
        } else if (response.data && Array.isArray(response.data.products)) {
          // Nested in products property
          productsArray = response.data.products;
        } else {
          console.warn("⚠️ Unexpected API response structure:", response.data);
          productsArray = [];
        }

        console.log("✅ Products array:", productsArray);
        setProducts(productsArray);
        // Set first 6 products as featured
        setFeaturedProducts(productsArray.slice(0, 6));

        toast({
          title: "Products Loaded",
          description: `Successfully loaded ${productsArray.length} products`,
        });
      } else {
        console.error("❌ API Error:", response);
        const errorMsg = response.data?.message || `HTTP ${response.status}`;
        toast({
          title: "API Error",
          description: `Failed to load products: ${errorMsg}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ Failed to load products:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Network Error",
        description: `Failed to connect: ${errorMsg}`,
        variant: "destructive",
      });
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

  const handleAddToCart = (productId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items to your cart",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Added to Cart",
      description: "Product has been added to your cart",
    });
  };

  const HeroSection = () => (
    <section className="relative bg-gradient-to-br from-metallic-primary via-metallic-secondary to-metallic-tertiary text-white py-20 overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Welcome to
              <span className="block text-metallic-background">
                EcommerceHub
              </span>
            </h1>
            <p className="text-xl text-metallic-background/90 mb-8 leading-relaxed">
              Discover amazing products with our comprehensive inventory
              management system. Shop with confidence from our curated
              selection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-white text-metallic-primary hover:bg-metallic-background text-lg px-8 py-3"
                onClick={() =>
                  document
                    .getElementById("products")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              {!isAuthenticated && (
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-metallic-primary text-lg px-8 py-3"
                  asChild
                >
                  <Link to="/auth">Join Us</Link>
                </Button>
              )}
            </div>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 transform rotate-3">
                  <Package className="h-8 w-8 text-metallic-background mb-2" />
                  <h3 className="font-semibold text-metallic-background">
                    Quality Products
                  </h3>
                  <p className="text-sm text-metallic-background/80">
                    Curated selection
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 transform -rotate-2">
                  <Truck className="h-8 w-8 text-metallic-background mb-2" />
                  <h3 className="font-semibold text-metallic-background">
                    Fast Delivery
                  </h3>
                  <p className="text-sm text-metallic-background/80">
                    Quick & reliable
                  </p>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 transform -rotate-1">
                  <Shield className="h-8 w-8 text-metallic-background mb-2" />
                  <h3 className="font-semibold text-metallic-background">
                    Secure Shopping
                  </h3>
                  <p className="text-sm text-metallic-background/80">
                    Protected payments
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 transform rotate-2">
                  <Users className="h-8 w-8 text-metallic-background mb-2" />
                  <h3 className="font-semibold text-metallic-background">
                    Great Support
                  </h3>
                  <p className="text-sm text-metallic-background/80">
                    24/7 assistance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const FeaturedSection = () => (
    <section className="py-16 bg-gradient-to-b from-metallic-background/30 to-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-metallic-primary mb-4">
            Featured Products
          </h2>
          <p className="text-lg text-metallic-tertiary max-w-2xl mx-auto">
            Discover our handpicked selection of trending products that
            customers love
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-metallic-light/30 rounded-xl h-48 mb-4"></div>
                  <div className="bg-metallic-light/30 h-4 rounded mb-2"></div>
                  <div className="bg-metallic-light/30 h-4 rounded w-2/3"></div>
                </div>
              ))
            : featuredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="group hover:shadow-xl transition-all duration-300 border-metallic-light/20 overflow-hidden"
                >
                  <div className="relative">
                    <div className="bg-gradient-to-br from-metallic-light to-metallic-background h-48 flex items-center justify-center">
                      <Package className="h-16 w-16 text-metallic-primary/30" />
                    </div>
                    <div className="absolute top-3 right-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/90 border-metallic-light"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    {product.quantity < product.low_stock_threshold && (
                      <Badge className="absolute top-3 left-3 bg-red-500 text-white">
                        Low Stock
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg text-metallic-primary mb-2 group-hover:text-metallic-secondary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-metallic-tertiary text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-metallic-primary">
                        ${product.price}
                      </span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-metallic-tertiary ml-1">
                          4.5
                        </span>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-metallic-secondary hover:bg-metallic-secondary/90"
                      onClick={() => handleAddToCart(product.id)}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
        </div>
      </div>
    </section>
  );

  const ProductsSection = () => (
    <section id="products" className="py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-bold text-metallic-primary mb-2">
              All Products
            </h2>
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

        <div
          className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-4" : "grid-cols-1"}`}
        >
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-metallic-light/30 rounded-xl h-32 mb-4"></div>
                <div className="bg-metallic-light/30 h-4 rounded mb-2"></div>
                <div className="bg-metallic-light/30 h-4 rounded w-2/3"></div>
              </div>
            ))
          ) : filteredProducts.length === 0 ? (
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
                  className={`${viewMode === "list" ? "w-32 h-32" : "h-32"} bg-gradient-to-br from-metallic-light to-metallic-background flex items-center justify-center relative`}
                >
                  <Package className="h-8 w-8 text-metallic-primary/30" />
                  {product.quantity < product.low_stock_threshold && (
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
                      Low Stock
                    </Badge>
                  )}
                </div>
                <div className={`${viewMode === "list" ? "flex-1" : ""}`}>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-metallic-primary mb-1">
                      {product.name}
                    </h3>
                    <p className="text-metallic-tertiary text-sm mb-2 line-clamp-1">
                      {product.description}
                    </p>
                    <div
                      className={`flex items-center ${viewMode === "list" ? "justify-between" : "justify-between"} mb-3`}
                    >
                      <span className="text-lg font-bold text-metallic-primary">
                        ${product.price}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Stock: {product.quantity}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      className={`${viewMode === "list" ? "w-auto" : "w-full"} bg-metallic-tertiary hover:bg-metallic-tertiary/90`}
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
      </div>
    </section>
  );

  const StatsSection = () => (
    <section className="py-16 bg-metallic-primary text-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold mb-2">
              {Array.isArray(products) ? products.length : 0}+
            </div>
            <div className="text-metallic-background/80">
              Products Available
            </div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">1000+</div>
            <div className="text-metallic-background/80">Happy Customers</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">99%</div>
            <div className="text-metallic-background/80">Satisfaction Rate</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">24/7</div>
            <div className="text-metallic-background/80">Customer Support</div>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen">
      {/* Temporary API Test Component */}
      <div className="fixed top-20 right-4 z-50 max-w-md">
        <ApiTest />
        <Card className="mt-2 border-2 border-green-500">
          <CardContent className="p-4">
            <Button
              onClick={loadProducts}
              disabled={isLoading}
              className="w-full mb-2"
            >
              {isLoading ? "Testing..." : "🔄 Test Products API"}
            </Button>
            <div className="text-xs text-gray-600">
              Products: {Array.isArray(products) ? products.length : "Invalid"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Public Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-metallic-light shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-metallic-primary to-metallic-secondary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EC</span>
              </div>
              <span className="text-xl font-semibold text-metallic-primary">
                EcommerceHub
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className="text-metallic-primary hover:text-metallic-secondary"
              >
                Home
              </Link>
              <a
                href="#products"
                className="text-metallic-primary hover:text-metallic-secondary"
              >
                Products
              </a>
              <Link
                to="/about"
                className="text-metallic-primary hover:text-metallic-secondary"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-metallic-primary hover:text-metallic-secondary"
              >
                Contact
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-metallic-light"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Cart
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="bg-metallic-primary hover:bg-metallic-primary/90"
                  >
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-metallic-light"
                  >
                    <Link to="/auth">Sign In</Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="bg-metallic-primary hover:bg-metallic-primary/90"
                  >
                    <Link to="/auth">Join Now</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        <HeroSection />
        <FeaturedSection />
        <ProductsSection />
        <StatsSection />
      </main>

      {/* Footer */}
      <footer className="bg-metallic-primary text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-metallic-secondary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">EC</span>
                </div>
                <span className="text-xl font-semibold">EcommerceHub</span>
              </div>
              <p className="text-metallic-background/80">
                Your trusted partner for quality products and exceptional
                service.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2 text-metallic-background/80">
                <div>
                  <Link to="/" className="hover:text-white">
                    Home
                  </Link>
                </div>
                <div>
                  <Link to="/products" className="hover:text-white">
                    Products
                  </Link>
                </div>
                <div>
                  <Link to="/about" className="hover:text-white">
                    About
                  </Link>
                </div>
                <div>
                  <Link to="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Customer Service</h3>
              <div className="space-y-2 text-metallic-background/80">
                <div>Support Center</div>
                <div>Shipping Info</div>
                <div>Returns</div>
                <div>FAQ</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <div className="space-y-2 text-metallic-background/80">
                <div>Newsletter</div>
                <div>Social Media</div>
                <div>Blog</div>
                <div>Community</div>
              </div>
            </div>
          </div>
          <div className="border-t border-metallic-secondary mt-8 pt-8 text-center text-metallic-background/80">
            <p>&copy; 2024 EcommerceHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
