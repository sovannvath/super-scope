import { User } from "@/api/auth";

export type UserRole = "admin" | "customer" | "staff" | "warehouse_manager";

export interface RoleConfig {
  label: string;
  description: string;
  permissions: string[];
  dashboardRoute: string;
  defaultRoute: string;
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  admin: {
    label: "Administrator",
    description: "Full system access and management capabilities",
    permissions: [
      "manage_users",
      "manage_products",
      "manage_orders",
      "view_analytics",
      "manage_system",
      "manage_inventory",
      "process_orders",
      "view_all_data",
    ],
    dashboardRoute: "/dashboard/admin",
    defaultRoute: "/dashboard/admin",
  },
  warehouse_manager: {
    label: "Warehouse Manager",
    description: "Inventory and warehouse operations management",
    permissions: [
      "manage_inventory",
      "manage_products",
      "view_low_stock",
      "approve_requests",
      "view_warehouse_analytics",
    ],
    dashboardRoute: "/dashboard/warehouse",
    defaultRoute: "/dashboard/warehouse",
  },
  staff: {
    label: "Staff Member",
    description: "Order processing and customer service",
    permissions: [
      "process_orders",
      "view_orders",
      "update_order_status",
      "view_customers",
      "manage_support_tickets",
    ],
    dashboardRoute: "/dashboard/staff",
    defaultRoute: "/dashboard/staff",
  },
  customer: {
    label: "Customer",
    description: "Shopping and order management",
    permissions: [
      "place_orders",
      "view_own_orders",
      "manage_cart",
      "view_products",
      "manage_profile",
    ],
    dashboardRoute: "/dashboard/customer",
    defaultRoute: "/",
  },
};

/**
 * Gets the user's role, with fallback to customer
 */
export function getUserRole(user: User | null): UserRole {
  if (!user) return "customer";
  return (user.role as UserRole) || "customer";
}

/**
 * Checks if user has a specific role
 */
export function hasRole(user: User | null, role: UserRole): boolean {
  return getUserRole(user) === role;
}

/**
 * Checks if user has any of the specified roles
 */
export function hasAnyRole(user: User | null, roles: UserRole[]): boolean {
  const userRole = getUserRole(user);
  return roles.includes(userRole);
}

/**
 * Checks if user has all of the specified roles (usually just one)
 */
export function hasAllRoles(user: User | null, roles: UserRole[]): boolean {
  const userRole = getUserRole(user);
  return roles.every((role) => role === userRole);
}

/**
 * Gets role configuration
 */
export function getRoleConfig(role: UserRole): RoleConfig {
  return ROLE_CONFIGS[role];
}

/**
 * Gets user's role configuration
 */
export function getUserRoleConfig(user: User | null): RoleConfig {
  const role = getUserRole(user);
  return getRoleConfig(role);
}

/**
 * Checks if user has a specific permission
 */
export function hasPermission(user: User | null, permission: string): boolean {
  const roleConfig = getUserRoleConfig(user);
  return roleConfig.permissions.includes(permission);
}

/**
 * Checks if user has any of the specified permissions
 */
export function hasAnyPermission(
  user: User | null,
  permissions: string[],
): boolean {
  return permissions.some((permission) => hasPermission(user, permission));
}

/**
 * Gets the default route for a user based on their role
 */
export function getDefaultRoute(user: User | null): string {
  const roleConfig = getUserRoleConfig(user);
  return roleConfig.defaultRoute;
}

/**
 * Gets the dashboard route for a user based on their role
 */
export function getDashboardRoute(user: User | null): string {
  const roleConfig = getUserRoleConfig(user);
  return roleConfig.dashboardRoute;
}

/**
 * Checks if a route is accessible to a user based on their role
 */
export function canAccessRoute(
  user: User | null,
  route: string,
  isAuthenticated: boolean,
): boolean {
  // Public routes (no authentication required)
  const publicRoutes = ["/", "/login", "/register", "/products"];
  if (publicRoutes.includes(route) || route.startsWith("/products/")) {
    return true;
  }

  // Protected routes require authentication
  if (!isAuthenticated) {
    return false;
  }

  const userRole = getUserRole(user);

  // Role-specific route access
  const roleRouteMap: Record<string, UserRole[]> = {
    "/dashboard/admin": ["admin"],
    "/dashboard/warehouse": ["warehouse_manager"],
    "/dashboard/staff": ["staff"],
    "/dashboard/customer": ["customer"],
    "/dashboard": ["admin", "warehouse_manager", "staff", "customer"],
    "/cart": ["customer"],
    "/orders": ["customer"],
    "/product-management": ["admin"],
    "/low-stock": ["admin", "warehouse_manager"],
    "/purchase-history": ["customer"],
    "/reorder-requests": ["admin", "warehouse_manager"],
  };

  const allowedRoles = roleRouteMap[route];
  if (allowedRoles) {
    return allowedRoles.includes(userRole);
  }

  // Default: allow access for authenticated users
  return true;
}

