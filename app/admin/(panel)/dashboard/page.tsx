"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Pill,
  FlaskConical,
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  IndianRupee,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Package,
  Star,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import toast from "react-hot-toast";
import { getSocket } from "@/lib/socket";

type DashboardData = {
  stats: {
    orders: number;
    medicines: number;
    labTests: number;
    customers: number;
    revenue: number;
    pendingOrders: number;
    todayOrders: number;
    todayRevenue: number;
  };
  recentOrders: Array<{
    id: number;
    customer_name: string;
    total_amount: number;
    status: string;
    created_at: string;
    payment_method: string;
  }>;
  lowStockMedicines: Array<{
    name: string;
    stock_qty: number;
    price: number;
  }>;
  monthlyChart: Array<{
    name: string;
    orders: number;
    revenue: number;
  }>;
  popularMedicines: Array<{
    name: string;
    order_count: number;
    total_qty: number;
  }>;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Connecting");

  const loadDashboard = async () => {
    try {
      const res = await fetch("/api/admin/dashboard", {
        cache: "no-store",
      });
      const dashboardData: DashboardData = await res.json();
      setData(dashboardData);
    } catch (error) {
      console.error("Dashboard fetch failed:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    const socket = getSocket();

    socket.on("connect", () => {
      setStatus("Live");
      console.log("Admin socket connected:", socket.id);
    });

    socket.on("order:new", () => {
      toast.success("🛒 New order received!");
      loadDashboard();
    });

    socket.on("dashboard:update", () => {
      loadDashboard();
    });

    socket.on("disconnect", () => {
      setStatus("Disconnected");
    });

    return () => {
      socket.off("order:new");
      socket.off("dashboard:update");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    loadDashboard();
    toast.success("Dashboard refreshed");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "PROCESSING":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "DELIVERED":
        return "bg-green-100 text-green-700 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return <Clock className="w-3 h-3" />;
      case "PROCESSING":
        return <Activity className="w-3 h-3" />;
      case "DELIVERED":
        return <CheckCircle className="w-3 h-3" />;
      case "CANCELLED":
        return <XCircle className="w-3 h-3" />;
      default:
        return <Activity className="w-3 h-3" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Failed to load dashboard</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Pharmacy Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Real-time administration overview
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span
            className={`h-2 w-2 rounded-full ${
              status === "Live" ? "bg-emerald-500 animate-pulse" : "bg-red-500"
            }`}
          />
          <span
            className={
              status === "Live" ? "text-emerald-600" : "text-red-600"
            }
          >
            {status}
          </span>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Total Orders"
          value={data.stats.orders}
          icon={<ShoppingCart />}
          trend="+8%"
          trendUp={true}
          color="teal"
          subtitle={`${data.stats.todayOrders} today`}
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(data.stats.revenue)}
          icon={<IndianRupee />}
          trend="+12%"
          trendUp={true}
          color="green"
          subtitle={`${formatCurrency(data.stats.todayRevenue)} today`}
        />
        <StatCard
          title="Medicines"
          value={data.stats.medicines}
          icon={<Pill />}
          trend="+3%"
          trendUp={true}
          color="blue"
          subtitle={`${data.lowStockMedicines.length} low stock`}
        />
        <StatCard
          title="Customers"
          value={data.stats.customers}
          icon={<Users />}
          trend="+15%"
          trendUp={true}
          color="purple"
          subtitle="Active users"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <MiniStatCard
          title="Pending Orders"
          value={data.stats.pendingOrders}
          icon={<Clock />}
          color="amber"
        />
        <MiniStatCard
          title="Lab Tests"
          value={data.stats.labTests}
          icon={<FlaskConical />}
          color="indigo"
        />
        <MiniStatCard
          title="Low Stock Items"
          value={data.lowStockMedicines.length}
          icon={<AlertTriangle />}
          color="red"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-2 mb-6">
        {/* Revenue & Orders Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Monthly Performance
          </h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  dot={{ fill: "#14b8a6", r: 4 }}
                  name="Orders"
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 4 }}
                  name="Revenue (₹)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Medicines */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Popular Medicines
          </h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.popularMedicines}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="total_qty"
                  fill="#14b8a6"
                  radius={[8, 8, 0, 0]}
                  name="Total Quantity Sold"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders & Low Stock */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Orders
            </h2>
            <ShoppingCart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {data.recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No orders yet</p>
            ) : (
              data.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">
                        #{order.id}
                      </p>
                      <span
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {order.customer_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(order.total_amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.payment_method}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Low Stock Alert
            </h2>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="space-y-3">
            {data.lowStockMedicines.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-gray-500">All medicines well stocked!</p>
              </div>
            ) : (
              data.lowStockMedicines.map((medicine, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 border border-red-200 bg-red-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {medicine.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(medicine.price)} per unit
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-red-500" />
                      <p className="font-bold text-red-600">
                        {medicine.stock_qty}
                      </p>
                    </div>
                    <p className="text-xs text-red-500">units left</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Components ---------------- */

function StatCard({
  title,
  value,
  icon,
  trend,
  trendUp,
  color,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean;
  color: string;
  subtitle?: string;
}) {
  const colorClasses = {
    teal: "bg-teal-50 text-teal-600",
    green: "bg-green-50 text-green-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div
          className={`h-12 w-12 rounded-lg flex items-center justify-center ${
            colorClasses[color as keyof typeof colorClasses]
          }`}
        >
          {icon}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span
          className={`text-xs flex items-center gap-1 ${
            trendUp ? "text-green-600" : "text-red-600"
          }`}
        >
          {trendUp ? (
            <TrendingUp size={14} />
          ) : (
            <TrendingDown size={14} />
          )}
          {trend}
        </span>
        {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
      </div>
    </div>
  );
}

function MiniStatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  const colorClasses = {
    amber: "bg-amber-50 text-amber-600",
    indigo: "bg-indigo-50 text-indigo-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div
          className={`h-10 w-10 rounded-lg flex items-center justify-center ${
            colorClasses[color as keyof typeof colorClasses]
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}