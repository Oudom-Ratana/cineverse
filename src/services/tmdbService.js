/**
 * Live TMDB Cloud API Service
 * Handles live searching, details, and fetching directly from TMDB's cloud servers.
 */

// Reads from .env (Vite) or user-saved key in localStorage
export const getTmdbApiKey = () => {
  return (
    import.meta.env.VITE_TMDB_API_READ_ACCESS_TOKEN ||
    import.meta.env.VITE_TMDB_ACCESS_TOKEN ||
    import.meta.env.VITE_TMDB_API_KEY ||
    localStorage.getItem("tmdb_admin_api_key") ||
    "4e44d9029b1270a757cddc766a1bcb63"
  );
};

export const setTmdbApiKey = (key) => {
  if (key) {
    localStorage.setItem("tmdb_admin_api_key", key.trim());
  } else {
    localStorage.removeItem("tmdb_admin_api_key");
  }
};

/**
 * Live Dynamic Search on TMDB Cloud Database
 * @param {string} query Search keyword (e.g. "Avatar", "Deadpool", "Inception")
 * @param {number} page Page number (default 1)
 */
export async function searchLiveTmdb(query, page = 1) {
  if (!query || !query.trim()) return { results: [], total_results: 0 };

  const key = getTmdbApiKey();
  const isBearer = key.length > 50; // TMDB v4 Read Access Tokens are long JWT strings

  const url = isBearer
    ? `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&page=${page}&include_adult=false`
    : `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`;

  const headers = {
    "Content-Type": "application/json",
  };

  if (isBearer) {
    headers["Authorization"] = `Bearer ${key}`;
  }

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error(`TMDB error status: ${res.status}`);
    }
    const data = await res.json();
    return {
      results: (data.results || []).map((m) => ({
        id: m.id,
        tmdbId: m.id,
        title: m.title,
        overview: m.overview,
        release_date: m.release_date || "",
        year: m.release_date ? m.release_date.slice(0, 4) : "2026",
        poster_path: m.poster_path
          ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
          : "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
        backdrop_path: m.backdrop_path
          ? `https://image.tmdb.org/t/p/original${m.backdrop_path}`
          : "https://image.tmdb.org/t/p/original/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg",
        vote_average: m.vote_average ? Number(m.vote_average.toFixed(1)) : 8.0,
        genre_ids: m.genre_ids || [],
      })),
      total_results: data.total_results || 0,
      total_pages: data.total_pages || 0,
    };
  } catch (err) {
    console.warn("Live TMDB search error:", err);
    return { error: err.message, results: [] };
  }
}

/**
 * Fetch Full Movie Details (including exact duration runtime and genre names)
 */
export async function fetchLiveTmdbDetails(tmdbId) {
  const key = getTmdbApiKey();
  const isBearer = key.length > 50;

  const url = isBearer
    ? `https://api.themoviedb.org/3/movie/${tmdbId}?append_to_response=credits,videos`
    : `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${key}&append_to_response=credits,videos`;

  const headers = { "Content-Type": "application/json" };
  if (isBearer) headers["Authorization"] = `Bearer ${key}`;

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`TMDB details status: ${res.status}`);
    const data = await res.json();

    const hours = Math.floor((data.runtime || 120) / 60);
    const mins = (data.runtime || 120) % 60;
    const formattedDuration = `${hours}:${mins < 10 ? "0" : ""}${mins}:00`;

    return {
      title: data.title,
      year: data.release_date ? data.release_date.slice(0, 4) : "2026",
      duration: formattedDuration,
      genres: (data.genres || []).map((g) => g.name).join(", ") || "Action",
      poster_path: data.poster_path
        ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
        : "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
      overview: data.overview,
      vote_average: data.vote_average
        ? Number(data.vote_average.toFixed(1))
        : 8.5,
      trailer_key:
        data.videos?.results?.find((v) => v.site === "YouTube")?.key || "",
    };
  } catch (err) {
    console.warn("Fetch details error:", err);
    return null;
  }
}

const GENRE_MAP = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
  10759: "Action & Adventure",
  10762: "Kids",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
};

const HALL_ROTATION = [
  "IMAX Hall 1",
  "Sen Sok VIP",
  "Dolby Atmos 1",
  "ScreenX 270°",
  "Hall 2 (Kids)",
  "VIP Lounge",
  "3D Laser Hall",
  "Hall 3",
  "Hall 4",
  "Gold Class 1",
];

/**
 * Fetch exactly 15 Real TMDB Titles (Trending Movies + Trending TV + Featured Series)
 * Endpoints:
 * 1. /trending/movie/day (Trending Movies)
 * 2. /trending/tv/day (Trending TV Series)
 * 3. /tv/popular (Featured Series)
 */
