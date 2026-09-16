import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Clock, Plus, Minus, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import {
  selectSelectedSeats,
  selectBooking,
  updateConcessionQuantity,
  setSelectedSeats,
  setBookingConfirmation,
} from "../../redux/slices/bookingSlice";
import { selectTheme } from "../../redux/slices/uiSlice";
import { selectIsAuthenticated } from "../../redux/slices/authSlice";
import { useGetMovieDetailsQuery } from "../../services/api/movieApi";
import { useGetTVDetailsQuery } from "../../services/api/tvApi";
import BookingStepper from "../../components/booking/BookingStepper";
import PaymentModal from "../../components/booking/PaymentModal";
import { CONCESSIONS } from "../../data/concessionsData";
import { BRANCH_SHOWTIMES } from "../../data/cinemaShowtimeData";

export default function BookingDetailsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const theme = useSelector(selectTheme);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isDark = theme === "dark";

  // Glassmorphic tokens
  const glassCardStyle = {
    backgroundColor: isDark
      ? "var(--primary-color-30)"
      : "var(--primary-color-5)",
    borderColor: isDark
      ? "var(--border-dark-mode)"
      : "var(--border-light-mode)",
  };

  // URL & Redux State
  const movieId =
    searchParams.get("movie") || searchParams.get("movieId") || "558449";
  const hallType = (searchParams.get("hall") || "standard").toLowerCase();
  const time = searchParams.get("time") || "06:30 PM";
  const branch = searchParams.get("branch") || "Ciniverse SenSok";
  const date = searchParams.get("date") || "Sat, 6 Sep";

  const booking = useSelector(selectBooking);
  const reduxMovie = booking?.movie;
  const isTV =
    searchParams.get("mediaType") === "tv" ||
    Boolean(
      reduxMovie?.first_air_date || (reduxMovie?.name && !reduxMovie?.title),
    );

  const { data: movieData } = useGetMovieDetailsQuery(movieId, {
    skip: !movieId || isTV || Boolean(reduxMovie?.id),
  });
  const { data: tvData } = useGetTVDetailsQuery(movieId, {
    skip: !movieId || !isTV || Boolean(reduxMovie?.id),
  });

  const reduxSelectedSeats = useSelector(selectSelectedSeats);
  const seatsParam = searchParams.get("seats");

  // Read selected seats from Redux or parse from URL parameters
  const selectedSeats = useMemo(() => {
    if (reduxSelectedSeats && reduxSelectedSeats.length > 0) {
      return reduxSelectedSeats;
    }
    if (seatsParam) {
      const seatIds = seatsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const seatPrice = hallType.includes("gold") ? 10.0 : 5.0;
      return seatIds.map((id) => {
        const row = id.charAt(0);
        const num = parseInt(id.slice(1), 10) || 1;
        return {
          id,
          row,
          number: num,
          type: hallType.includes("gold") ? "gold" : "single",
          price: seatPrice,
        };
      });
    }
    return [
      { id: "A1", price: 5.0, row: "A", number: 1 },
      { id: "A2", price: 5.0, row: "A", number: 2 },
    ];
  }, [reduxSelectedSeats, seatsParam, hallType]);

  // Sync back to Redux if Redux was empty
  useEffect(() => {
    if (
      (!reduxSelectedSeats || reduxSelectedSeats.length === 0) &&
      selectedSeats.length > 0
    ) {
      dispatch(setSelectedSeats(selectedSeats));
    }
  }, [reduxSelectedSeats, selectedSeats, dispatch]);

  const concessions = booking.concessions || [];

  const movie = reduxMovie ||
    (isTV ? tvData : movieData || tvData) || {
      title: "Spider-Man: Brand New Day",
      poster_path: null,
    };

  // Dynamic screenType: from query params, or booking slice, or inferred from BRANCH_SHOWTIMES
  const resolvedScreenType = useMemo(() => {
    const fromParam =
      searchParams.get("screenType") || searchParams.get("format");
    if (fromParam) return fromParam;

    if (booking.showtime?.screenType) {
      return booking.showtime.screenType;
    }

    // Look up in BRANCH_SHOWTIMES
    const branchData = BRANCH_SHOWTIMES.find(
      (b) =>
        b.branchName.toLowerCase() === branch.toLowerCase() ||
        b.location.toLowerCase() === branch.toLowerCase(),
    );
    if (branchData) {
      for (const hall of branchData.halls) {
        if (hall.times.includes(time)) {
          return hall.screenType;
        }
      }
    }

    return hallType.includes("gold") ? "GOLD" : "2D";
  }, [searchParams, booking.showtime, branch, time, hallType]);

  const hallNumber = hallType.includes("gold") ? "Hall 4" : "Hall 3";
  const hallName = `${resolvedScreenType} ${hallNumber}`;

  // Seats Total
  const ticketsTotal = selectedSeats.reduce(
    (acc, s) => acc + (s.price || 4.0),
    0,
  );

  // Concessions Total
  const concessionsTotal = concessions.reduce(
    (acc, c) => acc + c.price * c.quantity,
    0,
  );

  // Combined Total
  const totalPaid = ticketsTotal + concessionsTotal;

  // 3-Minute Live Countdown Timer
  const [timeLeft, setTimeLeft] = useState(180);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pendingBookingRef, setPendingBookingRef] = useState(null);

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

  const handleAddConcession = (item) => {
    dispatch(updateConcessionQuantity({ item, delta: 1 }));
  };

  const handleRemoveConcession = (item) => {
    dispatch(updateConcessionQuantity({ item, delta: -1 }));
  };

  const handleContinue = () => {
    const bookingRef = pendingBookingRef || `FZ-${Math.floor(100000 + Math.random() * 900000)}`;
    setPendingBookingRef(bookingRef);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (paymentData) => {
    setIsPaymentModalOpen(false);
    const bookingRef = pendingBookingRef || `FZ-${Math.floor(100000 + Math.random() * 900000)}`;
    dispatch(setBookingConfirmation(bookingRef));
    const params = new URLSearchParams(searchParams);
    params.set("ref", bookingRef);
    params.set("screenType", resolvedScreenType);
    params.set("seats", selectedSeats.map((s) => s.id).join(","));
    params.set("payMethod", paymentData.paymentMethod || "KHQR");
    params.set("payStatus", paymentData.paymentStatus || "PAID");
    params.set("txnRef", paymentData.transactionRef || "");
    if (paymentData.currency) params.set("currency", paymentData.currency);
    if (concessions.length > 0) {
      params.set(
        "concessions",
        encodeURIComponent(JSON.stringify(concessions)),
      );
    }
    navigate(`/booking/confirmed?${params.toString()}`);
  };

  return (
    <div className="relative min-h-screen w-full pb-24 font-sans select-none overflow-x-hidden">
      {/* Deep Red Radial Glow Background for Dark Mode */}
      <div className="pointer-events-none absolute inset-0 -top-10 z-0 overflow-hidden">
        <div className="hidden dark:block absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[750px] bg-[radial-gradient(circle_at_center,rgba(185,1,1,0.22)_0%,rgba(8,2,3,0)_70%)]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 space-y-6 pt-2">
        {/* Top Navigation & Back Button */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:text-[#B90101] dark:hover:text-[#B90101] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        {/* 1. Stepper Bar (Active at Step 3: Booking Details) */}
        <BookingStepper currentStep={3} />

        {/* 2. Sub-header: "Food & Drinks" on left + Timer on far right under Confirmed */}
        <div className="flex items-center justify-between pt-1">
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            Food & Drinks
          </h2>

          {/* Timer Pill - aligned under Confirmed on far right */}
          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#B90101] text-[#B90101] font-bold text-xs sm:text-sm bg-[#B90101]/5 shadow-xs">
            <Clock className="w-4 h-4 text-[#B90101]" />
            <span className="tracking-wider">{formatTimer(timeLeft)}</span>
          </div>
        </div>

        {/* 3. Main Content: 2-Column Responsive Layout (Top Aligned) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Food & Drinks Section (7 Cols) */}
          <div className="lg:col-span-7">
            {/* Food & Drinks Grid Card */}
            <div
              className="w-full rounded-2xl sm:rounded-3xl border p-5 sm:p-7 shadow-sm backdrop-blur-md"
              style={glassCardStyle}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                {CONCESSIONS.map((item) => {
                  const existing = concessions.find((c) => c.id === item.id);
                  const qty = existing ? existing.quantity : 0;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col justify-between space-y-3 p-2 rounded-2xl transition hover:scale-[1.01]"
                    >
                      {/* Image */}
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-sm bg-neutral-200 dark:bg-neutral-800">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      {/* Info Row: Name & Price */}
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-extrabold text-sm sm:text-base text-neutral-900 dark:text-white">
                          {item.name}
                        </h3>
                        <span className="font-black text-sm sm:text-base text-neutral-900 dark:text-white">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>

                      {/* Description & Add/Quantity Row */}
                      <div className="flex items-end justify-between gap-2">
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 whitespace-pre-line leading-relaxed">
                          {item.description}
                        </p>

                        {/* + Add or Quantity Buttons */}
                        {qty === 0 ? (
                          <button
                            type="button"
                            onClick={() => handleAddConcession(item)}
                            className="px-4 py-1.5 rounded-full bg-[#B90101] hover:bg-[#9E0000] text-white font-extrabold text-xs tracking-wide uppercase transition active:scale-95 flex items-center gap-1 shrink-0 shadow-sm"
                          >
                            <Plus className="w-3 h-3 stroke-[3]" />
                            <span>Add</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 bg-[#B90101] text-white px-2.5 py-1 rounded-full text-xs font-black shadow-sm">
                            <button
                              type="button"
                              onClick={() => handleRemoveConcession(item)}
                              className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/20 active:scale-90 transition"
                            >
                              <Minus className="w-3 h-3 stroke-[3]" />
                            </button>
                            <span className="min-w-[16px] text-center font-black">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddConcession(item)}
                              className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/20 active:scale-90 transition"
                            >
                              <Plus className="w-3 h-3 stroke-[3]" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: Booking Detail Summary Card (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* 1. Summary Card */}
            <div
              className="w-full rounded-2xl sm:rounded-3xl border p-5 sm:p-6 shadow-sm backdrop-blur-md space-y-5"
              style={glassCardStyle}
            >
              {/* Movie Header */}
              <div className="flex items-center gap-4">
                <img
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
                      : "https://i.pinimg.com/736x/95/26/68/9526684fe11e38cf6bb6fbd48e37de6a.jpg"
                  }
                  alt={movie.title}
                  className="w-14 h-20 sm:w-16 sm:h-22 rounded-xl object-cover shadow-sm shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-extrabold text-base sm:text-lg text-neutral-900 dark:text-white leading-tight">
                    {movie.title}
                  </h3>
                  <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 mt-1">
                    {hallName}
                  </p>
                </div>
              </div>

              {/* Dashed Divider */}
              <div className="border-b border-dashed border-neutral-300 dark:border-white/20" />

              {/* Booking Details Grid */}
              <div className="space-y-3.5 text-xs sm:text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-bold text-neutral-400 dark:text-neutral-500 block text-xs">
                      Cinema
                    </span>
                    <strong className="font-black text-neutral-900 dark:text-white text-sm sm:text-base">
                      {branch}
                    </strong>
                  </div>
                  <div>
                    <span className="font-bold text-neutral-400 dark:text-neutral-500 block text-xs">
                      Hall
                    </span>
                    <strong className="font-black text-neutral-900 dark:text-white text-sm sm:text-base">
                      {hallType.includes("gold") ? "Hall 4" : "Hall 3"}
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-bold text-neutral-400 dark:text-neutral-500 block text-xs">
                      Date
                    </span>
                    <strong className="font-black text-neutral-900 dark:text-white text-sm sm:text-base">
                      {date}
                    </strong>
                  </div>
                  <div>
                    <span className="font-bold text-neutral-400 dark:text-neutral-500 block text-xs">
                      Time
                    </span>
                    <strong className="font-black text-neutral-900 dark:text-white text-sm sm:text-base">
                      {time}
                    </strong>
                  </div>
                </div>

                <div>
                  <span className="font-bold text-neutral-400 dark:text-neutral-500 block text-xs">
                    Seats
                  </span>
                  <strong className="font-black text-neutral-900 dark:text-white text-sm sm:text-base">
                    {selectedSeats.map((s) => s.id).join(", ")}
                  </strong>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-extrabold text-neutral-800 dark:text-neutral-200">
                    Tickets x{selectedSeats.length}
                  </span>
                  <span className="font-black text-base text-neutral-900 dark:text-white">
                    ${ticketsTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Dashed Divider */}
              <div className="border-b border-dashed border-neutral-300 dark:border-white/20" />

              {/* Food & Drinks Line Items */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs sm:text-sm text-[#B90101] uppercase tracking-wider">
                  Food & Drinks
                </h4>
                {concessions.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic">
                    No food & drinks added yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {concessions.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200"
                      >
                        <span>
                          {c.name} x{c.quantity}
                        </span>
                        <span className="font-black text-neutral-900 dark:text-white">
                          ${(c.price * c.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 2. Total Paid Card */}
            <div
              className="w-full rounded-2xl sm:rounded-3xl border px-6 py-4 flex items-center justify-between shadow-sm backdrop-blur-md"
              style={glassCardStyle}
            >
              <span className="text-base sm:text-lg font-bold text-[#B90101]">
                Total paid
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#B90101]">
                ${totalPaid.toFixed(2)}
              </span>
            </div>

            {/* 3. Action Buttons: Back & Continue */}
            <div className="flex items-center gap-4 pt-1">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-3 px-6 rounded-full bg-[#B90101] hover:bg-[#9E0000] text-white font-extrabold text-sm uppercase tracking-wider transition active:scale-95 text-center shadow-md border border-white/20"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleContinue}
                className="flex-1 py-3 px-6 rounded-full bg-[#B90101] hover:bg-[#9E0000] text-white font-extrabold text-sm uppercase tracking-wider transition active:scale-95 text-center shadow-md border border-white/20"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KHQR & ABA PayWay Checkout Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmountUSD={totalPaid}
        bookingRef={pendingBookingRef || `FZ-${Math.floor(100000 + Math.random() * 900000)}`}
        movieTitle={movie?.title || movie?.name || "Movie Ticket"}
        branchName={branch}
        selectedSeats={selectedSeats.map((s) => s.id)}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
