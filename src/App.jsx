import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import RootLayout from "./layout/RootLayout";
import AdminLayout from "./layout/AdminLayout";
import SpidermanLoader from "./components/common/SpidermanLoader";

// Lazy load route pages for high performance
const HomePage = lazy(() => import("./pages/HomePage"));
const StreamPage = lazy(() => import("./pages/StreamPage"));
const MovieDetailPage = lazy(() => import("./pages/MovieDetailPage"));
const StreamMovieDetailPage = lazy(
  () => import("./pages/StreamMovieDetailPage"),
);
const WatchPage = lazy(() => import("./pages/WatchPage"));
const SeatSelectionPage = lazy(
  () => import("./pages/booking/SeatSelectionPage"),
);
const BookingDetailsPage = lazy(
  () => import("./pages/booking/BookingDetailsPage"),
);
const BookingConfirmedPage = lazy(
  () => import("./pages/booking/BookingConfirmedPage"),
);
const GroupBookingRoom = lazy(() => import("./pages/GroupBookingRoom"));
const GroupBookingRedirect = lazy(
  () => import("./pages/booking/GroupBookingRedirect"),
);
const PromotionPage = lazy(() => import("./pages/promotions/PromotionPage"));
const DetailPage = lazy(() => import("./pages/promotions/DetailPage"));
const AboutUsPage = lazy(() => import("./pages/AboutUsPage"));
const FavouritePage = lazy(() => import("./pages/FavouritePage"));
const MyTicketsPage = lazy(() => import("./pages/MyTicketsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ProfileSetup = lazy(() => import("./pages/ProfileSetup"));
const LoginComponent = lazy(() => import("./components/auth/LoginComponent"));
const SignUpComponent = lazy(() => import("./components/auth/SignUpComponent"));
const ForgotPassword = lazy(() => import("./components/auth/ForgotPassword"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// Admin Pages
const AdminDashboardPage = lazy(
  () => import("./pages/admin/AdminDashboardPage"),
);
const AdminMovieLibraryPage = lazy(
  () => import("./pages/admin/AdminMovieLibraryPage"),
);
const AdminCinemaBranchPage = lazy(
  () => import("./pages/admin/AdminCinemaBranchPage"),
);
const AdminShowtimesPage = lazy(
  () => import("./pages/admin/AdminShowtimesPage"),
);
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminUserAnalyticsPage = lazy(
  () => import("./pages/admin/AdminUserAnalyticsPage"),
);

// Route Suspense Fallback
const RouteSuspenseFallback = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-white py-16">
    <SpidermanLoader size="md" text="Loading Ciniverse..." />
  </div>
);

export default function App() {
  return (
    <>
      <Suspense fallback={<RouteSuspenseFallback />}>
        <Routes>
          {/* Main Public & Customer Facing Layout */}
          <Route path="/" element={<RootLayout />}>
            <Route index element={<HomePage />} />
            <Route path="stream" element={<StreamPage />} />
            <Route path="movies/:id" element={<MovieDetailPage />} />
            <Route path="stream/:id" element={<StreamMovieDetailPage />} />
            <Route path="movies/:id/watch" element={<WatchPage />} />
            <Route path="tv/:id/watch" element={<WatchPage />} />
            <Route path="movies/:id/book" element={<SeatSelectionPage />} />

            {/* Booking Flow */}
            <Route path="booking/seats" element={<SeatSelectionPage />} />
            <Route path="booking/details" element={<BookingDetailsPage />} />
            <Route
              path="booking/confirmed"
              element={<BookingConfirmedPage />}
            />
            <Route
              path="booking/group/:groupId"
              element={<GroupBookingRedirect />}
            />
            <Route path="group/:groupId" element={<GroupBookingRedirect />} />

            {/* Promotions */}
            <Route path="promo" element={<PromotionPage />}>
              <Route path=":id" element={<DetailPage />} />
            </Route>

            {/* Static & Customer Pages */}
            <Route path="about" element={<AboutUsPage />} />
            <Route path="favourite" element={<FavouritePage />} />
            <Route path="my-tickets" element={<MyTicketsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="profile/setup" element={<ProfileSetup />} />

            {/* Auth Pages */}
            <Route path="login" element={<LoginComponent />} />
            <Route path="signup" element={<SignUpComponent />} />
            <Route path="forgot-password" element={<ForgotPassword />} />

            {/* Catch All Not Found */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Admin Portal Layout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="movies" element={<AdminMovieLibraryPage />} />
            <Route path="cinemas" element={<AdminCinemaBranchPage />} />
            <Route path="showtimes" element={<AdminShowtimesPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="analytics" element={<AdminUserAnalyticsPage />} />
          </Route>

          {/* Global Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
}
