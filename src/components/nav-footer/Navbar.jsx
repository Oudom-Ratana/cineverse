import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  User,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  Heart,
  LayoutDashboard,
  Ticket,
  Calendar,
  Clock,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  selectCurrentUser,
  selectIsAuthenticated,
  logout,
} from "../../redux/slices/authSlice";
import { selectTheme, toggleTheme } from "../../redux/slices/uiSlice";
import { selectFavouriteMovies } from "../../redux/slices/favouriteSlice";
import { selectUserTickets, setUserTickets } from "../../redux/slices/ticketSlice";
import { listenUserBookings } from "../../services/firestoreService";
import { toast } from "react-toastify";
import CiniverseLogo from "../../assets/logo/CiniverseLogo.png";

export default function Navbar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const theme = useSelector(selectTheme);
  const favouriteMovies = useSelector(selectFavouriteMovies) || [];
  const favoriteCount = favouriteMovies.length;
  const userTickets = useSelector(selectUserTickets) || [];
  const ticketCount = isAuthenticated ? userTickets.length : 0;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isBellDropdownOpen, setIsBellDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const bellDropdownRef = useRef(null);

  // Sync tickets in real-time from Firestore specifically for the currently logged-in user
  useEffect(() => {
    if (!isAuthenticated || (!user?.uid && !user?.id)) {
      dispatch(setUserTickets([]));
      return;
    }

    const uid = user.uid || user.id;
    const unsub = listenUserBookings(uid, (tickets) => {
      if (tickets && Array.isArray(tickets)) {
        dispatch(setUserTickets(tickets));
      } else {
        dispatch(setUserTickets([]));
      }
    });

    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [isAuthenticated, user, dispatch]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
      if (
        bellDropdownRef.current &&
        !bellDropdownRef.current.contains(event.target)
      ) {
        setIsBellDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen || isBellDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileDropdownOpen, isBellDropdownOpen]);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
    setIsBellDropdownOpen(false);
  }, [location.pathname]);

  const [isScrolled, setIsScrolled] = useState(false);
  const isHomePage = location.pathname === "/";

  // Track scroll position for dynamic homepage navbar transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isTransparentHeroMode = isHomePage && !isScrolled;

  // Active state: Primary red with red underline indicator bar
  // Inactive state:
  // - Top of homepage: Golden yellow text (#EAB308) matching the dark hero banner
  // - Scrolled / Other pages: Crisp charcoal (#1E293B / neutral-800) in light mode, Golden yellow in dark mode
  const navLinkClass = ({ isActive }) =>
    `relative text-[18px] font-bold transition-all px-1 pb-1.5 ${
      isActive
        ? 'text-[#B90101] font-black after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#B90101] after:rounded-full'
        : isTransparentHeroMode
          ? "text-[#EAB308] hover:text-[#B90101]"
          : "text-neutral-800 dark:text-[#EAB308] hover:text-[#B90101] dark:hover:text-[#B90101]"
    }`;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isTransparentHeroMode
          ? "bg-gradient-to-b from-black/80 via-black/40 to-transparent backdrop-blur-[2px] border-b border-white/10"
          : "bg-white/55 dark:bg-black/40 backdrop-blur-md border-b border-neutral-200/80 dark:border-[#9E0505]/20 shadow-xs dark:shadow-none"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* 1. Left: Ciniverse Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group shrink-0 select-none py-1"
          aria-label="Ciniverse Home"
        >
          <img
            src={CiniverseLogo}
            alt="Ciniverse Logo"
            className="h-10 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105 drop-shadow-sm"
          />
          <span className="font-black text-2xl tracking-tighter text-[#B90101] flex items-center">
            CINIVERSE
          </span>
        </Link>

        {/* 2. Center: Navigation Links (Home, Promo, Stream, About) */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-12">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>
          {/* <NavLink to="/promo" className={navLinkClass}>
            Promo
          </NavLink> */}
          <NavLink to="/stream" className={navLinkClass}>
            Movies
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
        </nav>

        {/* 3. Right: Action Buttons (Notification Bell, Theme Switcher, Avatar/Login on far right) */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Notification Bell Button with User-Specific Bookings Popover */}
          <div className="relative" ref={bellDropdownRef}>
            <button
              type="button"
              onClick={() => setIsBellDropdownOpen((prev) => !prev)}
              className={`relative w-[46px] h-[46px] rounded-full border backdrop-blur-md flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-xs cursor-pointer ${
                isTransparentHeroMode
                  ? "bg-[#1A1F25]/20 hover:bg-[#1A1F25]/35 border-white/20 text-[#FFD700]"
                  : "bg-white/80 hover:bg-white dark:bg-[#1A1F25]/40 dark:hover:bg-[#1A1F25]/60 border-neutral-200 dark:border-white/15 text-[#B90101] dark:text-[#EAB308]"
              }`}
              aria-label="My Tickets"
              title="My Bookings & Tickets"
            >
              <Bell className="w-5 h-5 fill-current" />
              {ticketCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#B90101] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {ticketCount > 9 ? "9+" : ticketCount}
                </span>
              )}
            </button>

            {/* Notification Bell Dropdown Menu */}
            {isBellDropdownOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden z-50 animate-scaleUp">
                {/* Header */}
                <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-[#B90101]" />
                    <span className="font-extrabold text-sm text-neutral-900 dark:text-white">
                      My Booking History
                    </span>
                  </div>
                  {isAuthenticated && ticketCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#B90101]/10 text-[#B90101] font-black text-[10px] uppercase tracking-wider">
                      {ticketCount} {ticketCount === 1 ? "Ticket" : "Tickets"}
                    </span>
                  )}
                </div>

                {/* Dropdown Body */}
                <div className="max-h-80 overflow-y-auto p-3 space-y-2">
                  {!isAuthenticated ? (
                    <div className="py-6 px-4 text-center space-y-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
                        <Bell className="w-5 h-5" />
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Please sign in to view your personalized tickets and booking history.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsBellDropdownOpen(false);
                          navigate("/login?redirect=/my-tickets");
                        }}
                        className="px-4 py-2 rounded-full bg-[#B90101] hover:bg-[#9E0000] text-white text-xs font-bold transition shadow-xs"
                      >
                        Sign In / Register
                      </button>
                    </div>
                  ) : userTickets.length === 0 ? (
                    <div className="py-6 px-4 text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
                        <Ticket className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                        No Bookings Yet
                      </p>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        You have not booked any tickets with this account yet.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsBellDropdownOpen(false);
                          navigate("/stream");
                        }}
                        className="text-xs font-bold text-[#B90101] hover:underline pt-1 inline-block"
                      >
                        Explore Movies & Book Now →
                      </button>
                    </div>
                  ) : (
                    userTickets.slice(0, 3).map((ticket) => {
                      const movieObj = ticket.movie || {};
                      const showtimeObj = ticket.showtime || {};
                      const posterUrl =
                        movieObj.poster ||
                        (movieObj.poster_path
                          ? `https://image.tmdb.org/t/p/w200${movieObj.poster_path}`
                          : "https://i.pinimg.com/736x/95/26/68/9526684fe11e38cf6bb6fbd48e37de6a.jpg");

                      return (
                        <div
                          key={ticket.id || ticket.bookingId}
                          onClick={() => {
                            setIsBellDropdownOpen(false);
                            navigate(ticket.viewUrl || "/my-tickets");
                          }}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800/60 dark:hover:bg-neutral-800 transition border border-neutral-200/60 dark:border-neutral-700/50 cursor-pointer group"
                        >
                          <img
                            src={posterUrl}
                            alt={movieObj.title}
                            className="w-12 h-16 object-cover rounded-lg shrink-0 shadow-xs group-hover:scale-105 transition"
                          />
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <h5 className="font-extrabold text-xs text-neutral-900 dark:text-white truncate">
                              {movieObj.title || "Cinema Ticket"}
                            </h5>
                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                              {showtimeObj.location || "Ciniverse Cinema"} • {showtimeObj.hall || "Hall 3"}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-neutral-600 dark:text-neutral-300">
                              <span>{showtimeObj.date}</span>
                              <span>•</span>
                              <span className="font-bold text-[#B90101]">{showtimeObj.time}</span>
                            </div>
                            <p className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300">
                              Seats: {Array.isArray(ticket.seats) ? ticket.seats.join(", ") : ticket.seats}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-[#B90101] transition shrink-0" />
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                {isAuthenticated && userTickets.length > 0 && (
                  <div className="p-2.5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/80 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsBellDropdownOpen(false);
                        navigate("/my-tickets");
                      }}
                      className="w-full py-2 rounded-xl bg-[#B90101] hover:bg-[#9E0000] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span>View All My Tickets ({userTickets.length})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Theme Switcher Toggle Button */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className={`w-[46px] h-[46px] rounded-full border backdrop-blur-md flex items-center justify-center text-[#B90101] hover:scale-105 active:scale-95 transition shadow-xs cursor-pointer ${
              isTransparentHeroMode
                ? "bg-[#1A1F25]/20 hover:bg-[#1A1F25]/35 border-white/20"
                : "bg-white/80 hover:bg-white dark:bg-[#1A1F25]/40 dark:hover:bg-[#1A1F25]/60 border-neutral-200 dark:border-white/15"
            }`}
            aria-label="Toggle Theme"
            title={
              theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
            }
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-[#B90101] transition-transform rotate-0 hover:rotate-90 duration-300" />
            ) : (
              <Moon className="w-5 h-5 text-[#B90101] fill-[#B90101] transition-transform duration-300" />
            )}
          </button>

          {/* User Avatar Dropdown on the far right (Replaces Admin button) */}
          {isAuthenticated && user ? (
            <div className="relative" ref={profileDropdownRef}>
              <button
                type="button"
                onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                className="w-[46px] h-[46px] rounded-full overflow-hidden border-2 border-[#B90101] hover:scale-105 active:scale-95 transition shadow-md flex items-center justify-center bg-neutral-200 dark:bg-neutral-800 cursor-pointer focus:outline-none"
                aria-label="User profile menu"
                title={user.name}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#B90101] flex items-center justify-center text-white">
                    <User className="w-5 h-5 fill-white" />
                  </div>
                )}
              </button>

              {/* Popup Dropdown Menu with Profile, Favorite, and Logout */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-52 rounded-2xl bg-white dark:bg-[#1A1F25] border border-neutral-200 dark:border-white/10 shadow-2xl backdrop-blur-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* User Header */}
                  <div className="px-4 py-2 border-b border-neutral-100 dark:border-white/5">
                    <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                      {user.email}
                    </p>
                  </div>

                  {/* 1. Profile Option */}
                  <Link
                    to="/profile"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-[#B90101] dark:hover:text-[#B90101] transition"
                  >
                    <User className="w-4 h-4 text-[#B90101]" />
                    <span>Profile</span>
                  </Link>

                  {/* 2. Favorite Option (Inside dropdown below profile) */}
                  <Link
                    to="/favourite"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-[#B90101] dark:hover:text-[#B90101] transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <Heart className="w-4 h-4 text-[#B90101]" />
                      <span>Favorite</span>
                    </div>
                    {favoriteCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-[#B90101] text-white text-[10px] font-black shadow-xs">
                        {favoriteCount}
                      </span>
                    )}
                  </Link>

                  {/* 3. Admin Portal Option */}
                  <Link
                    to="/admin/movies"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-[#B90101] dark:hover:text-[#B90101] transition"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#B90101]" />
                    <span>Admin Movie Library</span>
                  </Link>

                  <div className="my-1 border-t border-neutral-100 dark:border-white/5" />

                  {/* 3. Logout Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      dispatch(logout());
                      toast.info("Logged out successfully");
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-[#B90101] hover:bg-red-500/10 transition cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-6 py-2.5 rounded-[35px] text-white font-bold text-[18px] shadow-md hover:brightness-110 active:scale-95 transition cursor-pointer"
              style={{ backgroundColor: "#B90101" }}
            >
              <User className="w-4 h-4 fill-white" />
              <span>Login</span>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          {/* Mobile Theme Switcher (Red primary color #B90101) */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className={`w-[40px] h-[40px] rounded-full backdrop-blur-md flex items-center justify-center text-[#B90101] shadow-xs cursor-pointer transition-colors ${
              isTransparentHeroMode
                ? "bg-[#1A1F25]/20 hover:bg-[#1A1F25]/40 border border-white/20"
                : "bg-white/80 hover:bg-white dark:bg-[#1A1F25]/40 border border-neutral-200 dark:border-white/15"
            }`}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-[#B90101]" />
            ) : (
              <Moon className="w-4 h-4 text-[#B90101] fill-[#B90101]" />
            )}
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-2 rounded-[20px] backdrop-blur-md shadow-xs cursor-pointer transition-colors ${
              isTransparentHeroMode
                ? "text-white bg-[#1A1F25]/20 hover:bg-[#1A1F25]/40 border border-white/20"
                : "text-neutral-800 dark:text-white bg-white/80 hover:bg-white dark:bg-[#1A1F25]/40 border border-neutral-200 dark:border-white/15"
            }`}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl px-6 py-4 space-y-3 transition-colors border-neutral-200 dark:border-[#9E0505]/20 shadow-xl">
          <NavLink
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className={navLinkClass}
          >
            Home
          </NavLink>
          <div />
          {/* <NavLink
            to="/promo"
            onClick={() => setIsMobileMenuOpen(false)}
            className={navLinkClass}
          >
            Promo
          </NavLink> */}
          <div />
          <NavLink
            to="/stream"
            onClick={() => setIsMobileMenuOpen(false)}
            className={navLinkClass}
          >
            Movies
          </NavLink>
          <NavLink
            to="/my-tickets"
            onClick={() => setIsMobileMenuOpen(false)}
            className={navLinkClass}
          >
            My Tickets {ticketCount > 0 && `(${ticketCount})`}
          </NavLink>
          <div />
          <NavLink
            to="/favourite"
            onClick={() => setIsMobileMenuOpen(false)}
            className={navLinkClass}
          >
            Favorites {favoriteCount > 0 && `(${favoriteCount})`}
          </NavLink>
          <div />
          <NavLink
            to="/about"
            onClick={() => setIsMobileMenuOpen(false)}
            className={navLinkClass}
          >
            About
          </NavLink>
          <div />
          <NavLink
            to="/admin"
            onClick={() => setIsMobileMenuOpen(false)}
            className={navLinkClass}
          >
            Admin Dashboard
          </NavLink>

          <div
            className="pt-3 border-t flex flex-col gap-2"
            style={{ borderColor: "rgba(158, 5, 5, 0.20)" }}
          >
            {isAuthenticated && user ? (
              <div className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#B90101] text-white shadow-md">
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 truncate hover:opacity-90 transition cursor-pointer flex-1"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover bg-white/20 border border-white/40 shrink-0"
                    />
                  ) : (
                    <User className="w-5 h-5 fill-white shrink-0" />
                  )}
                  <div className="truncate">
                    <p className="text-sm font-bold truncate">{user.name}</p>
                    <p className="text-xs text-white/70 truncate">
                      {user.email}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    dispatch(logout());
                    setIsMobileMenuOpen(false);
                    toast.info("Logged out successfully");
                  }}
                  className="p-2 rounded-xl bg-black/20 hover:bg-black/30 transition text-white cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-[35px] text-white font-bold text-[18px] flex items-center justify-center gap-2 shadow-md hover:brightness-110 transition"
                style={{ backgroundColor: "#B90101" }}
              >
                <User className="w-4 h-4 fill-white" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
