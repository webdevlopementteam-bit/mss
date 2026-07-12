import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  ShoppingCart,
  CalendarDays,
  TrendingUp,
  CreditCard,
  Clock,
  Truck,
  CheckCircle,
} from "lucide-react";

import API from "../api/axios";
import toast from "react-hot-toast";

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_STYLE = {
  pending: "bg-yellow-500/20 text-yellow-400",
  confirmed: "bg-blue-500/20 text-blue-400",
  processing: "bg-blue-500/20 text-blue-400",
  packed: "bg-blue-500/20 text-blue-400",
  shipped: "bg-blue-500/20 text-blue-400",
  out_for_delivery: "bg-yellow-500/20 text-yellow-400",
  delivered: "bg-green-500/20 text-green-400",
  cancelled: "bg-gray-500/20 text-gray-400",
};

const formatCurrency = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/orders/admin/all");
        setOrders(res.data.orders || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Cancelled orders never counted as revenue.
  const revenueOrders = useMemo(
    () => orders.filter((o) => o.orderStatus !== "cancelled"),
    [orders]
  );

  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const sumInRange = (from, to) =>
      revenueOrders
        .filter((o) => {
          const t = new Date(o.createdAt);
          return t >= from && (!to || t < to);
        })
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const statusCounts = orders.reduce((acc, o) => {
      acc[o.orderStatus] = (acc[o.orderStatus] || 0) + 1;
      return acc;
    }, {});

    return {
      todaySales: sumInRange(todayStart),
      yesterdaySales: sumInRange(yesterdayStart, todayStart),
      thisMonthSales: sumInRange(monthStart),
      lastMonthSales: sumInRange(lastMonthStart, monthStart),
      allTimeSales: revenueOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
      totalOrders: orders.length,
      pendingCount: statusCounts.pending || 0,
      processingCount:
        (statusCounts.confirmed || 0) + (statusCounts.processing || 0) + (statusCounts.packed || 0),
      deliveredCount: statusCounts.delivered || 0,
    };
  }, [orders, revenueOrders]);

  // Revenue for each of the last 7 days.
  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    return days.map((d) => {
      const dayStart = startOfDay(d);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const value = revenueOrders
        .filter((o) => {
          const t = new Date(o.createdAt);
          return t >= dayStart && t < dayEnd;
        })
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      return { name: d.toLocaleDateString("en-US", { weekday: "short" }), value };
    });
  }, [revenueOrders]);

  // Order-status breakdown (replaces the old unrelated "Category Split" pie).
  const pieData = useMemo(() => {
    const buckets = [
      { key: "pending", name: "Pending", color: "#f5c451" },
      { key: "processing", name: "Processing", color: "#a7c8ff" },
      { key: "shipped", name: "Shipped", color: "#7fd1ff" },
      { key: "delivered", name: "Delivered", color: "#acffa4" },
      { key: "cancelled", name: "Cancelled", color: "#ff9a9a" },
    ];

    const counts = { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
    for (const o of orders) {
      if (o.orderStatus === "pending") counts.pending++;
      else if (["confirmed", "processing", "packed"].includes(o.orderStatus)) counts.processing++;
      else if (["shipped", "out_for_delivery"].includes(o.orderStatus)) counts.shipped++;
      else if (o.orderStatus === "delivered") counts.delivered++;
      else if (o.orderStatus === "cancelled") counts.cancelled++;
    }

    const total = orders.length || 1;
    return buckets
      .map((b) => ({ ...b, value: counts[b.key], percent: Math.round((counts[b.key] / total) * 100) }))
      .filter((b) => b.value > 0);
  }, [orders]);

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6),
    [orders]
  );

  const statsTop = [
    { title: "Today Orders", value: formatCurrency(stats.todaySales), icon: ShoppingCart },
    { title: "Yesterday Orders", value: formatCurrency(stats.yesterdaySales), icon: CalendarDays },
    { title: "This Month", value: formatCurrency(stats.thisMonthSales), icon: TrendingUp },
    { title: "Last Month", value: formatCurrency(stats.lastMonthSales), icon: CreditCard },
    { title: "All-Time Sales", value: formatCurrency(stats.allTimeSales), icon: TrendingUp },
  ];

  const statsBottom = [
    { title: "Total Order", value: stats.totalOrders, icon: ShoppingCart },
    { title: "Orders Pending", value: stats.pendingCount, icon: Clock },
    { title: "Orders Processing", value: stats.processingCount, icon: Truck },
    { title: "Orders Delivered", value: stats.deliveredCount, icon: CheckCircle },
  ];

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-[var(--on-surface-variant)]">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* TITLE */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--on-surface)]">
          Dashboard
        </h1>
      </div>

      {/* TOP CARDS */}
      <div className="grid grid-cols-5 gap-5">
        {statsTop.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-xl bg-[var(--surface-container-high)] border border-white/5 hover:border-white/10 transition group"
            >
              {/* ICON */}
              <div className="w-10 h-10 mb-4 flex items-center justify-center rounded-lg bg-white/5 group-hover:bg-[var(--primary-container)] transition">
                <Icon size={18} className="text-[var(--primary)]" />
              </div>

              {/* TITLE */}
              <p className="text-sm text-[var(--on-surface-variant)] mb-1">
                {item.title}
              </p>

              {/* VALUE */}
              <h2 className="text-2xl font-semibold text-white tracking-wide">
                {item.value}
              </h2>
            </div>
          );
        })}
      </div>

      {/* SECOND ROW */}
      <div className="grid grid-cols-4 gap-5">
        {statsBottom.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-xl bg-[var(--surface-container-high)] border border-white/5 flex items-center gap-4 hover:border-white/10 transition"
            >
              {/* ICON */}
              <div className="w-11 h-11 flex items-center justify-center rounded-full bg-[var(--primary-container)]">
                <Icon size={18} className="text-[var(--primary)]" />
              </div>

              {/* TEXT */}
              <div>
                <p className="text-sm text-[var(--on-surface-variant)]">
                  {item.title}
                </p>
                <h3 className="text-xl font-semibold text-white">
                  {item.value}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* CHART + PIE */}
      <div className="grid grid-cols-3 gap-6">
        {/* AREA CHART */}
        <div className="col-span-2 p-6 rounded-2xl bg-[var(--surface-container-low)]">
          <h2 className="text-lg font-semibold text-white mb-4">
            Last 7 Days Revenue
          </h2>

          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a7c8ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#a7c8ff" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#cbd5f5" }}
                />

                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    background: "#1a202b",
                    border: "none",
                    borderRadius: "10px",
                    color: "#fff",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#a7c8ff"
                  fill="url(#gradient)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE */}
        <div className="p-6 rounded-2xl bg-[var(--surface-container-low)]">
          <h2 className="text-lg font-semibold text-white mb-4">
            Orders by Status
          </h2>

          {pieData.length === 0 ? (
            <p className="text-sm text-[var(--on-surface-variant)]">No orders yet</p>
          ) : (
            <>
              <div className="h-[200px] flex justify-center">
                <PieChart width={200} height={200}>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    innerRadius={50}
                    outerRadius={80}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#1a202b",
                      border: "none",
                      borderRadius: "10px",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </div>

              <div className="mt-4 space-y-2">
                {pieData.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-[var(--on-surface-variant)]">
                      {item.name}
                    </span>
                    <span className="text-white">
                      {item.value} ({item.percent}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Recent Orders</h2>

        {recentOrders.length === 0 ? (
          <p className="text-sm text-[var(--on-surface-variant)] py-6">
            No orders yet.
          </p>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((order) => {
              const itemLabel =
                order.orderItems?.length > 1
                  ? `${order.orderItems[0]?.name} +${order.orderItems.length - 1} more`
                  : order.orderItems?.[0]?.name || "—";

              const initial =
                order.customerInfo?.fullName?.[0]?.toUpperCase() || "?";

              return (
                <div
                  key={order._id}
                  onClick={() => navigate(`/orders/${order._id}`)}
                  className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition cursor-pointer"
                >
                  {/* USER */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-medium flex-shrink-0">
                      {initial}
                    </div>

                    <div className="min-w-0">
                      <p className="text-white font-medium truncate">
                        {order.customerInfo?.fullName || "Guest"}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {order.customerInfo?.email}
                      </p>
                    </div>
                  </div>

                  {/* PRODUCT */}
                  <p className="text-gray-300 truncate">{itemLabel}</p>

                  {/* PRICE */}
                  <p className="text-white font-semibold">
                    {formatCurrency(order.totalAmount)}
                  </p>

                  {/* STATUS */}
                  <span
                    className={`px-3 py-1 text-xs rounded-full w-fit ${
                      STATUS_STYLE[order.orderStatus] || "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {STATUS_LABELS[order.orderStatus] || order.orderStatus}
                  </span>

                  {/* DATE */}
                  <p className="text-sm text-gray-400 text-right">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
