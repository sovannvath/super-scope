import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Product } from "@/api/products";
import { useAuth } from "@/contexts/AuthContext";
import { useCartContext } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { RoleGuard } from "@/components/atoms/RoleGuard";
import { ProductImage } from "@/components/atoms/ProductImage";
import {
  ShoppingCart,
  Heart,
  Star,
  AlertTriangle,
  Eye,
  Edit,
} from "lucide-react";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "compact" | "featured";
  showActions?: boolean;
  showDescription?: boolean;
  className?: string;
  onEdit?: (product: Product) => void;
  onView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  variant = "default",
  showActions = true,
  showDescription = true,
  className,
  onEdit,
  onView,
}) => {
  const { isAuthenticated } = useAuth();
  const { addItem } = useCartContext();
  const { toast } = useToast();
  const [addingToCart, setAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items to your cart",
        variant: "destructive",
      });
      return;
    }

    try {
      setAddingToCart(true);
      console.log(`🛒 ProductCard: Adding product ${product.id} to cart`);

      const success = await addItem({
        product_id: product.id,
        quantity: 1,
      });

      if (success) {
        console.log(
          `✅ ProductCard: Successfully added ${product.name} to cart`,
        );
        // Toast is already shown by the cart hook
      } else {
        console.log(`❌ ProductCard: Failed to add ${product.name} to cart`);
        // Error toast is already shown by the cart hook
      }
    } catch (error: any) {
      console.error("❌ ProductCard: Unexpected error adding to cart:", error);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const isLowStock = product.quantity < product.low_stock_threshold;
  const isOutOfStock = product.quantity === 0;

  const cardContent = (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-200 hover:shadow-lg",
        {
          "h-full": variant === "default",
          "h-32 flex-row": variant === "compact",
          "h-80": variant === "featured",
        },
        className,
      )}
    >
      {/* Product Image */}
      <div className="relative">
        <ProductImage
          src={product.image}
          alt={product.name}
          className={cn({
            "h-48": variant === "default",
            "w-32 h-32": variant === "compact",
            "h-56": variant === "featured",
          })}
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 space-y-1">
          {isOutOfStock && (
            <Badge variant="destructive" className="text-xs">
              Out of Stock
            </Badge>
          )}
          {isLowStock && !isOutOfStock && (
            <Badge
              variant="outline"
              className="text-xs border-orange-500 text-orange-700"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              Low Stock
            </Badge>
          )}
          {product.status === "featured" && (
            <Badge variant="secondary" className="text-xs">
              Featured
            </Badge>
          )}
        </div>

        {/* Actions Overlay */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity space-y-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="bg-background/90 h-8 w-8 p-0"
                onClick={(e) => {
                  e.preventDefault();
                  onView?.(product);
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>View Details</TooltipContent>
          </Tooltip>

          <RoleGuard roles={["admin", "warehouse_manager"]}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-background/90 h-8 w-8 p-0"
                  onClick={(e) => {
                    e.preventDefault();
                    onEdit?.(product);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit Product</TooltipContent>
            </Tooltip>
          </RoleGuard>

          <RoleGuard roles={["customer"]}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-background/90 h-8 w-8 p-0"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add to Wishlist</TooltipContent>
            </Tooltip>
          </RoleGuard>
        </div>
      </div>

      {/* Content */}
      <CardContent
        className={cn("p-4", {
          "flex-1": variant === "compact",
        })}
      >
        <div className="flex items-start justify-between mb-2">
          <h3
            className={cn(
              "font-semibold text-foreground group-hover:text-primary transition-colors",
              {
                "text-sm": variant === "compact",
                "text-lg": variant === "featured",
              },
            )}
          >
            {product.name}
          </h3>
          {variant !== "compact" && (
            <div className="flex items-center">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span className="text-xs text-muted-foreground ml-1">4.5</span>
            </div>
          )}
        </div>

        {showDescription && variant !== "compact" && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between mb-3">
          <span
            className={cn("font-bold text-primary", {
              "text-lg": variant === "default",
              "text-sm": variant === "compact",
              "text-xl": variant === "featured",
            })}
          >
            ${parseFloat(product.price).toFixed(2)}
          </span>
          <Badge variant="outline" className="text-xs">
            Stock: {product.quantity}
          </Badge>
        </div>

        {/* Categories */}
        {product.categories &&
          product.categories.length > 0 &&
          variant !== "compact" && (
            <div className="flex flex-wrap gap-1 mb-2">
              {product.categories.slice(0, 2).map((category) => (
                <Badge
                  key={category.id}
                  variant="secondary"
                  className="text-xs"
                >
                  {category.name}
                </Badge>
              ))}
              {product.categories.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{product.categories.length - 2} more
                </Badge>
              )}
            </div>
          )}
      </CardContent>

      {/* Actions */}
      {showActions && (
        <CardFooter
          className={cn("p-4 pt-0", {
            hidden: variant === "compact",
          })}
        >
          <div className="flex gap-2 w-full">
            <RoleGuard roles={["customer"]} fallback={null}>
              <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart}
                className="flex-1"
                size={variant === "featured" ? "default" : "sm"}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {addingToCart
                  ? "Adding..."
                  : isOutOfStock
                    ? "Out of Stock"
                    : "Add to Cart"}
              </Button>
            </RoleGuard>

            <RoleGuard roles={["admin", "warehouse_manager", "staff"]}>
              <Button
                variant="outline"
                size={variant === "featured" ? "default" : "sm"}
                onClick={() => onView?.(product)}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </RoleGuard>
          </div>
        </CardFooter>
      )}
    </Card>
  );

  // Wrap with link for navigation
  if (variant === "compact" || !showActions) {
    return (
      <Link to={`/products/${product.id}`} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

// Specialized variants
export const FeaturedProductCard: React.FC<
  Omit<ProductCardProps, "variant">
> = (props) => <ProductCard {...props} variant="featured" />;

export const CompactProductCard: React.FC<Omit<ProductCardProps, "variant">> = (
  props,
) => <ProductCard {...props} variant="compact" showActions={false} />;
