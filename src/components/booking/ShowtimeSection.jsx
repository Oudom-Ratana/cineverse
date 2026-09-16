import { useState, useEffect, useMemo } from "react";
import {
  ChevronDown,
  Volume2,
  MessageCircleMore,
  Building,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { selectTheme } from "../../redux/slices/uiSlice";
import { setMovie, setShowtime } from "../../redux/slices/bookingSlice";
import { selectIsAuthenticated } from "../../redux/slices/authSlice";
import {
  LOCATIONS,
  DATES,
  BRANCH_SHOWTIMES,
} from "../../data/cinemaShowtimeData";
import { listenAdminBranches } from "../../services/firestoreService";
import { getHallsForDate } from "../../utils/hallConfigs";
import { generateDateList } from "../../utils/dateHelpers";

/**
 * ShowtimeSection
 * Displays Cinema Location selector, Date picker cards, and Branch Showtime listings.
 * Each branch shows all its halls grouped separately.
 * Synchronized with movie-specific branches and Firestore admin_branches.
 */
export default function ShowtimeSection({
  movieId,
  isTV = false,
  movie = null,
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isDark = theme === "dark";

  // Initial branches: prefer movie.branches, fallback to BRANCH_SHOWTIMES
  const [branches, setBranches] = useState(() => {
    if (
      movie?.branches &&
      Array.isArray(movie.branches) &&
      movie.branches.length > 0
    ) {
      return movie.branches;
    }
    return BRANCH_SHOWTIMES;
  });

  // Calculate dynamic date list based on movie showing range or default DATES
  const availableDates = useMemo(() => {
    if (movie?.startDate) {
      return generateDateList(
        movie.startDate,
        movie.totalDays || 7,
        movie.endDate,
      );
    }
    return DATES;
  }, [movie?.startDate, movie?.totalDays, movie?.endDate]);

  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedDate, setSelectedDate] = useState(
    () => availableDates[0] || DATES[0],
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

  // Sync branches when movie changes
  useEffect(() => {
    if (
      movie?.branches &&
      Array.isArray(movie.branches) &&
      movie.branches.length > 0
    ) {
      setBranches(movie.branches);
    }
  }, [movie?.branches]);

  // Sync selectedDate when availableDates change
  useEffect(() => {
    if (availableDates.length > 0) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates]);

  // Real-time listener for Firestore Admin Cinema Branches as fallback
  useEffect(() => {
    if (movie?.branches && movie.branches.length > 0) return;
    const unsub = listenAdminBranches(BRANCH_SHOWTIMES, (list) => {
      if (list && list.length > 0) {
        setBranches(list);
      }
    });
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [movie?.branches]);

  // Glassmorphism design tokens from index.css
  const glassCardStyle = {
    backgroundColor: isDark
      ? "var(--primary-color-30)"
      : "var(--primary-color-5)",
    borderColor: isDark
      ? "var(--border-dark-mode)"
      : "var(--border-light-mode)",
  };

  const borderDividerStyle = {
    borderColor: isDark
      ? "var(--border-dark-mode)"
      : "var(--border-light-mode)",
  };

  const dynamicLocations = [
    "All Locations",
    ...new Set(branches.map((b) => b.location || b.branchName)),
  ];

  const filteredBranches =
    selectedLocation === "All Locations"
      ? branches
      : branches.filter(
          (b) => (b.location || b.branchName) === selectedLocation,
        );

  const handleTimeClick = (branch, hall, time) => {
    const slotKey = `${hall.id}-${time}`;
    setSelectedTimeSlot(slotKey);

    const isGold =
      hall.goldClass ||
      hall.hallCategory === "vip" ||
      (hall.screenType || "").toUpperCase().includes("GOLD") ||
      (hall.hallName || "").toLowerCase().includes("vip") ||
      (hall.hallName || "").toLowerCase().includes("gold");

    const screenTypeFormatted =
      hall.screenType ||
      (hall.badges && hall.badges[0]) ||
      hall.badge ||
      (isGold ? "GOLD" : "2D");

    const formattedDate =
      selectedDate.display ||
      `${selectedDate.month} ${selectedDate.day} ${selectedDate.weekday}`;

    if (movie) {
      dispatch(setMovie(movie));
    }

    dispatch(
      setShowtime({
        time,
        branch: branch.branchName || branch.location,
        date: formattedDate,
        screenType: screenTypeFormatted,
        hall: isGold ? "Gold Class VIP" : `Hall 3 - ${screenTypeFormatted}`,
        hallType: isGold ? "gold" : "standard",
      }),
    );

    const bookingParams = new URLSearchParams({
      movie: movieId || movie?.id || "",
      mediaType: isTV ? "tv" : "movie",
      hall: isGold ? "gold" : "standard",
      screenType: screenTypeFormatted,
      time,
      branch: branch.branchName || branch.location,
      date: formattedDate,
    });

    const targetUrl = `/booking/seats?${bookingParams.toString()}`;

    // Require authentication before choosing seats or proceeding to booking
    if (!isAuthenticated) {
      toast.info("Please log in or create an account to choose showtimes and book your seats.");
      navigate(`/login?redirect=${encodeURIComponent(targetUrl)}`);
      return;
    }

    navigate(targetUrl);
  };

  // Helper: render the screen type header for each hall group
  const renderHallHeader = (hall) => {
    const isGold =
      hall.goldClass ||
      hall.hallCategory === "vip" ||
      (hall.screenType || "").toUpperCase().includes("GOLD") ||
      (hall.hallName || "").toLowerCase().includes("vip") ||
      (hall.hallName || "").toLowerCase().includes("gold");

    if (isGold) {
      return (
        <div className="flex items-center gap-3">
          {/* Gold Class Logo */}
          <div className="flex items-baseline gap-0.5">
            <span className="text-[11px] font-black uppercase text-[#FFB800] leading-none tracking-wider">
              GOLD
            </span>
            <span className="text-[8px] font-black uppercase text-[#FFB800] leading-none tracking-wider">
              CLASS
            </span>
          </div>
          {hall.audio && (
            <>
              <span className="text-neutral-400 dark:text-neutral-600">|</span>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
                <MessageCircleMore className="w-3.5 h-3.5" />
                <span>{hall.audio}</span>
              </div>
            </>
          )}
          {hall.subtitle && (
            <>
              <span className="text-neutral-400 dark:text-neutral-600">|</span>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
                <Volume2 className="w-3.5 h-3.5" />
                <span>{hall.subtitle}</span>
              </div>
            </>
          )}
        </div>
      );
    }

    const screenLabel =
      hall.screenType || (hall.badges && hall.badges[0]) || hall.badge || "2D";

    return (
      <div className="flex items-center gap-3">
        {/* Screen Format Pill */}
        <span
          className="text-xs font-black tracking-wider px-2.5 py-0.5 rounded uppercase"
          style={{
            backgroundColor: "#B90101",
            color: "#FFFFFF",
          }}
        >
          {screenLabel}
        </span>
        {hall.audio && (
          <>
            <span className="text-neutral-400 dark:text-neutral-600">|</span>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
              <MessageCircleMore className="w-3.5 h-3.5" />
              <span>{hall.audio}</span>
            </div>
          </>
        )}
        {hall.subtitle && (
          <>
            <span className="text-neutral-400 dark:text-neutral-600">|</span>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
              <Volume2 className="w-3.5 h-3.5" />
              <span>{hall.subtitle}</span>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* 1. Header: Section Title + Location Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Title */}
        <div className="flex items-center gap-3">
          <span
            className="w-1.5 h-7 rounded-full inline-block"
            style={{ backgroundColor: "#B90101" }}
          />
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            Cinemas & Showtimes
          </h2>
        </div>

        {/* Right Location Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsLocationDropdownOpen((prev) => !prev)}
            className="flex items-center justify-between gap-3 px-5 py-2.5 rounded-full border text-xs sm:text-sm font-extrabold transition-all shadow-xs min-w-[200px] cursor-pointer"
            style={glassCardStyle}
            aria-haspopup="listbox"
            aria-expanded={isLocationDropdownOpen}
          >
            <span className="truncate">{selectedLocation}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 shrink-0 text-[#B90101] ${
                isLocationDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Location Dropdown Menu */}
          {isLocationDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-2xl border shadow-xl z-30 py-2 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
              style={glassCardStyle}
            >
              {dynamicLocations.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => {
                    setSelectedLocation(loc);
                    setIsLocationDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                    selectedLocation === loc
                      ? "text-[#B90101] font-black bg-[#B90101]/10"
                      : "text-neutral-700 dark:text-neutral-200 hover:text-[#B90101] hover:bg-neutral-100 dark:hover:bg-white/5"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Date Picker Row (Dynamic Date Cards) */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none">
        {availableDates.map((dateItem) => {
          const isSelected = selectedDate.id === dateItem.id;
          return (
            <button
              key={dateItem.id}
              type="button"
              onClick={() => setSelectedDate(dateItem)}
              className={`group relative flex flex-col items-center justify-center min-w-[80px] sm:min-w-[90px] h-[92px] rounded-2xl sm:rounded-3xl border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "border-[#B90101] shadow-lg scale-105"
                  : "hover:border-[#B90101]/50 hover:scale-[1.02]"
              }`}
              style={{
                backgroundColor: isSelected
                  ? "#B90101"
                  : isDark
                    ? "var(--primary-color-30)"
                    : "var(--primary-color-5)",
                borderColor: isSelected
                  ? "#B90101"
                  : isDark
                    ? "var(--border-dark-mode)"
                    : "var(--border-light-mode)",
              }}
            >
              {/* Month */}
              <span
                className={`text-[11px] font-extrabold uppercase tracking-wider ${
                  isSelected
                    ? "text-white"
                    : "text-neutral-500 dark:text-neutral-400"
                }`}
              >
                {dateItem.month}
              </span>

              {/* Day Number */}
              <span
                className={`text-2xl sm:text-3xl font-black leading-tight my-0.5 ${
                  isSelected
                    ? "text-white"
                    : "text-neutral-900 dark:text-white group-hover:text-[#B90101]"
                }`}
              >
                {dateItem.day}
              </span>

              {/* Weekday */}
              <span
                className={`text-[11px] font-bold ${
                  isSelected
                    ? "text-white/90"
                    : "text-neutral-500 dark:text-neutral-400"
                }`}
              >
                {dateItem.weekday}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Cinema Branches Listing Cards */}
      <div className="space-y-6 pt-2">
        {filteredBranches.map((branch) => {
          const hallsToDisplay = getHallsForDate(
            branch,
            selectedDate.id || selectedDate.full,
          );
          const activeHalls =
            hallsToDisplay && hallsToDisplay.length > 0
              ? hallsToDisplay
              : branch.halls || [];

          return (
            <div
              key={branch.id}
              className="w-full rounded-2xl sm:rounded-3xl border p-5 sm:p-7 space-y-6 shadow-sm backdrop-blur-md"
              style={glassCardStyle}
            >
              {/* Branch Header (Branch Name) */}
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white tracking-tight">
                  {branch.branchName || branch.location}
                </h3>
              </div>

              {/* Halls List inside this Branch */}
              <div className="space-y-6 divide-y" style={borderDividerStyle}>
                {activeHalls.map((hall, hallIdx) => (
                  <div
                    key={hall.id}
                    className={`space-y-3.5 ${hallIdx > 0 ? "pt-5" : ""}`}
                  >
                    {/* Hall Sub-Header */}
                    {renderHallHeader(hall)}

                    {/* Time Slots Chips Container */}
                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                      {(hall.times || []).map((time) => {
                        const slotKey = `${hall.id}-${time}`;
                        const isSelected = selectedTimeSlot === slotKey;

                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => handleTimeClick(branch, hall, time)}
                            className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-extrabold border transition-all duration-150 cursor-pointer shadow-xs ${
                              isSelected
                                ? "bg-[#B90101] text-white border-[#B90101] scale-105 shadow-md"
                                : "hover:border-[#B90101] hover:text-[#B90101] hover:scale-105 active:scale-95"
                            }`}
                            style={{
                              backgroundColor: isSelected
                                ? "#B90101"
                                : isDark
                                  ? "var(--primary-color-30)"
                                  : "var(--primary-color-5)",
                              borderColor: isSelected
                                ? "#B90101"
                                : isDark
                                  ? "var(--border-dark-mode)"
                                  : "var(--border-light-mode)",
                              color: isSelected
                                ? "#FFFFFF"
                                : isDark
                                  ? "#FFFFFF"
                                  : "#171717",
                            }}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
