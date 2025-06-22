import React, { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Wifi, WifiOff } from "lucide-react";
import { productApi } from "@/lib/api";

export const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await productApi.index();
        const wasOffline = !isOnline;

        // Consider successful if we get any response (even errors from server)
        const isServerResponding = response.status > 0;
        setIsOnline(isServerResponding);

        // Show status change notification
        if (wasOffline && isServerResponding) {
          setShowStatus(true);
          setTimeout(() => setShowStatus(false), 3000);
        }
      } catch (error: any) {
        // Only mark as offline for timeout/network errors, not server errors
        const isTimeout =
          error.code === "ECONNABORTED" || error.message?.includes("timeout");
        const isNetworkError = !error.response;

        if (isTimeout || isNetworkError) {
          setIsOnline(false);
          setShowStatus(true);
          setTimeout(() => setShowStatus(false), 5000);
        }
      }
    };

    // Check initially with a small delay
    setTimeout(checkConnection, 1000);

    // Check every 60 seconds (less aggressive)
    const interval = setInterval(checkConnection, 60000);

    return () => clearInterval(interval);
  }, [isOnline]);

  if (!showStatus && isOnline) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm">
      <Alert
        className={
          isOnline
            ? "border-green-200 bg-green-50"
            : "border-orange-200 bg-orange-50"
        }
      >
        <div className="flex items-center">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-orange-600" />
          )}
          <AlertDescription
            className={`ml-2 ${isOnline ? "text-green-800" : "text-orange-800"}`}
          >
            {isOnline
              ? "Connected to backend server"
              : "Backend server unavailable - working in offline mode"}
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
};

export default NetworkStatus;
