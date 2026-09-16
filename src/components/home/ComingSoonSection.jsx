import { useMemo } from "react";
import { useDiscoverMoviesQuery } from "../../services/api/movieApi";
import { useActiveMovies } from "../../utils/movieCatalogService";
import ComingSoonCard from "./ComingSoonCard";
import ComingSoonCardSkeleton from "./ComingSoonCardSkeleton";
import ScrollReveal from "../common/ScrollReveal";

export default function ComingSoonSection() {
  // Fetch newest movies ordered by primary_release_date.desc as fallback
  const { data: tmdbNewest, isLoading } = useDiscoverMoviesQuery({
    sort_by: "primary_release_date.desc",
    page: 1,
  });

  const catalogMovies = useActiveMovies();

  const rawList = Array.isArray(tmdbNewest)
    ? tmdbNewest
    : tmdbNewest?.results || [];

  const upcomingToDisplay = useMemo(() => {
    const catalogUpcoming = catalogMovies.filter(
      (m) => m.status === "Upcoming",
    );

    if (catalogUpcoming.length >= 3) {
      return catalogUpcoming.slice(0, 3).map((m) => ({
        ...m,
        release_date: m.date || m.year || "Coming Soon 2026",
      }));
    }

    if (catalogUpcoming.length > 0) {
      const remainingNeeded = 3 - catalogUpcoming.length;
      const remaining = catalogMovies
        .filter((m) => m.status !== "Upcoming")
        .slice(0, remainingNeeded);
      return [...catalogUpcoming, ...remaining].map((m) => ({
        ...m,
        release_date: m.date || m.year || "Coming Soon 2026",
      }));
    }

    const fallbackList =
      catalogMovies.length >= 3 ? catalogMovies.slice(0, 3) : rawList.slice(0, 3);
    return fallbackList.map((m) => ({
      ...m,
      release_date: m.date || m.year || "Coming Soon 2026",
    }));
  }, [catalogMovies, rawList]);

  return (
    <section className="space-y-6 font-sans">
      {/* Section Header */}
      <div className="flex items-center gap-2.5">
        <span
          className="w-1.5 h-6 rounded-full inline-block"
          style={{ backgroundColor: "#FFD700" }}
        />
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 dark:text-white uppercase">
          Coming Soon
        </h2>
      </div>

      {/* 3 Landscape Banners Grid (3 Cards or 3 Skeletons) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading || upcomingToDisplay.length === 0
          ? Array.from({ length: 3 }).map((_, index) => (
              <ComingSoonCardSkeleton key={`skeleton-coming-${index}`} />
            ))
          : upcomingToDisplay.map((item, index) => (
              <ScrollReveal
                key={item.id || index}
                delay={index * 120}
                duration={750}
                distance="translate-y-12"
              >
                <ComingSoonCard item={item} />
              </ScrollReveal>
            ))}
      </div>
    </section>
  );
}
