import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react";

const ApiTest: React.FC = () => {
  const [testResults, setTestResults] = useState<{
    [key: string]: { status: "success" | "error" | "testing"; message: string };
  }>({});
  const [isTestingAll, setIsTestingAll] = useState(false);

  const testEndpoints = [
    { name: "Products (Public)", url: "/products", auth: false },
    { name: "User Auth", url: "/user", auth: true },
    { name: "Dashboard", url: "/dashboard/customer", auth: true },
  ];

  const testSingleEndpoint = async (
    endpoint: { name: string; url: string; auth: boolean },
    testToken?: string,
  ) => {
    setTestResults((prev) => ({
      ...prev,
      [endpoint.name]: { status: "testing", message: "Testing..." },
    }));

    try {
      const apiBaseUrl =
        import.meta.env.VITE_API_URL || "http://localhost:8000/api";
      const fullUrl = `${apiBaseUrl}${endpoint.url}`;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (endpoint.auth && testToken) {
        headers.Authorization = `Bearer ${testToken}`;
      }

      console.log(`🔍 Testing URL: ${fullUrl}`);
      console.log(`🔍 Headers:`, headers);

      const response = await fetch(fullUrl, {
        method: "GET",
        headers,
        mode: "cors", // Explicitly set CORS mode
      });

      const result = {
        status: response.ok ? ("success" as const) : ("error" as const),
        message: response.ok
          ? `✅ Success (${response.status})`
          : `❌ Error ${response.status}: ${response.statusText}`,
      };

      setTestResults((prev) => ({
        ...prev,
        [endpoint.name]: result,
      }));
    } catch (error) {
      console.error(`🚨 Test Error for ${endpoint.name}:`, error);

      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = error.message;

        // Detect specific error types
        if (error.message.includes("Failed to fetch")) {
          errorMessage = `🚫 CORS or Network Error: Cannot connect to ${fullUrl}. This usually means:\n1. CORS is not configured on your Laravel backend\n2. The backend is not running\n3. The URL is incorrect`;
        }
      }

      setTestResults((prev) => ({
        ...prev,
        [endpoint.name]: {
          status: "error",
          message: `❌ ${errorMessage}`,
        },
      }));
    }
  };

  const testAllEndpoints = async () => {
    setIsTestingAll(true);
    setTestResults({});

    // Test public endpoints first
    for (const endpoint of testEndpoints.filter((e) => !e.auth)) {
      await testSingleEndpoint(endpoint);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay
    }

    // Test auth endpoints (will fail without token, but that's expected)
    for (const endpoint of testEndpoints.filter((e) => e.auth)) {
      await testSingleEndpoint(endpoint);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay
    }

    setIsTestingAll(false);
  };

  const getStatusIcon = (status: "success" | "error" | "testing") => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "testing":
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
    }
  };

  const getStatusBadge = (status: "success" | "error" | "testing") => {
    const variants = {
      success: "default" as const,
      error: "destructive" as const,
      testing: "secondary" as const,
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5" />
          API Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This tool helps diagnose connection issues with your Laravel
            backend. Make sure your backend is running with{" "}
            <code className="bg-muted px-1 rounded">php artisan serve</code>
          </AlertDescription>
        </Alert>

        <Button
          onClick={testAllEndpoints}
          disabled={isTestingAll}
          className="w-full"
        >
          {isTestingAll ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Testing Endpoints...
            </>
          ) : (
            "Test API Connection"
          )}
        </Button>

        <div className="space-y-2">
          {testEndpoints.map((endpoint) => {
            const result = testResults[endpoint.name];
            return (
              <div
                key={endpoint.name}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div className="flex items-center space-x-3">
                  {result && getStatusIcon(result.status)}
                  <div>
                    <div className="font-medium">{endpoint.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {endpoint.url}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {result && getStatusBadge(result.status)}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testSingleEndpoint(endpoint)}
                    disabled={result?.status === "testing"}
                  >
                    Test
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {Object.keys(testResults).length > 0 && (
          <div className="mt-4 p-3 bg-muted rounded">
            <h4 className="font-medium mb-2">Test Results:</h4>
            <div className="space-y-1 text-sm">
              {Object.entries(testResults).map(([name, result]) => (
                <div key={name}>
                  <strong>{name}:</strong> {result.message}
                </div>
              ))}
            </div>
          </div>
        )}

        <Alert>
          <AlertDescription>
            <strong>Common Solutions:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                Start Laravel backend:{" "}
                <code className="bg-muted px-1 rounded">php artisan serve</code>
              </li>
              <li>
                Check if running on port 8000:{" "}
                <code className="bg-muted px-1 rounded">
                  http://localhost:8000
                </code>
              </li>
              <li>
                Add CORS headers to your Laravel API (check cors.php config)
              </li>
              <li>
                Verify your <code className="bg-muted px-1 rounded">.env</code>{" "}
                file has correct database settings
              </li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default ApiTest;
