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

        // Map role_id from Laravel backend to role names
        let userRole = user.role || user.user_type || user.type;

        // If we have role_id instead of role name, map it
        if (user.role_id && !userRole) {
          const roleMapping = {
            1: "admin",
            2: "warehouse_manager",
            3: "customer",
            4: "staff",
          };
          userRole =
            roleMapping[user.role_id as keyof typeof roleMapping] || "customer";
          user.role = userRole;
        }

        console.log("🔍 Final userRole for navigation:", userRole);

        let targetRoute = "/dashboard/customer"; // default

        switch (userRole) {
          case "admin":
            targetRoute = "/dashboard/admin";
            break;
          case "staff":
            targetRoute = "/dashboard/staff";
            break;
          case "warehouse":
          case "warehouse_manager":
            targetRoute = "/dashboard/warehouse";
            break;
          case "customer":
          default:
            targetRoute = "/dashboard/customer";
        }

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
        case "staff":
          targetRoute = "/dashboard/staff";
          break;
        case "warehouse_manager":
          targetRoute = "/dashboard/warehouse";
          break;
        default:
          targetRoute = "/dashboard/customer";
      }

      // Use window.location to force a full page reload and ensure correct dashboard loads
      window.location.href = targetRoute;
      setIsLoading(false);
      return;
    }

    // If not a mock account, try real backend
    try {
      const response = await authApi.login(loginForm);

      if (response.status === 200) {
        const { user, token } = response.data;
        console.log("🔍 Raw API response:", response.data);
        console.log("🔍 User object from backend:", user);
        console.log("🔍 All user properties:", Object.keys(user));
        console.log("🔍 User role field:", user.role);
        console.log("🔍 User user_type field:", user.user_type);
        console.log("🔍 User type field:", user.type);

        saveToken(token);
        login(user);

        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.name}!`,
        });

        // Map role_id from Laravel backend to role names
        let userRole = user.role || user.user_type || user.type;

        console.log("🔍 Original user object:", user);
        console.log("🔍 Original userRole:", userRole);
        console.log("🔍 User role_id:", user.role_id);

        // If we have role_id instead of role name, map it
        if (user.role_id && !userRole) {
          const roleMapping = {
            1: "admin",
            2: "warehouse_manager",
            3: "customer",
            4: "staff",
          };
          userRole =
            roleMapping[user.role_id as keyof typeof roleMapping] || "customer";

          console.log("🔍 Mapped role_id", user.role_id, "to role:", userRole);

          // Update the user object with the role name for context
          user.role = userRole;
        }

        console.log("🔍 Final userRole for navigation:", userRole);
        console.log("🔍 Updated user object:", user);

        let targetRoute = "/dashboard/customer"; // default

        switch (userRole) {
          case "admin":
            targetRoute = "/dashboard/admin";
            break;
          case "staff":
            targetRoute = "/dashboard/staff";
            break;
          case "warehouse":
          case "warehouse_manager":
            targetRoute = "/dashboard/warehouse";
            break;
          case "customer":
          default:
            targetRoute = "/dashboard/customer";
        }

        // Use window.location to force a full page reload and ensure correct dashboard loads
        window.location.href = targetRoute;
      } else {
        // Handle different error types
        let errorTitle = "Login Failed";
        let errorMessage = response.message || "Invalid credentials";

        if (response.status === 401) {
          errorTitle = "Invalid Credentials";
          errorMessage =
            "Email or password is incorrect. Please check your credentials and try again.";
        } else if (
          response.status === 422 &&
          response.data &&
          response.data.errors
        ) {
          errorTitle = "Validation Error";
          const errors = response.data.errors;
          const errorMessages = Object.values(errors).flat();
          errorMessage = errorMessages.join(", ");
        }

        console.error(`🚨 Login Error ${response.status}:`, response.data);

        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "Failed to connect to authentication service",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

            {/* Mock Account Info */}
            <div className="border-t border-metallic-light pt-4 mt-4">
              <p className="text-center text-sm text-metallic-tertiary mb-2">
                🎭 Test Accounts Available:
              </p>
              <div className="text-xs text-metallic-tertiary space-y-1">
                <div>👑 admin@test.com / password123</div>
                <div>📦 warehouse@test.com / password123</div>
                <div>👨‍💼 staff@test.com / password123</div>
                <div>🛒 customer@test.com / password123</div>
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
