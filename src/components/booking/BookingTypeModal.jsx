import { useEffect } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * BookingTypeModal
 * "How are you watching today?" Modal
 * Gives the user the choice between Standard Booking and Group Booking
 */
export default function BookingTypeModal({
  isOpen,
  onClose,
  session, // { movieId, movieTitle, branchName, date, time, screenType }
  onSelectBookingType,
}) {
  const navigate = useNavigate();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBookingChoice = (bookingType) => {
    if (onSelectBookingType) {
      onSelectBookingType(bookingType, session);
    }
    onClose();
    if (session?.movieId) {
      const isGold = Boolean(
        session.goldClass ||
        (session.hall && session.hall.toLowerCase().includes("gold")),
      );
      const hallParam = isGold ? "gold" : "standard";
      const screenType = session.screenType || (isGold ? "GOLD" : "2D");
      const params = new URLSearchParams({
        movie: session.movieId,
        hall: hallParam,
        screenType,
        type: bookingType,
        time: session.time || "",
        branch: session.branchName || "",
        date: session.date || "",
      });
      navigate(`/booking/seats?${params.toString()}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn select-none font-sans">
      {/* Modal Card */}
      <div
        className="relative w-full max-w-md rounded-3xl border border-[var(--border-light-mode)] bg-[var(--primary-color-5)] dark:bg-[var(--primary-color-30)] dark:border-[var(--border-dark-mode)] p-6 sm:p-8 shadow-2xl transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Red Close Button (Top Right) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#B90101] hover:scale-110 active:scale-95 transition p-1"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Content */}
        <div className="space-y-6 pt-2 text-center">
          <div className="space-y-1.5">
            <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
              How are you watching today?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium">
              Select your booking type to get the best seating options
            </p>
          </div>

          {/* Action Buttons: Standard Booking & Group Booking */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {/* Standard Booking Button */}
            <button
              type="button"
              onClick={() => handleBookingChoice("standard")}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full text-white font-bold text-sm tracking-wide shadow-md hover:brightness-110 active:scale-95 transition"
              style={{ backgroundColor: "#B90101" }}
            >
              Standard Booking
            </button>

            {/* Group Booking Button */}
            <button
              type="button"
              onClick={() => handleBookingChoice("group")}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full text-white font-bold text-sm tracking-wide shadow-md hover:brightness-110 active:scale-95 transition"
              style={{ backgroundColor: "#B90101" }}
            >
              Group Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
