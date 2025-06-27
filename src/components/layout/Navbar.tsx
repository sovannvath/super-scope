import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useCartContext } from "@/contexts/CartContext";
import { LogOut, Settings, User, ShoppingCart, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  // Safely get cart context with fallback
  let itemCount = 0;
  let cartLoading = false;
  let hasCartError = false;
  try {
    const cartContext = useCartContext();
    itemCount = cartContext?.itemCount || 0;
    cartLoading = cartContext?.loading || false;
    hasCartError = !!cartContext?.error;
  } catch (error) {
    console.warn("Cart context not available in Navbar:", error);
    hasCartError = true;
  }

  const handleLogout = async () => {
    await logout();
  };

  const getUserInitials = (name?: string) => {
    if (!name) return "U";

    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-metallic-primary text-white";
      case "warehouse":
        return "bg-metallic-secondary text-white";
      case "staff":
        return "bg-metallic-tertiary text-white";
      default:
        return "bg-metallic-light text-metallic-primary";
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-metallic-light shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-metallic-primary to-metallic-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">EC</span>
            </div>
            <h1 className="text-xl font-semibold text-metallic-primary">
              EcommerceHub
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative hover:bg-metallic-light/20"
          >
            <Bell className="h-5 w-5 text-metallic-primary" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-red-500 text-white text-xs">
              3
            </Badge>
          </Button>

          {/* Shopping Cart (for customers) */}
          {user?.role === "customer" && (
            <Button
              variant="ghost"
              size="sm"
              className="relative hover:bg-metallic-light/20"
              asChild
            >
              <Link to="/cart">
                <ShoppingCart
                  className={`h-5 w-5 ${
                    hasCartError
                      ? "text-red-500"
                      : cartLoading
                        ? "text-gray-400"
                        : "text-metallic-primary"
                  } ${cartLoading ? "animate-pulse" : ""}`}
                />
                {cartLoading && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full animate-ping"></div>
                )}
                {!cartLoading && itemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-metallic-secondary text-white text-xs">
                    {itemCount > 99 ? "99+" : itemCount}
                  </Badge>
                )}
                {!cartLoading && hasCartError && (
                  <Badge className="absolute -top-1 -right-1 h-3 w-3 p-0 bg-red-500 text-white text-xs">
                    !
                  </Badge>
                )}
              </Link>
            </Button>
          )}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-2 hover:bg-metallic-light/20"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-metallic-primary text-white text-sm">
                    {getUserInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-medium text-metallic-primary">
                    {user?.name || "User"}
                  </p>
                  <Badge
                    className={`text-xs ${getRoleBadgeColor(typeof user?.role === "string" ? user.role : "customer")}`}
                  >
                    {typeof user?.role === "string" ? user.role : "customer"}
                  </Badge>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};
