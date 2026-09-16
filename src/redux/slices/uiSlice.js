import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('cinema_theme');
    if (savedTheme) {
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return savedTheme;
    }
  }
  if (typeof document !== 'undefined') {
    document.documentElement.classList.add('dark');
  }
  return 'dark';
};

const initialState = {
  theme: getInitialTheme(),
  trailerModal: {
    isOpen: false,
    videoKey: null,
    movieTitle: '',
  },
  authModal: {
    isOpen: false,
    mode: 'login', // 'login' | 'register'
  },
  searchQuery: '',
  selectedGenre: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        localStorage.setItem('cinema_theme', state.theme);
        if (state.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('cinema_theme', state.theme);
        if (state.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
    openTrailerModal: (state, action) => {
      state.trailerModal = {
        isOpen: true,
        videoKey: action.payload.videoKey || 'dQw4w9WgXcQ',
        movieTitle: action.payload.title || 'Trailer',
      };
    },
    closeTrailerModal: (state) => {
      state.trailerModal = {
        isOpen: false,
        videoKey: null,
        movieTitle: '',
      };
    },
    openAuthModal: (state, action) => {
      state.authModal = {
        isOpen: true,
        mode: action.payload?.mode || 'login',
      };
    },
    closeAuthModal: (state) => {
      state.authModal.isOpen = false;
    },
    setAuthModalMode: (state, action) => {
      state.authModal.mode = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedGenre: (state, action) => {
      state.selectedGenre = action.payload;
    },
  },
});

export const {
  toggleTheme,
  setTheme,
  openTrailerModal,
  closeTrailerModal,
  openAuthModal,
  closeAuthModal,
  setAuthModalMode,
  setSearchQuery,
  setSelectedGenre,
} = uiSlice.actions;

export const selectTheme = (state) => state.ui.theme;
export const selectTrailerModal = (state) => state.ui.trailerModal;
export const selectAuthModal = (state) => state.ui.authModal;
export const selectSearchQuery = (state) => state.ui.searchQuery;
export const selectSelectedGenre = (state) => state.ui.selectedGenre;

export default uiSlice.reducer;
