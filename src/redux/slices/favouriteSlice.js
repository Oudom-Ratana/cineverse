import { createSlice } from "@reduxjs/toolkit";

// Load favourites persisted in localStorage (if any)
const loadInitialMovies = () => {
  try {
    const stored = localStorage.getItem("favouriteMovies");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const initialState = {
  movies: loadInitialMovies(),
};

export const favouriteSlice = createSlice({
  name: "favourite",
  initialState,
  reducers: {
    addToFavourite: (state, action) => {
      const movie = action.payload;
      if (!movie || !movie.id) return;

      const exists = state.movies.some(
        (m) => String(m.id) === String(movie.id),
      );
      if (!exists) {
        state.movies.push(movie);
      }
      localStorage.setItem("favouriteMovies", JSON.stringify(state.movies));
    },

    removeFromFavourite: (state, action) => {
      const id = action.payload;
      state.movies = state.movies.filter((m) => String(m.id) !== String(id));
      localStorage.setItem("favouriteMovies", JSON.stringify(state.movies));
    },

    toggleFavourite: (state, action) => {
      const movie = action.payload;
      if (!movie || !movie.id) return;

      const index = state.movies.findIndex(
        (m) => String(m.id) === String(movie.id),
      );
      if (index >= 0) {
        state.movies.splice(index, 1);
      } else {
        state.movies.push(movie);
      }
      localStorage.setItem("favouriteMovies", JSON.stringify(state.movies));
    },

    setFavouriteMovies: (state, action) => {
      state.movies = action.payload || [];
      localStorage.setItem("favouriteMovies", JSON.stringify(state.movies));
    },
  },
});

export const {
  addToFavourite,
  removeFromFavourite,
  toggleFavourite,
  setFavouriteMovies,
} = favouriteSlice.actions;

export const selectFavouriteMovies = (state) => state.favourite.movies;

export default favouriteSlice.reducer;
