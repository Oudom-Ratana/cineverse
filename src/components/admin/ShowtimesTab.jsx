import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2, Film, Sparkles } from 'lucide-react';
import { HALLS, getUpcomingDates, generateDefaultShowtimes } from '../../utils/cinemaData';
import { formatCurrency } from '../../utils/formatters';
import {
  listenAdminShowtimes,
  addAdminShowtime,
  deleteAdminShowtime,
  listenManagedMovies,
} from '../../services/firestoreService';

export default function ShowtimesTab() {
  const dates = getUpcomingDates(7);
  const [selectedDate, setSelectedDate] = useState(dates[0].dateStr);
  const [showtimes, setShowtimes] = useState([]);
  const [managedMovies, setManagedMovies] = useState([]);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newMovieId, setNewMovieId] = useState('');
  const [newTime, setNewTime] = useState('06:00 PM');
  const [newHall, setNewHall] = useState('hall-imax-1');
  const [newFormat, setNewFormat] = useState('IMAX 3D');
  const [newPrice, setNewPrice] = useState('19.50');

  useEffect(() => {
    const unsubMovies = listenManagedMovies((list) => {
      setManagedMovies(list);
      if (list.length > 0 && !newTitle) {
        setNewTitle(list[0].title || 'Dune: Part Two');
        setNewMovieId(String(list[0].id));
      }
    });

    const unsubShowtimes = listenAdminShowtimes((slots) => {
      if (slots && slots.length > 0) {
        setShowtimes(slots);
      } else {
        // Fallback default seeded slots
        const defaults = generateDefaultShowtimes(693134, 'Dune: Part Two');
        setShowtimes(defaults);
      }
    });

    return () => {
      if (typeof unsubMovies === 'function') unsubMovies();
      if (typeof unsubShowtimes === 'function') unsubShowtimes();
    };
  }, []);

  const handleAddSlot = async (e) => {
    e.preventDefault();
    const hallObj = HALLS.find((h) => h.id === newHall) || HALLS[0];
    const priceNum = parseFloat(newPrice) || 16.00;

    const newSlot = {
      id: `st_${newMovieId || 'custom'}_${selectedDate}_${Date.now().toString(36)}`,
      movieId: String(newMovieId || 693134),
      movieTitle: newTitle || 'Featured Film',
      date: selectedDate,
      time: newTime,
      hallId: hallObj.id,
      hallName: hallObj.name.split('—')[0].trim(),
      format: newFormat,
      basePrice: priceNum,
      vipPrice: priceNum + 8.00,
    };

    await addAdminShowtime(newSlot);
  };

  const handleDelete = async (id) => {
    await deleteAdminShowtime(id);
  };

  const filtered = showtimes.filter((s) => s.date === selectedDate);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Date Bar */}
      <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {dates.map((d) => (
          <button
            key={d.dateStr}
            onClick={() => setSelectedDate(d.dateStr)}
            className={`flex-none px-4 py-2 rounded-xl text-xs font-semibold transition ${
              selectedDate === d.dateStr
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                : 'bg-dark-950 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {d.dayName}, {d.monthDay}
          </button>
        ))}
      </div>

      {/* Add Showtime Slot Form */}
      <form onSubmit={handleAddSlot} className="p-6 rounded-3xl bg-dark-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-rose-500" />
            Schedule New Screening for {selectedDate} (Live for Users)
          </h3>
          <span className="text-xs text-emerald-400 font-medium">Auto-Synced to User Booking Flow</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Movie</label>
            {managedMovies.length > 0 ? (
              <select
                value={newMovieId}
                onChange={(e) => {
                  const found = managedMovies.find((m) => String(m.id) === e.target.value);
                  setNewMovieId(e.target.value);
                  if (found) setNewTitle(found.title);
                }}
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                {managedMovies.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title || `Movie #${m.id}`}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Dune: Part Two"
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            )}
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Auditorium</label>
            <select
              value={newHall}
              onChange={(e) => setNewHall(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
            >
              {HALLS.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Time Slot</label>
            <input
              type="text"
              required
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              placeholder="e.g. 07:15 PM"
              className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Screen Format</label>
            <input
              type="text"
              required
              value={newFormat}
              onChange={(e) => setNewFormat(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Base Price ($)</label>
            <input
              type="number"
              step="0.5"
              required
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Publish Screening Slot to Public
        </button>
      </form>

      {/* Screenings List */}
      <div className="bg-dark-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
          <span>Scheduled Slots for {selectedDate} ({filtered.length})</span>
          <span className="text-slate-400 font-normal">All slots appear dynamically in User Showtime Picker</span>
        </div>

        <div className="divide-y divide-slate-800">
          {filtered.length > 0 ? (
            filtered.map((slot) => (
              <div
                key={slot.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-white">{slot.time}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-rose-400 font-semibold">
                      {slot.format}
                    </span>
                  </div>
                  <h4 className="font-semibold text-xs text-slate-200 mt-1">{slot.movieTitle}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{slot.hallName}</p>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <span className="text-sm font-bold text-emerald-400">{formatCurrency(slot.basePrice)}</span>
                  <button
                    onClick={() => handleDelete(slot.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Delete showtime"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              No screenings scheduled yet for {selectedDate}. Use the form above to add a slot.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
