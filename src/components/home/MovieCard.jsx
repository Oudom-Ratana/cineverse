import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useGetMovieRuntimeQuery } from "../../services/api/movieApi";
import { formatMovieRuntime } from "../../utils/formatRuntime";

export default function MovieCard({ movie, basePath = "/movies" }) {
  const isTV = Boolean(
    movie?.media_type === "tv" ||
    movie?.first_air_date ||
    (movie?.name && !movie?.title),
  );

  const { data: fetchedRuntime } = useGetMovieRuntimeQuery(movie?.id, {
    skip: !movie?.id || isTV || Boolean(movie?.runtime),
  });

  if (!movie) return null;

  const targetUrl = movie.id
    ? `${basePath}/${movie.id}${isTV ? "?type=tv" : ""}`
    : "#";

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

  // Handle genre resolution
  let genreName = "ACTION";
  if (movie.genre) {
    genreName = movie.genre;
  } else if (movie.genres && movie.genres.length > 0) {
    genreName = movie.genres[0].name || movie.genres[0];
  } else if (movie.genre_ids && movie.genre_ids.length > 0) {
    const genreMap = {
      28: "ACTION",
      12: "ADVENTURE",
      16: "ANIMATION",
      35: "COMEDY",
      80: "CRIME",
      18: "DRAMA",
      14: "FANTASY",
      27: "HORROR",
      878: "SCI-FI",
      10759: "ACTION",
      10765: "FANTASY",
    };
    genreName = genreMap[movie.genre_ids[0]] || "ACTION";
  }

  // Handle poster path (TMDB vs full URL)
  const posterUrl = movie.poster_path
    ? movie.poster_path.startsWith("http")
      ? movie.poster_path
      : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80";

  const overviewText =
    movie.overview ||
    "Experience the thrilling adventures, captivating story, and cinematic brilliance of this blockbuster release.";

  return (
    <div className="group flex flex-col space-y-3 font-sans cursor-pointer">
      {/* Poster Container with Mixed Corner Radius and Dark Blur Hover Overlay */}
      <Link
        to={targetUrl}
        className="relative aspect-[291/386] w-full overflow-hidden shadow-md dark:shadow-2xl bg-neutral-900 border border-neutral-200/80 dark:border-white/10 transition-all duration-300 rounded-tl-[25px] rounded-br-[25px] rounded-tr-none rounded-bl-none"
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
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80";
          }}
        />

        {/* Dark Blur Hover Overlay with Description Pop-up (Active for both Light & Dark modes) */}
        <div className="absolute  inset-0 bg-black/75 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-center p-4 sm:p-5 text-center">
          <div className="transform translate-y-3 mx-auto group-hover:translate-y-0 transition-transform duration-300 space-y-2">
            <span
              className="inline-flex items-center justify-center px-4 py-1 rounded-full text-white font-black text-[12px] sm:text-[13px] uppercase tracking-wider shadow-md border border-white/20"
              style={{ backgroundColor: "#B90101" }}
            >
              {genreName.toUpperCase()}
            </span>
            <p className="text-white text-xs sm:text-[18px] leading-7 line-clamp-4 font-light drop-shadow">
              {overviewText}
            </p>
            <span className="inline-flex items-center text-[16px] font-bold text-neutral-300 group-hover:text-accent-gold pt-1">
              {basePath === "/stream" ? "Stream Now →" : "Booking Now →"}
            </span>
          </div>
        </div>
      </Link>

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

      {/* Red Genre Pill Badge - Commented out for now as requested */}
      {/*
      <div className="pt-0.5">
        <span
          className="inline-block px-4 py-1 rounded-full text-white font-black text-[12px] uppercase tracking-wider shadow-xs"
          style={{ backgroundColor: "#B90101" }}
        >
          {genreName.toUpperCase()}
        </span>
      </div>
      */}
    </div>
  );
}
