import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  requireAuth = true,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && user) {
    // Get role from different possible field names
    const userRole = user.role || user.user_type || user.type || "customer";
    const hasAccess = allowedRoles.includes(userRole);

    if (!hasAccess) {
      // Instead of showing access denied, redirect to appropriate dashboard
      let redirectPath;
      switch (userRole) {
        case "admin":
          redirectPath = "/dashboard/admin";
          break;
        case "staff":
          redirectPath = "/dashboard/staff";
          break;
        case "warehouse":
        case "warehouse_manager":
          redirectPath = "/dashboard/warehouse";
          break;
        case "customer":
        default:
          redirectPath = "/dashboard/customer";
          break;
      }

      console.log(
        `🔄 Access denied for ${userRole} to ${allowedRoles.join(",")}. Redirecting to ${redirectPath}`,
      );

      return <Navigate to={redirectPath} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
