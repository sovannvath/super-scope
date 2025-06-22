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
  // Customer Navigation
  {
    label: "Dashboard",
    href: "/dashboard/customer",
    icon: LayoutDashboard,
    roles: ["customer"],
  },
  {
    label: "Shop Products",
    href: "/",
    icon: Package,
    roles: ["customer"],
  },
  {
    label: "My Cart",
    href: "/cart",
    icon: ShoppingCart,
    roles: ["customer"],
  },
  {
    label: "My Orders",
    href: "/orders",
    icon: ClipboardList,
    roles: ["customer"],
  },

  // Admin Navigation
  {
    label: "Admin Dashboard",
    href: "/dashboard/admin",
    icon: TrendingUp,
    roles: ["admin"],
  },
  {
    label: "Product Management",
    href: "/product-management",
    icon: Store,
    roles: ["admin"],
  },
  {
    label: "Low Stock Alerts",
    href: "/low-stock",
    icon: AlertTriangle,
    roles: ["admin"],
  },

  // Staff Navigation
  {
    label: "Staff Dashboard",
    href: "/dashboard/staff",
    icon: LayoutDashboard,
    roles: ["staff"],
  },
  {
    label: "Order Processing",
    href: "/order-processing",
    icon: Truck,
    roles: ["staff"],
  },

  // Warehouse Navigation
  {
    label: "Warehouse Dashboard",
    href: "/dashboard/warehouse",
    icon: LayoutDashboard,
    roles: ["warehouse_manager"],
  },
  {
    label: "Restock Requests",
    href: "/reorder-requests",
    icon: Truck,
    roles: ["admin", "warehouse_manager"],
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
        {filteredItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={`${item.href}-${item.label}-${index}`}
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
