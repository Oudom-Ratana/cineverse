import { baseApi } from "./baseApi";

export const movieApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Upcoming Movies (/movie/upcoming)
    getUpcomingMovies: builder.query({
      query: (page = 1) => `/movie/upcoming?page=${page}`,
      transformResponse: (response) => response?.results || response,
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: "Movie", id })),
              { type: "Movie", id: "UPCOMING" },
            ]
          : [{ type: "Movie", id: "UPCOMING" }],
    }),

    // 2. Trending Movies (/trending/movie/{time_window})
    getTrendingMovies: builder.query({
      query: (timeWindow = "day") => `/trending/movie/${timeWindow}`,
      transformResponse: (response) => response?.results || response,
      providesTags: [{ type: "Movie", id: "TRENDING" }],
    }),

    // 3. All Trending (Movies + TV + People)
    getAllTrending: builder.query({
      query: (timeWindow = "day") => `/trending/all/${timeWindow}`,
      transformResponse: (response) => response?.results || response,
      providesTags: [{ type: "Movie", id: "ALL_TRENDING" }],
    }),

    // 4. Now Playing Movies (Currently in Cinemas)
    getNowPlayingMovies: builder.query({
      query: (page = 1) => `/movie/now_playing?page=${page}`,
      transformResponse: (response) => response?.results || response,
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: "Movie", id })),
              { type: "Movie", id: "NOW_PLAYING" },
            ]
          : [{ type: "Movie", id: "NOW_PLAYING" }],
    }),

    // 5. Popular Movies (/movie/popular)
    getPopularMovies: builder.query({
      query: (page = 1) => `/movie/popular?page=${page}`,
      transformResponse: (response) => response?.results || response,
      providesTags: [{ type: "Movie", id: "POPULAR" }],
    }),

    // 6. Top Rated Movies (/movie/top_rated)
    getTopRatedMovies: builder.query({
      query: (page = 1) => `/movie/top_rated?page=${page}`,
      transformResponse: (response) => response?.results || response,
      providesTags: [{ type: "Movie", id: "TOP_RATED" }],
    }),

    // 7. Discover All Movies
    discoverMovies: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page);
        if (params.with_genres)
          queryParams.append("with_genres", params.with_genres);
        if (params.sort_by) {
          queryParams.append("sort_by", params.sort_by);
          if (params.sort_by.startsWith("vote_average")) {
            queryParams.append("vote_count.gte", "200");
          }
        }
        if (params.primary_release_year)
          queryParams.append(
            "primary_release_year",
            params.primary_release_year,
          );
        const queryStr = queryParams.toString();
        return `/discover/movie${queryStr ? `?${queryStr}` : ""}`;
      },
      transformResponse: (response) => ({
        results: response?.results || [],
        total_pages: Math.min(response?.total_pages || 1, 500),
        total_results: response?.total_results || 0,
      }),
      providesTags: [{ type: "Movie", id: "DISCOVER" }],
    }),

    // 8. Movie Details (with videos, credits & similar movies appended)
    getMovieDetails: builder.query({
      query: (id) =>
        `/movie/${id}?append_to_response=videos,credits,similar,images`,
      providesTags: (result, error, id) => [{ type: "Movie", id }],
    }),

    // 9. Movie Videos & Trailers (/movie/{id}/videos)
    getMovieTrailers: builder.query({
      query: (id) => `/movie/${id}/videos`,
      transformResponse: (response) => response?.results || [],
    }),

    // 10. Movie Credits & Cast (/movie/{id}/credits)
    getMovieCredits: builder.query({
      query: (id) => `/movie/${id}/credits`,
    }),

    // 11. Movie Genres List (/genre/movie/list)
    getMovieGenres: builder.query({
      query: () => "/genre/movie/list",
      transformResponse: (response) => response?.genres || [],
    }),

    // 12. Search Movies (/search/movie)
    searchMovies: builder.query({
      query: ({ query, page = 1 }) =>
        `/search/movie?query=${encodeURIComponent(query)}&page=${page}`,
      transformResponse: (response) => ({
        results: response?.results || [],
        total_pages: Math.min(response?.total_pages || 1, 500),
        total_results: response?.total_results || 0,
      }),
    }),

    // 13. Search Multi (Movies, TV Series, People)
    searchMulti: builder.query({
      query: ({ query, page = 1 }) =>
        `/search/multi?query=${encodeURIComponent(query)}&page=${page}`,
      transformResponse: (response) => response?.results || [],
    }),

    // 14. Lightweight Movie Runtime Query (/movie/{id})
    getMovieRuntime: builder.query({
      query: (id) => `/movie/${id}`,
      transformResponse: (response) => response?.runtime || null,
      providesTags: (result, error, id) => [
        { type: "Movie", id: `runtime-${id}` },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUpcomingMoviesQuery,
  useGetTrendingMoviesQuery,
  useGetAllTrendingQuery,
  useGetNowPlayingMoviesQuery,
  useGetPopularMoviesQuery,
  useGetTopRatedMoviesQuery,
  useDiscoverMoviesQuery,
  useGetMovieDetailsQuery,
  useGetMovieRuntimeQuery,
  useGetMovieTrailersQuery,
  useGetMovieCreditsQuery,
  useGetMovieGenresQuery,
  useSearchMoviesQuery,
  useLazySearchMoviesQuery,
  useSearchMultiQuery,
  useLazySearchMultiQuery,
} = movieApi;
