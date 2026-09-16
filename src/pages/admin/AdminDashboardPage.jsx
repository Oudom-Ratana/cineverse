import {
  Clapperboard,
  Users,
  Banknote,
  MoreVertical,
} from "lucide-react";
import AdminChart from "../../components/admin/AdminChart";

export default function AdminDashboardPage() {
  const metricCards = [
    {
      title: "TOTAL MOVIES",
      value: "1,245",
      change: "+4.2%",
      isPositive: true,
      icon: <Clapperboard className="w-4 h-4 text-white" />,
    },
    {
      title: "TOTAL FREE MOVIES",
      value: "1,245",
      change: "+4.2%",
      isPositive: true,
      icon: <Clapperboard className="w-4 h-4 text-white" />,
    },
    {
      title: "TOTAL USERS",
      value: "45.2k",
      change: "+12.4%",
      isPositive: true,
      icon: <Users className="w-4 h-4 text-white" />,
    },
    {
      title: "TOTAL INCOMES",
      value: "$12.5k",
      change: "0.0%",
      isNeutral: true,
      icon: <Banknote className="w-4 h-4 text-white" />,
    },
    {
      title: "TOTAL EXPENSES",
      value: "45.2k",
      change: "+12.4%",
      isPositive: true,
      icon: <Banknote className="w-4 h-4 text-white" />,
    },
    {
      title: "REVENUE (MTD)",
      value: "$12.5k",
      change: "0.0%",
      isNeutral: true,
      icon: <Banknote className="w-4 h-4 text-white" />,
    },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* 6 Top Metric Cards Grid (Matching Exact Screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {metricCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
          >
            {/* Top Row: Icon badge + Title + 3-dots */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#b90101] shadow-xs flex items-center justify-center">
                  {card.icon}
                </div>
                <span className="text-[12px] font-black uppercase tracking-wider text-neutral-600">
                  {card.title}
                </span>
              </div>
              <button
                type="button"
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 transition"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Row: Big Value + Percentage pill */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
                {card.value}
              </span>
              <span className="text-xs font-bold text-neutral-500 flex items-center gap-0.5">
                {card.isPositive && <span className="text-neutral-600">↗</span>}
                {card.isNeutral && <span className="text-neutral-500">→</span>}
                <span>{card.change}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Chart 1: Tickets (monthly) */}
      <section>
        <AdminChart
          title="Tickets (monthly)"
          subtitle="Bandwidth consumption over last 9 months"
          yMax={3000}
          yStep={1000}
          badgeText="12M"
          dateText="September"
          yearText="2026"
          data={[
            600,
            750,
            700,
            1300,
            2300,
            2000,
            2900,
            2200,
            2550,
            1800,
            null,
            null,
          ]}
        />
      </section>

      {/* Chart 2: Total Profit (monthly) */}
      <section>
        <AdminChart
          title="Total Profit (monthly)"
          subtitle="Bandwidth consumption over last 9 months"
          yMax={30000}
          yStep={10000}
          badgeText="12M"
          dateText="September"
          yearText="2026"
          data={[
            6500,
            7800,
            8000,
            13000,
            21000,
            19000,
            24000,
            21000,
            24500,
            19000,
            null,
            null,
          ]}
        />
      </section>
    </div>
  );
}
