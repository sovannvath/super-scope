import React from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Public routes that don't need authentication layout
  const publicRoutes = ["/", "/login", "/register"];
  const isPublicRoute =
    publicRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/products");

  // Routes that should use simple layout regardless of auth status
  const alwaysSimpleLayout = [
    "/",
    "/login",
    "/register",
    "/products",
    "/test",
    "/cart",
  ];
  const useSimpleLayout = alwaysSimpleLayout.some(
    (route) =>
      location.pathname === route || location.pathname.startsWith(route + "/"),
  );

  console.log("🔍 Layout Debug:", {
    currentPath: location.pathname,
    isAuthenticated,
    useSimpleLayout,
    alwaysSimpleLayout,
  });

  // Use simple layout for public routes and specific pages
  if (useSimpleLayout) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  // Authenticated layout with navbar and sidebar
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-6 pt-20">{children}</main>
      </div>
    </div>
  );
};
