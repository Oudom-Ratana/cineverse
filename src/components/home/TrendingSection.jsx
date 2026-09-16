import { useMemo } from "react";
import { useGetTrendingMoviesQuery } from "../../services/api/movieApi";
import { useActiveMovies } from "../../utils/movieCatalogService";
import MovieCard from "./MovieCard";
import MovieCardSkeleton from "./MovieCardSkeleton";
import ScrollReveal from "../common/ScrollReveal";

export default function TrendingSection() {
  const { data: tmdbMovies, isLoading } = useGetTrendingMoviesQuery("day");
  const catalogMovies = useActiveMovies();

  const moviesToDisplay = useMemo(() => {
    const liveCatalog = catalogMovies.filter((m) => m.status === "Live");

    if (liveCatalog.length > 0) {
      return liveCatalog.slice(0, 8);
    }

    return tmdbMovies && tmdbMovies.length > 0 ? tmdbMovies.slice(0, 8) : [];
  }, [catalogMovies, tmdbMovies]);

  return (
    <section className="space-y-6 font-sans">
      {/* Section Header */}
      <div className="flex items-center gap-2.5">
        <span
          className="w-1.5 h-6 rounded-full inline-block"
          style={{ backgroundColor: "#B90101" }}
        />
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 dark:text-white uppercase">
          Trending Now
        </h2>
      </div>

      {/* 4-Column Responsive Grid (8 Cards or 8 Skeletons) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {isLoading || moviesToDisplay.length === 0
          ? Array.from({ length: 8 }).map((_, index) => (
              <MovieCardSkeleton key={`skeleton-trend-${index}`} />
            ))
          : moviesToDisplay.map((movie, index) => (
              <ScrollReveal
                key={movie.id || index}
                delay={(index % 4) * 80}
                duration={700}
                distance="translate-y-12"
              >
                <MovieCard movie={movie} />
              </ScrollReveal>
            ))}
      </div>
    </section>
  );
}
