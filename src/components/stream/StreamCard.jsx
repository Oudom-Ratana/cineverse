import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import {
  addToFavourite,
  removeFromFavourite,
} from "../../redux/slices/favouriteSlice";
import { useGetMovieRuntimeQuery } from "../../services/api/movieApi";
import { useAddFavoriteMutation } from "../../services/api/accountApi";
import { formatMovieRuntime } from "../../utils/formatRuntime";

export default function StreamCard({ movie, activeGenreId }) {
  const dispatch = useDispatch();
  const favouriteMovies = useSelector((state) => state.favourite?.movies || []);
  const [addFavorite] = useAddFavoriteMutation();

  const isTV = Boolean(
    movie?.isTV ||
    movie?.media_type === "tv" ||
    movie?.first_air_date ||
    (movie?.name && !movie?.title),
  );

  const { data: fetchedRuntime } = useGetMovieRuntimeQuery(movie?.id, {
    skip: !movie?.id || isTV || Boolean(movie?.runtime),
  });

  if (!movie) return null;

  const title = movie.title || movie.name || "Untitled";
  const rating = (movie.vote_average || 8.5).toFixed(1);
  const releaseYear = (
    movie.release_date ||
    movie.first_air_date ||
    "2026"
  ).slice(0, 4);

  const rawRuntime = movie.runtime || fetchedRuntime;
  const runtime = formatMovieRuntime(
    rawRuntime,
    movie.id,
    isTV,
    movie.number_of_seasons,
  );

  // Comprehensive TMDB Genre Dictionary (TV + Movies)
  const TMDB_GENRE_MAP = {
    // Shared
    16: "ANIMATION",
    35: "COMEDY",
    80: "CRIME",
    99: "DOCUMENTARY",
    18: "DRAMA",
    10751: "FAMILY",
    9648: "MYSTERY",
    37: "WESTERN",
    // Movie specific
    28: "ACTION",
    12: "ADVENTURE",
    14: "FANTASY",
    36: "HISTORY",
    27: "HORROR",
    10402: "MUSIC",
    10749: "ROMANCE",
    878: "SCI-FI",
    10770: "TV MOVIE",
    53: "THRILLER",
    10752: "WAR",
    // TV specific
    10759: "ACTION",
    10762: "KIDS",
    10763: "NEWS",
    10764: "REALITY",
    10765: "SCI-FI",
    10766: "SOAP",
    10767: "TALK",
    10768: "WAR",
  };

  let genreName = isTV ? "SERIES" : "MOVIE";
  if (movie.genre) {
    genreName = movie.genre;
  } else if (movie.genres && movie.genres.length > 0) {
    genreName = movie.genres[0].name || movie.genres[0];
  } else if (movie.genre_ids && movie.genre_ids.length > 0) {
    if (
      activeGenreId &&
      movie.genre_ids.includes(activeGenreId) &&
      TMDB_GENRE_MAP[activeGenreId]
    ) {
      genreName = TMDB_GENRE_MAP[activeGenreId];
    } else {
      for (const gid of movie.genre_ids) {
        if (TMDB_GENRE_MAP[gid]) {
          genreName = TMDB_GENRE_MAP[gid];
          break;
        }
      }
    }
  }

  // Handle poster path (TMDB vs full URL)
  const posterUrl = movie.poster_path
    ? movie.poster_path.startsWith("http")
      ? movie.poster_path
      : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80";

  const targetUrl = movie.id
    ? `/stream/${movie.id}${isTV ? "?type=tv" : ""}`
    : "#";

  const overviewText =
    movie.overview ||
    movie.tagline ||
    "Experience the thrilling adventures, captivating story, and cinematic brilliance of this blockbuster release.";

  const isFavourite = favouriteMovies.some(
    (m) => String(m.id) === String(movie.id),
  );

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const nextFavState = !isFavourite;

    // 1. Instant local/optimistic update in Redux
    if (isFavourite) {
      dispatch(removeFromFavourite(movie.id));
    } else {
      dispatch(
        addToFavourite({
          id: movie.id,
          title,
          posterUrl,
          duration: runtime,
          year: releaseYear,
          genre: genreName,
          description: overviewText,
          isTV,
        }),
      );
    }

    // 2. Sync to official TMDB Account Favorite API
    try {
      await addFavorite({
        mediaType: isTV ? "tv" : "movie",
        mediaId: movie.id,
        favorite: nextFavState,
      }).unwrap();
    } catch (err) {
      console.warn("Failed to sync favorite with TMDB API:", err);
    }
  };

  return (
    <div className="group flex flex-col space-y-3 font-sans cursor-pointer">
      {/* Poster Container with Top-Right Favorite Button */}
      <div className="relative">
        <Link
          to={targetUrl}
          className="relative aspect-[291/386] w-full overflow-hidden block shadow-md dark:shadow-2xl bg-neutral-900 border border-neutral-200/80 dark:border-white/10 transition-all duration-300 rounded-tl-[25px] rounded-br-[25px] rounded-tr-none rounded-bl-none"
          style={{
            borderTopLeftRadius: "25px",
            borderBottomRightRadius: "25px",
            borderTopRightRadius: "0px",
            borderBottomLeftRadius: "0px",
          }}
        >
          <img
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95"
            loading="lazy"
          />

          {/* Dark Blur Hover Overlay with Description Pop-up (Active for both Light & Dark modes) */}
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-center p-4 sm:p-5 text-center">
            <div className="transform translate-y-3 mx-auto group-hover:translate-y-0 transition-transform duration-300 space-y-2">
              <span
                className="inline-flex items-center justify-center px-4 py-1 rounded-full text-white font-black text-[12px] sm:text-[13px] uppercase tracking-wider shadow-md border border-white/20"
                style={{ backgroundColor: "#B90101" }}
              >
                {genreName.toUpperCase()}
              </span>
              <p className="text-white text-[18px] leading-relaxed line-clamp-4 font-normal drop-shadow">
                {overviewText}
              </p>
              <span className="inline-flex items-center text-[16px] font-bold text-neutral-300 group-hover:text-accent-gold pt-1">
                Stream Now →
              </span>
            </div>
          </div>
        </Link>

        {/* Favorite Heart Button: Positioned on the Card Top Right */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          className="absolute top-2.5 right-2.5 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-90 hover:scale-110 shadow-lg"
          aria-label={
            isFavourite
              ? `Remove ${title} from favourites`
              : `Add ${title} to favourites`
          }
          title={
            isFavourite
              ? `Remove ${title} from favourites`
              : `Add ${title} to favourites`
          }
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isFavourite
                ? "fill-[#B90101] text-[#B90101]"
                : "text-white hover:text-[#B90101]"
            }`}
          />
        </button>
      </div>

      {/* Title & Metadata */}
      <div className="space-y-1 px-0.5 pt-0.5">
        <Link to={targetUrl}>
          <h3 className="font-black text-[21px] sm:text-[22px] text-neutral-900 dark:text-white leading-tight line-clamp-1 group-hover:text-[#B90101] transition-colors">
            {title}
          </h3>
        </Link>

        {/* Time and Rating Row */}
        <div className="flex items-center justify-between pt-0.5">
          <p className="text-[18px] text-neutral-500 dark:text-neutral-400 font-semibold tracking-tight">
            {runtime} • {releaseYear}
          </p>

          {/* Right Side: Rating */}
          <div className="flex items-center gap-1 text-[#C8961E]">
            <Star className="w-4 h-4 fill-[#C8961E] text-[#C8961E]" />
            <span className="text-[18px] font-black leading-none">
              {rating}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
