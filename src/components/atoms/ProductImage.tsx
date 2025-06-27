import React, { useState } from "react";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  loading?: "lazy" | "eager";
  onError?: () => void;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className,
  fallbackClassName,
  loading = "lazy",
  onError,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
    onError?.();
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  if (!src || imageError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-muted to-muted/50",
          fallbackClassName,
          className,
        )}
      >
        <Package className="h-8 w-8 text-muted-foreground/30" />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          "object-cover w-full h-full transition-opacity duration-300",
          imageLoaded ? "opacity-100" : "opacity-0",
        )}
        loading={loading}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    </div>
  );
};

export default ProductImage;
