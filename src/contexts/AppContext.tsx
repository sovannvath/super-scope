import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useAuth } from "./AuthContext";

export interface AppContextValue {
  // Theme
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;

  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Loading states
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;

  // Error handling
  globalError: string | null;
  setGlobalError: (error: string | null) => void;
  clearGlobalError: () => void;

  // Search
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;

  // Filters
  activeFilters: Record<string, any>;
  setActiveFilters: (filters: Record<string, any>) => void;
  clearFilters: () => void;

  // App settings
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;

  // Network status
  isOnline: boolean;
  lastSync: Date | null;
  setLastSync: (date: Date) => void;
}

export interface AppSettings {
  itemsPerPage: number;
  autoRefresh: boolean;
  refreshInterval: number;
  showNotifications: boolean;
  compactMode: boolean;
  language: string;
}

const defaultSettings: AppSettings = {
  itemsPerPage: 20,
  autoRefresh: true,
  refreshInterval: 30000, // 30 seconds
  showNotifications: true,
  compactMode: false,
  language: "en",
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // Theme management
  const [theme, setThemeState] = useState<"light" | "dark" | "system">(
    () => (localStorage.getItem("theme") as any) || "system",
  );

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Search and filters
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem("appSettings");
    return saved
      ? { ...defaultSettings, ...JSON.parse(saved) }
      : defaultSettings;
  });

  // Network status
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Theme setter that persists to localStorage
  const setTheme = useCallback((newTheme: "light" | "dark" | "system") => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);

    // Apply theme to document
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else if (newTheme === "light") {
      root.classList.remove("dark");
    } else {
      // System theme
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (isDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, []);

  // Sidebar controls
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  // Error handling
  const clearGlobalError = useCallback(() => {
    setGlobalError(null);
  }, []);

  // Filters
  const clearFilters = useCallback(() => {
    setActiveFilters({});
  }, []);

  // Settings management
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem("appSettings", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Initialize theme on mount
  useEffect(() => {
    setTheme(theme);
  }, []);

  // Auto-close sidebar on mobile when not authenticated
  useEffect(() => {
    if (!isAuthenticated && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [isAuthenticated]);

  // Clear all app state when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setGlobalSearchQuery("");
      setActiveFilters({});
      setGlobalError(null);
      setGlobalLoading(false);
      setSidebarOpen(false);
      // Reset settings to default
      setSettings(defaultSettings);
    }
  }, [isAuthenticated]);

  const value: AppContextValue = {
    theme,
    setTheme,
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    globalLoading,
    setGlobalLoading,
    globalError,
    setGlobalError,
    clearGlobalError,
    globalSearchQuery,
    setGlobalSearchQuery,
    activeFilters,
    setActiveFilters,
    clearFilters,
    settings,
    updateSettings,
    isOnline,
    lastSync,
    setLastSync,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
