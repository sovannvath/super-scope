import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Product, ProductFilters } from "@/api/products";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/molecules/ProductCard";
import {
  SearchAndFilter,
  FilterOptions,
} from "@/components/molecules/SearchAndFilter";
import {
  ProductLoading,
  EmptyProducts,
  ErrorState,
  InlineLoading,
} from "@/components/atoms/LoadingStates";
import { ChevronDown, RefreshCw } from "lucide-react";

interface ProductGridProps {
  initialFilters?: ProductFilters;
  filterOptions?: FilterOptions;
  showSearch?: boolean;
  showFilters?: boolean;
  showViewToggle?: boolean;
  variant?: "default" | "compact" | "featured";
  className?: string;
  onProductSelect?: (product: Product) => void;
  onProductEdit?: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  initialFilters = {},
  filterOptions = {
    categories: ["Electronics", "Clothing", "Books", "Home", "Sports"],
    priceRanges: [
      { label: "Under $25", min: 0, max: 25 },
      { label: "$25 - $50", min: 25, max: 50 },
      { label: "$50 - $100", min: 50, max: 100 },
      { label: "$100 - $200", min: 100, max: 200 },
      { label: "Over $200", min: 200, max: 10000 },
    ],
    sortOptions: [
      { label: "Name A-Z", value: "name:asc" },
      { label: "Name Z-A", value: "name:desc" },
      { label: "Price Low to High", value: "price:asc" },
      { label: "Price High to Low", value: "price:desc" },
      { label: "Newest First", value: "created_at:desc" },
      { label: "Oldest First", value: "created_at:asc" },
    ],
    statusOptions: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Featured", value: "featured" },
    ],
  },
  showSearch = true,
  showFilters = true,
  showViewToggle = true,
  variant = "default",
  className,
  onProductSelect,
  onProductEdit,
}) => {
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { products, loading, error, meta, refetch, loadMore, hasMore } =
    useProducts(filters);

  const handleFiltersChange = useCallback((newFilters: ProductFilters) => {
    setFilters(newFilters);
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (hasMore && !loading) {
      await loadMore();
    }
  }, [hasMore, loading, loadMore]);

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Loading state
  if (loading && products.length === 0) {
    return (
      <div className={cn("space-y-6", className)}>
        {showSearch && (
          <div className="h-16 bg-muted/30 rounded-lg animate-pulse" />
        )}
        <ProductLoading count={12} />
      </div>
    );
  }

  // Error state
  if (error && products.length === 0) {
    return (
      <div className={cn("space-y-6", className)}>
        {showSearch && (
          <SearchAndFilter
            filters={filters}
            onFiltersChange={handleFiltersChange}
            options={filterOptions}
            showViewToggle={showViewToggle}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        )}
        <ErrorState
          description={error}
          action={
            <Button onClick={handleRefresh} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          }
        />
      </div>
    );
  }

  // Empty state
  if (!loading && products.length === 0) {
    return (
      <div className={cn("space-y-6", className)}>
        {showSearch && (
          <SearchAndFilter
            filters={filters}
            onFiltersChange={handleFiltersChange}
            options={filterOptions}
            showViewToggle={showViewToggle}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        )}
        <EmptyProducts />
      </div>
    );
  }

  const gridClasses = {
    grid: {
      default: "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      compact: "grid gap-4 sm:grid-cols-1 lg:grid-cols-2",
      featured: "grid gap-8 sm:grid-cols-2 lg:grid-cols-3",
    },
    list: "space-y-4",
  };

  const currentGridClass =
    viewMode === "list" ? gridClasses.list : gridClasses.grid[variant];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search and Filters */}
      {showSearch && (
        <SearchAndFilter
          filters={filters}
          onFiltersChange={handleFiltersChange}
          options={showFilters ? filterOptions : undefined}
          showViewToggle={showViewToggle}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      )}

      {/* Results Summary */}
      {meta && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {products.length} of {meta.total} products
            {filters.search && ` for "${filters.search}"`}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4", { "animate-spin": loading })} />
          </Button>
        </div>
      )}

      {/* Product Grid */}
      <div className={currentGridClass}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            variant={viewMode === "list" ? "compact" : variant}
            onEdit={onProductEdit}
            onView={onProductSelect}
            className={cn({
              "hover:scale-105 transition-transform": variant === "featured",
            })}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center pt-8">
          <Button
            onClick={handleLoadMore}
            disabled={loading}
            variant="outline"
            size="lg"
          >
            {loading ? (
              <InlineLoading text="Loading more..." />
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Load More Products
              </>
            )}
          </Button>
        </div>
      )}

      {/* Loading overlay for load more */}
      {loading && products.length > 0 && (
        <div className="text-center py-4">
          <InlineLoading text="Loading more products..." />
        </div>
      )}
    </div>
  );
};

// Specialized versions
export const FeaturedProductGrid: React.FC<
  Omit<ProductGridProps, "variant">
> = (props) => <ProductGrid {...props} variant="featured" />;

export const CompactProductGrid: React.FC<Omit<ProductGridProps, "variant">> = (
  props,
) => <ProductGrid {...props} variant="compact" />;

// Admin/Management version with enhanced controls
export const ProductManagementGrid: React.FC<
  ProductGridProps & {
    onBulkAction?: (action: string, productIds: number[]) => void;
  }
> = ({ onBulkAction, ...props }) => {
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  const handleBulkAction = (action: string) => {
    if (selectedProducts.length > 0) {
      onBulkAction?.(action, selectedProducts);
      setSelectedProducts([]);
    }
  };

  return (
    <div>
      {selectedProducts.length > 0 && (
        <div className="mb-4 p-4 bg-muted rounded-lg flex items-center justify-between">
          <span className="text-sm">
            {selectedProducts.length} products selected
          </span>
          <div className="space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction("delete")}
            >
              Delete Selected
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction("export")}
            >
              Export Selected
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedProducts([])}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}
      <ProductGrid {...props} />
    </div>
  );
};
