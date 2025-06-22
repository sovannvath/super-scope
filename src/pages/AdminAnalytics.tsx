import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  AlertTriangle,
  Calendar,
  Eye,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Target,
  Zap,
} from "lucide-react";

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
}

interface ProductAnalytics {
  id: number;
  name: string;
  revenue: number;
  unitsSold: number;
  viewCount: number;
  conversionRate: number;
  profitMargin: number;
  stockLevel: number;
  category: string;
}

interface CustomerSegment {
  segment: string;
  count: number;
  totalSpent: number;
  averageOrderValue: number;
  orders: number;
}

interface AnalyticsSummary {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  ordersGrowth: number;
  totalCustomers: number;
  customersGrowth: number;
  averageOrderValue: number;
  aovGrowth: number;
  conversionRate: number;
  conversionGrowth: number;
  lowStockItems: number;
  pendingOrders: number;
  topSellingCategory: string;
}

const AdminAnalytics: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30days");
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [productAnalytics, setProductAnalytics] = useState<ProductAnalytics[]>(
    [],
  );
  const [customerSegments, setCustomerSegments] = useState<CustomerSegment[]>(
    [],
  );

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const response = await dashboardApi.admin();
      if (response.status === 200) {
        const dashboardData = response.data;

        // Map dashboard data to analytics summary
        const analyticsData: AnalyticsSummary = {
          totalRevenue: dashboardData.totalIncome || 0,
          revenueGrowth: dashboardData.revenueGrowth || 0,
          totalOrders: dashboardData.totalOrders || 0,
          ordersGrowth: dashboardData.ordersGrowth || 0,
          totalCustomers: dashboardData.totalCustomers || 0,
          customersGrowth: dashboardData.customersGrowth || 0,
          averageOrderValue: dashboardData.averageOrderValue || 0,
          aovGrowth: dashboardData.aovGrowth || 0,
          conversionRate: dashboardData.conversionRate || 0,
          conversionGrowth: dashboardData.conversionGrowth || 0,
          lowStockItems: dashboardData.lowStockAlerts?.length || 0,
          pendingOrders: dashboardData.pendingOrders?.length || 0,
          topSellingCategory: dashboardData.topSellingCategory || "N/A",
        };

        setAnalytics(analyticsData);

        // Set mock data for detailed analytics (you may need separate API endpoints for these)
        setSalesData([]);
        setProductAnalytics([]);
        setCustomerSegments([]);
      } else {
        toast({
          title: "Error",
          description: "Failed to load analytics data",
          variant: "destructive",
        });
      }
      // Mock analytics data
      /* const mockAnalytics: AnalyticsSummary = {
        totalRevenue: 145420.5,
        revenueGrowth: 12.5,
        totalOrders: 1247,
        ordersGrowth: 8.3,
        totalCustomers: 892,
        customersGrowth: 15.2,
        averageOrderValue: 116.63,
        aovGrowth: 3.8,
        conversionRate: 2.4,
        conversionGrowth: -0.2,
        lowStockItems: 8,
        pendingOrders: 23,
        topSellingCategory: "Electronics",
      };

      const mockSalesData: SalesData[] = [
        { date: "2024-01-01", revenue: 4200, orders: 32, customers: 28 },
        { date: "2024-01-02", revenue: 5100, orders: 41, customers: 35 },
        { date: "2024-01-03", revenue: 3800, orders: 29, customers: 22 },
        { date: "2024-01-04", revenue: 6200, orders: 48, customers: 41 },
        { date: "2024-01-05", revenue: 7300, orders: 55, customers: 47 },
        { date: "2024-01-06", revenue: 5900, orders: 44, customers: 38 },
        { date: "2024-01-07", revenue: 8100, orders: 62, customers: 53 },
      ];

      const mockProductAnalytics: ProductAnalytics[] = [
        {
          id: 1,
          name: "Premium Laptop",
          revenue: 45699.75,
          unitsSold: 35,
          viewCount: 2840,
          conversionRate: 1.23,
          profitMargin: 22.5,
          stockLevel: 15,
          category: "Electronics",
        },
        {
          id: 2,
          name: "Wireless Headphones",
          revenue: 23998.65,
          unitsSold: 120,
          viewCount: 3920,
          conversionRate: 3.06,
          profitMargin: 35.8,
          stockLevel: 3,
          category: "Audio",
        },
        {
          id: 3,
          name: "4K Monitor",
          revenue: 21999.55,
          unitsSold: 40,
          viewCount: 1560,
          conversionRate: 2.56,
          profitMargin: 28.3,
          stockLevel: 12,
          category: "Electronics",
        },
        {
          id: 4,
          name: "Gaming Mouse",
          revenue: 15598.4,
          unitsSold: 195,
          viewCount: 4580,
          conversionRate: 4.26,
          profitMargin: 42.1,
          stockLevel: 2,
          category: "Gaming",
        },
        {
          id: 5,
          name: "Smart Watch",
          revenue: 18397.5,
          unitsSold: 46,
          viewCount: 2100,
          conversionRate: 2.19,
          profitMargin: 31.7,
          stockLevel: 25,
          category: "Wearables",
        },
      ];

      const mockCustomerSegments: CustomerSegment[] = [
        {
          segment: "VIP Customers",
          count: 45,
          totalSpent: 67890.25,
          averageOrderValue: 452.6,
          orders: 150,
        },
        {
          segment: "Regular Customers",
          count: 312,
          totalSpent: 89420.8,
          averageOrderValue: 125.3,
          orders: 714,
        },
        {
          segment: "New Customers",
          count: 535,
          totalSpent: 45230.15,
          averageOrderValue: 89.7,
          orders: 504,
        },
      ];

      setAnalytics(mockAnalytics);
      setSalesData(mockSalesData);
      setProductAnalytics(mockProductAnalytics);
      setCustomerSegments(mockCustomerSegments);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  const getTrendIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getTrendColor = (growth: number) => {
    return growth >= 0 ? "text-green-600" : "text-red-600";
  };

  const getStockStatus = (stockLevel: number) => {
    if (stockLevel <= 5) {
      return <Badge variant="destructive">Low Stock</Badge>;
    } else if (stockLevel <= 15) {
      return <Badge className="bg-orange-600 text-white">Medium</Badge>;
    } else {
      return <Badge className="bg-green-600 text-white">In Stock</Badge>;
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="text-center py-12">
        <BarChart3 className="mx-auto h-16 w-16 text-metallic-light mb-4" />
        <h3 className="text-lg font-semibold text-metallic-primary mb-2">
          Access Denied
        </h3>
        <p className="text-metallic-tertiary">
          Only administrators can access analytics.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-metallic-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-metallic-primary">
            Admin Analytics
          </h1>
          <p className="text-metallic-tertiary">
            Comprehensive business intelligence and reporting
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={loadAnalytics}
            variant="outline"
            className="border-metallic-light"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button className="bg-metallic-primary hover:bg-metallic-primary/90">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-metallic-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-metallic-primary">
              {formatCurrency(analytics?.totalRevenue || 0)}
            </div>
            <div className="flex items-center space-x-1">
              {getTrendIcon(analytics?.revenueGrowth || 0)}
              <span
                className={`text-xs ${getTrendColor(analytics?.revenueGrowth || 0)}`}
              >
                {formatPercentage(analytics?.revenueGrowth || 0)} vs last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-metallic-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-metallic-primary">
              {analytics?.totalOrders?.toLocaleString() || 0}
            </div>
            <div className="flex items-center space-x-1">
              {getTrendIcon(analytics?.ordersGrowth || 0)}
              <span
                className={`text-xs ${getTrendColor(analytics?.ordersGrowth || 0)}`}
              >
                {formatPercentage(analytics?.ordersGrowth || 0)} vs last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
            <Users className="h-4 w-4 text-metallic-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-metallic-primary">
              {analytics?.totalCustomers?.toLocaleString() || 0}
            </div>
            <div className="flex items-center space-x-1">
              {getTrendIcon(analytics?.customersGrowth || 0)}
              <span
                className={`text-xs ${getTrendColor(analytics?.customersGrowth || 0)}`}
              >
                {formatPercentage(analytics?.customersGrowth || 0)} vs last
                period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Order Value
            </CardTitle>
            <Target className="h-4 w-4 text-metallic-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-metallic-primary">
              {formatCurrency(analytics?.averageOrderValue || 0)}
            </div>
            <div className="flex items-center space-x-1">
              {getTrendIcon(analytics?.aovGrowth || 0)}
              <span
                className={`text-xs ${getTrendColor(analytics?.aovGrowth || 0)}`}
              >
                {formatPercentage(analytics?.aovGrowth || 0)} vs last period
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-metallic-primary">
              {analytics?.conversionRate || 0}%
            </div>
            <div className="flex items-center space-x-1">
              {getTrendIcon(analytics?.conversionGrowth || 0)}
              <span
                className={`text-xs ${getTrendColor(analytics?.conversionGrowth || 0)}`}
              >
                {formatPercentage(analytics?.conversionGrowth || 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Items
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {analytics?.lowStockItems || 0}
            </div>
            <p className="text-xs text-metallic-tertiary">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Orders
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {analytics?.pendingOrders || 0}
            </div>
            <p className="text-xs text-metallic-tertiary">
              Awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <PieChart className="h-4 w-4 text-metallic-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-metallic-primary">
              {analytics?.topSellingCategory || "N/A"}
            </div>
            <p className="text-xs text-metallic-tertiary">Best performing</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-metallic-secondary" />
              Sales Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-metallic-light/10 rounded-lg">
              <div className="text-center">
                <BarChart3 className="mx-auto h-12 w-12 text-metallic-light mb-2" />
                <p className="text-sm text-metallic-tertiary">
                  Sales chart visualization
                </p>
                <p className="text-xs text-metallic-tertiary mt-1">
                  7-day revenue trend:{" "}
                  {formatCurrency(
                    salesData.reduce((sum, day) => sum + day.revenue, 0),
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="mr-2 h-5 w-5 text-metallic-secondary" />
              Customer Segments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {customerSegments.map((segment) => (
                <div
                  key={segment.segment}
                  className="flex items-center justify-between p-3 bg-metallic-light/10 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-metallic-primary">
                      {segment.segment}
                    </div>
                    <div className="text-sm text-metallic-tertiary">
                      {segment.count} customers
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(segment.totalSpent)}
                    </div>
                    <div className="text-sm text-metallic-tertiary">
                      Avg: {formatCurrency(segment.averageOrderValue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5 text-metallic-secondary" />
            Product Performance Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Units Sold</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Conversion</TableHead>
                  <TableHead>Profit Margin</TableHead>
                  <TableHead>Stock Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productAnalytics.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-metallic-tertiary">
                          {product.category}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-metallic-primary">
                        {formatCurrency(product.revenue)}
                      </span>
                    </TableCell>
                    <TableCell>{product.unitsSold}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Eye className="mr-1 h-3 w-3 text-metallic-tertiary" />
                        {product.viewCount.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>{product.conversionRate.toFixed(2)}%</TableCell>
                    <TableCell className="text-green-600">
                      {product.profitMargin.toFixed(1)}%
                    </TableCell>
                    <TableCell>{getStockStatus(product.stockLevel)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Daily Sales Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-metallic-secondary" />
            Daily Sales Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>New Customers</TableHead>
                  <TableHead>Avg Order Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesData.map((day) => (
                  <TableRow key={day.date}>
                    <TableCell>
                      {new Date(day.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-metallic-primary">
                        {formatCurrency(day.revenue)}
                      </span>
                    </TableCell>
                    <TableCell>{day.orders}</TableCell>
                    <TableCell>{day.customers}</TableCell>
                    <TableCell>
                      {formatCurrency(day.revenue / day.orders)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;