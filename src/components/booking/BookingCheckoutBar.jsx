import { ChevronRight } from "lucide-react";
import { useSelector } from "react-redux";
import { selectTheme } from "../../redux/slices/uiSlice";

export default function BookingCheckoutBar({
  selectedSeats = [],
  totalPrice = 0,
  isGroupDiscount = false,
  isGroupMode = false,
  onProceed,
}) {
  const theme = useSelector(selectTheme);
  const isDark = theme === "dark";

  if (selectedSeats.length === 0) return null;

  const count = selectedSeats.length;
  const label = count === 1 ? "1 SEAT" : `${count} SEATS`;
  const seatList = selectedSeats.map((s) => s.id).join(", ");

  return (
    <div
      className="fixed bottom-6 left-4 right-4 max-w-2xl mx-auto z-40 rounded-full border px-6 sm:px-8 py-3.5 shadow-2xl flex items-center justify-between backdrop-blur-md animate-slideUp select-none"
      style={{
        backgroundColor: isDark
          ? "var(--primary-color-30)"
          : "var(--primary-color-5)",
        borderColor: isDark
          ? "var(--border-dark-mode)"
          : "var(--border-light-mode)",
      }}
    >
      {/* Left: Seat list and Total (User's own chosen seats) */}
      <div className="space-y-0.5 min-w-0 pr-3">
        <div className="text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200 truncate">
          {isGroupMode && (
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#B90101] mr-1.5">
              [GROUP]
            </span>
          )}
          <span>{label}: </span>
          <span className="text-[#B90101] font-extrabold">{seatList}</span>
        </div>
        <p className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-300">
          Total:{" "}
          <strong className="font-black text-neutral-900 dark:text-white">
            ${totalPrice.toFixed(2)}
          </strong>
          {isGroupDiscount && (
            <span className="ml-2 text-[11px] font-bold text-emerald-500">
              (10% Off Group)
            </span>
          )}
        </p>
      </div>

      {/* Right: Red Booking Details Button */}
      <button
        type="button"
        onClick={onProceed}
        className="px-5 sm:px-7 py-2.5 rounded-full bg-[#B90101] hover:bg-[#9E0000] text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md active:scale-95 flex items-center gap-1.5 shrink-0 border border-white/20 cursor-pointer"
      >
        <span>BOOKING DETAILS</span>
        <ChevronRight className="w-4 h-4 stroke-[3]" />
      </button>
    </div>
  );
}
