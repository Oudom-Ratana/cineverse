import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Clock, ArrowLeft, User, Users } from "lucide-react";
import { toast } from "react-toastify";
import {
  toggleSeat,
  clearSeats,
  selectSelectedSeats,
  setShowtime,
  setMovie,
  selectBooking,
} from "../../redux/slices/bookingSlice";
import { selectTheme } from "../../redux/slices/uiSlice";
import { selectIsAuthenticated } from "../../redux/slices/authSlice";
import { useGetMovieDetailsQuery } from "../../services/api/movieApi";
import { useGetTVDetailsQuery } from "../../services/api/tvApi";

// Modular Subcomponents & Data
import BookingStepper from "../../components/booking/BookingStepper";
import ScreenCurve from "../../components/booking/ScreenCurve";
import SeatLegend from "../../components/booking/SeatLegend";
import SeatPricingCards from "../../components/booking/SeatPricingCards";
import BookingCheckoutBar from "../../components/booking/BookingCheckoutBar";
import GoldClassSeatMap from "../../components/booking/GoldClassSeatMap";
import StandardHallSeatMap from "../../components/booking/StandardHallSeatMap";
import GroupBookingLinkModal from "../../components/booking/GroupBookingLinkModal";
import GroupSeatLegend from "../../components/booking/GroupSeatLegend";
import {
  GOLD_PRICE,
  STANDARD_SINGLE_PRICE,
  STANDARD_COUPLE_PRICE,
  getReservedSeatsForShowtime,
  getCouplePair,
} from "../../data/seatLayoutData";

