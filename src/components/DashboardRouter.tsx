import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const DashboardRouter: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log("🔄 Dashboard Router - Full User:", user);
    console.log("🔄 Dashboard Router - Role:", user?.role);
    console.log("🔄 Dashboard Router - Current Location:", location.pathname);
  }, [user, location]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Get role from different possible field names
  const userRole = user?.role || user?.user_type || user?.type;
  console.log("🔄 DashboardRouter using role:", userRole);

  // Redirect based on user role
  switch (userRole) {
    case "admin":
      return <Navigate to="/dashboard/admin" replace />;
    case "customer":
      return <Navigate to="/dashboard/customer" replace />;
    case "warehouse":
    case "warehouse_manager":
      return <Navigate to="/dashboard/warehouse" replace />;
    case "staff":
      return <Navigate to="/dashboard/staff" replace />;
    default:
      console.warn(
        "⚠️ Unknown or undefined role:",
        userRole,
        "- defaulting to customer",
      );
      // Default to customer dashboard for any unknown roles
      return <Navigate to="/dashboard/customer" replace />;
  }
};

export default DashboardRouter;
