import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { productApi, cartApi } from "@/lib/api";
import {
  ShoppingCart,
  Star,
  Heart,
  Package,
  ArrowLeft,
  Plus,
  Minus,
  Shield,
  Truck,
  RotateCcw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct(parseInt(id));
    }
  }, [id]);

  const loadProduct = async (productId: number) => {
    console.log(`🔄 Loading product ${productId} from API...`);
    console.log(
      "📍 Full API URL:",
      `https://laravel-wtc.onrender.com/api/products/${productId}`,
    );

    try {
      const response = await productApi.show(productId);
      console.log("📡 API Response:", response);

      if (response.status === 200) {
        // Extract product from response.data.product
        const productData = response.data.product || response.data;
        if (!productData) {
          throw new Error("No product data found in response");
        }

        setProduct(productData);
        console.log("✅ Product loaded:", productData);
      } else {
        console.error("❌ API Error:", response.status, response.statusText);
        toast({
          title: "Failed to Load Product",
          description: `API Error: ${response.status} ${response.statusText}`,
          variant: "destructive",
        });
        navigate("/products");
      }
    } catch (error: any) {
      console.error("❌ API connection failed:", error.message, error);
      toast({
        title: "Backend Connection Error",
        description: error.message || "Cannot connect to Laravel API",
        variant: "destructive",
      });
      navigate("/products");
    } finally {
      setregistry: {
        setIsLoading(false);
      }
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items to your cart",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!product) return;

    setIsAddingToCart(true);
    try {
      const response = await cartApi.addItem({
        product_id: product.id,
        quantity: quantity,
      });

      if (response.status === 200 || response.status === 201) {
        toast({
          title: "Added to Cart",
          description: `${quantity} ${product.name}${quantity > 1 ? "s" : ""} added to your cart`,
        });
      } else {
        toast({
          title: "Error",
          description: response.data?.message || "Failed to add to cart",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          error.message ||
          "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-metallic-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-16 w-16 text-metallic-light mb-4" />
          <h3 className="text-lg font-semibold text-metallic-primary mb-2">
            Product Not Found
          </h3>
          <p className="text-metallic-tertiary mb-4">
            The product you're looking for doesn't exist
          </p>
          <Button onClick={() => navigate("/products")}>
            Browse All Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-metallic-background/30 to-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/products")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Product Image */}
          <Card>
            <CardContent className="p-0">
              <div className="h-96 bg-gradient-to-br from-metallic-light to-metallic-background flex items-center justify-center relative rounded-lg">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="object-cover w-full h-full rounded-lg"
                  />
                ) : (
                  <Package className="h-24 w-24 text-metallic-primary/30" />
                )}
                {product.quantity < product.low_stock_threshold && (
                  <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                    Low Stock
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-metallic-primary mb-2">
                {product.name}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    (4.5) 123 reviews
                  </span>
                </div>
                <Badge
                  variant={
                    product.quantity > product.low_stock_threshold
                      ? "default"
                      : "destructive"
                  }
                >
                  {product.quantity > 0 ? "In Stock" : "Out of Stock"}
                </Badge>
              </div>
              <p className="text-4xl font-bold text-metallic-primary mb-4">
                ${parseFloat(product.price).toFixed(2)}
              </p>
              <p className="text-metallic-tertiary text-lg leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Stock Information */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Available Stock:</span>
                  <span
                    className={`font-bold ${product.quantity < product.low_stock_threshold ? "text-red-600" : "text-green-600"}`}
                  >
                    {product.quantity} units
                  </span>
                </div>
                {product.quantity < product.low_stock_threshold && (
                  <p className="text-sm text-red-600 mt-2">
                    Only {product.quantity} left in stock!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quantity Selector */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value >= 1 && value <= product.quantity) {
                        setQuantity(value);
                      }
                    }}
                    className="w-20 text-center"
                    min="1"
                    max={product.quantity}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={incrementQuantity}
                    disabled={quantity >= product.quantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="flex space-x-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || product.quantity === 0}
                  className="flex-1 bg-metallic-primary hover:bg-metallic-primary/90"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {isAddingToCart
                    ? "Adding..."
                    : `Add ${quantity} to Cart - $${(parseFloat(product.price) * quantity).toFixed(2)}`}
                </Button>
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Product Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Quality Guaranteed</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Truck className="h-5 w-5 text-blue-600" />
                  <span className="text-sm">
                    Free Shipping on orders over $50
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <RotateCcw className="h-5 w-5 text-orange-600" />
                  <span className="text-sm">30-day return policy</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Details */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">Specifications</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Product ID:</span>
                    <span>#{product.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stock Threshold:</span>
                    <span>{product.low_stock_threshold} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Added:</span>
                    <span>
                      {new Date(product.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Updated:</span>
                    <span>
                      {new Date(product.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductDetail;
