import { baseApi } from "./baseApi";

export const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createBooking: builder.mutation({
      query: (bookingData) => ({
        url: "/bookings",
        method: "POST",
        body: bookingData,
      }),
      invalidatesTags: ["Booking", "Showtime"],
    }),

    getMyBookings: builder.query({
      query: () => "/user/bookings",
      providesTags: ["Booking"],
    }),

    getBookingById: builder.query({
      query: (id) => `/bookings/${id}`,
      providesTags: (result, error, id) => [{ type: "Booking", id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateBookingMutation,
  useGetMyBookingsQuery,
  useGetBookingByIdQuery,
} = bookingApi;
