import React, { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  Grid3X3,
  List,
  ArrowUpDown,
} from "lucide-react";

export interface FilterOptions {
  categories?: string[];
  priceRanges?: { label: string; min: number; max: number }[];
  sortOptions?: { label: string; value: string }[];
  statusOptions?: { label: string; value: string }[];
}

export interface SearchFilters {
  search?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  status?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  in_stock?: boolean;
}

interface SearchAndFilterProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  options?: FilterOptions;
  placeholder?: string;
  showViewToggle?: boolean;
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
  className?: string;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  filters,
  onFiltersChange,
  options = {},
  placeholder = "Search products...",
  showViewToggle = true,
  viewMode = "grid",
  onViewModeChange,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState(filters.search || "");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== filters.search) {
        onFiltersChange({ ...filters, search: searchQuery || undefined });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, filters, onFiltersChange]);

  const handleFilterChange = useCallback(
    (key: keyof SearchFilters, value: any) => {
      const newFilters = { ...filters };
      if (value === undefined || value === "" || value === null) {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      onFiltersChange(newFilters);
    },
    [filters, onFiltersChange],
  );

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    onFiltersChange({ search: undefined });
  }, [onFiltersChange]);

  const clearSpecificFilter = useCallback(
    (key: keyof SearchFilters) => {
      handleFilterChange(key, undefined);
    },
    [handleFilterChange],
  );

  const activeFiltersCount = Object.values(filters).filter(
    (value) => value !== undefined && value !== "",
  ).length;

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Quick Sort */}
        {options.sortOptions && (
          <Select
            value={`${filters.sort_by || ""}:${filters.sort_order || "asc"}`}
            onValueChange={(value) => {
              const [sort_by, sort_order] = value.split(":");
              handleFilterChange("sort_by", sort_by || undefined);
              handleFilterChange("sort_order", sort_order as "asc" | "desc");
            }}
          >
            <SelectTrigger className="w-full sm:w-48">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              {options.sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Advanced Filters */}
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge className="ml-2 h-5 w-5 p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Filters</h4>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-auto p-1 text-xs"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              <Separator />

              {/* Category Filter */}
              {options.categories && (
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={filters.category || ""}
                    onValueChange={(value) =>
                      handleFilterChange("category", value || undefined)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      {options.categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Price Range Filter */}
              {options.priceRanges && (
                <div className="space-y-2">
                  <Label>Price Range</Label>
                  <Select
                    value={
                      filters.min_price && filters.max_price
                        ? `${filters.min_price}-${filters.max_price}`
                        : ""
                    }
                    onValueChange={(value) => {
                      if (!value) {
                        handleFilterChange("min_price", undefined);
                        handleFilterChange("max_price", undefined);
                      } else {
                        const [min, max] = value.split("-").map(Number);
                        handleFilterChange("min_price", min);
                        handleFilterChange("max_price", max);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any price" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any price</SelectItem>
                      {options.priceRanges.map((range) => (
                        <SelectItem
                          key={`${range.min}-${range.max}`}
                          value={`${range.min}-${range.max}`}
                        >
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Status Filter */}
              {options.statusOptions && (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={filters.status || ""}
                    onValueChange={(value) =>
                      handleFilterChange("status", value || undefined)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      {options.statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Stock Filter */}
              <div className="space-y-2">
                <Label>Stock Status</Label>
                <Select
                  value={
                    filters.in_stock === true
                      ? "in_stock"
                      : filters.in_stock === false
                        ? "out_of_stock"
                        : ""
                  }
                  onValueChange={(value) => {
                    if (value === "in_stock") {
                      handleFilterChange("in_stock", true);
                    } else if (value === "out_of_stock") {
                      handleFilterChange("in_stock", false);
                    } else {
                      handleFilterChange("in_stock", undefined);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All items" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All items</SelectItem>
                    <SelectItem value="in_stock">In stock only</SelectItem>
                    <SelectItem value="out_of_stock">Out of stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* View Toggle */}
        {showViewToggle && onViewModeChange && (
          <div className="flex border border-input rounded-md overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className="rounded-none border-0"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className="rounded-none border-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="pr-1">
              Search: {filters.search}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => clearSpecificFilter("search")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.category && (
            <Badge variant="secondary" className="pr-1">
              Category: {filters.category}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => clearSpecificFilter("category")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.min_price && filters.max_price && (
            <Badge variant="secondary" className="pr-1">
              Price: ${filters.min_price} - ${filters.max_price}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => {
                  clearSpecificFilter("min_price");
                  clearSpecificFilter("max_price");
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.status && (
            <Badge variant="secondary" className="pr-1">
              Status: {filters.status}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => clearSpecificFilter("status")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.in_stock !== undefined && (
            <Badge variant="secondary" className="pr-1">
              {filters.in_stock ? "In stock only" : "Out of stock"}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => clearSpecificFilter("in_stock")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
