import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import FavouriteMovieCard from "../components/favourite/FavouriteMovieCard";
import {
  removeFromFavourite,
  setFavouriteMovies,
} from "../redux/slices/favouriteSlice";
import {
  useGetFavoriteMoviesQuery,
  useGetFavoriteTVShowsQuery,
} from "../services/api/accountApi";

export default function FavouritePage() {
  const dispatch = useDispatch();
  const movies = useSelector((state) => state.favourite.movies) || [];

  const { data: tmdbMovies, isLoading: isMoviesLoading } =
    useGetFavoriteMoviesQuery();
  const { data: tmdbTV, isLoading: isTVLoading } = useGetFavoriteTVShowsQuery();

  // Sync TMDB Cloud Favorites into Redux state
  useEffect(() => {
    if (tmdbMovies && tmdbTV) {
      const mergedTmdb = [
        ...tmdbMovies.map((m) => ({
          id: m.id,
          title: m.title || "Untitled",
          posterUrl: m.poster_path
            ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
            : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80",
          duration: "2h 05m",
          year: (m.release_date || "2026").slice(0, 4),
          genre: "Movie",
          description: m.overview || "",
          isTV: false,
        })),
        ...tmdbTV.map((t) => ({
          id: t.id,
          title: t.name || "Untitled",
          posterUrl: t.poster_path
            ? `https://image.tmdb.org/t/p/w500${t.poster_path}`
            : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80",
          duration: "1 Season",
          year: (t.first_air_date || "2026").slice(0, 4),
          genre: "Series",
          description: t.overview || "",
          isTV: true,
        })),
      ];

      dispatch(setFavouriteMovies(mergedTmdb));
    }
  }, [tmdbMovies, tmdbTV, dispatch]);

  const isInitialLoading =
    (isMoviesLoading || isTVLoading) && movies.length === 0;

  if (isInitialLoading) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center text-center space-y-4 font-sans">
        <div className="w-10 h-10 border-4 border-[#B90101] border-t-transparent rounded-full animate-spin" />
        <p className="text-neutral-500 font-semibold text-sm">
          Loading your TMDB favourites...
        </p>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center text-center space-y-4 font-sans">
        <div className="w-16 h-16 rounded-full bg-[#B90101]/10 flex items-center justify-center">
          <Heart className="w-8 h-8 text-[#B90101]" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
          No Favourite Movies Yet
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 max-w-md">
          You haven&apos;t added any movies to your favourites yet. Browse the
          stream and tap the heart on any movie to save it to your TMDB account.
        </p>
        <Link
          to="/stream"
          className="mt-2 inline-flex items-center gap-2 px-6 py-2 rounded-full text-white font-bold text-[14px] shadow-lg hover:brightness-110 active:scale-95 transition"
          style={{ backgroundColor: "#B90101" }}
        >
          <span>Browse Stream</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-12 pb-10 font-sans">
      {/* Page Header with Red Bar */}
      <div className="flex items-center gap-3">
        <span
          className="w-1.5 h-7 rounded-full inline-block"
          style={{ backgroundColor: "#B90101" }}
        />
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
          My Favourite Movies & Shows
        </h2>
        <span className="text-sm font-bold text-neutral-400">
          ({movies.length})
        </span>
      </div>

      {/* Favourite Movie Cards */}
      <div className="grid grid-cols-1 gap-6">
        {movies.map((movie) => (
          <FavouriteMovieCard
            key={movie.id}
            id={movie.id}
            title={movie.title}
            posterUrl={movie.posterUrl}
            duration={movie.duration}
            year={movie.year}
            genre={movie.genre}
            description={movie.description}
            isTV={movie.isTV}
            isFavourite
            onDelete={() => dispatch(removeFromFavourite(movie.id))}
          />
        ))}
      </div>
    </div>
  );
}
