import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardApi, DashboardData } from "@/lib/api";
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  DollarSign,
  Calendar,
  BarChart3,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user?.role]);

  const loadDashboardData = async () => {
    if (!user?.role) return;

    try {
      let response;
      switch (user.role) {
        case "admin":
          response = await dashboardApi.admin();
          break;
        case "customer":
          response = await dashboardApi.customer();
          break;
        case "warehouse":
          response = await dashboardApi.warehouse();
          break;
        case "staff":
          response = await dashboardApi.staff();
          break;
        default:
          return;
      }

      if (response.status === 200) {
        setDashboardData(response.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    color?: string;
  }> = ({ title, value, icon, trend, color = "metallic-primary" }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-metallic-tertiary">
          {title}
        </CardTitle>
        <div className={`text-${color}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-metallic-primary">{value}</div>
        {trend && (
          <p className="text-xs text-metallic-tertiary mt-1">{trend}</p>
        )}
      </CardContent>
    </Card>
  );

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const greeting =
      hour < 12
        ? "Good morning"
        : hour < 18
          ? "Good afternoon"
          : "Good evening";
    return `${greeting}, ${user?.name}!`;
  };

  const getRoleSpecificContent = () => {
    switch (user?.role) {
      case "admin":
        return (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Revenue"
              value={`$${dashboardData?.totalIncome?.toLocaleString() || "0"}`}
              icon={<DollarSign className="h-5 w-5" />}
              trend="+12% from last month"
              color="metallic-secondary"
            />
            <StatCard
              title="Total Products"
              value={dashboardData?.totalProducts || "0"}
              icon={<Package className="h-5 w-5" />}
              trend="3 new this week"
            />
            <StatCard
              title="Pending Orders"
              value={dashboardData?.pendingOrders?.length || "0"}
              icon={<ShoppingCart className="h-5 w-5" />}
              trend="Process orders ASAP"
              color="metallic-tertiary"
            />
            <StatCard
              title="Low Stock Items"
              value={dashboardData?.lowStockAlerts?.length || "0"}
              icon={<AlertTriangle className="h-5 w-5" />}
              trend="Needs attention"
              color="destructive"
            />
          </div>
        );

      case "customer":
        return (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="My Orders"
              value={dashboardData?.totalOrders || "0"}
              icon={<ShoppingCart className="h-5 w-5" />}
              trend="2 in progress"
            />
            <StatCard
              title="Total Spent"
              value={`$${dashboardData?.totalIncome?.toLocaleString() || "0"}`}
              icon={<DollarSign className="h-5 w-5" />}
              trend="This month"
              color="metallic-secondary"
            />
            <StatCard
              title="Favorite Products"
              value="8"
              icon={<Package className="h-5 w-5" />}
              trend="In wishlist"
              color="metallic-tertiary"
            />
          </div>
        );

      case "warehouse":
        return (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Inventory"
              value={dashboardData?.totalProducts || "0"}
              icon={<Package className="h-5 w-5" />}
              trend="Items in stock"
            />
            <StatCard
              title="Low Stock Alerts"
              value={dashboardData?.lowStockAlerts?.length || "0"}
              icon={<AlertTriangle className="h-5 w-5" />}
              trend="Needs restocking"
              color="destructive"
            />
            <StatCard
              title="Pending Requests"
              value="5"
              icon={<Calendar className="h-5 w-5" />}
              trend="Restock requests"
              color="metallic-secondary"
            />
            <StatCard
              title="Items Shipped"
              value="42"
              icon={<TrendingUp className="h-5 w-5" />}
              trend="This week"
              color="metallic-tertiary"
            />
          </div>
        );

      case "staff":
        return (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Orders to Process"
              value={dashboardData?.pendingOrders?.length || "0"}
              icon={<ShoppingCart className="h-5 w-5" />}
              trend="Awaiting processing"
            />
            <StatCard
              title="Completed Today"
              value="18"
              icon={<TrendingUp className="h-5 w-5" />}
              trend="Orders processed"
              color="metallic-secondary"
            />
            <StatCard
              title="Customer Inquiries"
              value="3"
              icon={<Users className="h-5 w-5" />}
              trend="Pending response"
              color="metallic-tertiary"
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-metallic-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-metallic-primary to-metallic-secondary rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{getWelcomeMessage()}</h1>
            <p className="text-metallic-light/80">
              Welcome to your{" "}
              <Badge className="bg-white/20 text-white">
                {user?.role?.toUpperCase()}
              </Badge>{" "}
              dashboard
            </p>
          </div>
          <div className="hidden md:block">
            <BarChart3 className="h-16 w-16 text-white/30" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {getRoleSpecificContent()}

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-metallic-primary">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {user?.role === "admin" && (
              <>
                <Button className="w-full justify-start bg-metallic-primary hover:bg-metallic-primary/90">
                  <Package className="mr-2 h-4 w-4" />
                  Add New Product
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-metallic-light"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
              </>
            )}
            {user?.role === "customer" && (
              <>
                <Button className="w-full justify-start bg-metallic-secondary hover:bg-metallic-secondary/90">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Browse Products
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-metallic-light"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  View Order History
                </Button>
              </>
            )}
            {user?.role === "warehouse" && (
              <>
                <Button className="w-full justify-start bg-metallic-tertiary hover:bg-metallic-tertiary/90">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Check Low Stock
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-metallic-light"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Update Inventory
                </Button>
              </>
            )}
            {user?.role === "staff" && (
              <>
                <Button className="w-full justify-start bg-metallic-primary hover:bg-metallic-primary/90">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Process Orders
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-metallic-light"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Customer Support
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-metallic-primary">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-metallic-secondary rounded-full"></div>
                <p className="text-sm text-metallic-tertiary">
                  Dashboard data loaded successfully
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-metallic-tertiary rounded-full"></div>
                <p className="text-sm text-metallic-tertiary">
                  User authenticated as {user?.role}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-metallic-light rounded-full"></div>
                <p className="text-sm text-metallic-tertiary">
                  System status: All services operational
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
