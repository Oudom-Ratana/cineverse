import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Play, Ticket, Heart, Bookmark, Check, Sparkles } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { openTrailerModal, openAuthModal } from '../../redux/slices/uiSlice';
import { useGetMovieVideosQuery, useGetTVVideosQuery } from '../../redux/services/tmdbApi';
import { getPosterUrl, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { toggleFavorite, toggleWatchlist, listenManagedMovies } from '../../services/firestoreService';

export default function MovieCard({ item, mediaType = 'movie', isFavInitially = false, isWatchlistInitially = false }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const [isFavorite, setIsFavorite] = useState(isFavInitially);
  const [isWatchlist, setIsWatchlist] = useState(isWatchlistInitially);
  const [managedMovies, setManagedMovies] = useState([]);

  const id = item?.id;
  const title = item?.title || item?.name || 'Untitled';
  const releaseDate = item?.release_date || item?.first_air_date;
  const rating = item?.vote_average ? item.vote_average.toFixed(1) : null;
  const resolvedMediaType = item?.media_type || mediaType;

  // Listen to Admin Managed Movies in Firestore dynamically
  useEffect(() => {
    const unsub = listenManagedMovies((list) => {
      setManagedMovies(list || []);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const isBookableInCinema = item?.isBookable ?? (managedMovies.length === 0 || managedMovies.some((m) => Number(m.id) === Number(id)));

  // Query trailer video key from TMDB for this item
  const { data: movieVideos } = useGetMovieVideosQuery(id, { skip: !id || resolvedMediaType === 'tv' });
  const { data: tvVideos } = useGetTVVideosQuery(id, { skip: !id || resolvedMediaType !== 'tv' });

  const trailerVideo = (movieVideos?.results || tvVideos?.results || []).find(
    (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
  );

  const handleTrailerClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (trailerVideo?.key) {
      dispatch(openTrailerModal({ videoKey: trailerVideo.key, title: `${title} - Official Trailer` }));
    } else {
      dispatch(openTrailerModal({ videoKey: null, title }));
    }
  };

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      dispatch(openAuthModal({ mode: 'login' }));
      return;
    }
    const newStatus = await toggleFavorite(user.uid, {
      id,
      title,
      poster_path: item.poster_path,
      vote_average: item.vote_average,
      release_date: releaseDate,
      mediaType: resolvedMediaType,
    });
    setIsFavorite(newStatus);
  };

  const handleWatchlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      dispatch(openAuthModal({ mode: 'login' }));
      return;
    }
    const newStatus = await toggleWatchlist(user.uid, {
      id,
      title,
      poster_path: item.poster_path,
      vote_average: item.vote_average,
      release_date: releaseDate,
      mediaType: resolvedMediaType,
    });
    setIsWatchlist(newStatus);
  };

  return (
    <div className="group relative flex-none w-44 sm:w-52 rounded-2xl bg-dark-900 border border-slate-800/80 overflow-hidden hover:border-slate-700 transition-all duration-300 hover:shadow-xl hover:shadow-rose-950/20 hover:-translate-y-1">
      {/* Poster Image Container */}
      <Link to={`/${resolvedMediaType === 'tv' ? 'tv' : 'movies'}/${id}`} className="block relative aspect-[2/3] overflow-hidden bg-slate-800">
        <img
          src={getPosterUrl(item.poster_path, 'w500')}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Rating Badge */}
        {rating && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-dark-950/80 backdrop-blur-md border border-slate-700/50 text-[11px] font-bold text-amber-400">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>{rating}</span>
          </div>
        )}

        {/* Action Toggles: Favourites & Watchlist */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 opacity-90 group-hover:opacity-100 transition">
          <button
            onClick={handleFavoriteClick}
            className={`p-1.5 rounded-full backdrop-blur-md transition ${
              isFavorite
                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/50'
                : 'bg-dark-950/70 text-slate-300 hover:text-white hover:bg-dark-950'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label="Toggle favorite"
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white' : ''}`} />
          </button>

          <button
            onClick={handleWatchlistClick}
            className={`p-1.5 rounded-full backdrop-blur-md transition ${
              isWatchlist
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/50'
                : 'bg-dark-950/70 text-slate-300 hover:text-white hover:bg-dark-950'
            }`}
            title={isWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
            aria-label="Toggle watchlist"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isWatchlist ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Hover Quick Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 gap-2">
          {resolvedMediaType === 'movie' ? (
            isBookableInCinema ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/movies/${id}/book`);
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-950/80 transition"
              >
                <Ticket className="w-3.5 h-3.5" />
                Book Cinema Seats
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/movies/${id}/watch`);
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold shadow transition"
              >
                <Play className="w-3.5 h-3.5 fill-cyan-400" />
                Watch Stream
              </button>
            )
          ) : (
            <button
              onClick={(e) => {
                e.preventDefault();
                navigate(`/tv/${id}/watch`);
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-950/80 transition"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Watch Episode 1
            </button>
          )}

          <button
            onClick={handleTrailerClick}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-medium backdrop-blur transition"
          >
            <Play className="w-3 h-3 text-rose-400" />
            Watch Trailer
          </button>
        </div>
      </Link>

      {/* Info Meta */}
      <div className="p-3.5">
        <Link to={`/${resolvedMediaType === 'tv' ? 'tv' : 'movies'}/${id}`}>
          <h3 className="font-semibold text-sm text-white truncate hover:text-rose-400 transition" title={title}>
            {title}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-1 text-xs text-slate-400">
          <span>{releaseDate ? new Date(releaseDate).getFullYear() : 'Upcoming'}</span>
          <div className="flex items-center gap-1">
            {isBookableInCinema && (
              <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/30">
                In Theaters
              </span>
            )}
            <span className="uppercase text-[10px] tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              {resolvedMediaType}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
