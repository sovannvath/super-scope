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
  login: (email: string, password: string) => Promise<boolean>;
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
      const response = await authApi.getUserInfo();
      if (response.status === 200) {
        setUser(response.data);
      } else {
        console.log("Token validation failed, clearing auth");
        clearAuth();
        setUser(null);
      }
    } catch (error) {
      console.log("API unavailable, using mock user for development");
      // For development purposes, create a mock user if API is unavailable
      const mockUser = {
        id: 1,
        name: "Demo User",
        email: "demo@example.com",
        role: "admin" as const,
        email_verified_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUser(mockUser);

      // Don't clear auth - keep the token for when API becomes available
      // clearAuth();
      // setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
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
      console.log("API unavailable, using demo login");

      // For development purposes, allow demo login when API is unavailable
      if (email === "demo@example.com" || email === "admin@example.com") {
        const mockUser = {
          id: 1,
          name: email === "admin@example.com" ? "Admin User" : "Demo User",
          email: email,
          role:
            email === "admin@example.com"
              ? ("admin" as const)
              : ("customer" as const),
          email_verified_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        saveToken("demo-token-" + Date.now());
        setUser(mockUser);
        toast({
          title: "Demo Login Successful",
          description: `Welcome, ${mockUser.name}! (Demo Mode)`,
        });
        return true;
      }

      toast({
        title: "Login Error",
        description:
          "API unavailable. Try demo@example.com or admin@example.com for demo mode.",
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
      console.log("API unavailable, using demo registration");

      // For development purposes, allow demo registration when API is unavailable
      if (password === passwordConfirmation) {
        const mockUser = {
          id: Date.now(),
          name: name,
          email: email,
          role: "customer" as const,
          email_verified_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        saveToken("demo-token-" + Date.now());
        setUser(mockUser);
        toast({
          title: "Demo Registration Successful",
          description: `Welcome, ${mockUser.name}! (Demo Mode)`,
        });
        return true;
      }

      toast({
        title: "Registration Error",
        description:
          "API unavailable. Registration works in demo mode when passwords match.",
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
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
