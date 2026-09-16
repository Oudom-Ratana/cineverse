import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Sparkles, ShieldCheck } from 'lucide-react';
import { getUpcomingDates, generateDefaultShowtimes } from '../../utils/cinemaData';
import { formatCurrency } from '../../utils/formatters';
import { listenAdminShowtimes } from '../../services/firestoreService';

export default function ShowtimePicker({ movie, selectedShowtime, onSelectShowtime }) {
  const dates = getUpcomingDates(7);
  const [selectedDate, setSelectedDate] = useState(dates[0].dateStr);
  const [adminSlots, setAdminSlots] = useState([]);

  // Listen to dynamic Admin scheduled showtimes in Firestore
  useEffect(() => {
    const unsub = listenAdminShowtimes((slots) => {
      setAdminSlots(slots || []);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const defaultSlots = generateDefaultShowtimes(movie.id, movie.title || movie.name);

  // Match admin slots for this date and movie (or general slots for this movie)
  const matchingAdminSlots = adminSlots.filter(
    (s) => s.date === selectedDate && (String(s.movieId) === String(movie.id) || s.movieTitle === movie.title)
  );

  // If admin scheduled custom slots for this movie, show admin slots with full priority; otherwise provide defaults
  const fallbackDateDefaults = defaultSlots.filter((st) => st.date === selectedDate);
  const combinedSlots = matchingAdminSlots.length > 0
    ? matchingAdminSlots.map((s) => ({ ...s, isAdminManaged: true }))
    : fallbackDateDefaults;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mb-1">
          <Calendar className="w-5 h-5 text-rose-500" />
          Select Date
        </h3>
        <p className="text-xs text-slate-400">Choose your preferred screening day</p>

        {/* Date Chips */}
        <div className="flex gap-2.5 overflow-x-auto py-3 no-scrollbar">
          {dates.map((d) => {
            const isSelected = selectedDate === d.dateStr;
            return (
              <button
                key={d.dateStr}
                onClick={() => setSelectedDate(d.dateStr)}
                className={`flex-none flex flex-col items-center justify-center min-w-[76px] py-2.5 px-3 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-950/60 scale-105'
                    : 'bg-dark-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <span className="text-[11px] font-medium uppercase tracking-wider">{d.dayName}</span>
                <span className="text-base font-bold my-0.5">{d.monthDay.split(' ')[1]}</span>
                <span className="text-[10px] opacity-80">{d.monthDay.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Screenings / Halls List */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Available Screenings & Auditoriums
          </h3>
          {matchingAdminSlots.length > 0 && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Verified Screenings Live
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 mb-4">Select an auditorium and showtime slot</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {combinedSlots.map((slot) => {
            const isSelected = selectedShowtime?.id === slot.id;
            return (
              <div
                key={slot.id}
                onClick={() => onSelectShowtime(slot)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-rose-950/30 border-rose-500 ring-2 ring-rose-500/50 shadow-xl'
                    : 'bg-dark-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-white">{slot.time}</span>
                      {slot.isAdminManaged && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          Admin Scheduled
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-rose-400 mt-0.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {slot.format}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">From</span>
                    <p className="text-sm font-bold text-emerald-400">{formatCurrency(slot.basePrice)}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="truncate">{slot.hallName}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300">
                    Select Seats →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
