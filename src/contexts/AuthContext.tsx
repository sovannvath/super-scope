import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getToken, setToken, removeToken, authApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  role_id?: number;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: () => boolean;
  isCustomer: () => boolean;
  isWarehouseManager: () => boolean;
  isStaff: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Initialize auth state from token
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken();
      const storedUser = localStorage.getItem("user_data");

      console.log("🔄 AuthContext: Initializing auth...", {
        hasToken: !!token,
        hasStoredUser: !!storedUser,
      });

      if (token) {
        try {
          // Try to get fresh user data from server
          console.log("🔄 AuthContext: Fetching user data from server...");
          const response = await authApi.user();

          if (response.status === 200 && response.data) {
            let rawData = response.data;
            console.log("🔄 AuthContext: Raw user data from server:", rawData);

            // Handle nested user structure - extract user data from nested object
            let userData = rawData.user || rawData;
            console.log("🔄 AuthContext: Extracted user data:", userData);

            // Map role_id to role name if needed
            if (userData.role_id && !userData.role) {
              const roleMapping: Record<number, string> = {
                1: "admin",
                2: "warehouse_manager",
                3: "customer",
                4: "staff",
              };
              userData.role = roleMapping[userData.role_id] || "customer";
              console.log(
                `🔄 AuthContext: Mapped role_id ${userData.role_id} to role: ${userData.role}`,
              );
            }
            // Store user data in localStorage for persistence
            localStorage.setItem("user_data", JSON.stringify(userData));
            setUser(userData);
            console.log(
              "✅ User authenticated from server:",
              userData.name,
              "Role:",
              userData.role,
              "Full user object:",
              userData,
            );
          } else {
            console.log(
              "⚠️ AuthContext: Server response failed, status:",
              response.status,
            );
            // Server response failed, but token exists - try stored user data
            if (storedUser) {
              try {
                const parsedUser = JSON.parse(storedUser);
                console.log(
                  "🔄 AuthContext: Using stored user data:",
                  parsedUser,
                );
                setUser(parsedUser);
                console.log(
                  "✅ User restored from localStorage:",
                  parsedUser.name,
                  "Role:",
                  parsedUser.role,
                );
              } catch (e) {
                console.log("❌ Stored user data is corrupted, clearing auth");
                removeToken();
                localStorage.removeItem("user_data");
                setUser(null);
              }
            } else {
              console.log(
                "❌ No stored user data and server failed, clearing auth",
              );
              removeToken();
              setUser(null);
            }
          }
        } catch (error) {
          console.log("❌ Token validation failed:", error.message || error);
          // If server is unreachable but we have stored user data, use it
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              console.log(
                "🔄 AuthContext: Fallback to stored user data:",
                parsedUser,
              );
              setUser(parsedUser);
              console.log(
                "✅ User restored from localStorage (offline):",
                parsedUser.name,
                "Role:",
                parsedUser.role,
              );
            } catch (e) {
              console.log("❌ Stored user data is corrupted, clearing auth");
              removeToken();
              localStorage.removeItem("user_data");
              setUser(null);
            }
          } else {
            console.log(
              "❌ No stored user data and server failed, clearing auth",
            );
            removeToken();
            setUser(null);
          }
        }
      } else if (storedUser) {
        // No token but we have stored user data - this shouldn't happen, clear it
        console.log(
          "⚠️ AuthContext: No token but stored user exists, clearing stored data",
        );
        localStorage.removeItem("user_data");
        setUser(null);
      } else {
        console.log(
          "ℹ️ AuthContext: No token and no stored user, user not authenticated",
        );
      }

      setIsLoading(false);
      console.log("✅ AuthContext: Initialization complete");
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log("🔄 AuthContext: Attempting login for:", email);

      const response = await authApi.login({ email, password });
      console.log("🔄 AuthContext: Login API response:", {
        status: response.status,
        hasData: !!response.data,
        data: response.data,
      });

      if (response.status === 200 && response.data) {
        const { user: userData, token } = response.data;
        console.log("🔄 AuthContext: Login successful, user data:", userData);
        console.log("🔄 AuthContext: Token received:", token ? "Yes" : "No");

        // Map role_id to role name if needed
        if (userData.role_id && !userData.role) {
          const roleMapping: Record<number, string> = {
            1: "admin",
            2: "warehouse_manager",
            3: "customer",
            4: "staff",
          };
          userData.role = roleMapping[userData.role_id] || "customer";
          console.log(
            `🔄 AuthContext: Mapped role_id ${userData.role_id} to role: ${userData.role}`,
          );
        }

        setToken(token);
        localStorage.setItem("user_data", JSON.stringify(userData));
        setUser(userData);

        toast({
          title: "Login Successful",
          description: `Welcome back, ${userData.name}!`,
        });

        console.log(
          "✅ User logged in successfully:",
          userData.name,
          "Role:",
          userData.role,
          "ID:",
          userData.id,
          "Full user:",
          userData,
        );
        return true;
      } else {
        console.log("❌ Login failed, invalid response:", response);
        toast({
          title: "Login Failed",
          description: response.message || "Invalid credentials",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      console.error("🚨 Login Error Details:", {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        config: error.config,
      });

      let errorMessage = "Login failed. Please try again.";
      let errorTitle = "Login Error";

      if (error.response?.status === 422) {
        errorTitle = "Validation Error";
        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data?.errors) {
          // Handle Laravel validation errors
          const errors = error.response.data.errors;
          const errorMessages = Object.values(errors).flat().join(", ");
          errorMessage = errorMessages;
        } else {
          errorMessage = "Please check your email and password format.";
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Try to logout from server
      await authApi.logout();
    } catch (error) {
      console.log("Logout API call failed, but clearing local auth anyway");
    } finally {
      // Clear all authentication data
      removeToken();
      localStorage.removeItem("user_data");
      setUser(null);

      // Clear any app-specific cached data
      const keysToRemove = ["cart_data", "app_state"];

      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });

      console.log("👋 User logged out - all session data cleared");

      // Force page reload to ensure complete state reset
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  };

  // Role check helpers
  const isAdmin = () => user?.role === "admin";
  const isCustomer = () => user?.role === "customer";
  const isWarehouseManager = () => user?.role === "warehouse_manager";
  const isStaff = () => user?.role === "staff";

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    isAdmin,
    isCustomer,
    isWarehouseManager,
    isStaff,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
