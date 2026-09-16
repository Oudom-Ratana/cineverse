import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useDiscoverMoviesQuery,
  useSearchMoviesQuery,
} from "../services/api/movieApi";
import { useDiscoverTVQuery, useSearchTVQuery } from "../services/api/tvApi";
import MovieCardSkeleton from "../components/home/MovieCardSkeleton";
import ScrollReveal from "../components/common/ScrollReveal";
import StreamHero from "../components/stream/StreamHero";
import {
  ChevronLeft,
  ChevronRight,
  Tv,
  Film,
  Flame,
  Star,
  Search,
  X,
} from "lucide-react";
import StreamCard from "../components/stream/StreamCard";

// Official TMDB TV Genres
const TV_GENRES = [
  { id: "all", label: "All Genres" },
  { id: "action", label: "Action & Adventure", genreId: 10759 },
  { id: "drama", label: "Drama", genreId: 18 },
  { id: "comedy", label: "Comedy", genreId: 35 },
  { id: "scifi", label: "Sci-Fi & Fantasy", genreId: 10765 },
  { id: "animation", label: "Animation", genreId: 16 },
  { id: "crime", label: "Crime", genreId: 80 },
  { id: "mystery", label: "Mystery", genreId: 9648 },
  { id: "family", label: "Family", genreId: 10751 },
  { id: "documentary", label: "Documentary", genreId: 99 },
];

// Official TMDB Movie Genres
const MOVIE_GENRES = [
  { id: "all", label: "All Genres" },
  { id: "action", label: "Action", genreId: 28 },
  { id: "romance", label: "Romance", genreId: 10749 },
  { id: "comedy", label: "Comedy", genreId: 35 },
  { id: "drama", label: "Drama", genreId: 18 },
  { id: "horror", label: "Horror", genreId: 27 },
  { id: "scifi", label: "Sci-Fi", genreId: 878 },
  { id: "animation", label: "Animation", genreId: 16 },
  { id: "crime", label: "Crime", genreId: 80 },
  { id: "thriller", label: "Thriller", genreId: 53 },
];

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Most Popular", icon: Flame },
  { value: "vote_average.desc", label: "Top Rated", icon: Star },
];

function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}

