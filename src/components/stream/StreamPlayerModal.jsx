import { useState, useEffect } from "react";
import { X, Play, Film } from "lucide-react";

/**
 * StreamPlayerModal
 * Cinema video player with:
 * 1. VidSrc.pm streaming engine for Full Movies and TV Series
 * 2. Official TMDB YouTube Trailers
 */
export default function StreamPlayerModal({
  isOpen,
  onClose,
  tmdbId,
  mediaType = "movie", // 'movie' | 'tv'
  title = "Movie Player",
  trailerKey,
  initialMode = "full_movie", // 'full_movie' | 'trailer'
  season = 1,
  episode = 1,
  totalEpisodes = 8,
  onEpisodeChange,
}) {
  const [activeMode, setActiveMode] = useState(initialMode);
  const [currentSeason, setCurrentSeason] = useState(season);
  const [currentEpisode, setCurrentEpisode] = useState(episode);

  useEffect(() => {
    setActiveMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    setCurrentSeason(season);
    setCurrentEpisode(episode);
  }, [season, episode]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !tmdbId) return null;

  const isTV = mediaType === "tv";

  // VidSrc.pm streaming endpoint
  const fullMovieUrl = isTV
    ? `https://vidsrc.pm/embed/tv?tmdb=${tmdbId}&season=${currentSeason}&episode=${currentEpisode}`
    : `https://vidsrc.pm/embed/movie?tmdb=${tmdbId}`;

  const youtubeUrl = trailerKey
    ? `https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`
    : null;

  const currentStreamSrc =
    activeMode === "trailer" && youtubeUrl ? youtubeUrl : fullMovieUrl;

  const handleEpisodeSelect = (ep) => {
    setCurrentEpisode(ep);
    if (onEpisodeChange) onEpisodeChange(ep);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn">
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-neutral-950 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* 1. Modal Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-b border-white/10 bg-neutral-900/80">
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-black text-white truncate">
              {title}
            </h3>
            {mediaType === "tv" && activeMode === "full_movie" && (
              <p className="text-xs sm:text-sm font-semibold text-[#FFD700]">
                Season {currentSeason} • Episode {currentEpisode}
              </p>
            )}
          </div>

          {/* Controls: Mode Switcher & Close */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mode Switcher Pills */}
            <div className="flex items-center p-1 rounded-full bg-neutral-800 border border-white/10 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveMode("full_movie")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                  activeMode === "full_movie"
                    ? "bg-[#B90101] text-white shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>
                  {mediaType === "tv" ? "Watch Series" : "Full Movie"}
                </span>
              </button>

              {trailerKey && (
                <button
                  type="button"
                  onClick={() => setActiveMode("trailer")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                    activeMode === "trailer"
                      ? "bg-[#B90101] text-white shadow-sm"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Trailer</span>
                </button>
              )}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-[#B90101] border border-white/15 text-white flex items-center justify-center transition active:scale-95"
              aria-label="Close Player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Responsive 16:9 Video Player Viewport */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          <iframe
            key={currentStreamSrc}
            src={currentStreamSrc}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* 3. TV Series Episode Navigator (if TV Show & Full Movie mode) */}
        {mediaType === "tv" &&
          activeMode === "full_movie" &&
          totalEpisodes > 1 && (
            <div className="p-3 sm:p-4 bg-neutral-900 border-t border-white/10 flex items-center gap-3 overflow-x-auto select-none">
              <span className="text-xs font-black text-neutral-400 uppercase tracking-wider shrink-0">
                Episodes:
              </span>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map(
                  (epNum) => {
                    const isActive = epNum === currentEpisode;
                    return (
                      <button
                        key={epNum}
                        type="button"
                        onClick={() => handleEpisodeSelect(epNum)}
                        className={`w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center transition-all ${
                          isActive
                            ? "bg-[#B90101] text-white shadow-lg shadow-red-950/60 scale-105"
                            : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-white/10"
                        }`}
                      >
                        {epNum}
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
