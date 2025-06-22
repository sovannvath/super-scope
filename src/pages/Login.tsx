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

    try {
      const response = await authApi.login(loginForm);

      if (response.status === 200) {
        const { user, token } = response.data;
        console.log("🔍 Login response data:", { user, token });
        console.log("🔍 User role:", user.role);

        saveToken(token);
        login(user);

        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.name}!`,
        });

        // Redirect based on role (handle different possible role names)
        const userRole = user.role || user.user_type || user.type;
        console.log("🔍 Using role for navigation:", userRole);

        switch (userRole) {
          case "admin":
            navigate("/dashboard/admin");
            break;
          case "staff":
            navigate("/dashboard/staff");
            break;
          case "warehouse":
          case "warehouse_manager":
            navigate("/dashboard/warehouse");
            break;
          case "customer":
          default:
            navigate("/dashboard/customer");
        }
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
