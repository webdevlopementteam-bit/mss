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

const statsTop = [
  {
    title: "Today Orders",
    value: "₹0.00",
    icon: ShoppingCart,
  },
  {
    title: "Yesterday Orders",
    value: "₹0.00",
    icon: CalendarDays,
  },
  {
    title: "This Month",
    value: "₹8,887.99",
    icon: TrendingUp,
  },
  {
    title: "Last Month",
    value: "₹790.00",
    icon: CreditCard,
  },
  {
    title: "All-Time Sales",
    value: "₹5,35,873.00",
    icon: TrendingUp,
  },
];

const statsBottom = [
  {
    title: "Total Order",
    value: "195",
    icon: ShoppingCart,
  },
  {
    title: "Orders Pending",
    value: "13",
    icon: Clock,
  },
  {
    title: "Orders Processing",
    value: "3",
    icon: Truck,
  },
  {
    title: "Orders Delivered",
    value: "87",
    icon: CheckCircle,
  },
];

const chartData = [
  { name: "Mon", value: 150 },
  { name: "Tue", value: 120 },
  { name: "Wed", value: 100 },
  { name: "Thu", value: 140 },
  { name: "Fri", value: 80 },
  { name: "Sat", value: 60 },
  { name: "Sun", value: 90 },
];

const pieData = [
  { name: "Ready", value: 45, color: "#a7c8ff" },
  { name: "Bespoke", value: 25, color: "#adcbda" },
  { name: "Accessories", value: 30, color: "#acffa4" },
];

export default function Dashboard() {
  return (
    <div className="p-8 space-y-8">
      {/* TITLE */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--on-surface)]">
          Dashboard
        </h1>
      </div>

      {/* TOP CARDS (OLD ADMIN STYLE + NEW UI) */}
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
            Weekly Sales Revenue
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
            Category Split
          </h2>

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
            </PieChart>
          </div>

          <div className="mt-4 space-y-2">
            {pieData.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-[var(--on-surface-variant)]">
                  {item.name}
                </span>
                <span className="text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="space-y-4">
        {[
          {
            name: "Julian Deakin",
            email: "julian.d@example.com",
            product: "Midnight Wool Tuxedo",
            price: "₹2,450",
            status: "Delivered",
            date: "Oct 12",
            color: "green",
            initial: "J",
          },
          {
            name: "Sarah McAvoy",
            email: "s.mcavoy@atelier.com",
            product: "Silk Evening Gown",
            price: "₹4,820",
            status: "Processing",
            date: "Oct 14",
            color: "blue",
            initial: "S",
          },
          {
            name: "Evelyn Laurent",
            email: "e.laurent@luxury.fr",
            product: "Cashmere Coat",
            price: "₹1,950",
            status: "Pending",
            date: "Oct 15",
            color: "yellow",
            initial: "E",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition"
          >
            {/* USER */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-medium">
                {item.initial}
              </div>

              <div>
                <p className="text-white font-medium">{item.name}</p>
                <p className="text-xs text-gray-400">{item.email}</p>
              </div>
            </div>

            {/* PRODUCT */}
            <p className="text-gray-300">{item.product}</p>

            {/* PRICE */}
            <p className="text-white font-semibold">{item.price}</p>

            {/* STATUS */}
            <span
              className={`px-3 py-1 text-xs rounded-full w-fit ${
                item.color === "green"
                  ? "bg-green-500/20 text-green-400"
                  : item.color === "blue"
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-yellow-500/20 text-yellow-400"
              }`}
            >
              {item.status}
            </span>

            {/* DATE */}
            <p className="text-sm text-gray-400 text-right">{item.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
