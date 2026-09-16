import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Film, Sparkles } from 'lucide-react';
import { useGetNowPlayingQuery } from '../../redux/services/tmdbApi';
import { getPosterUrl } from '../../utils/formatters';
import { listenManagedMovies, toggleAdminManagedMovie } from '../../services/firestoreService';

export default function ManagedMoviesTab() {
  const { data: nowPlayingData } = useGetNowPlayingQuery();
  const [managedMovies, setManagedMovies] = useState([]);
  const [newTmdbId, setNewTmdbId] = useState('');
  const [newMovieTitle, setNewMovieTitle] = useState('');

  useEffect(() => {
    const unsub = listenManagedMovies((list) => {
      setManagedMovies(list);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const managedIds = new Set(managedMovies.map((m) => Number(m.id)));

  const handleToggle = async (movie) => {
    await toggleAdminManagedMovie(movie);
  };

  const handleAddById = async (e) => {
    e.preventDefault();
    const idNum = parseInt(newTmdbId.trim(), 10);
    if (!isNaN(idNum)) {
      await toggleAdminManagedMovie({
        id: idNum,
        title: newMovieTitle.trim() || `Movie #${idNum}`,
        poster_path: null,
      });
      setNewTmdbId('');
      setNewMovieTitle('');
    }
  };

  const moviesList = nowPlayingData?.results || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Add Movie */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-dark-900 border border-slate-800">
        <div>
          <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-rose-500" />
            Managed Cinema Releases (Live Sync With Storefront)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Toggle which TMDB movies are unlocked for user seat booking and showtimes. Changes update public users instantly.
          </p>
        </div>

        <form onSubmit={handleAddById} className="flex flex-wrap gap-2">
          <input
            type="number"
            placeholder="TMDB ID (e.g. 693134)..."
            required
            value={newTmdbId}
            onChange={(e) => setNewTmdbId(e.target.value)}
            className="w-36 px-3.5 py-2 rounded-xl bg-dark-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
          />
          <input
            type="text"
            placeholder="Title (optional)..."
            value={newMovieTitle}
            onChange={(e) => setNewMovieTitle(e.target.value)}
            className="w-40 px-3.5 py-2 rounded-xl bg-dark-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            Authorize Movie
          </button>
        </form>
      </div>

      {/* Movies Table */}
      <div className="bg-dark-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            TMDB Catalog ({moviesList.length} Playing)
          </span>
          <span className="text-xs text-rose-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {managedIds.size} Titles Live for User Booking
          </span>
        </div>

        <div className="divide-y divide-slate-800">
          {moviesList.map((movie) => {
            const isEnabled = managedIds.has(Number(movie.id));

            return (
              <div
                key={movie.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/40 transition"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={getPosterUrl(movie.poster_path, 'w92')}
                    alt={movie.title}
                    className="w-12 h-16 object-cover rounded-lg bg-slate-800 flex-shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-white">{movie.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <span>TMDB ID: {movie.id}</span>
                      <span>•</span>
                      <span>Released: {movie.release_date || 'N/A'}</span>
                      <span>•</span>
                      <span className="text-amber-400 font-bold">★ {movie.vote_average?.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <button
                    onClick={() => handleToggle(movie)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                      isEnabled
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {isEnabled ? '✓ Live for Booking (Click to Disable)' : '+ Enable for Booking'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
