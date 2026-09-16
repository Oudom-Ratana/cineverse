import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DollarSign, Ticket, Film, Users, TrendingUp, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const REVENUE_DATA = [
  { day: 'Mon', revenue: 3840, bookings: 210 },
  { day: 'Tue', revenue: 4210, bookings: 245 },
  { day: 'Wed', revenue: 5120, bookings: 310 },
  { day: 'Thu', revenue: 4890, bookings: 290 },
  { day: 'Fri', revenue: 8450, bookings: 540 },
  { day: 'Sat', revenue: 11200, bookings: 720 },
  { day: 'Sun', revenue: 9800, bookings: 615 },
];

const AUDITORIUM_UTILIZATION = [
  { name: 'Hall 1 (IMAX)', occupancy: 88 },
  { name: 'Hall 2 (Dolby)', occupancy: 82 },
  { name: 'Hall 3 (VIP Lounge)', occupancy: 94 },
];

export default function AdminAnalytics() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Weekly Revenue</span>
            <h3 className="text-2xl font-black text-white mt-1">$47,510</h3>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              +18.4% vs last week
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Total Bookings</span>
            <h3 className="text-2xl font-black text-white mt-1">2,930</h3>
            <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
              <Sparkles className="w-3 h-3" />
              892 Group Sessions
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
            <Ticket className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Active Screenings</span>
            <h3 className="text-2xl font-black text-white mt-1">36 Slots</h3>
            <p className="text-[11px] text-cyan-400 mt-1">3 Auditoriums Active</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <Film className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Avg Occupancy</span>
            <h3 className="text-2xl font-black text-white mt-1">88.0%</h3>
            <p className="text-[11px] text-purple-400 mt-1">VIP Lounge 94% Peak</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recharts Revenue Area Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-6 rounded-3xl bg-dark-900 border border-slate-800 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-bold text-lg text-white">Revenue & Sales Trajectory</h3>
              <p className="text-xs text-slate-400">Gross revenue generated across all cinema halls</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
              Past 7 Days
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueColor" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Gross Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f43f5e"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#revenueColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recharts Daily Bookings Bar Chart */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-dark-900 border border-slate-800 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-bold text-lg text-white">Daily Admissions</h3>
              <p className="text-xs text-slate-400">Tickets booked per day</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="bookings" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
