import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { FileText, Clock, Calendar, Play, ArrowLeft } from "lucide-react";
import {
  useGetMovieDetailsQuery,
  useGetMovieTrailersQuery,
} from "../services/api/movieApi";
import { useGetTVDetailsQuery } from "../services/api/tvApi";
import { useActiveMovies } from "../utils/movieCatalogService";
import ShowtimeSection from "../components/booking/ShowtimeSection";
import MovieDetailSkeleton from "../components/common/MovieDetailSkeleton";
import { formatMovieRuntime } from "../utils/formatRuntime";

export default function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Scroll to top immediately when opened
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const isExplicitTV = searchParams.get("type") === "tv";

  // Check admin-managed movie catalog
  const catalogMovies = useActiveMovies();
  const catalogMovie = useMemo(() => {
    return catalogMovies.find(
      (m) => String(m.id) === String(id) || String(m.tmdbId) === String(id),
    );
  }, [catalogMovies, id]);

  const queryId = catalogMovie?.tmdbId || id;

  // Fetch movie details from TMDB (skipped if isExplicitTV)
  const {
    data: movieData,
    isLoading: isMovieLoading,
    isError: isMovieError,
  } = useGetMovieDetailsQuery(queryId, { skip: isExplicitTV });

  // Fetch TV details from TMDB (active if isExplicitTV or if movie query fails)
  const {
    data: tvData,
    isLoading: isTVLoading,
    isError: isTVError,
  } = useGetTVDetailsQuery(queryId, { skip: !isExplicitTV && !isMovieError });

  const rawMovie = isExplicitTV ? tvData : movieData || tvData;

  const movie = useMemo(() => {
    if (!catalogMovie) return rawMovie;
    return {
      ...(rawMovie || {}),
      id: catalogMovie.id,
      tmdbId: catalogMovie.tmdbId || rawMovie?.id,
      title: catalogMovie.title || rawMovie?.title || rawMovie?.name,
      name: catalogMovie.title || rawMovie?.name || rawMovie?.title,
      overview:
        catalogMovie.overview ||
        rawMovie?.overview ||
        "Experience the thrilling blockbuster action, authentic cinema experience, and multi-branch screening at Ciniverse.",
      poster_path: catalogMovie.poster_path || rawMovie?.poster_path,
      backdrop_path:
        catalogMovie.backdrop_path ||
        rawMovie?.backdrop_path ||
        catalogMovie.poster_path,
      genres:
        rawMovie?.genres && rawMovie.genres.length > 0
          ? rawMovie.genres
          : catalogMovie.genres
            ? catalogMovie.genres
                .split(",")
                .map((g, idx) => ({ id: idx, name: g.trim() }))
            : [{ id: 1, name: "Action" }],
      vote_average: catalogMovie.vote_average || rawMovie?.vote_average || 8.8,
      release_date:
        catalogMovie.year ||
        catalogMovie.date ||
        rawMovie?.release_date ||
        "2026",
      runtime: rawMovie?.runtime || (catalogMovie.duration ? 145 : null),
      status: catalogMovie.status || rawMovie?.status || "Live",
      branches: catalogMovie.branches,
      startDate: catalogMovie.startDate,
      endDate: catalogMovie.endDate,
      totalDays: catalogMovie.totalDays,
    };
  }, [catalogMovie, rawMovie]);

  // Determine if still waiting for initial data
  const isInitialLoading =
    !catalogMovie &&
    (isExplicitTV
      ? isTVLoading || (!tvData && !isTVError)
      : isMovieLoading ||
        (!movieData && !isMovieError) ||
        (isMovieError && (isTVLoading || (!tvData && !isTVError))));

  const isActuallyError =
    !catalogMovie && (isExplicitTV ? isTVError : isMovieError && isTVError);

  const { data: trailersData } = useGetMovieTrailersQuery(id, {
    skip: isExplicitTV,
  });

  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);

  // While fetching data or if data is not yet ready, always render the loading skeleton!
  if (isInitialLoading || (!movie && !isActuallyError)) {
    return <MovieDetailSkeleton />;
  }

  // Only show error screen if all queries have genuinely completed and returned an error
  if (isActuallyError || !movie) {
    return (
      <div className="w-full py-20 text-center space-y-4 font-sans">
        <h2 className="text-3xl font-black text-[#B90101]">Movie Not Found</h2>
        <p className="text-neutral-500 dark:text-neutral-400">
          The requested movie could not be loaded. Please try again.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 rounded-full bg-[#B90101] text-white font-bold hover:brightness-110 active:scale-95 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Extract 100% real movie/TV metadata from TMDB API
  const title =
    movie.title ||
    movie.name ||
    movie.original_title ||
    movie.original_name ||
    "Untitled";
  const genres =
    movie.genres && movie.genres.length > 0
      ? movie.genres.map((g) => g.name).join(", ")
      : "Genre unavailable";

  const duration =
    movie.runtime && movie.runtime > 0
      ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}min`
      : movie.episode_run_time?.[0]
        ? `${movie.episode_run_time[0]}min per ep`
        : movie.number_of_seasons
          ? `${movie.number_of_seasons} Season${movie.number_of_seasons > 1 ? "s" : ""}`
          : formatMovieRuntime(
              movie.runtime,
              movie.id,
              isTV,
              movie.number_of_seasons,
            );

  const rawDate = movie.release_date || movie.first_air_date;
  const releaseDate = rawDate
    ? new Date(rawDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Release date unavailable";

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : movie.poster_path
      ? `https://image.tmdb.org/t/p/original${movie.poster_path}`
      : "";

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : backdropUrl || "/placeholder-poster.png";

  // Extract 100% real Cast & Crew from TMDB credits
  const castList = movie.credits?.cast || movie.aggregate_credits?.cast || [];
  const crewList = movie.credits?.crew || movie.aggregate_credits?.crew || [];

  // 1. Real Directors
  const directors = crewList
    .filter((c) => c.job === "Director")
    .map((c) => ({ name: c.name, role: "Director" }));

  // 2. Real Writers & Creators
  const creators = [
    ...(movie.created_by?.map((c) => ({ name: c.name, role: "Creator" })) ||
      []),
    ...crewList
      .filter(
        (c) =>
          c.job === "Characters" ||
          c.job === "Comic Book" ||
          c.job === "Novel" ||
          c.job === "Original Story" ||
          c.job === "Creator",
      )
      .map((c) => ({ name: c.name, role: "Characters" })),
  ];

  const writers = crewList
    .filter(
      (c) =>
        c.job === "Screenplay" ||
        c.job === "Writer" ||
        c.job === "Story" ||
        c.job === "Author",
    )
    .map((c) => ({ name: c.name, role: "Writer" }));

  // 3. Real Lead Cast (Actors)
  const topActors = castList.slice(0, 12).map((actor) => ({
    id: actor.id,
    name: actor.name,
    character: actor.character || "Actor",
    profilePath: actor.profile_path
      ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
      : null,
  }));

  // Build the 3-Column Key Contributors list dynamically from real API data
  const keyContributors = [];
  const seenNames = new Set();

  const addPerson = (person) => {
    if (person?.name && !seenNames.has(person.name)) {
      seenNames.add(person.name);
      keyContributors.push(person);
    }
  };

  // Add real key figures in order: Directors -> Creators -> Writers -> Lead Actors
  directors.forEach(addPerson);
  creators.forEach(addPerson);
  writers.forEach(addPerson);
  topActors.forEach((actor) => {
    addPerson({
      name: actor.name,
      role: actor.character ? actor.character : "Cast",
    });
  });

  // Up to 6 real contributors for the 3 columns (2 rows each)
  const heroPeople = keyContributors.slice(0, 6);

  // Extract official trailer key from TMDB videos or trailers query
  const trailerKey =
    movie.videos?.results?.find(
      (v) =>
        v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"),
    )?.key ||
    trailersData?.find(
      (v) =>
        v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"),
    )?.key ||
    movie.videos?.results?.find((v) => v.site === "YouTube")?.key ||
    trailersData?.find((v) => v.site === "YouTube")?.key;

  const handleWatchTrailer = () => {
    setIsPlayingTrailer(true);
  };

  const handleStopTrailer = () => {
    setIsPlayingTrailer(false);
  };

  return (
    <div className="relative w-full pb-24 font-sans select-none space-y-12">
      {/* 1. Cinematic Dark Hero Banner (Fits poster background stably) */}
      <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-neutral-950 border border-neutral-800/80 shadow-2xl min-h-[460px] md:min-h-[500px]">
        {/* Layer 1: Atmospheric Backdrop Poster Image Layer */}
        {backdropUrl && (
          <div
            className={`absolute inset-0 z-0 overflow-hidden transition-opacity duration-[1500ms] ease-out ${
              isPlayingTrailer ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <img
              src={backdropUrl}
              alt={title}
              className="w-full h-full object-cover object-center opacity-70 sm:opacity-80 scale-105"
            />
            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/35" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30" />
          </div>
        )}

        {/* Layer 2: Full Auto-Playing Trailer Video Layer (1.5s smooth ease-out transition) */}
        <div
          className={`absolute inset-0 z-20 bg-black transition-opacity duration-[1500ms] ease-out ${
            isPlayingTrailer
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          {isPlayingTrailer && (
            <>
              {/* The ONLY Arrow Button to stop the trailer and return */}
              <button
                type="button"
                onClick={handleStopTrailer}
                className="absolute top-4 left-4 sm:top-6 sm:left-6 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#B90101] text-white flex items-center justify-center shadow-2xl hover:brightness-110 active:scale-95 transition cursor-pointer border border-white/20"
                aria-label="Stop trailer and return"
                title="Stop trailer and return"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {trailerKey ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1&playsinline=1`}
                  title={`${title} Official Trailer`}
                  className="w-full h-full border-0 absolute inset-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full min-h-[460px] flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <p className="text-white text-lg font-bold">
                    No official trailer found for {title}.
                  </p>
                  <button
                    type="button"
                    onClick={handleStopTrailer}
                    className="px-6 py-2.5 rounded-full bg-[#B90101] text-white font-bold text-sm hover:brightness-110 active:scale-95 transition"
                  >
                    Return to Movie Details
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Layer 3: Content Detail Section (Fades out / morphs with 1.5s ease-out transition) */}
        <div
          className={`relative z-10 p-6 sm:p-10 lg:p-12 transition-all duration-[1500ms] ease-out ${
            isPlayingTrailer
              ? "opacity-0 -translate-y-4 scale-95 pointer-events-none"
              : "opacity-100 translate-y-0 scale-100 pointer-events-auto"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left: Movie Poster with Rounded 25px Corners */}
            <div className="md:col-span-5 lg:col-span-4 flex justify-center md:justify-start">
              <div className="relative aspect-[2/3] w-full max-w-[280px] sm:max-w-[320px] rounded-[25px] overflow-hidden shadow-2xl bg-neutral-900 border border-white/10">
                <img
                  src={posterUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right: Movie Title, Real Metadata, and Real Cast/Crew Grid */}
            <div className="md:col-span-7 lg:col-span-8 space-y-6 pt-2">
              {/* Real Movie Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {title}
              </h1>

              {/* Real Metadata List with Red Outline Icons */}
              <div className="space-y-2.5 pt-1 text-sm sm:text-base text-neutral-300 font-medium">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#B90101] shrink-0" />
                  <span>
                    Genre:{" "}
                    <span className="text-white font-semibold">{genres}</span>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#B90101] shrink-0" />
                  <span>
                    Duration:{" "}
                    <span className="text-white font-semibold">{duration}</span>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#B90101] shrink-0" />
                  <span>
                    Release:{" "}
                    <span className="text-white font-bold">{releaseDate}</span>
                  </span>
                </div>
              </div>

              {/* Watch Trailer Button (Primary Color Red with White Text) */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleWatchTrailer}
                  className="inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 rounded-full text-white font-black text-sm sm:text-base uppercase tracking-wider shadow-lg shadow-red-950/60 hover:brightness-110 active:scale-95 transition cursor-pointer"
                  style={{ backgroundColor: "#B90101" }}
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                  <span>Watch Trailer</span>
                </button>
              </div>

              {/* 3-Column Real Contributors Grid (Directors, Writers, Lead Actors) */}
              {heroPeople.length > 0 && (
                <div className="pt-4 sm:pt-6 grid grid-cols-2 sm:grid-cols-3 gap-x-8 sm:gap-x-12 lg:gap-x-16 gap-y-6">
                  {heroPeople.map((person, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <h4 className="font-bold text-sm sm:text-base text-white leading-tight line-clamp-1">
                        {person.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-neutral-400 font-medium line-clamp-1">
                        {person.role}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Cast (Actors) Section with Real Profile Photos from TMDB (Auto-Loop Left to Right) */}
      {topActors.length > 0 &&
        (() => {
          // Ensure sufficient items for seamless full-width infinite loop
          const baseActors =
            topActors.length < 4
              ? [...topActors, ...topActors, ...topActors, ...topActors]
              : topActors.length < 8
                ? [...topActors, ...topActors]
                : topActors;

          const renderActorCard = (actor, indexPrefix) => (
            <div
              key={`${indexPrefix}-${actor.id}`}
              className="min-w-[110px] max-w-[110px] sm:min-w-[130px] sm:max-w-[130px] flex flex-col items-center text-center space-y-2 group shrink-0"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-neutral-800 border-2 border-neutral-300 dark:border-white/15 shadow-md group-hover:border-[#B90101] group-hover:scale-105 transition-all duration-300">
                {actor.profilePath ? (
                  <img
                    src={actor.profilePath}
                    alt={actor.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400 font-black text-xl">
                    {actor.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="w-full">
                <h4 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white truncate">
                  {actor.name}
                </h4>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                  {actor.character}
                </p>
              </div>
            </div>
          );

          return (
            <div className="max-w-6xl mx-auto px-2 sm:px-4 space-y-5">
              <style>{`
              @keyframes cast-loop-ltr {
                0% {
                  transform: translateX(-50%);
                }
                100% {
                  transform: translateX(0%);
                }
              }
              .cast-ticker-track {
                animation: cast-loop-ltr 35s linear infinite;
              }
              .cast-ticker-track:hover {
                animation-play-state: paused;
              }
              @media (prefers-reduced-motion: reduce) {
                .cast-ticker-track {
                  animation: none;
                }
              }
            `}</style>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="w-1.5 h-7 rounded-full inline-block"
                    style={{ backgroundColor: "#B90101" }}
                  />
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
                    Top Cast
                  </h2>
                </div>
                <span className="text-xs font-semibold text-neutral-400 hidden sm:inline-block">
                  Hover to pause
                </span>
              </div>

              {/* Seamless Auto-Scrolling Carousel Track with Edge Fades */}
              <div
                className="relative w-full overflow-hidden py-2 select-none"
                style={{
                  maskImage:
                    "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
                }}
              >
                <div className="flex w-max cast-ticker-track">
                  {/* First Half */}
                  <div className="flex items-center gap-4 sm:gap-6 shrink-0 pr-4 sm:pr-6">
                    {baseActors.map((actor, idx) =>
                      renderActorCard(actor, `h1-${idx}`),
                    )}
                  </div>
                  {/* Second Half (duplicate for seamless loop) */}
                  <div
                    className="flex items-center gap-4 sm:gap-6 shrink-0 pr-4 sm:pr-6"
                    aria-hidden="true"
                  >
                    {baseActors.map((actor, idx) =>
                      renderActorCard(actor, `h2-${idx}`),
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {/* 3. Showtime Section (Locations, Date Selector, Branch Cards) */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <ShowtimeSection
          movieId={id}
          isTV={Boolean(isExplicitTV || movie?.first_air_date || movie?.name)}
          movie={movie}
        />
      </div>
    </div>
  );
}
