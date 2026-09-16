import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectTheme } from "../redux/slices/uiSlice";
import Navbar from "../components/nav-footer/Navbar";
import Footer from "../components/nav-footer/Footer";

export default function RootLayout() {
  const location = useLocation();
  const theme = useSelector(selectTheme);
  const isDark = theme === "dark";
  const isHomePage = location.pathname === "/";
  const isAuthPage = [
    "/login",
    "/Login",
    "/signup",
    "/SignUp",
    "/forgot-password",
    "/ForgotPassword",
  ].includes(location.pathname);

  // Smooth scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div
      className={`min-h-screen flex flex-col font-sans antialiased transition-colors duration-300 selection:bg-[#B90101] selection:text-white ${
        isDark ? "text-white" : "text-neutral-900"
      } ${isAuthPage ? "h-screen overflow-hidden" : ""}`}
      style={{
        backgroundColor: isDark ? "transparent" : "#F6F7F9",
        background: isDark ? "var(--bg-dark-mode)" : "#F6F7F9",
        backgroundAttachment: isDark ? "fixed" : "scroll",
        minHeight: "100vh",
      }}
    >
      <Navbar />
      <main
        className={`flex-1 w-full ${
          isHomePage
            ? "pb-12"
            : isAuthPage
              ? "h-[calc(100dvh-5rem)] mt-20 overflow-hidden"
              : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12"
        }`}
      >
        <Outlet />
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}
