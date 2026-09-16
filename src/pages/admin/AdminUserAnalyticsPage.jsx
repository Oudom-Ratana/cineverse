import {
  Calendar,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Clapperboard,
  Film,
  Ticket,
} from "lucide-react";
import { toast } from "react-toastify";

export default function AdminUserAnalyticsPage() {
  const handleExport = () => {
    toast.success("Analytics report exported successfully (CSV/PDF)");
  };

  const topMovies = [
    {
      id: 1,
      title: "Spider-Man",
      duration: "2h 12m",
      year: "2026",
      genre: "ACTION",
      tickets: "1.2K",
      poster: "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
    },
    {
      id: 2,
      title: "Spider-Man",
      duration: "2h 12m",
      year: "2026",
      genre: "ACTION",
      tickets: "1.2K",
      poster: "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
    },
    {
      id: 3,
      title: "Spider-Man",
      duration: "2h 12m",
      year: "2026",
      genre: "ACTION",
      tickets: "1.2K",
      poster: "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
    },
  ];

  const topUsers = [
    {
      id: 1,
      name: "Ratana Oudom",
      tickets: "10 tickets",
      period: "This Month",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: 2,
      name: "Seng SilKhema",
      tickets: "8 tickets",
      period: "This Month",
      avatar:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: 3,
      name: "San SengThanu",
      tickets: "5 tickets",
      period: "This Month",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 font-sans">
      {/* Header: Title with Red Underline + Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="relative inline-block pb-1.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[#b90101] tracking-tight">
              User Analytics
            </h1>
            <div className="absolute bottom-0 left-0 w-28 h-0.5 bg-[#b90101] rounded-full" />
          </div>
          <p className="text-xs text-neutral-500 font-semibold mt-1">
            Insights into audience engagement and subscription models.
          </p>
        </div>

        {/* Right Date Filter & Export Button */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 shadow-xs transition"
          >
            <Calendar className="w-3.5 h-3.5 text-[#b90101]" />
            <span>Last 30 Days</span>
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-[#b90101] hover:brightness-110 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Row 1: Booking Summary (Left) & Booking Insights (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Left: Booking Summary Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-neutral-200/80 shadow-xs flex flex-col justify-between space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-neutral-900">
                Booking Summary
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5 font-medium">
                Overview of customer bookings
              </p>
            </div>
            <span className="text-xs font-bold text-neutral-500 flex items-center gap-0.5">
              <span>↗</span>
              <span>+12.4%</span>
            </span>
          </div>

          <div>
            <span className="text-3xl sm:text-4xl font-black text-[#b90101] tracking-tight">
              1,680
            </span>
            <p className="text-xs font-bold text-neutral-500 mt-0.5">
              Total Booking
            </p>
          </div>

          {/* 3 Color Status Cards: Green Confirmed, Red Cancelled, Yellow Pending */}
          <div className="grid grid-cols-2  gap-2.5 sm:gap-3">
            {/* Confirmed */}
            <div className="bg-emerald-50/70 border border-emerald-300/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 text-center space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-emerald-800 font-black text-sm sm:text-base">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>2540</span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-bold text-emerald-900">
                Confirmed
              </p>
              <p className="text-xs sm:text-sm font-black text-emerald-800">
                76%
              </p>
            </div>

            {/* Cancelled */}
            <div className="bg-rose-50/70 border border-rose-300/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 text-center space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-rose-800 font-black text-sm sm:text-base">
                <XCircle className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                <span>180</span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-bold text-rose-900">Cancelled</p>
              <p className="text-xs sm:text-sm font-black text-rose-800">14%</p>
            </div>

            {/* Pending */}
            {/* <div className="bg-amber-50/70 border border-amber-300/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 text-center space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-amber-800 font-black text-sm sm:text-base">
                <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>120</span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-bold text-amber-900">Pending</p>
              <p className="text-xs sm:text-sm font-black text-amber-800">
                10%
              </p>
            </div> */}
          </div>
        </div>

        {/* Right: Booking Insights Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-neutral-200/80 shadow-xs flex flex-col justify-between space-y-2.5">
          <h3 className="text-lg font-extrabold text-neutral-900">
            Booking insights
          </h3>

          <div className="space-y-2 divide-y divide-neutral-100">
            {/* Item 1: Most Book Movie */}
            <div className="flex items-center justify-between pt-2 first:pt-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#b90101] text-white shadow-xs">
                  <Clapperboard className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-[#b90101]">
                    Spider-Man
                  </h4>
                  <p className="text-[11px] text-neutral-500 font-medium">
                    Most Book Movie
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-neutral-900">
                  1,680
                </span>
                <p className="text-[10px] text-neutral-400 font-semibold">
                  tickets
                </p>
              </div>
            </div>

            {/* Item 2: Popular Screen Types */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#b90101] text-white shadow-xs">
                  <Film className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-[#b90101]">
                    2D
                  </h4>
                  <p className="text-[11px] text-neutral-500 font-medium">
                    Popular screen types
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-neutral-900">81%</span>
                <p className="text-[10px] text-neutral-400 font-semibold">
                  Occupancy
                </p>
              </div>
            </div>

            {/* Item 3: Peak Showtime */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#b90101] text-white shadow-xs">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-[#b90101]">
                    Peak Showtime
                  </h4>
                  <p className="text-[11px] text-neutral-500 font-medium">
                    5:00 - 9:00 PM
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-neutral-900">911</span>
                <p className="text-[10px] text-neutral-400 font-semibold">
                  bookings
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Top Movies (Left) & Top Active Users (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Left: Top Movies */}
        <div className="lg:col-span-5 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-neutral-200/80 shadow-xs space-y-2.5">
          <h3 className="text-base font-extrabold text-[#b90101]">Top Movies</h3>

          <div className="space-y-2">
            {topMovies.map((movie, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-neutral-50/80 border border-neutral-100 hover:border-neutral-200 transition"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-9 h-12 object-cover rounded-lg shadow-xs shrink-0"
                  />
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-neutral-900 leading-tight">
                      {movie.title}
                    </h4>
                    <p className="text-[10px] text-neutral-400 font-medium mt-0.5">
                      {movie.duration} • {movie.year}
                    </p>
                    <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-[#b90101] text-white text-[9px] font-black uppercase">
                      {movie.genre}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-black text-neutral-700 bg-white px-2.5 py-1 rounded-lg border border-neutral-200 shadow-xs shrink-0">
                  <Ticket className="w-3.5 h-3.5 text-[#b90101]" />
                  <span>{movie.tickets}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Top Active Users */}
        <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-neutral-200/80 shadow-xs space-y-2.5">
          <h3 className="text-base font-extrabold text-[#b90101]">
            Top Active Users
          </h3>

          <div className="space-y-2">
            {topUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-neutral-50/80 border border-neutral-100 hover:border-neutral-200 transition"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
                  />
                  <span className="text-xs sm:text-sm font-extrabold text-neutral-900">
                    {user.name}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs sm:text-sm font-black text-[#b90101] block">
                    {user.tickets}
                  </span>
                  <span className="text-[10px] font-semibold text-neutral-400">
                    {user.period}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
