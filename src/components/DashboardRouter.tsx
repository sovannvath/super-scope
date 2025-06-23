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
  console.log("🔄 DashboardRouter user object:", user);
  console.log("🔄 DashboardRouter role_id:", user?.role_id);

  // Determine the correct dashboard route for this user
  let correctRoute = "/dashboard/customer"; // default

  switch (userRole) {
    case "admin":
      correctRoute = "/dashboard/admin";
      break;
    case "customer":
      correctRoute = "/dashboard/customer";
      break;
    case "warehouse":
    case "warehouse_manager":
      correctRoute = "/dashboard/warehouse";
      break;
    case "staff":
      correctRoute = "/dashboard/staff";
      break;
    default:
      console.warn(
        "⚠️ Unknown or undefined role:",
        userRole,
        "- defaulting to customer",
      );
      correctRoute = "/dashboard/customer";
  }

  // If user is on a different dashboard route than their role allows, redirect
  if (
    location.pathname !== correctRoute &&
    location.pathname.startsWith("/dashboard/")
  ) {
    console.log(
      `🔄 Redirecting from ${location.pathname} to ${correctRoute} for role ${userRole}`,
    );
    // Force navigation to correct route using window.location for clean redirect
    window.location.href = correctRoute;
    return null;
  }

  // Navigate to the correct dashboard
  return <Navigate to={correctRoute} replace />;
};

export default DashboardRouter;
