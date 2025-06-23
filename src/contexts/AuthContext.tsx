import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getToken, setToken, removeToken } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
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

// Mock users for development
const MOCK_USERS: Record<string, { user: User; token: string }> = {
  "admin@test.com": {
    user: {
      id: 1,
      name: "Admin User",
      email: "admin@test.com",
      role: "admin",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    token: "mock-admin-token",
  },
  "customer@test.com": {
    user: {
      id: 2,
      name: "Customer User",
      email: "customer@test.com",
      role: "customer",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    token: "mock-customer-token",
  },
  "staff@test.com": {
    user: {
      id: 3,
      name: "Staff Member",
      email: "staff@test.com",
      role: "staff",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    token: "mock-staff-token",
  },
  "warehouse@test.com": {
    user: {
      id: 4,
      name: "Warehouse Manager",
      email: "warehouse@test.com",
      role: "warehouse_manager",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    token: "mock-warehouse-token",
  },
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      const token = getToken();
      if (token) {
        // Check if it's a mock token
        const mockEntry = Object.values(MOCK_USERS).find(
          (entry) => entry.token === token,
        );

        if (mockEntry) {
          setUser(mockEntry.user);
          console.log("✅ Restored mock user session:", mockEntry.user.name);
        } else {
          // For real tokens, we could validate with backend here
          // For now, clear invalid tokens
          removeToken();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (userData: User, token: string) => {
    setToken(token);
    setUser(userData);
    console.log("✅ User logged in:", userData.name, "Role:", userData.role);
  };

  const logout = () => {
    removeToken();
    setUser(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    console.log("👋 User logged out");
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

// Export mock users for login form
export { MOCK_USERS };
