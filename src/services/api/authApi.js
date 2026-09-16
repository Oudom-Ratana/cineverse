import { baseApi } from "./baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),

    register: builder.mutation({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
    }),

    getProfile: builder.query({
      query: () => "/auth/profile",
      providesTags: ["Auth"],
    }),
  }),
  overrideExisting: false,
});

export const { useLoginMutation, useRegisterMutation, useGetProfileQuery } =
  authApi;
