import { apiClient, makeApiCall, ApiResponse } from "@/lib/api";
import { ordersApi } from "@/api/orders";

interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  total_products: number;
  total_customers: number;
  low_stock_products: any[];
  recent_orders: any[];
  pending_reorders: any[];
}

const dashboardApiWithRetry = async <T>(
  apiCall: () => Promise<any>,
  retries: number = 2,
): Promise<ApiResponse<T>> => {
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const result = await makeApiCall(apiCall);
      console.log(
        "📊 DashboardAPI: Raw response:",
        JSON.stringify(result, null, 2),
      );
      return result;
    } catch (error) {
      console.error(
        `📊 DashboardAPI: Attempt ${attempt}/${retries} failed:`,
        error,
      );
      if (attempt <= retries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      throw error;
    }
  }
  return { status: 500, message: "Max retries exceeded" };
};

export const dashboardApi = {
  admin: async (): Promise<ApiResponse<DashboardStats>> => {
    console.log("📊 DashboardAPI: Fetching admin dashboard data...");
    return dashboardApiWithRetry(async () => {
      const [statsResponse, ordersResponse] = await Promise.all([
        apiClient.get("/admin/dashboard"),
        ordersApi.getAll(),
      ]);
      const orders = Array.isArray(ordersResponse.data.orders)
        ? ordersResponse.data.orders
        : Array.isArray(ordersResponse.data)
          ? ordersResponse.data
          : [];
      const stats = statsResponse.data || {};
      return {
        ...statsResponse,
        data: {
          total_revenue: stats.total_revenue || 0,
          total_orders: stats.total_orders || orders.length,
          total_products: stats.total_products || 0,
          total_customers: stats.total_customers || 0,
          low_stock_products: stats.low_stock_products || [],
          recent_orders: orders.slice(0, 5),
          pending_reorders: stats.pending_reorders || [],
        },
      };
    });
  },

  warehouse: async (): Promise<ApiResponse<any>> => {
    console.log("📊 DashboardAPI: Fetching warehouse dashboard data...");
    return dashboardApiWithRetry(() => apiClient.get("/dashboard/warehouse"));
  },

  staff: async (): Promise<ApiResponse<any>> => {
    console.log("📊 DashboardAPI: Fetching staff dashboard data...");
    return dashboardApiWithRetry(() => apiClient.get("/dashboard/staff"));
  },
};
