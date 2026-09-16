import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Ticket, Star, Calendar, Info, Volume2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { openTrailerModal } from '../../redux/slices/uiSlice';
import { useGetMovieVideosQuery } from '../../redux/services/tmdbApi';
import { getBackdropUrl } from '../../utils/formatters';

export default function HeroCarousel({ items = [], isLoading = false }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const featuredList = items.slice(0, 5);
  const activeMovie = featuredList[currentIndex] || items[0];

  // Auto-advance hero carousel every 8 seconds
  useEffect(() => {
    if (featuredList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredList.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [featuredList.length]);

  const activeId = activeMovie?.id;
  const { data: movieVideos } = useGetMovieVideosQuery(activeId, { skip: !activeId });
  const trailer = movieVideos?.results?.find(
    (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
  );

  const handleWatchTrailer = () => {
    if (trailer?.key) {
      dispatch(
        openTrailerModal({
          videoKey: trailer.key,
          title: `${activeMovie.title || activeMovie.name} - Official Trailer`,
        })
      );
    } else {
      dispatch(
        openTrailerModal({
          videoKey: null,
          title: activeMovie?.title || activeMovie?.name,
        })
      );
    }
  };

  if (!activeMovie) return null;

  const title = activeMovie.title || activeMovie.name;
  const releaseYear = (activeMovie.release_date || activeMovie.first_air_date || '').split('-')[0];
  const isMovie = !activeMovie.name;

  return (
    <div className="relative w-full h-[65vh] sm:h-[80vh] min-h-[480px] max-h-[750px] overflow-hidden bg-dark-950">
      {/* Backdrop Image with gradient overlay */}
      <div className="absolute inset-0">
        <img
          key={activeMovie.id}
          src={getBackdropUrl(activeMovie.backdrop_path, 'original')}
          alt={title}
          className="w-full h-full object-cover object-center animate-fade-in filter brightness-90"
        />
        {/* Layered Cinema Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/70 to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12 sm:pb-16">
        <div className="max-w-2xl space-y-4 animate-slide-up">
          {/* Badges */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-rose-600/90 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-rose-950">
              # {currentIndex + 1} Trending Worldwide
            </span>
            {activeMovie.vote_average > 0 && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {activeMovie.vote_average.toFixed(1)} TMDB
              </span>
            )}
            {releaseYear && (
              <span className="flex items-center gap-1 text-slate-300 text-xs font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {releaseYear}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-lg line-clamp-2">
            {title}
          </h1>

          {/* Overview */}
          <p className="text-slate-300 text-sm sm:text-base line-clamp-3 leading-relaxed max-w-xl text-shadow">
            {activeMovie.overview || 'Experience this cinematic masterpiece in high-definition.'}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2 flex-wrap">
            {isMovie && (
              <button
                onClick={() => navigate(`/movies/${activeMovie.id}/book`)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-sm shadow-xl shadow-rose-950/60 transition hover:scale-105"
              >
                <Ticket className="w-4 h-4" />
                Book Cinema Seats
              </button>
            )}

            <button
              onClick={handleWatchTrailer}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white font-semibold text-sm border border-slate-700 backdrop-blur transition hover:scale-105"
            >
              <Play className="w-4 h-4 text-rose-500 fill-rose-500" />
              Watch Trailer
            </button>

            <button
              onClick={() => navigate(`/${isMovie ? 'movies' : 'tv'}/${activeMovie.id}`)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-dark-900/70 hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-sm transition"
            >
              <Info className="w-4 h-4" />
              Details
            </button>
          </div>
        </div>

        {/* Carousel Slide Indicators */}
        <div className="flex items-center gap-2 mt-8">
          {featuredList.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentIndex === idx ? 'w-8 bg-rose-500' : 'w-2 bg-slate-600 hover:bg-slate-400'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
