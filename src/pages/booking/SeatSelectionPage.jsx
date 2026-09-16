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
import {
  selectIsAuthenticated,
  selectCurrentUser,
} from "../../redux/slices/authSlice";
import { useAuth } from "../../context/AuthContext";
import {
  createGroupSession,
  listenGroupSession,
  joinGroupSession,
  toggleGroupMemberSeat,
} from "../../services/firestoreService";
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
import { findCatalogMovie } from "../../utils/movieCatalogService";

export default function SeatSelectionPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Query Parameters
  const movieId =
    searchParams.get("movie") || searchParams.get("movieId") || "969681";
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

  // Check if Redux already contains the movie/show AND matches current movieId
  const booking = useSelector(selectBooking);
  const reduxMovie = booking?.movie;
  const isReduxMatching =
    reduxMovie &&
    (String(reduxMovie.id) === String(movieId) ||
      String(reduxMovie.tmdbId) === String(movieId));

  const catalogMovie = useMemo(() => findCatalogMovie(movieId), [movieId]);

  const mediaTypeParam = searchParams.get("mediaType");
  const isTV =
    mediaTypeParam === "tv" ||
    Boolean(catalogMovie?.isTv || catalogMovie?.media_type === "tv") ||
    Boolean(
      isReduxMatching &&
      (reduxMovie?.first_air_date || (reduxMovie?.name && !reduxMovie?.title)),
    );

  // Fetch movie or TV details if not present in catalog
  const queryId = catalogMovie?.tmdbId || movieId;
  const { data: movieData } = useGetMovieDetailsQuery(queryId, {
    skip: !queryId || isTV || Boolean(catalogMovie) || isReduxMatching,
  });
  const { data: tvData } = useGetTVDetailsQuery(queryId, {
    skip: !queryId || !isTV || Boolean(catalogMovie) || isReduxMatching,
  });

  const movie = useMemo(() => {
    if (isReduxMatching) return reduxMovie;
    if (catalogMovie) return catalogMovie;
    return (isTV ? tvData : movieData || tvData) || null;
  }, [isReduxMatching, reduxMovie, catalogMovie, isTV, tvData, movieData]);

  // Keep Redux in sync with the current URL movie
  useEffect(() => {
    if (movie && (!reduxMovie || String(reduxMovie.id) !== String(movie.id))) {
      dispatch(setMovie(movie));
    }
  }, [movie, reduxMovie, dispatch]);

  // Redux Selected Seats & Theme
  const selectedSeats = useSelector(selectSelectedSeats);
  const theme = useSelector(selectTheme);
  const isDark = theme === "dark";
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const reduxUser = useSelector(selectCurrentUser);
  const { user: authUser } = useAuth();
  const user = reduxUser || authUser;

  // Real user profile info
  const currentUserId = String(user?.uid || user?.id || "host_guest");
  const currentUserName =
    user?.name || user?.displayName || user?.email?.split("@")[0] || "You";
  const currentUserAvatar = user?.avatar || user?.photoURL || null;
  const currentUserInitials = (currentUserName || "U")
    .slice(0, 2)
    .toUpperCase();

  const location = useLocation();

  // 3-Minute Countdown Timer
  const [timeLeft, setTimeLeft] = useState(180);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  // Group Session State & Real-time Firestore Sync
  const urlGroupId = searchParams.get("groupId");
  const [groupId, setGroupId] = useState(urlGroupId || "");
  const [groupSessionData, setGroupSessionData] = useState(null);

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

  // Group session initializer & listener
  useEffect(() => {
    if (bookingType !== "group") return;

    let activeGroupId = urlGroupId || groupId;
    if (!activeGroupId) {
      activeGroupId = `GRP-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      setGroupId(activeGroupId);
      const params = new URLSearchParams(searchParams);
      params.set("groupId", activeGroupId);
      navigate(`/booking/seats?${params.toString()}`, { replace: true });
    }

    createGroupSession({
      groupId: activeGroupId,
      movieId,
      movieTitle: movie?.title || movie?.name || "Movie",
      date,
      time,
      hall: hallType,
      screenType,
      leaderId: currentUserId,
      leaderName: currentUserName,
      leaderAvatar: currentUserAvatar,
    }).catch(() => {});

    joinGroupSession(activeGroupId, {
      uid: currentUserId,
      name: currentUserName,
      avatar: currentUserAvatar,
      color: "#FFD700",
    }).catch(() => {});

    const unsub = listenGroupSession(activeGroupId, (data) => {
      if (data) {
        setGroupSessionData(data);
      }
    });

    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [
    bookingType,
    urlGroupId,
    groupId,
    movieId,
    movie?.title,
    movie?.name,
    date,
    time,
    hallType,
    screenType,
    currentUserId,
    currentUserName,
    currentUserAvatar,
  ]);

  // Clear selected seats whenever showtime or hall changes
  useEffect(() => {
    dispatch(clearSeats());
  }, [movieId, time, date, hallType, bookingType, dispatch]);

  // Dynamic showtime-specific reserved seats
  const reservedSeatsSet = useMemo(() => {
    return getReservedSeatsForShowtime(hallType, movieId, date, time);
  }, [hallType, movieId, date, time]);

  const isSeatSelected = (seatId) => selectedSeats.some((s) => s.id === seatId);
  const isSeatReserved = (seatId) => reservedSeatsSet.has(seatId);

  // Group seat avatars: shows live presence members on the map
  const groupSeatAvatars = useMemo(() => {
    if (bookingType !== "group") return {};

    const map = {};

    // 1. Friends' seats from Firestore session
    const remoteSeats = groupSessionData?.selectedSeats || {};
    Object.entries(remoteSeats).forEach(([seatId, sData]) => {
      if (String(sData?.uid) !== currentUserId) {
        map[seatId] = {
          avatar: sData.avatar || null,
          color: sData.color || "#3B82F6",
          name: sData.name || "Friend",
          initials: (sData.name || "F").slice(0, 2).toUpperCase(),
          isLocked: true, // Cannot be selected by current user
        };
      }
    });

    // 2. Current user's selected seats (Gold border, real user avatar)
    selectedSeats.forEach((seat) => {
      map[seat.id] = {
        avatar: currentUserAvatar,
        color: "#FFD700",
        name: currentUserName,
        initials: currentUserInitials,
        isLocked: false,
      };
    });

    return map;
  }, [
    bookingType,
    groupSessionData?.selectedSeats,
    currentUserId,
    currentUserAvatar,
    currentUserName,
    currentUserInitials,
    selectedSeats,
  ]);

  // Switch Booking Type (Standard vs Group)
  const handleBookingTypeChange = (newType) => {
    const params = new URLSearchParams(searchParams);
    params.set("type", newType);
    params.set("screenType", screenType);
    if (newType === "group") {
      const activeGId =
        urlGroupId ||
        groupId ||
        `GRP-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      setGroupId(activeGId);
      params.set("groupId", activeGId);
      setIsGroupModalOpen(true);
    }
    navigate(`/booking/seats?${params.toString()}`, { replace: true });
  };

  // Interactive Click Handler
  const handleSeatClick = (row, colNumber, isCouple = false) => {
    const seatId = `${row}${colNumber}`;

    // Friends' seats in group mode cannot be selected/deselected by you
    if (bookingType === "group" && groupSeatAvatars[seatId]?.isLocked) {
      toast.info(
        `Seat ${seatId} is already selected by ${groupSeatAvatars[seatId].name}`,
      );
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
        const activeGroupId = urlGroupId || groupId;
        if (bookingType === "group" && activeGroupId) {
          toggleGroupMemberSeat(
            activeGroupId,
            seatId1,
            { uid: currentUserId },
            false,
          ).catch(() => {});
          toggleGroupMemberSeat(
            activeGroupId,
            seatId2,
            { uid: currentUserId },
            false,
          ).catch(() => {});
        }
      } else {
        // Select both seats together
        if (!is1Selected) dispatch(toggleSeat(seat1Obj));
        if (!is2Selected) dispatch(toggleSeat(seat2Obj));
        const activeGroupId = urlGroupId || groupId;
        if (bookingType === "group" && activeGroupId) {
          toggleGroupMemberSeat(
            activeGroupId,
            seatId1,
            {
              uid: currentUserId,
              name: currentUserName,
              avatar: currentUserAvatar,
              color: "#FFD700",
            },
            true,
          ).catch(() => {});
          toggleGroupMemberSeat(
            activeGroupId,
            seatId2,
            {
              uid: currentUserId,
              name: currentUserName,
              avatar: currentUserAvatar,
              color: "#FFD700",
            },
            true,
          ).catch(() => {});
        }
      }
      return;
    }

    // Normal single seat toggle
    if (isSeatReserved(seatId)) return;

    const seatPrice = hallType === "gold" ? GOLD_PRICE : STANDARD_SINGLE_PRICE;
    const isSelecting = !isSeatSelected(seatId);

    dispatch(
      toggleSeat({
        id: seatId,
        row,
        number: colNumber,
        type: hallType === "gold" ? "gold" : "single",
        price: seatPrice,
      }),
    );

    const activeGroupId = urlGroupId || groupId;
    if (bookingType === "group" && activeGroupId) {
      toggleGroupMemberSeat(
        activeGroupId,
        seatId,
        {
          uid: currentUserId,
          name: currentUserName,
          avatar: currentUserAvatar,
          color: "#FFD700",
        },
        isSelecting,
      ).catch(() => {});
    }
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
          <GroupSeatLegend
            mySeats={selectedSeats.map((s) => s.id)}
            members={
              groupSessionData?.members && groupSessionData.members.length > 0
                ? groupSessionData.members
                : [
                    {
                      uid: currentUserId,
                      name: currentUserName,
                      avatar: currentUserAvatar,
                      color: "#FFD700",
                    },
                  ]
            }
            selectedSeatsMap={groupSessionData?.selectedSeats || {}}
            onInviteClick={() => setIsGroupModalOpen(true)}
          />
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
          groupCode={urlGroupId || groupId || "GRP-ROOM"}
          movieId={movieId}
          date={date}
          time={time}
          hall={hallType}
          screenType={screenType}
        />
      </div>
    </div>
  );
}
