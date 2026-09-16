import { useState, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Film,
  Eraser,
  Sparkles,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import MovieModal from "../../components/admin/MovieModal";
import ManagedMoviesTab from "../../components/admin/ManagedMoviesTab";
import {
  useActiveMovies,
  addCatalogMovie,
  updateCatalogMovie,
  deleteCatalogMovie,
  resetTo15RealMovies,
  syncFromLiveTmdb,
  clearAllCatalogMovies,
} from "../../utils/movieCatalogService";

export default function AdminMovieLibraryPage() {
  const movies = useActiveMovies();

  const [activeTab, setActiveTab] = useState("CATALOG"); // 'CATALOG' | 'TMDB_FEED'
  const [activeFilter, setActiveFilter] = useState("ALL"); // 'ALL' | 'LIVE' | 'UPCOMING'
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSyncing, setIsSyncing] = useState(false);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);

  // Dynamic Live TMDB Sync (Fetches 15 real trending movies & TV series)
  const handleSyncLiveTmdb = async () => {
    setIsSyncing(true);
    try {
      await syncFromLiveTmdb();
      toast.success("Successfully fetched 15 real titles live from TMDB!");
      setCurrentPage(1);
    } catch (e) {
      toast.error("Failed to sync live TMDB titles");
    } finally {
      setIsSyncing(false);
    }
  };

  // Reset to 15 Real TMDB Titles
  const handleReset15Movies = () => {
    resetTo15RealMovies();
    toast.info("Reset movie library to 15 Real TMDB titles");
    setCurrentPage(1);
  };

  // Clear all movies
  const handleClearAll = () => {
    if (movies.length === 0) return;
    clearAllCatalogMovies();
    setCurrentPage(1);
  };

  // Filtered & Searched Movies
  const filteredMovies = useMemo(() => {
    return movies.filter((m) => {
      if (activeFilter === "LIVE" && m.status !== "Live") return false;
      if (activeFilter === "UPCOMING" && m.status !== "Upcoming") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = m.title?.toLowerCase().includes(q);
        const matchesGenres = m.genres?.toLowerCase().includes(q);
        const matchesHall = m.hall?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesGenres && !matchesHall) return false;
      }

      return true;
    });
  }, [movies, activeFilter, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage) || 1;
  const paginatedMovies = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMovies.slice(start, start + itemsPerPage);
  }, [filteredMovies, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handlers
  const handleOpenAdd = () => {
    setEditingMovie(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (movie) => {
    setEditingMovie(movie);
    setIsModalOpen(true);
  };

  // Delete instantly without blocking popup or notification
  const handleDelete = (id) => {
    deleteCatalogMovie(id);
  };

  const handleToggleStatus = (movie) => {
    const nextStatus = movie.status === "Live" ? "Upcoming" : "Live";
    const updated = { ...movie, status: nextStatus };
    updateCatalogMovie(updated);
    toast.success(`"${movie.title}" status changed to ${nextStatus}!`);
  };

  const handleSaveMovie = (movieData) => {
    if (editingMovie) {
      updateCatalogMovie(movieData);
    } else {
      addCatalogMovie(movieData);
      setCurrentPage(1);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Top Main View Switcher */}
      <div className="flex items-center gap-6 border-b border-neutral-200">
        <button
          onClick={() => setActiveTab("CATALOG")}
          className={`flex items-center gap-2 pb-3 px-1 text-sm font-black uppercase tracking-wider border-b-2 transition ${
            activeTab === "CATALOG"
              ? "border-[#b90101] text-[#b90101]"
              : "border-transparent text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Active Cinema Library ({movies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("TMDB_FEED")}
          className={`flex items-center gap-2 pb-3 px-1 text-sm font-black uppercase tracking-wider border-b-2 transition ${
            activeTab === "TMDB_FEED"
              ? "border-[#b90101] text-[#b90101]"
              : "border-transparent text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#b90101]" />
          <span>TMDB Now Playing Explorer</span>
        </button>
      </div>

      {activeTab === "TMDB_FEED" ? (
        <ManagedMoviesTab />
      ) : (
        <>
          {/* Top Header: Title with Red Underline Bar + Filter Tabs & Action Buttons */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="relative inline-block pb-2">
                <h1 className="text-3xl sm:text-4xl font-black text-[#b90101] tracking-tight">
                  Movie Library
                </h1>
                <div className="absolute bottom-0 left-0 w-36 h-1 bg-[#b90101] rounded-full" />
              </div>
              <p className="text-xs sm:text-sm text-neutral-500 font-semibold mt-2">
                Manage your platform&apos;s content catalog ({movies.length}{" "}
                Real TMDB Titles Active — Synced with User Website & Firestore).
              </p>
            </div>

            {/* Right Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Pill Tabs Container */}
              <div className="flex items-center gap-1.5 p-1 bg-white border border-neutral-200 rounded-full shadow-xs">
                <button
                  onClick={() => {
                    setActiveFilter("ALL");
                    setCurrentPage(1);
                  }}
                  className={`px-5 py-2 rounded-full text-xs font-bold uppercase transition ${
                    activeFilter === "ALL"
                      ? "bg-[#b90101] text-white shadow-xs"
                      : "text-neutral-600 hover:text-black"
                  }`}
                >
                  ALL MOVIES
                </button>
                <button
                  onClick={() => {
                    setActiveFilter("LIVE");
                    setCurrentPage(1);
                  }}
                  className={`px-5 py-2 rounded-full text-xs font-bold uppercase transition ${
                    activeFilter === "LIVE"
                      ? "bg-[#b90101] text-white shadow-xs"
                      : "text-neutral-600 hover:text-black"
                  }`}
                >
                  LIVE
                </button>
                <button
                  onClick={() => {
                    setActiveFilter("UPCOMING");
                    setCurrentPage(1);
                  }}
                  className={`px-5 py-2 rounded-full text-xs font-bold uppercase transition ${
                    activeFilter === "UPCOMING"
                      ? "bg-[#b90101] text-white shadow-xs"
                      : "text-neutral-600 hover:text-black"
                  }`}
                >
                  UPCOMING
                </button>
              </div>

              {/* Sync Live TMDB Button */}
              <button
                onClick={handleSyncLiveTmdb}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-red-50 hover:bg-red-100 border border-red-200 text-[#b90101] font-extrabold text-xs shadow-xs transition active:scale-95 disabled:opacity-50"
                title="Fetch real trending movies & TV series directly from TMDB Cloud API"
              >
                {isSyncing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-[#b90101]" />
                )}
                <span>
                  {isSyncing ? "Syncing TMDB..." : "Sync Live TMDB (15)"}
                </span>
              </button>

              {/* Reset 15 Real TMDB Button */}
              <button
                onClick={handleReset15Movies}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-neutral-300 hover:border-[#b90101] text-neutral-700 hover:text-[#b90101] font-bold text-xs shadow-xs transition"
                title="Reset library to 15 Real TMDB titles"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset 15 TMDB</span>
              </button>

              {/* Clear Library Button */}
              {movies.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-white border border-neutral-300 hover:border-red-600 text-neutral-600 hover:text-red-600 font-bold text-xs shadow-xs transition"
                  title="Clear all active movies"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Clear</span>
                </button>
              )}

              {/* Add Movie CTA Button */}
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#b90101] hover:brightness-110 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>ADD MOVIE</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {movies.length > 0 && (
            <div className="flex items-center justify-between gap-4">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search movie title, hall, or genre..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-full text-xs font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#b90101] shadow-xs"
                />
              </div>

              <span className="text-xs font-bold text-neutral-500 whitespace-nowrap">
                Showing {paginatedMovies.length} of {filteredMovies.length}{" "}
                movies
              </span>
            </div>
          )}

          {/* Main Table Card */}
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#b90101] text-white text-xs font-black uppercase tracking-wider">
                    <th className="py-4 px-6">TITLE</th>
                    <th className="py-4 px-6">DURATION</th>
                    <th className="py-4 px-6">HALL</th>
                    <th className="py-4 px-6">DATE</th>
                    <th className="py-4 px-6">GENRES</th>
                    <th className="py-4 px-6 text-center">STATUS</th>
                    <th className="py-4 px-6 text-center">ACTIONS</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-100 text-xs sm:text-sm font-semibold text-neutral-800">
                  {paginatedMovies.map((movie) => {
                    const isLive = movie.status === "Live";

                    return (
                      <tr
                        key={movie.id}
                        className="hover:bg-neutral-50/80 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <img
                              src={
                                movie.poster_path?.startsWith("http")
                                  ? movie.poster_path
                                  : movie.poster_path
                                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                                    : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80"
                              }
                              alt={movie.title}
                              className="w-12 h-16 object-cover rounded-xl shadow-xs border border-neutral-200 shrink-0 bg-neutral-900"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src =
                                  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80";
                              }}
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="font-extrabold text-neutral-900 text-sm sm:text-base leading-snug">
                                {movie.title}
                              </span>
                              <span className="text-xs text-neutral-500 font-medium">
                                {movie.year || "2026"} &bull;{" "}
                                {movie.genres || "Action"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 font-medium text-neutral-700">
                          {movie.duration || "2h 25min"}
                        </td>

                        <td className="py-4 px-6 font-medium text-neutral-700">
                          {movie.hall || "Ciniverse SenSok"}
                        </td>

                        <td className="py-4 px-6 font-medium text-neutral-700">
                          {movie.date || "20-25/09/2026"}
                        </td>

                        <td className="py-4 px-6 font-medium text-neutral-700">
                          {movie.genres || "Action"}
                        </td>

                        <td className="py-4 px-6 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(movie)}
                            title={`Click to toggle status to ${isLive ? "Upcoming" : "Live"}`}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition cursor-pointer hover:scale-105 active:scale-95 ${
                              isLive
                                ? "text-[#b90101] border-red-300 bg-red-50/70 hover:bg-red-100"
                                : "text-amber-700 border-amber-300 bg-amber-50/70 hover:bg-amber-100"
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isLive
                                  ? "bg-[#b90101] animate-pulse"
                                  : "bg-amber-500"
                              }`}
                            />
                            <span>{movie.status || "Live"}</span>
                            <span className="text-[10px] text-neutral-400 font-normal">
                              ⇄
                            </span>
                          </button>
                        </td>

                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(movie)}
                              className="w-8 h-8 rounded-full bg-[#b90101] hover:brightness-110 text-white flex items-center justify-center shadow-xs transition active:scale-95"
                              title="Edit movie"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(movie.id)}
                              className="w-8 h-8 rounded-full bg-[#b90101] hover:brightness-110 text-white flex items-center justify-center shadow-xs transition active:scale-95"
                              title="Delete movie instantly"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {paginatedMovies.length === 0 && (
                <div className="p-16 text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-red-50 border border-red-200 text-[#b90101] flex items-center justify-center mx-auto shadow-sm">
                    <Film className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900">
                      Your Movie Library is Empty
                    </h3>
                    <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
                      Start adding movies live from TMDB Cloud, or load your 100
                      offline backup anytime.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={handleOpenAdd}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#b90101] text-white font-extrabold text-xs shadow-md transition hover:brightness-110 active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add First Movie from TMDB Cloud</span>
                    </button>

                    <button
                      onClick={handleReset15Movies}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-neutral-300 hover:border-[#b90101] text-neutral-700 hover:text-[#b90101] font-bold text-xs shadow-xs transition"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Load Authentic TMDB Catalog</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="p-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-50/50">
                <span className="text-xs font-semibold text-neutral-500">
                  Showing{" "}
                  <span className="font-bold text-neutral-800">
                    {filteredMovies.length === 0
                      ? 0
                      : (currentPage - 1) * itemsPerPage + 1}
                  </span>
                  –
                  <span className="font-bold text-neutral-800">
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredMovies.length,
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-neutral-800">
                    {filteredMovies.length}
                  </span>{" "}
                  movies (Page {currentPage} of {totalPages})
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = i + 1;
                      if (currentPage > 3 && totalPages > 5) {
                        pageNum = Math.min(
                          currentPage - 2 + i,
                          totalPages - (4 - i),
                        );
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition ${
                            currentPage === pageNum
                              ? "bg-[#b90101] text-white shadow-xs"
                              : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <MovieModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMovie}
        editingMovie={editingMovie}
      />
    </div>
  );
}
