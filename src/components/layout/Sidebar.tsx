import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ClipboardList,
  Users,
  TrendingUp,
  AlertTriangle,
  Truck,
  FileText,
  Settings,
  CreditCard,
  Store,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

const navigationItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "customer", "warehouse", "staff"],
  },
  {
    label: "Products",
    href: "/products",
    icon: Package,
    roles: ["customer"],
  },
  {
    label: "Product Management",
    href: "/product-management",
    icon: Store,
    roles: ["admin", "warehouse"],
  },
  {
    label: "Inventory",
    href: "/inventory",
    icon: Store,
    roles: ["admin", "warehouse"],
  },
  {
    label: "Orders",
    href: "/orders",
    icon: ClipboardList,
    roles: ["staff"],
  },
  {
    label: "Order Processing",
    href: "/orders",
    icon: ClipboardList,
    roles: ["admin", "staff"],
  },
  {
    label: "Shopping Cart",
    href: "/cart",
    icon: ShoppingCart,
    roles: ["customer"],
  },
  {
    label: "Purchase History",
    href: "/purchase-history",
    icon: FileText,
    roles: ["customer"],
  },
  {
    label: "Warehouse Approval",
    href: "/restock-requests",
    icon: Truck,
    roles: ["warehouse"],
  },
  {
    label: "Low Stock Alerts",
    href: "/low-stock",
    icon: AlertTriangle,
    roles: ["admin", "warehouse"],
  },
  {
    label: "Admin Analytics",
    href: "/analytics",
    icon: TrendingUp,
    roles: ["admin"],
  },
  {
    label: "Users",
    href: "/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    label: "Payment Methods",
    href: "/payment-methods",
    icon: CreditCard,
    roles: ["admin"],
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["admin", "customer", "warehouse", "staff"],
  },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const filteredItems = navigationItems.filter((item) =>
    user?.role ? item.roles.includes(user.role) : false,
  );

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-metallic-light overflow-y-auto">
      <nav className="p-4 space-y-2">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-metallic-primary text-white shadow-md"
                  : "text-metallic-primary hover:bg-metallic-light/20 hover:text-metallic-primary",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Role Badge */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-gradient-to-r from-metallic-secondary to-metallic-tertiary rounded-lg p-3 text-center">
          <p className="text-white text-sm font-medium">
            {user?.role?.toUpperCase()} PANEL
          </p>
        </div>
      </div>
    </aside>
  );
};
