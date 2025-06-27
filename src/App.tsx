import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
import { CartProvider } from "@/contexts/CartContext";

import { Layout } from "@/components/layout/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardRouter from "@/components/DashboardRouter";
import NetworkStatus from "@/components/NetworkStatus";

// Import pages matching Laravel backend routes exactly
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderSuccess from "./pages/OrderSuccess";
import CustomerDashboard from "./pages/CustomerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import ProductManagement from "./pages/ProductManagement";
import LowStockAlerts from "./pages/LowStockAlerts";
import WarehouseDashboard from "./pages/WarehouseDashboard";
import PurchaseHistory from "./pages/PurchaseHistory";
import NotFound from "./pages/NotFound";
import TestPage from "./pages/TestPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => {
  console.log("🚀 App component loaded");
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppProvider>
            <CartProvider>
              <Toaster />
              <Sonner />
              <NetworkStatus />
              <BrowserRouter>
                <Layout>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Homepage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/test" element={<TestPage />} />

                    {/* Import new components */}
                    <Route
                      path="/checkout"
                      element={
                        <ProtectedRoute allowedRoles={["customer"]}>
                          <Checkout />
                        </ProtectedRoute>
                      }
                    />

                    {/* Dashboard Router - Redirects to appropriate dashboard based on role */}
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute requireAuth={true}>
                          <DashboardRouter />
                        </ProtectedRoute>
                      }
                    />

                    {/* Admin Routes */}
                    <Route
                      path="/dashboard/admin"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/products"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <ProductManagement />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/product-management"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <ProductManagement />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/low-stock"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <LowStockAlerts />
                        </ProtectedRoute>
                      }
                    />

                    {/* Customer Routes */}
                    <Route
                      path="/cart"
                      element={
                        <ProtectedRoute allowedRoles={["customer"]}>
                          <Cart />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/orders"
                      element={
                        <ProtectedRoute allowedRoles={["customer"]}>
                          <Orders />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/orders/:id"
                      element={
                        <ProtectedRoute allowedRoles={["customer"]}>
                          <Orders />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/order-success/:orderId"
                      element={
                        <ProtectedRoute allowedRoles={["customer"]}>
                          <OrderSuccess />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/customer"
                      element={
                        <ProtectedRoute allowedRoles={["customer"]}>
                          <CustomerDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/purchase-history"
                      element={
                        <ProtectedRoute allowedRoles={["customer"]}>
                          <PurchaseHistory />
                        </ProtectedRoute>
                      }
                    />

                    {/* Staff Routes */}
                    <Route
                      path="/dashboard/staff"
                      element={
                        <ProtectedRoute allowedRoles={["staff"]}>
                          <StaffDashboard />
                        </ProtectedRoute>
                      }
                    />

                    {/* Warehouse Manager Routes */}
                    <Route
                      path="/dashboard/warehouse"
                      element={
                        <ProtectedRoute allowedRoles={["warehouse_manager"]}>
                          <WarehouseDashboard />
                        </ProtectedRoute>
                      }
                    />

                    {/* Shared Protected Routes (multiple roles) */}
                    <Route
                      path="/reorder-requests"
                      element={
                        <ProtectedRoute
                          allowedRoles={["admin", "warehouse_manager"]}
                        >
                          <WarehouseDashboard />
                        </ProtectedRoute>
                      }
                    />

                    {/* Catch-all route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </BrowserRouter>
            </CartProvider>
          </AppProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
