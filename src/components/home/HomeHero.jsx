import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Ticket, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { useGetTrendingMoviesQuery } from "../../services/api/movieApi";
import { useActiveMovies } from "../../utils/movieCatalogService";
import SpidermanLoader from "../common/SpidermanLoader";

export default function HomeHero() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch live catalog movies managed dynamically by Admin
  const catalogMovies = useActiveMovies();

  // Fetch trending movies directly from TMDB API as fallback
  const { data: tmdbMovies, isLoading } = useGetTrendingMoviesQuery("day");

  // Build slides from Admin-managed Live movies, falling back smoothly to live TMDB data
  const slides = useMemo(() => {
    const liveCatalogMovies = catalogMovies.filter(
      (m) => m.status === "Live" && (m.backdrop_path || m.poster_path),
    );

    const sourceList =
      liveCatalogMovies.length > 0
        ? liveCatalogMovies
        : tmdbMovies && tmdbMovies.length > 0
          ? tmdbMovies.filter((m) => m.backdrop_path || m.poster_path)
          : [];

    return sourceList.slice(0, 6).map((m, idx) => {
      const words = (m.title || m.name || "").split(" ");
      const mid = Math.ceil(words.length / 2);
      const line1 = words.slice(0, mid).join(" ") || "TRENDING";
      const line2 = words.slice(mid).join(" ") || "NOW";

      const backdrop = m.backdrop_path
        ? m.backdrop_path.startsWith("http")
          ? m.backdrop_path
          : `https://image.tmdb.org/t/p/original${m.backdrop_path}`
        : m.poster_path
          ? m.poster_path.startsWith("http")
            ? m.poster_path
            : `https://image.tmdb.org/t/p/original${m.poster_path}`
          : "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=1920&auto=format&fit=crop&q=90";

      return {
        id: m.id || m.tmdbId,
        title: m.title || m.name,
        displayTitleLine1: line1.toUpperCase(),
        displayTitleLine2: line2.toUpperCase(),
        brandTitle: (m.title || m.name || "CINEMA").toUpperCase(),
        brandSubtitle: m.hall
          ? `NOW SHOWING IN ${m.hall.toUpperCase()}`
          : "NOW STREAMING IN CINEMAS",
        studioBadge: idx % 2 === 0 ? "MARVEL STUDIOS" : "BLOCKBUSTER HIT",
        overview:
          m.overview ||
          "Experience the pulse-pounding action and cinematic thrill of the season in ultra-high definition.",
        backdrop_path: backdrop,
        vote_average: m.vote_average
          ? Number(m.vote_average).toFixed(1)
          : "8.8",
        genre: m.genres ? m.genres.toUpperCase() : "ACTION / CINEMA",
        release_date:
          m.year || (m.release_date ? m.release_date.substring(0, 4) : "2026"),
      };
    });
  }, [catalogMovies, tmdbMovies]);

  const totalSlides = slides.length;

  // Auto slide strictly every 4.0 seconds (4000ms)
  useEffect(() => {
    if (totalSlides <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 4000);

    return () => clearInterval(interval);
  }, [totalSlides, currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  // 1. Ciniverse Themed Loading State
  if ((isLoading && slides.length === 0) || totalSlides === 0) {
    return (
      <section className="relative w-full min-h-[620px] sm:min-h-[700px] lg:min-h-[760px] overflow-hidden bg-neutral-950 font-sans flex flex-col items-center justify-center pt-20 pb-8 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <SpidermanLoader size="lg" text="LOADING..." />
      </section>
    );
  }

  const activeMovie = slides[currentIndex] || slides[0];

  return (
    <section className="relative w-full min-h-[680px] sm:min-h-[700px] lg:min-h-[830px] overflow-hidden select-none font-sans flex flex-col justify-between">
      {/* 1. Full-Width Background Slides Layer with Smooth Cross-Fade */}
      <div className="absolute inset-0 z-0  bg-black ">
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={slide.id || index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                isActive
                  ? "opacity-100 scale-100 z-10"
                  : "opacity-0 scale-105 pointer-events-none z-0"
              }`}
            >
              <img
                src={slide.backdrop_path}
                alt={slide.title}
                className="w-full h-full object-cover object-center filter brightness-90"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?w=1920&auto=format&fit=crop&q=90";
                }}
              />
              {/* Cinematic Vignette Gradients */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/140 sm:to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/60" />
              <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/20 to-black/80" />
            </div>
          );
        })}
      </div>

      {/* 2. Left & Right Navigation Arrows */}
      <button
        type="button"
        onClick={handlePrev}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/20 backdrop-blur-md flex items-center justify-center text-white hover:text-white hover:border-[#B90101] hover:scale-110 active:scale-95 transition-all shadow-xl"
        style={{ backgroundColor: "rgba(26, 31, 37, 0.40)" }}
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        type="button"
        onClick={handleNext}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/20 backdrop-blur-md flex items-center justify-center text-white hover:text-white hover:border-[#B90101] hover:scale-110 active:scale-95 transition-all shadow-xl"
        style={{ backgroundColor: "rgba(26, 31, 37, 0.40)" }}
        aria-label="Next Slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* 3. Top Controls Floating Row (Ticket Button) */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 invisible">
        <div className="flex items-center justify-end w-full">
          {/* Floating Ticket Pill Button */}
          <Link
            to="/my-tickets"
            className="flex items-center gap-2 px-5 py-2 rounded-[35px] border backdrop-blur-md text-white font-bold text-[15px] shadow-sm hover:scale-105 active:scale-95 transition"
            style={{
              backgroundColor: "rgba(26, 31, 37, 0.10)",
              borderColor: "rgba(255, 255, 255, 0.20)",
            }}
          >
            <Ticket className="w-4 h-4 text-white" />
            <span>Ticket</span>
          </Link>
        </div>
      </div>

      {/* 4. Middle Content Area (Headline, Overview, Action Buttons) */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-auto py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center px-5">
          {/* Left Side: Headline, Description & Action Buttons */}
          <div
            key={`content-${activeMovie.id || currentIndex}`}
            className="lg:col-span-8 space-y-4 max-w-2xl lg:max-w-3xl transition-all px-5 duration-700"
          >
            {/* Split Colored Dynamic Headline (Strictly 2 Rows) */}
            <div className="overflow-hidden">
              <h1 className="text-4xl sm:text-7xl lg:text-7xl font-black text-white tracking-tighter leading-none drop-shadow-md truncate">
                {activeMovie.displayTitleLine1}
              </h1>
              <h2
                className="text-4xl sm:text-7xl lg:text-7xl font-black tracking-tighter leading-none mt-1 sm:mt-2 drop-shadow-md truncate"
                style={{ color: "#B90101" }}
              >
                {activeMovie.displayTitleLine2}
              </h2>
            </div>

            {/* Description */}
            <p className="text-neutral-200 font-sans text-[18px] leading-relaxed max-w-lg line-clamp-3 drop-shadow">
              {activeMovie.overview}
            </p>

            {/* Buttons: BOOK TICKETS & WATCH TRAILER */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to={`/movies/${activeMovie.id}`}
                className="flex items-center justify-center gap-2.5 h-[54px] px-8 rounded-[30px] text-white font-black text-[18px] uppercase tracking-wider hover:brightness-110 active:scale-95 transition"
                style={{
                  backgroundColor: "#B90101",
                  borderRadius: "30px",
                }}
              >
                <Ticket className="w-5 h-5 fill-white" />
                <span>Book Tickets</span>
              </Link>

              {/* Watch Trailer Button - Exact Figma Spec (213x54, Fill #FFFFFF 10%, Stroke #FFFFFF 20%, Radius 30px, Blur 12px) */}
              <Link
                to={`/movies/${activeMovie.id}`}
                className="flex items-center justify-center gap-3 h-[54px] min-w-[213px] px-7 rounded-[30px] border text-white font-bold text-[18px] uppercase tracking-wider transition hover:bg-white/20 active:scale-95 shadow-md group select-none"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.10)",
                  borderColor: "rgba(255, 255, 255, 0.20)",
                  borderRadius: "30px",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                <div className="w-7 h-7 rounded-full border-[2.2px] border-white flex items-center justify-center pl-0.5 group-hover:scale-105 transition">
                  <Play className="w-3.5 h-3.5 fill-white text-white" />
                </div>
                <span>Watch Trailer</span>
              </Link>
            </div>
          </div>

          {/* Right Side: Spacer */}
          <div className="hidden lg:block lg:col-span-5" />
        </div>
      </div>

      {/* 5. Bottom Center 3D Branding & Slide Indicators */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 flex flex-col items-center justify-center text-center gap-3">
        {/* Marvel / Cinema Pill Badge & Title Container */}
        <div
          key={`brand-${activeMovie.id || currentIndex}`}
          className="flex flex-col items-center justify-center transition-all duration-700"
        >
          {/* <div className="inline-flex items-center px-3 py-0.5 bg-[#B90101] text-white text-[11px] font-black uppercase tracking-widest rounded shadow-md mb-1">
            <span>{activeMovie.studioBadge}</span>
          </div> */}

          {/* 3D Metallic Title */}
          {/* <div className="relative">
            <h2
              className="text-3xl sm:text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-red-500 via-blue-600 to-blue-900 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] max-w-3xl truncate"
              style={{
                WebkitTextStroke: "1.5px #B90101",
              }}
            >
              {activeMovie.brandTitle}
            </h2>
          </div> */}

          {/* Glowing Subtitle */}
          {/* <span
            className="text-[14px] sm:text-[20px] font-black tracking-[0.25em] uppercase drop-shadow-[0_0_12px_rgba(204,255,0,0.8)]"
            style={{ color: "#CCFF00" }}
          >
            {activeMovie.brandSubtitle}
          </span> */}
        </div>

        {/* Slide Pagination Dots / Progress Indicators */}
        <div className="flex items-center gap-2 pt-2">
          {slides.map((_, dotIndex) => (
            <button
              key={dotIndex}
              onClick={() => setCurrentIndex(dotIndex)}
              className={`h-2.5 transition-all duration-300 rounded-full ${
                dotIndex === currentIndex
                  ? "w-8 bg-[#B90101] shadow-[0_0_10px_#B90101]"
                  : "w-2.5 bg-white/40 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${dotIndex + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
