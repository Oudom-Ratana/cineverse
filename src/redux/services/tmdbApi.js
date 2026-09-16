import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '4e44d9029b1270a757cddc766a1bcb63';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export const tmdbApi = createApi({
  reducerPath: 'tmdbApi',
  baseQuery: fetchBaseQuery({
    baseUrl: TMDB_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Movie', 'TV', 'Trending', 'Genres', 'Search'],
  endpoints: (builder) => ({
    // Trending Media (all, movie, or tv for day/week)
    getTrending: builder.query({
      query: ({ mediaType = 'all', timeWindow = 'day' } = {}) => ({
        url: `/trending/${mediaType}/${timeWindow}`,
        params: { api_key: TMDB_API_KEY },
      }),
      providesTags: ['Trending'],
    }),

    // Now Playing in Theaters
    getNowPlaying: builder.query({
      query: ({ page = 1 } = {}) => ({
        url: '/movie/now_playing',
        params: { api_key: TMDB_API_KEY, page },
      }),
      providesTags: ['Movie'],
    }),

    // Upcoming Theatrical Releases
    getUpcoming: builder.query({
      query: ({ page = 1 } = {}) => ({
        url: '/movie/upcoming',
        params: { api_key: TMDB_API_KEY, page },
      }),
      providesTags: ['Movie'],
    }),

    // Popular Movies
    getPopularMovies: builder.query({
      query: ({ page = 1 } = {}) => ({
        url: '/movie/popular',
        params: { api_key: TMDB_API_KEY, page },
      }),
      providesTags: ['Movie'],
    }),

    // Top Rated Movies
    getTopRatedMovies: builder.query({
      query: ({ page = 1 } = {}) => ({
        url: '/movie/top_rated',
        params: { api_key: TMDB_API_KEY, page },
      }),
      providesTags: ['Movie'],
    }),

    // Popular TV Shows
    getPopularTV: builder.query({
      query: ({ page = 1 } = {}) => ({
        url: '/tv/popular',
        params: { api_key: TMDB_API_KEY, page },
      }),
      providesTags: ['TV'],
    }),

    // Top Rated TV Shows
    getTopRatedTV: builder.query({
      query: ({ page = 1 } = {}) => ({
        url: '/tv/top_rated',
        params: { api_key: TMDB_API_KEY, page },
      }),
      providesTags: ['TV'],
    }),

    // Full Movie Details with appended credits, videos, similar, recommendations
    getMovieDetails: builder.query({
      query: (id) => ({
        url: `/movie/${id}`,
        params: {
          api_key: TMDB_API_KEY,
          append_to_response: 'credits,videos,similar,recommendations,release_dates',
        },
      }),
      providesTags: (result, error, id) => [{ type: 'Movie', id }],
    }),

    // Full TV Series Details with appended credits, videos, similar, recommendations
    getTVDetails: builder.query({
      query: (id) => ({
        url: `/tv/${id}`,
        params: {
          api_key: TMDB_API_KEY,
          append_to_response: 'credits,videos,similar,recommendations',
        },
      }),
      providesTags: (result, error, id) => [{ type: 'TV', id }],
    }),

    // TV Season details (including episode lists)
    getTVSeasonDetails: builder.query({
      query: ({ id, seasonNumber }) => ({
        url: `/tv/${id}/season/${seasonNumber}`,
        params: { api_key: TMDB_API_KEY },
      }),
      providesTags: (result, error, { id, seasonNumber }) => [{ type: 'TV', id: `${id}_s${seasonNumber}` }],
    }),

    // Movie Videos / Trailers
    getMovieVideos: builder.query({
      query: (id) => ({
        url: `/movie/${id}/videos`,
        params: { api_key: TMDB_API_KEY },
      }),
    }),

    // TV Videos / Trailers
    getTVVideos: builder.query({
      query: (id) => ({
        url: `/tv/${id}/videos`,
        params: { api_key: TMDB_API_KEY },
      }),
    }),

    // Media Genres
    getGenres: builder.query({
      query: (mediaType = 'movie') => ({
        url: `/genre/${mediaType}/list`,
        params: { api_key: TMDB_API_KEY },
      }),
      providesTags: ['Genres'],
    }),

    // Global Multi Search (Movies, TV, People)
    searchMulti: builder.query({
      query: ({ query, page = 1 }) => ({
        url: '/search/multi',
        params: {
          api_key: TMDB_API_KEY,
          query,
          page,
          include_adult: false,
        },
      }),
      providesTags: ['Search'],
    }),

    // Discover Movies with genres and sorting
    discoverMovies: builder.query({
      query: ({ page = 1, with_genres = '', sort_by = 'popularity.desc' } = {}) => ({
        url: '/discover/movie',
        params: {
          api_key: TMDB_API_KEY,
          page,
          with_genres: with_genres || undefined,
          sort_by,
          include_adult: false,
        },
      }),
      providesTags: ['Movie'],
    }),

    // Discover TV Shows with genres and sorting
    discoverTV: builder.query({
      query: ({ page = 1, with_genres = '', sort_by = 'popularity.desc' } = {}) => ({
        url: '/discover/tv',
        params: {
          api_key: TMDB_API_KEY,
          page,
          with_genres: with_genres || undefined,
          sort_by,
          include_adult: false,
        },
      }),
      providesTags: ['TV'],
    }),
  }),
});

export const {
  useGetTrendingQuery,
  useGetNowPlayingQuery,
  useGetUpcomingQuery,
  useGetPopularMoviesQuery,
  useGetTopRatedMoviesQuery,
  useGetPopularTVQuery,
  useGetTopRatedTVQuery,
  useGetMovieDetailsQuery,
  useGetTVDetailsQuery,
  useGetTVSeasonDetailsQuery,
  useGetMovieVideosQuery,
  useGetTVVideosQuery,
  useGetGenresQuery,
  useSearchMultiQuery,
  useDiscoverMoviesQuery,
  useDiscoverTVQuery,
} = tmdbApi;

export const getPosterUrl = (path, size = 'w500') => {
  if (!path) return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const getBackdropUrl = (path, size = 'original') => {
  if (!path) return 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1920&q=80';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

