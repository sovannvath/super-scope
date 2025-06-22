import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Play,
  User,
  ShoppingCart,
  Package,
  Bell,
  BarChart3,
  FileText,
  Clock,
} from "lucide-react";
import {
  authApi,
  productApi,
  cartApi,
  orderApi,
  notificationApi,
  dashboardApi,
  requestOrderApi,
  saveToken,
  clearAuth,
  getToken,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface TestResult {
  status: "success" | "error" | "testing" | "idle";
  message: string;
  data?: any;
  responseTime?: number;
}

interface TestCredentials {
  email: string;
  password: string;
  name: string;
  passwordConfirmation: string;
}

interface TestState {
  cartItemId?: number;
  productId?: number;
  orderId?: number;
}

const ApiTest: React.FC = () => {
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<{
    [key: string]: TestResult;
  }>({});
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [credentials, setCredentials] = useState<TestCredentials>({
    email: "test@example.com",
    password: "password123",
    name: "Test User",
    passwordConfirmation: "password123",
  });
  const [authToken, setAuthToken] = useState<string>(getToken() || "");
  const [testState, setTestState] = useState<TestState>({});

  // Test configuration
  const testCategories = {
    public: {
      name: "Public Endpoints (No Auth Required)",
      icon: <Package className="h-4 w-4" />,
      tests: [
        {
          name: "Get Products",
          endpoint: "GET /products",
          test: () => productApi.index(),
        },
        {
          name: "Get Single Product",
          endpoint: "GET /products/{id}",
          test: () => productApi.show(1),
        },
      ],
    },
    auth: {
      name: "Authentication",
      icon: <User className="h-4 w-4" />,
      tests: [
        {
          name: "Register User",
          endpoint: "POST /register",
          test: async () => {
            // Add timestamp to make email unique for testing
            const timestamp = Date.now();
            const testEmail = `test+${timestamp}@example.com`;

            return authApi.register({
              name: credentials.name + ` ${timestamp}`,
              email: testEmail,
              password: credentials.password,
              password_confirmation: credentials.passwordConfirmation,
            });
          },
        },
        {
          name: "Login User",
          endpoint: "POST /login",
          test: () =>
            authApi.login({
              email: credentials.email,
              password: credentials.password,
            }),
        },
        {
          name: "Get Current User",
          endpoint: "GET /user",
          test: () => authApi.user(),
        },
        {
          name: "Logout User",
          endpoint: "POST /logout",
          test: () => authApi.logout(),
        },
      ],
    },
    cart: {
      name: "Shopping Cart",
      icon: <ShoppingCart className="h-4 w-4" />,
      tests: [
        {
          name: "Get Cart",
          endpoint: "GET /cart",
          test: () => cartApi.index(),
        },
        {
          name: "Add Item to Cart",
          endpoint: "POST /cart/add",
          test: async () => {
            const response = await cartApi.addItem({ product_id: 1, quantity: 2 });
            // Store cart item ID for later tests
            if (response.status === 200 || response.status === 201) {
              if (response.data?.id) {
                setTestState(prev => ({ ...prev, cartItemId: response.data.id }));
              }
            }
            return response;
          },
        },
        {
          name: "Update Cart Item",
          endpoint: "PUT /cart/items/{id}",
          test: () => {
            const itemId = testState.cartItemId || 1; // Fallback to 1 if no ID stored
            return cartApi.updateItem(itemId, 3);
          },
        },
        {
          name: "Remove Cart Item",
          endpoint: "DELETE /cart/items/{id}",
          test: () => {
            const itemId = testState.cartItemId || 1; // Fallback to 1 if no ID stored
            return cartApi.removeItem(itemId);
          },
        },
        {
          name: "Clear Cart",
          endpoint: "DELETE /cart/clear",
          test: () => cartApi.clear(),
        },
      ],
    },
    orders: {
      name: "Orders",
      icon: <FileText className="h-4 w-4" />,
      tests: [
        {
          name: "Get Orders",
          endpoint: "GET /orders",
          test: () => orderApi.index(),
        },
        {
          name: "Create Order",
          endpoint: "POST /orders",
          test: () => orderApi.store(),
        },
        {
          name: "Get Single Order",
          endpoint: "GET /orders/{id}",
          test: () => orderApi.show(1),
        },
        {
          name: "Get Payment Methods",
          endpoint: "GET /payment-methods",
          test: () => orderApi.getPaymentMethods(),
        },
        {
          name: "Update Order Status",
          endpoint: "PUT /orders/{id}/status",
          test: () => orderApi.updateStatus(1, "processing"),
        },
        {
          name: "Update Payment Status",
          endpoint: "PUT /orders/{id}/payment",
          test: () => orderApi.updatePaymentStatus(1, "paid"),
        },
      ],
    },
    products: {
      name: "Product Management",
      icon: <Package className="h-4 w-4" />,
      tests: [
        {
          name: "Create Product",
          endpoint: "POST /products",
          test: () =>
            productApi.store({
              name: "Test Product",
              description: "Test Description",
              price: 99.99,
              quantity: 10,
              low_stock_threshold: 5,
            }),
        },
        {
          name: "Update Product",
          endpoint: "PUT /products/{id}",
          test: () =>
            productApi.update(1, {
              name: "Updated Test Product",
              price: 149.99,
            }),
        },
        {
          name: "Delete Product",
          endpoint: "DELETE /products/{id}",
          test: () => productApi.destroy(1),
        },
        {
          name: "Get Low Stock Products",
          endpoint: "GET /products/low-stock",
          test: () => productApi.lowStock(),
        },
      ],
    },
    notifications: {
      name: "Notifications",
      icon: <Bell className="h-4 w-4" />,
      tests: [
        {
          name: "Get Notifications",
          endpoint: "GET /notifications",
          test: () => notificationApi.index(),
        },
        {
          name: "Get Unread Notifications",
          endpoint: "GET /notifications/unread",
          test: () => notificationApi.unread(),
        },
        {
          name: "Mark Notification as Read",
          endpoint: "PUT /notifications/{id}/read",
          test: () => notificationApi.markAsRead(1),
        },
        {
          name: "Mark All as Read",
          endpoint: "PUT /notifications/read-all",
          test: () => notificationApi.markAllAsRead(),
        },
        {
          name: "Delete Notification",
          endpoint: "DELETE /notifications/{id}",
          test: () => notificationApi.destroy(1),
        },
      ],
    },
    dashboard: {
      name: "Dashboard",
      icon: <BarChart3 className="h-4 w-4" />,
      tests: [
        {
          name: "Customer Dashboard",
          endpoint: "GET /dashboard/customer",
          test: () => dashboardApi.customer(),
        },
        {
          name: "Admin Dashboard",
          endpoint: "GET /dashboard/admin",
          test: () => dashboardApi.admin(),
        },
        {
          name: "Staff Dashboard",
          endpoint: "GET /dashboard/staff",
          test: () => dashboardApi.staff(),
        },
        {
          name: "Warehouse Dashboard",
          endpoint: "GET /dashboard/warehouse",
          test: () => dashboardApi.warehouse(),
        },
      ],
    },
    requestOrders: {
      name: "Request Orders",
      icon: <Clock className="h-4 w-4" />,
      tests: [
        {
          name: "Get Request Orders",
          endpoint: "GET /request-orders",
          test: () => requestOrderApi.index(),
        },
        {
          name: "Create Request Order",
          endpoint: "POST /request-orders",
          test: () =>
            requestOrderApi.store({
              product_id: 1,
              requested_quantity: 100,
              notes: "Test request order",
            }),
        },
        {
          name: "Get Single Request Order",
          endpoint: "GET /request-orders/{id}",
          test: () => requestOrderApi.show(1),
        },
        {
          name: "Admin Approval",
          endpoint: "PUT /request-orders/{id}/admin-approval",
          test: () =>
            requestOrderApi.adminApproval(1, {
              status: "admin_approved",
              admin_notes: "Approved by admin",
            }),
        },
        {
          name: "Warehouse Approval",
          endpoint: "PUT /request-orders/{id}/warehouse-approval",
          test: () =>
            requestOrderApi.warehouseApproval(1, {
              status: "warehouse_approved",
              warehouse_notes: "Approved by warehouse",
            }),
        },
      ],
    },
  };

  const runSingleTest = async (
    testName: string,
    testFunction: () => Promise<any>,
  ) => {
    setTestResults((prev) => ({
      ...prev,
      [testName]: { status: "testing", message: "Testing..." },
    }));

    const startTime = Date.now();

    try {
      const response = await testFunction();
      const responseTime = Date.now() - startTime;

      if (response.status >= 200 && response.status < 300) {
        // Handle special cases for auth endpoints
        if (testName === "Login User" && response.data?.token) {
          saveToken(response.data.token);
          setAuthToken(response.data.token);
        }

        setTestResults((prev) => ({
          ...prev,
          [testName]: {
            status: "success",
            message: `✅ Success (${response.status}) - ${responseTime}ms`,
            data: response.data,
            responseTime,
          },
        }));
      } else {
        // Special handling for different error types
        let errorMessage = `❌ HTTP ${response.status}: ${response.message || "Error"}`;

        if (response.status === 401) {
          errorMessage = `🔒 Unauthenticated - Please login first or check your auth token`;
        } else if (response.status === 403) {
          errorMessage = `🚫 Forbidden - You don't have permission for this action`;
        } else if (response.status === 404) {
          errorMessage = `🔍 Not Found - Resource doesn't exist (ID might be invalid)`;
        } else if (response.status === 422) {
          // Handle validation errors specifically
          let validationErrors = "";
          if (response.data?.errors) {
            // Laravel validation errors format
            const errors = response.data.errors;
            validationErrors = Object.entries(errors)
              .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
              .join('; ');
          } else if (response.data?.message) {
            validationErrors = response.data.message;
          }
          errorMessage = `🔍 Validation Error (422): ${validationErrors || "Check your input data"}`;
        } else if (response.status >= 500) {
          errorMessage = `🚨 Server Error (${response.status}): ${response.message || "Internal server error"}`;
        }

        setTestResults((prev) => ({
          ...prev,
          [testName]: {
            status: "error",
            message: errorMessage,
            data: response.data,
            responseTime,
          },
        }));
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error(`Test Error for ${testName}:`, error);

      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = error.message;
        if (error.message.includes("Failed to fetch")) {
          errorMessage = "🚫 Network/CORS Error - Cannot connect to server";
        }
      }

      setTestResults((prev) => ({
        ...prev,
        [testName]: {
          status: "error",
          message: `❌ ${errorMessage}`,
          responseTime,
        },
      }));
    }
  };

  const runCategoryTests = async (categoryKey: string) => {
    const category = testCategories[categoryKey as keyof typeof testCategories];
    for (const test of category.tests) {
      await runSingleTest(test.name, test.test);
      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  };

  const runAllTests = async () => {
    setIsTestingAll(true);
    setTestResults({});

    // Run tests in a logical order
    const testOrder = [
      "public",
      "auth",
      "cart",
      "orders",
      "products",
      "notifications",
      "dashboard",
      "requestOrders",
    ];

    for (const categoryKey of testOrder) {
      await runCategoryTests(categoryKey);
    }

    setIsTestingAll(false);
    toast({
      title: "All Tests Completed",
      description: "Check the results below for detailed information",
    });
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "testing":
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestResult["status"]) => {
    const variants = {
      success: "default" as const,
      error: "destructive" as const,
      testing: "secondary" as const,
      idle: "outline" as const,
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧪 API Connection Tests
          </h1>
          <p className="text-lg text-gray-600">
            Comprehensive testing suite for all Laravel backend endpoints
          </p>
        </div>

        <div className="grid gap-6 mb-8">
          {/* Configuration Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Test Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Registration Test:</strong> Uses unique email with timestamp to avoid "user already exists" errors.
                  Login test uses the email you specify below.
                </AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Test Email (for Login)</Label>
                  <Input
                    id="email"
                    value={credentials.email}
                    onChange={(e) =>
                      setCredentials((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="password">Test Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="name">Test Name</Label>
                  <Input
                    id="name"
                    value={credentials.name}
                    onChange={(e) =>
                      setCredentials((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="token">Current Auth Token</Label>
                  <Input
                    id="token"
                    value={authToken}
                    onChange={(e) => setAuthToken(e.target.value)}
                    placeholder="Will be set automatically after login"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {/* Authentication Status */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <strong>Authentication Status:</strong>
                      {authToken ? (
                        <Badge className="ml-2" variant="default">
                          ✅ Authenticated
                        </Badge>
                      ) : (
                        <Badge className="ml-2" variant="destructive">
                          ❌ Not Authenticated
                        </Badge>
                      )}
                    </div>
                  </div>

                  {authToken && (
                    <div className="text-xs text-gray-600 mb-2">
                      <strong>Token:</strong> {authToken.substring(0, 20)}...
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const currentToken = getToken();
                        setAuthToken(currentToken || "");
                        toast({
                          title: "Token Refreshed",
                          description: currentToken
                            ? `Token found: ${currentToken.substring(0, 20)}...`
                            : "No token found in storage",
                        });
                      }}
                    >
                      🔄 Refresh Token
                    </Button>
                    <Button
                      size="sm"
                      onClick={async () => {
                        try {
                          const response = await authApi.login({
                            email: credentials.email,
                            password: credentials.password,
                          });
                          if (response.data?.token) {
                            saveToken(response.data.token);
                            setAuthToken(response.data.token);
                            toast({
                              title: "Login Successful",
                              description: "You can now test protected endpoints",
                            });
                          } else {
                            toast({
                              title: "Login Issue",
                              description: "No token received from server",
                              variant: "destructive",
                            });
                          }
                        } catch (error) {
                          toast({
                            title: "Login Failed",
                            description: "Check your credentials and try again",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      Quick Login
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        clearAuth();
                        setAuthToken("");
                        setTestResults({});
                      }}
                    >
                      Logout
                    </Button>
                  </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={runAllTests}
                    disabled={isTestingAll}
                    className="flex-1"
                    size="lg"
                  >
                    {isTestingAll ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Running All Tests...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Run All Tests
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      clearAuth();
                      setAuthToken("");
                      setTestResults({});
                    }}
                    variant="outline"
                  >
                    Clear Auth & Results
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Overview */}
          {Object.keys(testResults).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Test Results Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(
                    Object.values(testResults).reduce(
                      (acc, result) => ({
                        ...acc,
                        [result.status]: (acc[result.status] || 0) + 1,
                      }),
                      {} as Record<string, number>,
                    ),
                  ).map(([status, count]) => (
                    <div
                      key={status}
                      className="text-center p-4 bg-white rounded-lg border"
                    >
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-sm text-gray-600 capitalize">
                        {status}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Test Categories */}
        <Tabs defaultValue="public" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            {Object.entries(testCategories).map(([key, category]) => (
              <TabsTrigger key={key} value={key} className="flex items-center">
                {category.icon}
                <span className="ml-1 hidden sm:inline">{key}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(testCategories).map(([categoryKey, category]) => (
            <TabsContent key={categoryKey} value={categoryKey}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      {category.icon}
                      <span className="ml-2">{category.name}</span>
                    </div>
                    <Button
                      onClick={() => runCategoryTests(categoryKey)}
                      variant="outline"
                      size="sm"
                    >
                      <Play className="mr-1 h-3 w-3" />
                      Run Category
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.tests.map((test) => {
                      const result = testResults[test.name];
                      return (
                        <div
                          key={test.name}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-3">
                            {result && getStatusIcon(result.status)}
                            <div>
                              <div className="font-medium">{test.name}</div>
                              <div className="text-sm text-gray-500">
                                {test.endpoint}
                              </div>
                              {result?.message && (
                                <div className="text-xs text-gray-600 mt-1">
                                  {result.message}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {result && getStatusBadge(result.status)}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                runSingleTest(test.name, test.test)
                              }
                              disabled={result?.status === "testing"}
                            >
                              Test
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Backend Status */}
        <Alert className="mt-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Testing Guide & Troubleshooting</AlertTitle>
          <AlertDescription>
            <div className="space-y-2 mt-2">
              <div>
                <strong>API Base URL:</strong>{" "}
                <code className="bg-muted px-1 rounded">
                  https://laravel-wtc.onrender.com/api
                </code>
              </div>
              <div>
                <strong>Authentication:</strong> Laravel Sanctum (Bearer Token)
              </div>
              <div>
                <strong>⚠️ Common Errors & Solutions:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>
                    <strong>🔒 "Unauthenticated":</strong> Login first using the "Quick Login" button or Authentication tab
                  </li>
                  <li>
                    <strong>🔍 "Not Found" (404):</strong> Resource doesn't exist - normal for delete/update tests with hardcoded IDs
                  </li>
                  <li>
                    <strong>🚫 "Forbidden" (403):</strong> User doesn't have required permissions (admin/staff/warehouse role)
                  </li>
                  <li>
                    <strong>📡 "Network Error":</strong> Backend server might be down or CORS issues
                  </li>
                </ul>
              </div>
              <div>
                <strong>🎯 Recommended Test Order:</strong>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>Start with <strong>Public Endpoints</strong> to test connectivity</li>
                  <li>Use <strong>Authentication → Login User</strong> to get auth token</li>
                  <li>Test <strong>Shopping Cart</strong> and <strong>Orders</strong> (customer features)</li>
                  <li>Test <strong>Product Management</strong> and <strong>Dashboard</strong> (admin features)</li>
                  <li>Some tests may fail due to permissions or missing data - this is normal!</li>
                </ol>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default ApiTest;