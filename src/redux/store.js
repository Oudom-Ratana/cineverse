import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slices/authSlice';
import bookingReducer from './slices/bookingSlice';
import watchlistReducer from './slices/watchlistSlice';
import uiReducer from './slices/uiSlice';
import favouriteReducer from './slices/favouriteSlice';
import ticketReducer from './slices/ticketSlice';
import concessionsReducer from './slices/concessionsSlice';
import groupSessionReducer from './slices/groupSessionSlice';
import { baseApi } from '../services/api/baseApi';
import { tmdbApi } from './services/tmdbApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    favourite: favouriteReducer,
    booking: bookingReducer,
    watchlist: watchlistReducer,
    ui: uiReducer,
    tickets: ticketReducer,
    concessions: concessionsReducer,
    groupSession: groupSessionReducer,
    [baseApi.reducerPath]: baseApi.reducer,
    [tmdbApi.reducerPath]: tmdbApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(baseApi.middleware, tmdbApi.middleware),
});

setupListeners(store.dispatch);

export default store;