export default function StreamPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const categoryParam = searchParams.get("category") || "tv"; // 'tv' (default) | 'movie'
  const genreParam = searchParams.get("genre") || "all";
  const sortParam = searchParams.get("sort") || "popularity.desc";

  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [selectedGenre, setSelectedGenre] = useState(genreParam);
  const [sortBy, setSortBy] = useState(sortParam);
  const [currentPage, setCurrentPage] = useState(pageParam);

  // Sync state with URL params
  useEffect(() => {
    setCurrentPage(pageParam);
  }, [pageParam]);

  useEffect(() => {
    setActiveCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    setSelectedGenre(genreParam);
  }, [genreParam]);

  useEffect(() => {
    setSortBy(sortParam);
  }, [sortParam]);

  const isTV = activeCategory === "tv";
  const activeGenreList = isTV ? TV_GENRES : MOVIE_GENRES;
  const currentGenreObj = activeGenreList.find((g) => g.id === selectedGenre);
  const activeWithGenres = currentGenreObj?.genreId;

  // Sort key (popularity.desc or vote_average.desc)
  const resolvedSort = sortBy;

  // TV Series queries (Default / Main stream content)
  const { data: discoverTVData, isLoading: isDiscoverTVLoading } =
    useDiscoverTVQuery(
      {
        page: currentPage,
        sort_by: resolvedSort,
        with_genres: activeWithGenres,
      },
      { skip: Boolean(queryParam) || !isTV },
    );

  const { data: searchTVData, isLoading: isSearchTVLoading } = useSearchTVQuery(
    { query: queryParam, page: currentPage },
    { skip: !queryParam || !isTV },
  );

  // Movies queries (Alternative category)
  const { data: discoverMovieData, isLoading: isDiscoverMovieLoading } =
    useDiscoverMoviesQuery(
      {
        page: currentPage,
        sort_by: resolvedSort,
        with_genres: activeWithGenres,
      },
      { skip: Boolean(queryParam) || isTV },
    );

  const { data: searchMovieData, isLoading: isSearchMovieLoading } =
    useSearchMoviesQuery(
      { query: queryParam, page: currentPage },
      { skip: !queryParam || isTV },
    );

  const isLoading = isTV
    ? queryParam
      ? isSearchTVLoading
      : isDiscoverTVLoading
    : queryParam
      ? isSearchMovieLoading
      : isDiscoverMovieLoading;

  const rawData = isTV
    ? queryParam
      ? searchTVData
      : discoverTVData
    : queryParam
      ? searchMovieData
      : discoverMovieData;

  const rawList = Array.isArray(rawData) ? rawData : rawData?.results || [];
  const totalPages = Math.max(
    1,
    Math.min(rawData?.total_pages || (rawList.length > 0 ? 1 : 1), 10),
  );
  const totalResults = rawData?.total_results ?? rawList.length;

  const items = (rawList ? rawList.slice(0, 16) : []).map((item) => ({
    ...item,
    isTV,
  }));

  // Auto-reset currentPage if current page is out of bounds for the filtered results
  useEffect(() => {
    if (!isLoading && totalPages > 0 && currentPage > totalPages) {
      handlePageChange(1);
    }
  }, [currentPage, totalPages, isLoading]);

  // Handlers
  const handleCategoryChange = (cat) => {
    if (cat === activeCategory) return;
    setActiveCategory(cat);
    setSelectedGenre("all");
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("category", cat);
    newParams.delete("genre");
    newParams.set("page", "1");
    setSearchParams(newParams, { preventScrollReset: true });
  };

  const handleGenreChange = (genreId) => {
    if (genreId === selectedGenre) return;
    setSelectedGenre(genreId);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (genreId === "all") {
      newParams.delete("genre");
    } else {
      newParams.set("genre", genreId);
    }
    newParams.set("page", "1");
    setSearchParams(newParams, { preventScrollReset: true });
  };

  const handleSortChange = (newSort) => {
    if (newSort === sortBy) return;
    setSortBy(newSort);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("sort", newSort);
    newParams.set("page", "1");
    setSearchParams(newParams, { preventScrollReset: true });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams, { preventScrollReset: true });

    // Smooth scroll up to stream section
    window.scrollTo({ top: 460, behavior: "smooth" });
  };

  const [searchTerm, setSearchTerm] = useState(queryParam);

  // Sync search input if URL queryParam changes externally
  useEffect(() => {
    setSearchTerm(queryParam);
  }, [queryParam]);

  // Debounced auto-search (350ms)
  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (trimmed === queryParam) return;

    const timer = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams);
      if (trimmed) {
        newParams.set("q", trimmed);
      } else {
        newParams.delete("q");
      }
      newParams.set("page", "1");
      setSearchParams(newParams, { preventScrollReset: true });
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm, queryParam, searchParams, setSearchParams]);

  const handleClearSearch = () => {
    setSearchTerm("");
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("q");
    newParams.set("page", "1");
    setSearchParams(newParams, { preventScrollReset: true });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    const newParams = new URLSearchParams(searchParams);
    if (trimmed) {
      newParams.set("q", trimmed);
    } else {
      newParams.delete("q");
    }
    newParams.set("page", "1");
    setSearchParams(newParams, { preventScrollReset: true });
  };

  return (
    <div className="w-full space-y-10 pb-20 font-sans">
      {/* 1. Featured Stream Hero Banner with Favourite Button */}
      <StreamHero />

      {/* 2. Top Search Bar - Placed Above "Popular TV Series & Shows" Section */}
      <div className="flex justify-center w-full px-2">
        <form onSubmit={handleSearchSubmit} className="w-full max-w-xl">
          <div className="relative flex items-center">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-white/60 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                isTV ? "Search TV shows, series..." : "Search movies..."
              }
              className="w-full pl-12 pr-11 py-3 rounded-full border text-[18px] font-medium text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-white/50 focus:outline-none focus:border-[#B90101] focus:ring-2 focus:ring-[#B90101]/20 transition-all shadow-md dark:shadow-xl bg-white/90 dark:bg-[#1A1F25]/60 border-neutral-300/80 dark:border-white/15 backdrop-blur-md"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:text-white/60 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-white/10 transition cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 3. Stream Catalog Section */}
      <section className="space-y-6">
        {/* Section Header with Red Bar & Controls (Category Switcher + Sort Selector) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="w-1.5 h-7 rounded-full inline-block"
              style={{ backgroundColor: "#B90101" }}
            />
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
              {queryParam
                ? `Search Results for "${queryParam}"`
                : isTV
                  ? "Popular TV Series & Shows"
                  : "Free Feature Movies"}
            </h2>
          </div>

          {/* Right Controls: Sort Selector + Category Switcher */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {queryParam && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="text-sm font-bold text-[#B90101] hover:underline mr-2 cursor-pointer"
              >
                Clear Search
              </button>
            )}

            {/* Sort Options Bar (Popular, Top Rated, Newest) */}
            {!queryParam && (
              <div className="flex items-center p-1 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300/80 dark:border-white/10 text-[18px] font-bold shadow-xs">
                {SORT_OPTIONS.map((opt) => {
                  const isSortActive = sortBy === opt.value;
                  const IconComp = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSortChange(opt.value)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-[18px] font-bold transition-all whitespace-nowrap ${
                        isSortActive
                          ? "bg-[#B90101] text-white shadow-sm"
                          : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                      <span className="hidden sm:inline">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Category Toggle Pills (TV Series vs Movies) */}
            <div className="flex items-center p-1 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300/80 dark:border-white/10 text-[18px] font-bold shadow-xs">
              <button
                type="button"
                onClick={() => handleCategoryChange("tv")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[18px] font-bold transition-all ${
                  isTV
                    ? "bg-[#B90101] text-white shadow-sm"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <Tv className="w-4 h-4" />
                <span>Series</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange("movie")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[18px] font-bold transition-all ${
                  !isTV
                    ? "bg-[#B90101] text-white shadow-sm"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <Film className="w-4 h-4" />
                <span>Movies</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Horizontal Genre Filter Pills Bar */}
        {!queryParam && (
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 select-none scrollbar-none">
            {activeGenreList.map((g) => {
              const isGenreActive = selectedGenre === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleGenreChange(g.id)}
                  className={`px-5 py-2 rounded-full text-[18px] font-bold tracking-wide whitespace-nowrap transition-all shrink-0 ${
                    isGenreActive
                      ? "bg-[#B90101] text-white shadow-md shadow-red-950/40 scale-105"
                      : "bg-neutral-100 dark:bg-neutral-900/90 text-neutral-700 dark:text-neutral-300 border border-neutral-300/80 dark:border-white/10 hover:border-[#B90101]/50 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        )}

        {/* 4. 4-Column × 4-Row Responsive Grid (16 Cards, Loading Skeletons, or Empty State) */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-2">
            {Array.from({ length: 16 }).map((_, index) => (
              <MovieCardSkeleton key={`stream-skeleton-${index}`} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="w-full py-16 flex flex-col items-center justify-center text-center space-y-4 font-sans">
            <div className="w-16 h-16 rounded-full bg-[#B90101]/10 flex items-center justify-center">
              <Film className="w-8 h-8 text-[#B90101]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
              {queryParam
                ? `No results found for "${queryParam}"`
                : "No titles found"}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md">
              {queryParam
                ? "We couldn't find any matching movies or TV shows. Check your spelling or try another search."
                : "There are no titles available for this filter. Try selecting another genre or category."}
            </p>
            {queryParam && (
              <button
                type="button"
                onClick={() => handleHeroSearch("")}
                className="px-5 py-2 rounded-full bg-[#B90101] text-white font-bold text-sm hover:brightness-110 active:scale-95 transition"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-2">
            {items.map((item, index) => (
              <ScrollReveal
                key={item.id || index}
                delay={(index % 4) * 80}
                duration={700}
                distance="translate-y-10"
              >
                <StreamCard movie={item} activeGenreId={activeWithGenres} />
              </ScrollReveal>
            ))}
          </div>
        )}

        {/* 5. Dynamic Pagination Bar (< 1 2 3 ... N >) */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-8 select-none flex-wrap">
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-neutral-300 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:text-white hover:bg-[#B90101] disabled:opacity-30 disabled:pointer-events-none transition"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {getPageNumbers(currentPage, totalPages).map((pageNumber, idx) =>
              pageNumber === "..." ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="text-neutral-400 px-1 font-bold select-none"
                >
                  ...
                </span>
              ) : (
                <button
                  key={`page-${pageNumber}`}
                  type="button"
                  onClick={() => handlePageChange(pageNumber)}
                  className={`w-11 h-11 rounded-full font-black text-[18px] flex items-center justify-center transition-all ${
                    currentPage === pageNumber
                      ? "bg-[#B90101] text-white shadow-md"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                  }`}
                >
                  {pageNumber}
                </button>
              ),
            )}

            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-neutral-300 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:text-white hover:bg-[#B90101] disabled:opacity-30 disabled:pointer-events-none transition"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
