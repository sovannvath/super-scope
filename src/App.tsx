import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";

// Import pages matching Laravel backend routes exactly
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import CustomerDashboard from "./pages/CustomerDashboard";
import AdminAnalytics from "./pages/AdminAnalytics";
import StaffOrderProcessing from "./pages/StaffOrderProcessing";
import ProductManagement from "./pages/ProductManagement";
import LowStockAlerts from "./pages/LowStockAlerts";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              {/* Public Routes - Match Laravel public routes exactly */}
              <Route path="/" element={<Homepage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Product Routes - Match Laravel GET /products and GET /products/{id} */}
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />

              {/* Customer Routes - Match Laravel protected routes */}
              <Route path="/cart" element={<Cart />} />
              <Route path="/orders" element={<Orders />} />
              <Route
                path="/dashboard/customer"
                element={<CustomerDashboard />}
              />

              {/* Admin Routes - Match Laravel admin routes */}
              <Route path="/dashboard/admin" element={<AdminAnalytics />} />
              <Route path="/products/low-stock" element={<LowStockAlerts />} />

              {/* Staff Routes - Match Laravel staff routes */}
              <Route
                path="/dashboard/staff"
                element={<StaffOrderProcessing />}
              />

              {/* Warehouse Routes - Match Laravel warehouse routes */}
              <Route path="/dashboard/warehouse" element={<LowStockAlerts />} />

              {/* Product Management (admin/staff) - Different from public products */}
              <Route
                path="/product-management"
                element={<ProductManagement />}
              />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
