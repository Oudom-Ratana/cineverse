import React from 'react';
import { Filter, SlidersHorizontal, RotateCcw } from 'lucide-react';

export default function FilterBar({
  genres = [],
  selectedGenre = '',
  onSelectGenre,
  sortBy = 'popularity.desc',
  onSortChange,
  onReset,
}) {
  const sortOptions = [
    { label: 'Most Popular', value: 'popularity.desc' },
    { label: 'Highest Rated', value: 'vote_average.desc' },
    { label: 'Newest Release', value: 'primary_release_date.desc' },
    { label: 'Revenue Box Office', value: 'revenue.desc' },
  ];

  return (
    <div className="bg-dark-900 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-8 shadow-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2 text-white font-semibold">
          <SlidersHorizontal className="w-4 h-4 text-rose-500" />
          <span>Filters & Discovery</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-dark-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Reset Filters */}
          {(selectedGenre || sortBy !== 'popularity.desc') && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Genre Chips */}
      {genres.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pt-4 no-scrollbar">
          <button
            onClick={() => onSelectGenre('')}
            className={`flex-none px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
              !selectedGenre
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                : 'bg-dark-950 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Genres
          </button>
          {genres.map((g) => (
            <button
              key={g.id}
              onClick={() => onSelectGenre(String(g.id))}
              className={`flex-none px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
                selectedGenre === String(g.id)
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                  : 'bg-dark-950 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