export async function fetchReal15TmdbCatalog() {
  const key = getTmdbApiKey();
  const isBearer = key.length > 50;
  const headers = { "Content-Type": "application/json" };
  if (isBearer) headers["Authorization"] = `Bearer ${key}`;

  const queryParam = isBearer ? "" : `api_key=${key}`;

  const fetchUrl = async (path) => {
    const sep = path.includes("?") ? "&" : "?";
    const fullUrl = `https://api.themoviedb.org/3${path}${isBearer ? "" : `${sep}${queryParam}`}`;
    const res = await fetch(fullUrl, { headers });
    if (!res.ok) throw new Error(`TMDB HTTP ${res.status}`);
    return res.json();
  };

  try {
    const [trendingMoviesData, trendingTVData, popularTVData] =
      await Promise.all([
        fetchUrl("/trending/movie/day"),
        fetchUrl("/trending/tv/day"),
        fetchUrl("/tv/popular"),
      ]);

    const items = [];
    const seenIds = new Set();

    // 1. Trending Movies (top 7 with valid posters)
    for (const m of trendingMoviesData?.results || []) {
      if (items.length >= 7) break;
      if (seenIds.has(m.id) || !m.poster_path || !m.backdrop_path) continue;
      seenIds.add(m.id);

      const genres =
        (m.genre_ids || [])
          .map((gid) => GENRE_MAP[gid] || "Action")
          .slice(0, 2)
          .join(", ") || "Action, Sci-Fi";

      items.push({
        id: m.id,
        tmdbId: m.id,
        title: m.title || "Untitled",
        isTv: false,
        media_type: "movie",
        year: m.release_date ? m.release_date.slice(0, 4) : "2026",
        duration: "2:18:00",
        hall: HALL_ROTATION[items.length % HALL_ROTATION.length],
        date: "20-25/09/2026",
        startDate: "2026-08-25",
        endDate: "2026-09-01",
        totalDays: 7,
        genres,
        genreLabel: genres.split(",")[0].trim(),
        status: "Live",
        poster_path: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
        backdrop_path: `https://image.tmdb.org/t/p/original${m.backdrop_path}`,
        vote_average: m.vote_average ? Number(m.vote_average.toFixed(1)) : 8.5,
        overview: m.overview || "",
        isFreeStream: true,
      });
    }

    // 2. Trending TV Series (top 4 with valid posters)
    for (const t of trendingTVData?.results || []) {
      if (items.length >= 11) break;
      if (seenIds.has(t.id) || !t.poster_path || !t.backdrop_path) continue;
      seenIds.add(t.id);

      const genres =
        (t.genre_ids || [])
          .map((gid) => GENRE_MAP[gid] || "Drama")
          .slice(0, 2)
          .join(", ") || "Drama, Series";

      items.push({
        id: t.id,
        tmdbId: t.id,
        title: t.name || "Untitled Series",
        isTv: true,
        media_type: "tv",
        year: t.first_air_date ? t.first_air_date.slice(0, 4) : "2026",
        duration: "0:50:00",
        hall: HALL_ROTATION[items.length % HALL_ROTATION.length],
        date: "20-25/09/2026",
        startDate: "2026-08-25",
        endDate: "2026-09-01",
        totalDays: 7,
        genres,
        genreLabel: genres.split(",")[0].trim(),
        status: "Live",
        poster_path: `https://image.tmdb.org/t/p/w500${t.poster_path}`,
        backdrop_path: `https://image.tmdb.org/t/p/original${t.backdrop_path}`,
        vote_average: t.vote_average ? Number(t.vote_average.toFixed(1)) : 8.7,
        overview: t.overview || "",
        isFreeStream: true,
      });
    }

    // 3. Featured Series & Blockbusters (4 items to reach exactly 15)
    for (const p of popularTVData?.results || []) {
      if (items.length >= 15) break;
      if (seenIds.has(p.id) || !p.poster_path || !p.backdrop_path) continue;
      seenIds.add(p.id);

      const genres =
        (p.genre_ids || [])
          .map((gid) => GENRE_MAP[gid] || "Series")
          .slice(0, 2)
          .join(", ") || "Series, Fantasy";

      const isUpcoming = items.length >= 13;

      items.push({
        id: p.id,
        tmdbId: p.id,
        title: p.name || "Featured Series",
        isTv: true,
        media_type: "tv",
        year: p.first_air_date ? p.first_air_date.slice(0, 4) : "2026",
        duration: "0:45:00",
        hall: HALL_ROTATION[items.length % HALL_ROTATION.length],
        date: "20-25/09/2026",
        startDate: "2026-08-25",
        endDate: "2026-09-01",
        totalDays: 7,
        genres,
        genreLabel: genres.split(",")[0].trim(),
        status: isUpcoming ? "Upcoming" : "Live",
        poster_path: `https://image.tmdb.org/t/p/w500${p.poster_path}`,
        backdrop_path: `https://image.tmdb.org/t/p/original${p.backdrop_path}`,
        vote_average: p.vote_average ? Number(p.vote_average.toFixed(1)) : 8.8,
        overview: p.overview || "",
        isFreeStream: true,
      });
    }

    return items;
  } catch (err) {
    console.error("fetchReal15TmdbCatalog error:", err);
    return null;
  }
}
