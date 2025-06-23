import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi, saveToken } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, LogIn } from "lucide-react";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate form data before sending
    if (!loginForm.email || !loginForm.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!loginForm.email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    console.log("🔑 Login form data:", loginForm);

    // Check for backend accounts first - always try real backend authentication
    console.log("🔑 Attempting real backend authentication...");

    // Try real backend authentication first
    try {
      const response = await authApi.login(loginForm);
      console.log("🔍 Backend login response:", response);

      if (response.status === 200 && response.data) {
        const { user, token } = response.data;
        console.log("🔍 Backend user:", user);

        saveToken(token);
        login(user);

        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.name}!`,
        });

        // Always map role_id to role name for consistent navigation
        console.log("🔍 Backend user object:", user);
        console.log("🔍 user.role_id:", user.role_id, typeof user.role_id);
        console.log("🔍 user.role:", user.role);

        // Force role mapping based on role_id (backend uses role_id)
        const roleMapping = {
          1: "admin",
          2: "warehouse_manager",
          3: "customer",
          4: "staff",
        };

        const userRole =
          roleMapping[user.role_id as keyof typeof roleMapping] || "customer";
        user.role = userRole; // Update user object with mapped role

        console.log(
          "🔍 Mapped role_id",
          user.role_id,
          "to userRole:",
          userRole,
        );

        // Navigate based on role
        let targetRoute = "/dashboard/customer"; // default

        switch (userRole) {
          case "admin":
            targetRoute = "/dashboard/admin";
            break;
          case "warehouse_manager":
            targetRoute = "/dashboard/warehouse";
            break;
          case "staff":
            targetRoute = "/dashboard/staff";
            break;
          case "customer":
          default:
            targetRoute = "/dashboard/customer";
            break;
        }

        console.log("🔍 Target route for role", userRole, ":", targetRoute);

        // Use window.location to force a full page reload and ensure correct dashboard loads
        window.location.href = targetRoute;
        setIsLoading(false);
        return;
      }
    } catch (backendError) {
      console.log(
        "⚠️ Backend authentication failed, trying fallback mock accounts:",
        backendError,
      );
    }

    // Fallback mock accounts (matching real backend credentials for testing)
    const mockAccounts = {
      "admin@example.com": {
        email: "admin@example.com",
        password: "seng1234",
        user: {
          id: 1,
          name: "Admin User",
          email: "admin@example.com",
          role: "admin",
          role_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        token: "mock-token-admin",
      },
      "warehouse@example.com": {
        email: "warehouse@example.com",
        password: "seng1234",
        user: {
          id: 2,
          name: "Warehouse User",
          email: "warehouse@example.com",
          role: "warehouse_manager",
          role_id: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        token: "mock-token-warehouse",
      },
      "staff@example.com": {
        email: "staff@example.com",
        password: "seng1234",
        user: {
          id: 3,
          name: "Staff User",
          email: "staff@example.com",
          role: "staff",
          role_id: 4,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        token: "mock-token-staff",
      },
      "customer@example.com": {
        email: "customer@example.com",
        password: "seng1234",
        user: {
          id: 4,
          name: "Customer User",
          email: "customer@example.com",
          role: "customer",
          role_id: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        token: "mock-token-customer",
      },
    };

    // Check if this is a mock account
    const mockAccount =
      mockAccounts[loginForm.email as keyof typeof mockAccounts];
    if (mockAccount && mockAccount.password === loginForm.password) {
      console.log("🎭 Using mock account for", loginForm.email);

      saveToken(mockAccount.token);
      login(mockAccount.user);

      toast({
        title: "Login Successful (Mock)",
        description: `Welcome back, ${mockAccount.user.name}!`,
      });

      // Navigate based on role - use window.location for full page reload
      const userRole = mockAccount.user.role;
      let targetRoute = "/dashboard/customer"; // default

      switch (userRole) {
        case "admin":
          targetRoute = "/dashboard/admin";
          break;
        case "warehouse_manager":
          targetRoute = "/dashboard/warehouse";
          break;
        case "staff":
          targetRoute = "/dashboard/staff";
          break;
        case "customer":
        default:
          targetRoute = "/dashboard/customer";
          break;
      }

      console.log("🔍 Mock account - role:", userRole, "target:", targetRoute);

      // Use window.location to force a full page reload and ensure correct dashboard loads
      window.location.href = targetRoute;
      setIsLoading(false);
      return;
    }

    // If no matching mock account found, show error
    toast({
      title: "Invalid Credentials",
      description: "Please check your email and password",
      variant: "destructive",
    });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-metallic-light to-metallic-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-metallic-primary to-metallic-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">EC</span>
            </div>
            <span className="text-2xl font-bold text-metallic-primary">
              EcommerceHub
            </span>
          </div>
          <CardTitle className="flex items-center justify-center">
            <LogIn className="mr-2 h-5 w-5" />
            Sign In
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, email: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-metallic-primary hover:bg-metallic-primary/90"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>

            {/* Test Account Info */}
            <div className="border-t border-metallic-light pt-4 mt-4">
              <p className="text-center text-sm text-metallic-tertiary mb-2">
                🔑 Test Accounts Available:
              </p>
              <div className="text-xs text-metallic-tertiary space-y-1">
                <div>👑 admin@example.com / seng1234</div>
                <div>📦 warehouse@example.com / seng1234</div>
                <div>👨‍💼 staff@example.com / seng1234</div>
                <div>🛒 customer@example.com / seng1234</div>
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => navigate("/register")}
                >
                  Register here
                </Button>
              </p>
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => navigate("/")}
              >
                Back to Homepage
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
