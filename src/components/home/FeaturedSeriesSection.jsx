import { useMemo } from "react";
import { useGetPopularTVQuery } from "../../services/api/tvApi";
import { useActiveMovies } from "../../utils/movieCatalogService";
import MovieCard from "./MovieCard";
import MovieCardSkeleton from "./MovieCardSkeleton";
import ScrollReveal from "../common/ScrollReveal";

export default function FeaturedSeriesSection() {
  const { data: tmdbTV, isLoading } = useGetPopularTVQuery(1);
  const catalogMovies = useActiveMovies();

  const seriesToDisplay = useMemo(() => {
    // Combine TV series with featured movies from the 15-title catalog
    const seriesList = catalogMovies.filter(
      (m) => m.isTv || m.media_type === "tv",
    );
    const movieList = catalogMovies.filter(
      (m) => !m.isTv && m.media_type !== "tv",
    );

    const combined = [...seriesList, ...movieList];

    if (combined.length > 0) {
      return combined.slice(0, 8);
    }

    return tmdbTV && tmdbTV.length > 0 ? tmdbTV.slice(0, 8) : [];
  }, [catalogMovies, tmdbTV]);

  return (
    <section className="space-y-6 font-sans">
      {/* Section Header */}
      <div className="flex items-center gap-2.5">
        <span
          className="w-1.5 h-6 rounded-full inline-block"
          style={{ backgroundColor: "#B90101" }}
        />
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 dark:text-white uppercase">
          Featured Series
        </h2>
      </div>

      {/* 4-Column Responsive Grid (8 Cards or 8 Skeletons) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {isLoading || seriesToDisplay.length === 0
          ? Array.from({ length: 8 }).map((_, index) => (
              <MovieCardSkeleton key={`skeleton-series-${index}`} />
            ))
          : seriesToDisplay.map((item, index) => (
              <ScrollReveal
                key={item.id || index}
                delay={(index % 4) * 80}
                duration={700}
                distance="translate-y-12"
              >
                <MovieCard
                  basePath="/movies"
                  movie={{ ...item, media_type: "tv" }}
                />
              </ScrollReveal>
            ))}
      </div>
    </section>
  );
}
