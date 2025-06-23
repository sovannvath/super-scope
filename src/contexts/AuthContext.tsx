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
      if (token) {
        try {
          const response = await authApi.user();
          if (response.status === 200 && response.data) {
            let userData = response.data;

            // Map role_id to role name if needed
            if (userData.role_id && !userData.role) {
              const roleMapping: Record<number, string> = {
                1: "admin",
                2: "warehouse_manager",
                3: "customer",
                4: "staff",
              };
              userData.role = roleMapping[userData.role_id] || "customer";
            }

            setUser(userData);
            console.log(
              "✅ User authenticated:",
              userData.name,
              "Role:",
              userData.role,
            );
          } else {
            // Token is invalid, remove it
            removeToken();
            setUser(null);
          }
        } catch (error) {
          console.log("Token validation failed, clearing auth");
          removeToken();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authApi.login({ email, password });

      if (response.status === 200 && response.data) {
        const { user: userData, token } = response.data;

        // Map role_id to role name if needed
        if (userData.role_id && !userData.role) {
          const roleMapping: Record<number, string> = {
            1: "admin",
            2: "warehouse_manager",
            3: "customer",
            4: "staff",
          };
          userData.role = roleMapping[userData.role_id] || "customer";
        }

        setToken(token);
        setUser(userData);

        toast({
          title: "Login Successful",
          description: `Welcome back, ${userData.name}!`,
        });

        console.log(
          "✅ User logged in:",
          userData.name,
          "Role:",
          userData.role,
        );
        return true;
      } else {
        toast({
          title: "Login Failed",
          description: response.message || "Invalid credentials",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      toast({
        title: "Login Error",
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
      setUser(null);

      // Clear all localStorage
      localStorage.clear();

      // Clear all sessionStorage
      sessionStorage.clear();

      // Clear any app-specific cached data
      const keysToRemove = [
        "auth_token",
        "user_data",
        "cart_data",
        "app_state",
        "theme",
        "appSettings",
      ];

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
