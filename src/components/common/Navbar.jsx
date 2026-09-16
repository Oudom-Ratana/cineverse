import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Film,
  Search,
  Bell,
  User,
  Ticket,
  Heart,
  Clock,
  Shield,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDispatch } from 'react-redux';
import { openAuthModal } from '../../redux/slices/uiSlice';
import { useSearchMultiQuery } from '../../redux/services/tmdbApi';
import { getUserNotifications, markNotificationRead } from '../../services/firestoreService';
import { getPosterUrl } from '../../utils/formatters';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  // Global search state with 300ms debounce
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchContainerRef = useRef(null);

  // Debounce search query by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Execute TMDB multi-search query
  const { data: searchResults, isFetching: isSearching } = useSearchMultiQuery(
    { query: debouncedQuery },
    { skip: !debouncedQuery || debouncedQuery.length < 2 }
  );

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    if (user?.uid) {
      setNotifications(getUserNotifications(user.uid));
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkNotifRead = (id) => {
    if (user?.uid) {
      const updated = markNotificationRead(user.uid, id);
      setNotifications(updated);
    }
  };

  // Scroll listener for sticky translucent navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotifDropdownOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Movies', path: '/movies' },
    { name: 'TV Shows', path: '/tv' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-dark-950/90 backdrop-blur-md border-b border-slate-800/80 shadow-lg py-3'
          : 'bg-gradient-to-b from-dark-950/90 via-dark-950/50 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center shadow-lg shadow-rose-950/50 group-hover:scale-105 transition">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
              Film<span className="text-rose-500">Zone</span>
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'text-white bg-slate-800/80'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              to="/admin"
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}
        </nav>

        {/* Global Multi-Search Bar */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-xs sm:max-w-sm hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search movies, TV, actors..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-dark-900/90 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition shadow-inner"
            />
          </div>

          {/* Search Results Dropdown */}
          {searchOpen && debouncedQuery.length >= 2 && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-dark-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto animate-fade-in">
              {isSearching ? (
                <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                  Searching TMDB...
                </div>
              ) : searchResults?.results?.length > 0 ? (
                <div className="divide-y divide-slate-800/60">
                  {searchResults.results.slice(0, 7).map((item) => {
                    const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
                    if (mediaType === 'person') return null; // Only movies and TV
                    const title = item.title || item.name;
                    const date = item.release_date || item.first_air_date;
                    const year = date ? new Date(date).getFullYear() : '';

                    return (
                      <Link
                        key={item.id}
                        to={`/${mediaType === 'tv' ? 'tv' : 'movies'}/${item.id}`}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-3 p-2.5 hover:bg-slate-800/70 transition"
                      >
                        <img
                          src={getPosterUrl(item.poster_path, 'w92')}
                          alt={title}
                          className="w-10 h-14 object-cover rounded-md flex-shrink-0 bg-slate-800"
                        />
                        <div className="overflow-hidden flex-1">
                          <p className="text-sm font-medium text-white truncate">{title}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                            <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-rose-400">
                              {mediaType}
                            </span>
                            {year && <span>{year}</span>}
                            {item.vote_average > 0 && (
                              <span className="text-amber-400 font-semibold">★ {item.vote_average.toFixed(1)}</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  No TMDB results found for "{debouncedQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions: Notifications & Profile */}
        <div className="flex items-center gap-2.5">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setNotifDropdownOpen(!notifDropdownOpen);
                setUserDropdownOpen(false);
              }}
              className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/70 transition"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-dark-950 animate-pulse" />
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-dark-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <span className="font-semibold text-sm text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full font-medium">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/50">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleMarkNotifRead(n.id)}
                        className={`p-3.5 hover:bg-slate-800/60 cursor-pointer transition ${
                          !n.read ? 'bg-slate-800/30' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-white">{n.title}</p>
                          {!n.read && <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0 mt-1" />}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{n.body}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500">No notifications yet</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Auth Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setNotifDropdownOpen(false);
                }}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800/70 transition"
              >
                <img
                  src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                  alt={user.displayName || 'User'}
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700"
                />
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-dark-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in py-1">
                  <div className="px-4 py-2.5 border-b border-slate-800">
                    <p className="text-sm font-semibold text-white truncate">{user.displayName || 'Cinema Fan'}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>

                  <Link
                    to="/profile"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition"
                  >
                    <Ticket className="w-4 h-4 text-rose-400" />
                    My Tickets & Bookings
                  </Link>

                  <Link
                    to="/profile?tab=watchlist"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition"
                  >
                    <Heart className="w-4 h-4 text-rose-400" />
                    Watchlist & Favourites
                  </Link>

                  <Link
                    to="/profile?tab=history"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition"
                  >
                    <Clock className="w-4 h-4 text-cyan-400" />
                    Watch History
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-amber-400 hover:bg-slate-800 transition"
                    >
                      <Shield className="w-4 h-4" />
                      Admin Control Panel
                    </Link>
                  )}

                  <div className="border-t border-slate-800 my-1" />

                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => dispatch(openAuthModal({ mode: 'login' }))}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-rose-950/40 transition hover:scale-[1.02]"
            >
              <User className="w-4 h-4" />
              Sign In
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-300 hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-dark-900 border-b border-slate-800 px-4 py-4 space-y-3 animate-fade-in">
          <div className="relative mb-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search movies, TV..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-dark-950 border border-slate-800 text-sm text-slate-200"
            />
          </div>
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800"
              >
                {link.name}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="px-3 py-2 rounded-lg text-sm text-amber-400 hover:bg-amber-500/10 flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Admin Panel
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
