import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectTheme } from "../../redux/slices/uiSlice";

export default function TicketCard({ ticket }) {
  const navigate = useNavigate();
  const theme = useSelector(selectTheme);
  const isDark = theme === "dark";

  const {
    movie = {},
    showtime = {},
    seats = [],
    pricePerSeat = 5.0,
    totalSeats = (ticket.seats || []).length || 1,
    totalPrice = 5.0,
    status = "upcoming",
  } = ticket;

  const normalizedStatus = (status || "upcoming").toLowerCase();
  const isUpcoming =
    normalizedStatus === "upcoming" ||
    normalizedStatus === "confirmed" ||
    normalizedStatus === "active" ||
    normalizedStatus !== "history";

  const handleViewTicket = () => {
    if (ticket.viewUrl) {
      navigate(ticket.viewUrl);
    } else {
      const params = new URLSearchParams({
        movie: ticket.movieId || "558449",
        ref: ticket.id || ticket.bookingId || "TKT-001",
        time: showtime?.time || "6:30 PM",
        date: showtime?.date || "26 Aug 2026",
        branch: showtime?.location || "Ciniverse SenSok",
        hall: (showtime?.format || "").toLowerCase().includes("gold")
          ? "gold"
          : "standard",
        seats: (seats || []).join(","),
      });
      navigate(`/booking/confirmed?${params.toString()}`);
    }
  };

  return (
    <div
      className={`flex gap-4 sm:gap-5 rounded-2xl p-4 sm:p-5 border transition-shadow duration-200 hover:shadow-md ${
        isDark ? "bg-white/5 border-white/10" : "bg-white border-neutral-200"
      }`}
    >
      {/* Left: Movie Poster */}
      <div className="shrink-0 w-[110px] sm:w-[145px] rounded-xl overflow-hidden aspect-[3/4] bg-neutral-900">
        <img
          src={
            movie?.poster ||
            "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80"
          }
          alt={movie?.title || "Movie Ticket"}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80";
          }}
        />
      </div>

      {/* Right: Ticket Details */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        {/* Title Row + Status Badge */}
        <div className="flex items-start justify-between gap-2">
          <h3
            className={`font-black text-lg sm:text-xl leading-tight ${
              isDark ? "text-white" : "text-neutral-900"
            }`}
          >
            {movie?.title || "Movie Ticket"}
          </h3>

          {/* Status Badge */}
          {isUpcoming ? (
            <span
              className="shrink-0 text-[13px] font-bold whitespace-nowrap"
              style={{ color: "#EAB308" }}
            >
              • Upcoming
            </span>
          ) : (
            <span className="shrink-0 text-[13px] font-black uppercase tracking-wide text-[#B90101] whitespace-nowrap">
              Completed
            </span>
          )}
        </div>

        {/* Subtitle: Duration • Date • Time */}
        <p
          className="text-[13px] sm:text-[14px] font-semibold"
          style={{ color: "#B90101" }}
        >
          {movie?.duration || "2h 15m"} &bull; {showtime?.date || "Today"}{" "}
          &bull; {showtime?.time || "Now"}
        </p>

        {/* Genre Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {(Array.isArray(movie?.genres)
            ? movie.genres
            : typeof movie?.genres === "string"
              ? movie.genres.split(",").map((g) => g.trim())
              : ["Action", "Adventure"]
          ).map((genre) => (
            <span
              key={genre}
              className="px-3 py-0.5 rounded-full text-white text-[11px] font-black uppercase tracking-wider"
              style={{ backgroundColor: "#B90101" }}
            >
              {genre}
            </span>
          ))}
        </div>

        {/* Details Grid & Action: 2 Rows × 3 Balanced Columns */}
        <div className="flex items-end justify-between gap-4 mt-2">
          <div className="grid grid-cols-3 gap-x-6 sm:gap-x-8 gap-y-3 flex-1">
            {/* Column 1: FORMAT & SEAT */}
            <div>
              <p
                className={`text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider ${isDark ? "text-neutral-500" : "text-neutral-400"}`}
              >
                FORMAT
              </p>
              <p
                className={`text-[14px] sm:text-[15px] font-black mt-0.5 ${isDark ? "text-white" : "text-neutral-900"}`}
              >
                {showtime?.format || "2D"}
              </p>
            </div>

            {/* Column 2: HALL & PRICE/SEAT */}
            <div>
              <p
                className={`text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider ${isDark ? "text-neutral-500" : "text-neutral-400"}`}
              >
                HALL
              </p>
              <p
                className={`text-[14px] sm:text-[15px] font-black mt-0.5 ${isDark ? "text-white" : "text-neutral-900"}`}
              >
                {showtime?.hall || "Hall 3"}
              </p>
            </div>

            {/* Column 3: LOCATION & TOTAL */}
            <div>
              <p
                className={`text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider ${isDark ? "text-neutral-500" : "text-neutral-400"}`}
              >
                LOCATION
              </p>
              <p
                className={`text-[14px] sm:text-[15px] font-black mt-0.5 ${isDark ? "text-white" : "text-neutral-900"}`}
              >
                {showtime?.location || "Ciniverse SenSok"}
              </p>
            </div>

            {/* Row 2 - Column 1: SEAT */}
            <div>
              <p
                className={`text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider ${isDark ? "text-neutral-500" : "text-neutral-400"}`}
              >
                SEAT
              </p>
              <p
                className={`text-[14px] sm:text-[15px] font-black mt-0.5 ${isDark ? "text-white" : "text-neutral-900"}`}
              >
                {(Array.isArray(seats) ? seats : [seats]).join(", ") || "H10"}
              </p>
            </div>

            {/* Row 2 - Column 2: PRICE/SEAT */}
            <div>
              <p
                className={`text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider ${isDark ? "text-neutral-500" : "text-neutral-400"}`}
              >
                PRICE/SEAT
              </p>
              <p
                className={`text-[14px] sm:text-[15px] font-black mt-0.5 ${isDark ? "text-white" : "text-neutral-900"}`}
              >
                ${pricePerSeat.toFixed(2)}
              </p>
            </div>

            {/* Row 2 - Column 3: TOTAL */}
            <div>
              <p
                className={`text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider ${isDark ? "text-neutral-500" : "text-neutral-400"}`}
              >
                TOTAL ({totalSeats} {totalSeats === 1 ? "SEAT" : "SEATS"})
              </p>
              <p
                className={`text-[14px] sm:text-[15px] font-black mt-0.5 ${isDark ? "text-white" : "text-neutral-900"}`}
              >
                ${totalPrice.toFixed(2)}
              </p>
            </div>
          </div>

          {/* View Ticket Button — aligned on the right */}
          {isUpcoming && (
            <button
              type="button"
              onClick={handleViewTicket}
              className="shrink-0 pb-0.5 text-[14px] font-black text-[#B90101] hover:opacity-80 active:scale-95 transition cursor-pointer"
            >
              View Ticket
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
