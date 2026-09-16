import { createSlice } from "@reduxjs/toolkit";

const savedWatchlist = localStorage.getItem("cinema_watchlist");
const initialState = {
  items: savedWatchlist ? JSON.parse(savedWatchlist) : [],
};

const watchlistSlice = createSlice({
  name: "watchlist",
  initialState,
  reducers: {
    addToWatchlist: (state, action) => {
      const movie = action.payload;
      if (!state.items.some((item) => item.id === movie.id)) {
        state.items.push(movie);
        localStorage.setItem("cinema_watchlist", JSON.stringify(state.items));
      }
    },
    removeFromWatchlist: (state, action) => {
      const movieId = action.payload;
      state.items = state.items.filter((item) => item.id !== movieId);
      localStorage.setItem("cinema_watchlist", JSON.stringify(state.items));
    },
    toggleWatchlist: (state, action) => {
      const movie = action.payload;
      const index = state.items.findIndex((item) => item.id === movie.id);
      if (index >= 0) {
        state.items.splice(index, 1);
      } else {
        state.items.push(movie);
      }
      localStorage.setItem("cinema_watchlist", JSON.stringify(state.items));
    },
  },
});

export const { addToWatchlist, removeFromWatchlist, toggleWatchlist } =
  watchlistSlice.actions;

export const selectWatchlist = (state) => state.watchlist.items;
export const selectIsInWatchlist = (id) => (state) =>
  state.watchlist.items.some((item) => item.id === id);

export default watchlistSlice.reducer;
