import { createSlice } from "@reduxjs/toolkit";

const token = localStorage.getItem("cinema_token") || null;
const user = localStorage.getItem("cinema_user")
  ? JSON.parse(localStorage.getItem("cinema_user"))
  : null;

const initialState = {
  user: user,
  token: token,
  isAuthenticated: !!token,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.error = null;
      if (token) localStorage.setItem("cinema_token", token);
      if (user) localStorage.setItem("cinema_user", JSON.stringify(user));
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      if (state.user) {
        localStorage.setItem("cinema_user", JSON.stringify(state.user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("cinema_token");
      localStorage.removeItem("cinema_user");
      localStorage.removeItem("Ciniverse_booked_tickets");
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setCredentials, updateUser, logout, setError, setLoading } =
  authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;

export default authSlice.reducer;