/**
 * Gets navigation items based on user role
 */
export function getNavigationItems(
  user: User | null,
  isAuthenticated: boolean,
) {
  if (!isAuthenticated) {
    return [
      { label: "Home", href: "/", icon: "Home" },
      { label: "Products", href: "/products", icon: "Package" },
      { label: "Login", href: "/login", icon: "LogIn" },
      { label: "Register", href: "/register", icon: "UserPlus" },
    ];
  }

  const userRole = getUserRole(user);
  const baseItems = [
    { label: "Home", href: "/", icon: "Home" },
    { label: "Products", href: "/products", icon: "Package" },
  ];

  const roleSpecificItems: Record<UserRole, any[]> = {
    admin: [
      { label: "Dashboard", href: "/dashboard/admin", icon: "LayoutDashboard" },
      {
        label: "Product Management",
        href: "/product-management",
        icon: "Settings",
      },
      { label: "Low Stock Alerts", href: "/low-stock", icon: "AlertTriangle" },
      { label: "Analytics", href: "/analytics", icon: "BarChart3" },
    ],
    warehouse_manager: [
      {
        label: "Dashboard",
        href: "/dashboard/warehouse",
        icon: "LayoutDashboard",
      },
      { label: "Inventory", href: "/product-management", icon: "Package2" },
      { label: "Low Stock", href: "/low-stock", icon: "AlertTriangle" },
      { label: "Requests", href: "/reorder-requests", icon: "FileText" },
    ],
    staff: [
      { label: "Dashboard", href: "/dashboard/staff", icon: "LayoutDashboard" },
      { label: "Orders", href: "/orders", icon: "ShoppingBag" },
      { label: "Processing", href: "/order-processing", icon: "Package" },
    ],
    customer: [
      {
        label: "Dashboard",
        href: "/dashboard/customer",
        icon: "LayoutDashboard",
      },
      { label: "Cart", href: "/cart", icon: "ShoppingCart" },
      { label: "Orders", href: "/orders", icon: "Package" },
      { label: "Purchase History", href: "/purchase-history", icon: "History" },
    ],
  };

  return [...baseItems, ...roleSpecificItems[userRole]];
}

/**
 * Gets role-specific dashboard stats/metrics
 */
export function getRoleDashboardConfig(role: UserRole) {
  const configs = {
    admin: {
      title: "Admin Dashboard",
      metrics: [
        "total_products",
        "total_orders",
        "total_revenue",
        "low_stock_items",
        "pending_orders",
        "total_customers",
      ],
      charts: [
        "revenue_trend",
        "order_status_distribution",
        "product_categories",
      ],
      actions: ["add_product", "manage_users", "view_analytics"],
    },
    warehouse_manager: {
      title: "Warehouse Dashboard",
      metrics: [
        "total_inventory",
        "low_stock_items",
        "pending_requests",
        "recent_updates",
      ],
      charts: ["inventory_levels", "stock_movements", "request_approvals"],
      actions: ["manage_inventory", "approve_requests", "update_stock"],
    },
    staff: {
      title: "Staff Dashboard",
      metrics: [
        "pending_orders",
        "processing_orders",
        "completed_today",
        "customer_inquiries",
      ],
      charts: ["order_processing_time", "daily_completions"],
      actions: ["process_orders", "update_status", "contact_customers"],
    },
    customer: {
      title: "My Account",
      metrics: ["cart_items", "recent_orders", "total_spent", "loyalty_points"],
      charts: ["spending_history", "order_frequency"],
      actions: ["place_order", "track_orders", "manage_profile"],
    },
  };

  return configs[role];
}

/**
 * Formats role display name
 */
export function formatRoleName(role: string): string {
  const config = ROLE_CONFIGS[role as UserRole];
  return config
    ? config.label
    : role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Gets role hierarchy level (higher number = more permissions)
 */
export function getRoleLevel(role: UserRole): number {
  const levels = {
    customer: 1,
    staff: 2,
    warehouse_manager: 3,
    admin: 4,
  };
  return levels[role] || 0;
}

/**
 * Checks if user has higher or equal role level
 */
export function hasMinimumRoleLevel(
  user: User | null,
  minimumRole: UserRole,
): boolean {
  const userLevel = getRoleLevel(getUserRole(user));
  const minimumLevel = getRoleLevel(minimumRole);
  return userLevel >= minimumLevel;
}
