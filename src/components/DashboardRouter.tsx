import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const DashboardRouter: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    console.log("🔄 Dashboard Router - User:", user?.role);
  }, [user]);

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

  // Redirect based on user role
  switch (user?.role) {
    case "admin":
      return <Navigate to="/dashboard/admin" replace />;
    case "customer":
      return <Navigate to="/dashboard/customer" replace />;
    case "warehouse_manager":
      return <Navigate to="/dashboard/warehouse" replace />;
    case "staff":
      return <Navigate to="/dashboard/staff" replace />;
    default:
      // Default to customer dashboard for any unknown roles
      return <Navigate to="/dashboard/customer" replace />;
  }
};

export default DashboardRouter;
