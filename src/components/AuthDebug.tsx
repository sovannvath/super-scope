import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getToken } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AuthDebug: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const token = getToken();
  const storedUser = localStorage.getItem("user_data");

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-sm text-blue-800">
          🔍 Auth Debug Info
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-1">
        <div>
          <strong>Is Loading:</strong> {isLoading ? "Yes" : "No"}
        </div>
        <div>
          <strong>Is Authenticated:</strong> {isAuthenticated ? "Yes" : "No"}
        </div>
        <div>
          <strong>Has Token:</strong> {token ? "Yes" : "No"}
        </div>
        <div>
          <strong>Has Stored User:</strong> {storedUser ? "Yes" : "No"}
        </div>
        <div>
          <strong>User Object:</strong>{" "}
          {user ? JSON.stringify(user, null, 2) : "null"}
        </div>
        <div>
          <strong>User Name:</strong> {user?.name || "N/A"}
        </div>
        <div>
          <strong>User Role:</strong> {user?.role || "N/A"}
        </div>
        <div>
          <strong>User Role ID:</strong> {user?.role_id || "N/A"}
        </div>
        <div>
          <strong>Stored User Data:</strong>{" "}
          {storedUser ? storedUser : "No stored data"}
        </div>
        <div>
          <strong>Token (first 20 chars):</strong>{" "}
          {token ? token.substring(0, 20) + "..." : "No token"}
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthDebug;
