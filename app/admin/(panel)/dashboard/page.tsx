"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Pill,
  FlaskConical,
  Users,
  TrendingUp,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import toast from "react-hot-toast";
import { getSocket } from "@/lib/socket";

type DashboardStats = {
  orders: number;
  medicines: number;
  labTests: number;
  customers: number;
  chart: {
    name: string;
    value: number;
  }[];
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [status, setStatus] = useState("Connecting");

useEffect(() => {
  const loadStats = async () => {
    try {
      const res = await fetch("/api/admin/dashboard", {
        cache: "no-store",
      });
      const data: DashboardStats = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Dashboard fetch failed:", error);
    }
  };

  loadStats();

  const socket = getSocket();

  socket.on("connect", () => {
    setStatus("Live");
    console.log("Admin socket connected:", socket.id);
  });

  socket.on("order:new", () => {
    toast.success("🛒 New order received!");
  });

  socket.on("dashboard:update", () => {
    loadStats();
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

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        Loading dashboard…
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Pharmacy Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Real-time administration overview
        </p>
        <div className="flex items-center gap-2 text-xs text-emerald-600 mt-2">
          <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
          {status}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Orders"
          value={stats.orders}
          icon={<ShoppingCart />}
          trend="+8%"
        />
        <StatCard
          title="Medicines"
          value={stats.medicines}
          icon={<Pill />}
          trend="+3%"
        />
        <StatCard
          title="Lab Tests"
          value={stats.labTests}
          icon={<FlaskConical />}
          trend="+5%"
        />
        <StatCard
          title="Customers"
          value={stats.customers}
          icon={<Users />}
          trend="+12%"
        />
      </div>

      {/* Analytics Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4">
          Pharmacy Analytics
        </h2>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.chart}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="value"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">
            Recent Orders
          </h2>
          <div className="space-y-3 text-sm">
            <OrderRow id="1023" status="Delivered" />
            <OrderRow id="1022" status="Processing" />
            <OrderRow id="1021" status="Pending" />
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">
            System Status
          </h2>
          <StatusRow label="Server" value="Online" ok />
          <StatusRow label="Database" value="Connected" ok />
          <StatusRow label="Payments" value="Monitoring" />
          <StatusRow label="Activity" value="Normal" ok />
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
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex justify-between items-center hover:shadow-md transition">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <span className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
          <TrendingUp size={14} /> {trend}
        </span>
      </div>
      <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
        {icon}
      </div>
    </div>
  );
}

function OrderRow({ id, status }: { id: string; status: string }) {
  return (
    <div className="flex justify-between items-center border-b pb-2 last:border-none">
      <span>Order #{id}</span>
      <span className="text-xs px-3 py-1 rounded-full bg-gray-100">
        {status}
      </span>
    </div>
  );
}

function StatusRow({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok?: boolean;
}) {
  return (
    <div className="flex justify-between items-center text-sm mb-3">
      <span>{label}</span>
      <span
        className={`flex items-center gap-1 ${
          ok ? "text-emerald-600" : "text-amber-600"
        }`}
      >
        <Activity size={14} /> {value}
      </span>
    </div>
  );
}
