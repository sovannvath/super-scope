import React from "react";
import { cn } from "@/lib/utils";
import { Loader2, Package, ShoppingCart, Bell } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className,
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <Loader2
      className={cn("animate-spin", sizeClasses[size], className)}
      aria-label="Loading"
    />
  );
};

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = "rectangular",
}) => {
  const variantClasses = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-muted",
        variantClasses[variant],
        className,
      )}
      role="status"
      aria-label="Loading content"
    />
  );
};

interface FullPageLoadingProps {
  message?: string;
  className?: string;
}

export const FullPageLoading: React.FC<FullPageLoadingProps> = ({
  message = "Loading...",
  className,
}) => (
  <div
    className={cn("flex min-h-screen items-center justify-center", className)}
    role="status"
    aria-live="polite"
  >
    <div className="text-center">
      <LoadingSpinner size="lg" className="mx-auto mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  </div>
);

interface ContentLoadingProps {
  rows?: number;
  className?: string;
}

export const ContentLoading: React.FC<ContentLoadingProps> = ({
  rows = 3,
  className,
}) => (
  <div
    className={cn("space-y-3", className)}
    role="status"
    aria-label="Loading content"
  >
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    ))}
  </div>
);

interface ProductLoadingProps {
  count?: number;
  className?: string;
}

export const ProductLoading: React.FC<ProductLoadingProps> = ({
  count = 6,
  className,
}) => (
  <div
    className={cn("grid gap-6 md:grid-cols-2 lg:grid-cols-3", className)}
    role="status"
    aria-label="Loading products"
  >
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="space-y-3">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    ))}
  </div>
);

interface TableLoadingProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const TableLoading: React.FC<TableLoadingProps> = ({
  rows = 5,
  columns = 4,
  className,
}) => (
  <div
    className={cn("space-y-3", className)}
    role="status"
    aria-label="Loading table"
  >
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-8 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

interface InlineLoadingProps {
  text?: string;
  size?: "sm" | "md";
  className?: string;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  text = "Loading",
  size = "sm",
  className,
}) => (
  <div
    className={cn("flex items-center space-x-2", className)}
    role="status"
    aria-live="polite"
  >
    <LoadingSpinner size={size} />
    <span className="text-sm text-muted-foreground">{text}</span>
  </div>
);

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Package,
  title,
  description,
  action,
  className,
}) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center py-12 text-center",
      className,
    )}
    role="region"
    aria-label="Empty state"
  >
    <Icon className="h-12 w-12 text-muted-foreground/50 mb-4" />
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    {description && (
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
    )}
    {action && <div>{action}</div>}
  </div>
);

interface ErrorStateProps {
  title?: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  description,
  action,
  className,
}) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center py-12 text-center",
      className,
    )}
    role="alert"
  >
    <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
      <span className="text-destructive text-xl">⚠</span>
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
    {action && <div>{action}</div>}
  </div>
);

// Specific empty states for different content types
export const EmptyProducts: React.FC<{ className?: string }> = ({
  className,
}) => (
  <EmptyState
    icon={Package}
    title="No products found"
    description="We couldn't find any products matching your criteria. Try adjusting your search or filters."
    className={className}
  />
);

export const EmptyCart: React.FC<{ className?: string }> = ({ className }) => (
  <EmptyState
    icon={ShoppingCart}
    title="Your cart is empty"
    description="Start shopping to add items to your cart."
    className={className}
  />
);

export const EmptyNotifications: React.FC<{ className?: string }> = ({
  className,
}) => (
  <EmptyState
    icon={Bell}
    title="No notifications"
    description="You're all caught up! No new notifications."
    className={className}
  />
);
