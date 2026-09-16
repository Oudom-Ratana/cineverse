import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || "4e44d9029b1270a757cddc766a1bcb63";
const TMDB_ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || TMDB_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    if (TMDB_ACCESS_TOKEN) {
      headers.set("Authorization", `Bearer ${TMDB_ACCESS_TOKEN}`);
    }

    const userToken =
      getState()?.auth?.token || localStorage.getItem("cinema_token");
    if (userToken && !TMDB_ACCESS_TOKEN) {
      headers.set("Authorization", `Bearer ${userToken}`);
    }

    headers.set("accept", "application/json");
    return headers;
  },
});

const dynamicBaseQuery = async (args, api, extraOptions) => {
  let adjustedArgs = typeof args === "string" ? { url: args } : { ...args };
  if (!TMDB_ACCESS_TOKEN && TMDB_API_KEY) {
    const separator = adjustedArgs.url.includes("?") ? "&" : "?";
    if (!adjustedArgs.url.includes("api_key=")) {
      adjustedArgs.url = `${adjustedArgs.url}${separator}api_key=${TMDB_API_KEY}`;
    }
  }
  return rawBaseQuery(adjustedArgs, api, extraOptions);
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: dynamicBaseQuery,
  tagTypes: [
    "Movie",
    "TV",
    "Season",
    "Episode",
    "Showtime",
    "Booking",
    "Cinema",
    "Auth",
    "Favorite",
  ],
  endpoints: () => ({}),
});

