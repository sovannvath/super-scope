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
  const publicRoutes = ["/", "/auth", "/login", "/register", "/products"];
  const isPublicRoute =
    publicRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/products/");

  // If it's a public route or user is not authenticated, show simple layout
  if (isPublicRoute || !isAuthenticated) {
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
