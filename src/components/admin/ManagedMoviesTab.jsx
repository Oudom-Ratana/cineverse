import React, { useState, useEffect } from "react";
import { Plus, Film, Sparkles, PlusCircle, Check } from "lucide-react";
import { toast } from "react-toastify";
import { useGetNowPlayingQuery } from "../../redux/services/tmdbApi";
import { getPosterUrl } from "../../utils/formatters";
import {
  listenManagedMovies,
  toggleAdminManagedMovie,
} from "../../services/firestoreService";
import {
  addCatalogMovie,
  useActiveMovies,
} from "../../utils/movieCatalogService";

export default function ManagedMoviesTab() {
  const { data: nowPlayingData, isLoading } = useGetNowPlayingQuery();
  const [managedMovies, setManagedMovies] = useState([]);
  const [newTmdbId, setNewTmdbId] = useState("");
  const [newMovieTitle, setNewMovieTitle] = useState("");
  const activeCatalog = useActiveMovies();

  const catalogIds = new Set(
    activeCatalog.map((m) => String(m.id || m.tmdbId)),
  );

  useEffect(() => {
    const unsub = listenManagedMovies((list) => {
      setManagedMovies(list || []);
    });
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, []);

  const managedIds = new Set(managedMovies.map((m) => Number(m.id)));

  const handleToggle = async (movie) => {
    await toggleAdminManagedMovie(movie);
    toast.info(`Updated cinema booking status for "${movie.title}"`);
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
      addCatalogMovie({
        id: idNum,
        tmdbId: idNum,
        title: newMovieTitle.trim() || `Movie #${idNum}`,
        status: "Live",
      });
      toast.success(`Movie #${idNum} added to Cinema Catalog!`);
      setNewTmdbId("");
      setNewMovieTitle("");
    }
  };

  const handleAddToCatalog = (movie) => {
    addCatalogMovie({
      id: movie.id,
      tmdbId: movie.id,
      title: movie.title || movie.name,
      genres: "Action, Adventure",
      duration: "2h 10min",
      hall: "Hall 1 - Standard",
      date: "20-25/09/2026",
      status: "Live",
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      overview: movie.overview,
      vote_average: movie.vote_average,
      release_date: movie.release_date || "2026-09-01",
    });
    toast.success(`"${movie.title}" added to active Cinema Library!`);
  };

  const moviesList = nowPlayingData?.results || [];

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Quick Add by ID */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-xs">
        <div>
          <h3 className="font-bold text-lg text-neutral-900 flex items-center gap-2">
            <Film className="w-5 h-5 text-[#b90101]" />
            TMDB Now Playing Cloud Explorer
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Browse real-time releases currently in cinemas from TMDB. Click to
            instantly add titles into your Active Cinema Library with full
            schedules and hall booking.
          </p>
        </div>

        <form
          onSubmit={handleAddById}
          className="flex flex-wrap items-center gap-2"
        >
          <input
            type="number"
            placeholder="TMDB ID (e.g. 693134)..."
            required
            value={newTmdbId}
            onChange={(e) => setNewTmdbId(e.target.value)}
            className="w-36 px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:border-[#b90101]"
          />
          <input
            type="text"
            placeholder="Title (optional)..."
            value={newMovieTitle}
            onChange={(e) => setNewMovieTitle(e.target.value)}
            className="w-40 px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:border-[#b90101]"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#b90101] hover:brightness-110 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Quick Add
          </button>
        </form>
      </div>

      {/* Movies Table */}
      <div className="bg-white border border-neutral-200/80 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <span className="text-xs font-black text-neutral-600 uppercase tracking-wider">
            TMDB Cloud Feed ({moviesList.length} Now Playing)
          </span>
          <span className="text-xs text-[#b90101] font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            {catalogIds.size} Titles in Active Library
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-neutral-400 font-semibold">
            Connecting to TMDB Cloud API...
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {moviesList.map((movie) => {
              const inCatalog = catalogIds.has(String(movie.id));
              const isEnabled = managedIds.has(Number(movie.id));

              return (
                <div
                  key={movie.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/80 transition"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={getPosterUrl(movie.poster_path, "w92")}
                      alt={movie.title}
                      className="w-12 h-16 object-cover rounded-xl bg-neutral-900 border border-neutral-200 shrink-0 shadow-xs"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80";
                      }}
                    />
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900">
                        {movie.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 mt-1">
                        <span className="font-mono text-[11px] bg-neutral-100 px-1.5 py-0.5 rounded">
                          TMDB #{movie.id}
                        </span>
                        <span>•</span>
                        <span>{movie.release_date || "2026"}</span>
                        <span>•</span>
                        <span className="text-amber-500 font-bold">
                          ★ {movie.vote_average?.toFixed(1) || "8.0"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end sm:self-center">
                    {/* Add to Cinema Library Button */}
                    <button
                      onClick={() => handleAddToCatalog(movie)}
                      disabled={inCatalog}
                      className={`px-3.5 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                        inCatalog
                          ? "bg-emerald-50 border border-emerald-300 text-emerald-700 cursor-default"
                          : "bg-[#b90101] hover:brightness-110 text-white shadow-xs active:scale-95"
                      }`}
                    >
                      {inCatalog ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>In Cinema Library</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Add to Library</span>
                        </>
                      )}
                    </button>

                    {/* Quick Toggle for Booking */}
                    <button
                      onClick={() => handleToggle(movie)}
                      className={`px-3.5 py-2 rounded-full text-xs font-bold border transition ${
                        isEnabled
                          ? "bg-red-50 border-red-300 text-[#b90101] hover:bg-red-100"
                          : "bg-white border-neutral-300 text-neutral-600 hover:text-black hover:border-neutral-400"
                      }`}
                      title="Toggle direct authorization for cinema booking"
                    >
                      {isEnabled ? "✓ Authorized" : "+ Authorize"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
