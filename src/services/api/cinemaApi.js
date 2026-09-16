import { baseApi } from "./baseApi";
import { MOCK_CINEMAS, MOCK_SHOWTIMES } from "../../utils/mockData";

export const cinemaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCinemas: builder.query({
      query: () => "/cinemas",
      transformResponse: (response) => response || MOCK_CINEMAS,
      providesTags: ["Cinema"],
    }),

    getShowtimes: builder.query({
      query: ({ movieId, date }) =>
        `/showtimes?movieId=${movieId}&date=${date}`,
      transformResponse: (response) => response || MOCK_SHOWTIMES,
      providesTags: ["Showtime"],
    }),

    getSeatLayout: builder.query({
      query: (showtimeId) => `/showtimes/${showtimeId}/seats`,
      providesTags: (result, error, showtimeId) => [
        { type: "Showtime", id: showtimeId },
      ],
    }),
  }),
  // overrideExisting: false,
});

export const {
  useGetCinemasQuery,
  useGetShowtimesQuery,
  useGetSeatLayoutQuery,
} = cinemaApi;
