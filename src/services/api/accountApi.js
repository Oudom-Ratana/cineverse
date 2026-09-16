import { baseApi } from "./baseApi";

const DEFAULT_ACCOUNT_ID = import.meta.env.VITE_TMDB_ACCOUNT_ID || "23580518";
const DEFAULT_SESSION_ID =
  import.meta.env.VITE_TMDB_SESSION_ID ||
  "168c51c24085cda8c2bcd222e32f6d46fa487fdf";

export const accountApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Get Favorite Movies from TMDB
    getFavoriteMovies: builder.query({
      query: ({ page = 1 } = {}) =>
        `/account/${DEFAULT_ACCOUNT_ID}/favorite/movies?session_id=${DEFAULT_SESSION_ID}&page=${page}&sort_by=created_at.desc`,
      transformResponse: (response) => response?.results || [],
      providesTags: ["Favorite"],
    }),

    // 2. Get Favorite TV Shows from TMDB
    getFavoriteTVShows: builder.query({
      query: ({ page = 1 } = {}) =>
        `/account/${DEFAULT_ACCOUNT_ID}/favorite/tv?session_id=${DEFAULT_SESSION_ID}&page=${page}&sort_by=created_at.desc`,
      transformResponse: (response) => response?.results || [],
      providesTags: ["Favorite"],
    }),

    // 3. Add or Remove Favorite on TMDB (POST /account/{account_id}/favorite)
    addFavorite: builder.mutation({
      query: ({ mediaType = "movie", mediaId, favorite = true }) => ({
        url: `/account/${DEFAULT_ACCOUNT_ID}/favorite?session_id=${DEFAULT_SESSION_ID}`,
        method: "POST",
        body: {
          media_type: mediaType,
          media_id: Number(mediaId),
          favorite: Boolean(favorite),
        },
      }),
      invalidatesTags: ["Favorite"],
    }),
  }),
});

export const {
  useGetFavoriteMoviesQuery,
  useGetFavoriteTVShowsQuery,
  useAddFavoriteMutation,
} = accountApi;
