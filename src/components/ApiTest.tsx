import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getBaseUrl } from "@/lib/api";

export const ApiTest: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<"testing" | "success" | "error">(
    "testing",
  );
  const [responseData, setResponseData] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const testApi = async () => {
    setApiStatus("testing");
    const baseUrl = getBaseUrl();

    try {
      console.log("🧪 Testing API connection to:", baseUrl);

      const response = await fetch(`${baseUrl}/products`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      console.log("📡 Raw Response:", response);
      console.log("📊 Response Status:", response.status);
      console.log("📋 Response Headers:", response.headers);

      const data = await response.json();
      console.log("📦 Response Data:", data);

      if (response.ok) {
        setApiStatus("success");
        setResponseData(data);
        setError("");
      } else {
        setApiStatus("error");
        setError(
          `API Error: ${response.status} - ${data.message || "Unknown error"}`,
        );
      }
    } catch (err) {
      console.error("❌ API Test Error:", err);
      setApiStatus("error");
      setError(
        `Network Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  useEffect(() => {
    testApi();
  }, []);

  return (
    <Card className="m-4 border-2 border-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          🧪 API Connection Test
          <Badge
            variant={
              apiStatus === "success"
                ? "default"
                : apiStatus === "error"
                  ? "destructive"
                  : "secondary"
            }
          >
            {apiStatus === "testing"
              ? "Testing..."
              : apiStatus === "success"
                ? "Connected"
                : "Failed"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <strong>API Base URL:</strong> {getBaseUrl()}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}

        {responseData && (
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <strong>Response:</strong>
            <pre className="mt-2 text-sm overflow-auto">
              {JSON.stringify(responseData, null, 2)}
            </pre>
          </div>
        )}

        <Button onClick={testApi} disabled={apiStatus === "testing"}>
          {apiStatus === "testing" ? "Testing..." : "Test Again"}
        </Button>
      </CardContent>
    </Card>
  );
};
