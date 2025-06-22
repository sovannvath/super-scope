import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, authApi, saveToken, clearAuth, getToken } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void; // Simple method to set authenticated user
  loginWithCredentials: (email: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
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

  const refreshUser = async () => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.me();
      if (response.status === 200 && response.data) {
        setUser(response.data);
        console.log("✅ User authenticated:", response.data.name);
      } else if (response.status === 401) {
        // Only clear auth on 401 Unauthorized
        console.log("🔒 Token expired or invalid, clearing auth");
        clearAuth();
        setUser(null);
      } else {
        // For other errors, keep the token but don't set user data
        console.log("⚠️ Cannot validate user, but keeping token");
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      // Don't clear auth on network errors, keep the token
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  // Simple method to set authenticated user (used by Login/Register components)
  const login = (user: User) => {
    setUser(user);
  };

  const loginWithCredentials = async (
    email: string,
    password: string,
  ): Promise<boolean> => {
    try {
      const response = await authApi.login({ email, password });

      if (response.status === 200 && response.data.token) {
        saveToken(response.data.token);
        setUser(response.data.user);
        toast({
          title: "Login Successful",
          description: `Welcome back, ${response.data.user.name}!`,
        });
        return true;
      } else {
        toast({
          title: "Login Failed",
          description: response.data.message || "Invalid credentials",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "Unable to connect to the server. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ): Promise<boolean> => {
    try {
      const response = await authApi.register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      if (
        (response.status === 200 || response.status === 201) &&
        response.data.token
      ) {
        saveToken(response.data.token);
        setUser(response.data.user);
        toast({
          title: "Registration Successful",
          description: `Welcome, ${response.data.user.name}!`,
        });
        return true;
      } else {
        toast({
          title: "Registration Failed",
          description: response.data.message || "Registration failed",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Registration Error",
        description: "Unable to connect to the server. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuth();
      setUser(null);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithCredentials,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