export default function SeatSelectionPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Query Parameters
  const movieId =
    searchParams.get("movie") || searchParams.get("movieId") || "558449";
  const time = searchParams.get("time") || "03:00 PM";
  const branch = searchParams.get("branch") || "Ciniverse SenSok";
  const date = searchParams.get("date") || "Aug 26 Tue";

  // Hall Mode: 'gold' vs 'standard'
  const hallParam = searchParams.get("hall") || "standard";
  const hallType = hallParam.toLowerCase().includes("gold")
    ? "gold"
    : "standard";

  // Booking Mode: 'standard' vs 'group'
  const bookingType =
    (searchParams.get("type") || "standard").toLowerCase() === "group"
      ? "group"
      : "standard";

  // Dynamic Screen Type (e.g., '2D', 'SCREEN X', 'GOLD', '3D')
  const rawScreenType =
    searchParams.get("screenType") || searchParams.get("format");
  const screenType = rawScreenType || (hallType === "gold" ? "GOLD" : "2D");

  // Check if title is a TV series or if Redux already contains the movie/show
  const booking = useSelector(selectBooking);
  const reduxMovie = booking?.movie;
  const mediaTypeParam = searchParams.get("mediaType");
  const isTV =
    mediaTypeParam === "tv" ||
    Boolean(
      reduxMovie?.first_air_date || (reduxMovie?.name && !reduxMovie?.title),
    );

  // Fetch movie or TV details if not already present in Redux
  const { data: movieData } = useGetMovieDetailsQuery(movieId, {
    skip: !movieId || isTV || Boolean(reduxMovie?.id),
  });
  const { data: tvData } = useGetTVDetailsQuery(movieId, {
    skip: !movieId || !isTV || Boolean(reduxMovie?.id),
  });

  const movie = reduxMovie || (isTV ? tvData : movieData || tvData);

  // Redux Selected Seats & Theme
  const selectedSeats = useSelector(selectSelectedSeats);
  const theme = useSelector(selectTheme);
  const isDark = theme === "dark";
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  // 3-Minute Countdown Timer
  const [timeLeft, setTimeLeft] = useState(180);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Clear selected seats whenever showtime or hall changes
  useEffect(() => {
    dispatch(clearSeats());
    // In group booking mode, preselect C3 for the user so they see their seat with avatar immediately
    if (bookingType === "group") {
      dispatch(
        toggleSeat({
          id: "C3",
          row: "C",
          number: 3,
          type: "single",
          price: STANDARD_SINGLE_PRICE,
        }),
      );
    }
  }, [movieId, time, date, hallType, bookingType, dispatch]);

  // Dynamic showtime-specific reserved seats
  const reservedSeatsSet = useMemo(() => {
    return getReservedSeatsForShowtime(hallType, movieId, date, time);
  }, [hallType, movieId, date, time]);

  const isSeatSelected = (seatId) => selectedSeats.some((s) => s.id === seatId);
  const isSeatReserved = (seatId) => reservedSeatsSet.has(seatId);

  // Group seat avatars: shows live presence members on the map
  // Friends took F6 & B8; You took your selected seats (default C3)
  const groupSeatAvatars = useMemo(() => {
    if (bookingType !== "group") return {};

    const map = {
      F6: {
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        color: "#3B82F6",
        name: "Capibarra",
        initials: "C",
        isLocked: true,
      },
      B8: {
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        color: "#10B981",
        name: "Kapoy",
        initials: "K",
        isLocked: true,
      },
    };

    // Current user's selected seats get the gold ring avatar
    selectedSeats.forEach((seat) => {
      map[seat.id] = {
        avatar:
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
        color: "#FFD700",
        name: "You",
        initials: "U",
        isLocked: false,
      };
    });

    return map;
  }, [bookingType, selectedSeats]);

  // Switch Booking Type (Standard vs Group)
  const handleBookingTypeChange = (newType) => {
    if (newType === "group") {
      setIsGroupModalOpen(true);
    }
    if (newType === bookingType) return;
    const params = new URLSearchParams(searchParams);
    params.set("type", newType);
    params.set("screenType", screenType);
    navigate(`/booking/seats?${params.toString()}`, { replace: true });
  };

  // Interactive Click Handler
  const handleSeatClick = (row, colNumber, isCouple = false) => {
    const seatId = `${row}${colNumber}`;

    // Friends' seats in group mode cannot be selected/deselected by you
    if (bookingType === "group" && (seatId === "F6" || seatId === "B8")) {
      return;
    }

    if (isCouple) {
      const pair = getCouplePair(colNumber);
      if (!pair) return;
      const [col1, col2] = pair;
      const seatId1 = `${row}${col1}`;
      const seatId2 = `${row}${col2}`;

      // If either seat in the pair is reserved, cannot select
      if (isSeatReserved(seatId1) || isSeatReserved(seatId2)) return;

      const is1Selected = isSeatSelected(seatId1);
      const is2Selected = isSeatSelected(seatId2);
      const bothSelected = is1Selected && is2Selected;

      const seat1Obj = {
        id: seatId1,
        row,
        number: col1,
        type: "couple",
        price: STANDARD_COUPLE_PRICE / 2,
      };
      const seat2Obj = {
        id: seatId2,
        row,
        number: col2,
        type: "couple",
        price: STANDARD_COUPLE_PRICE / 2,
      };

      if (bothSelected) {
        // Deselect both
        dispatch(toggleSeat(seat1Obj));
        dispatch(toggleSeat(seat2Obj));
      } else {
        // Select both seats together
        if (!is1Selected) dispatch(toggleSeat(seat1Obj));
        if (!is2Selected) dispatch(toggleSeat(seat2Obj));
      }
      return;
    }

    // Normal single seat toggle
    if (isSeatReserved(seatId)) return;

    const seatPrice = hallType === "gold" ? GOLD_PRICE : STANDARD_SINGLE_PRICE;

    dispatch(
      toggleSeat({
        id: seatId,
        row,
        number: colNumber,
        type: hallType === "gold" ? "gold" : "single",
        price: seatPrice,
      }),
    );
  };

  // Each user chooses their own seat and pays for their own seat!
  const isGroupDiscount = bookingType === "group" && selectedSeats.length >= 4;
  const rawTotalPrice = useMemo(() => {
    return selectedSeats.reduce((acc, seat) => acc + (seat.price || 0), 0);
  }, [selectedSeats]);
  const totalPrice = isGroupDiscount ? rawTotalPrice * 0.9 : rawTotalPrice;

  // Proceed to Booking Details (only user's own seats are checked out and paid for)
  const handleProceed = () => {
    if (selectedSeats.length === 0) return;
    if (movie) {
      dispatch(setMovie(movie));
    }
    dispatch(
      setShowtime({
        time,
        branch,
        date,
        screenType,
        hall:
          hallType === "gold"
            ? "Hall 4 - Gold Class VIP"
            : `Hall 3 - ${screenType}`,
        hallType,
        bookingType,
      }),
    );
    const params = new URLSearchParams(searchParams);
    params.set("type", bookingType);
    params.set("hall", hallType);
    params.set("screenType", screenType);
    params.set("mediaType", isTV ? "tv" : "movie");
    params.set("seats", selectedSeats.map((s) => s.id).join(","));
    navigate(`/booking/details?${params.toString()}`);
  };

  return (
    <div className="relative min-h-screen w-full pb-28 font-sans select-none overflow-x-hidden">
      {/* Deep Red Radial Glow Background for Dark Mode */}
      <div className="pointer-events-none absolute inset-0 -top-10 z-0 overflow-hidden">
        <div className="hidden dark:block absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[750px] bg-[radial-gradient(circle_at_center,rgba(185,1,1,0.22)_0%,rgba(8,2,3,0)_70%)]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 space-y-8 pt-2">
        {/* Top Navigation */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:text-[#B90101] dark:hover:text-[#B90101] transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        {/* 1. Top 4-Step Stepper */}
        <BookingStepper currentStep={2} />

        {/* 2. Sub-header: "Select Seat(s)" + Live Countdown Timer */}
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-0.5">
            <h1 className="text-base sm:text-lg font-black text-[#B90101] tracking-tight">
              Select Seat(s)
            </h1>
            {(movie?.title || movie?.name) && (
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                {movie.title || movie.name} • {branch} • {time}
              </p>
            )}
          </div>

          {/* Timer Pill */}
          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#B90101] text-[#B90101] font-bold text-xs sm:text-sm bg-[#B90101]/5 shadow-xs">
            <Clock className="w-4 h-4 text-[#B90101]" />
            <span className="tracking-wider">{formatTimer(timeLeft)}</span>
          </div>
        </div>

        {/* Booking Type Switcher Bar (Standard Booking vs Group Booking) */}
        <div className="flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200/80 dark:border-white/10 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-neutral-600 dark:text-neutral-400">
              Booking Type:
            </span>
          </div>

          <div className="inline-flex p-1 rounded-full bg-neutral-200/80 dark:bg-neutral-900 border border-neutral-300 dark:border-white/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => handleBookingTypeChange("standard")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                bookingType === "standard"
                  ? "bg-[#B90101] text-white shadow-sm"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Standard Booking</span>
            </button>
            <button
              type="button"
              onClick={() => handleBookingTypeChange("group")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                bookingType === "group"
                  ? "bg-[#B90101] text-white shadow-sm"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Group Booking</span>
            </button>
          </div>
        </div>

        {/* 3. Curved "Screen" Arc */}
        <ScreenCurve />

        {/* 4. Main Seating Pod */}
        <div
          className="w-full rounded-2xl sm:rounded-3xl border p-6 sm:p-10 shadow-sm overflow-x-auto backdrop-blur-md"
          style={{
            backgroundColor: isDark
              ? "var(--primary-color-30)"
              : "var(--primary-color-5)",
            borderColor: isDark
              ? "var(--border-dark-mode)"
              : "var(--border-light-mode)",
          }}
        >
          {hallType === "gold" ? (
            <GoldClassSeatMap
              isSeatReserved={isSeatReserved}
              isSeatSelected={isSeatSelected}
              onSeatClick={handleSeatClick}
              groupSeatAvatars={groupSeatAvatars}
            />
          ) : (
            <StandardHallSeatMap
              isSeatReserved={isSeatReserved}
              isSeatSelected={isSeatSelected}
              onSeatClick={handleSeatClick}
              groupSeatAvatars={groupSeatAvatars}
            />
          )}
        </div>

        {/* 5. Pricing Cards (Always shown in both Standard and Group Booking modes) */}
        <SeatPricingCards hallType={hallType} />

        {/* 6. Legend: Standard or Group Legend with Live Presence */}
        {bookingType === "group" ? (
          <GroupSeatLegend mySeats={selectedSeats.map((s) => s.id)} />
        ) : (
          <SeatLegend />
        )}

        {/* 7. Floating Checkout Bar (Charges only for current user's chosen seats) */}
        <BookingCheckoutBar
          selectedSeats={selectedSeats}
          totalPrice={totalPrice}
          isGroupDiscount={isGroupDiscount}
          isGroupMode={bookingType === "group"}
          onProceed={handleProceed}
        />

        {/* 8. Group Booking Link Modal Popup */}
        <GroupBookingLinkModal
          isOpen={isGroupModalOpen}
          onClose={() => setIsGroupModalOpen(false)}
          onContinue={() => setIsGroupModalOpen(false)}
          groupCode="ABCD1234"
        />
      </div>
    </div>
  );
}
