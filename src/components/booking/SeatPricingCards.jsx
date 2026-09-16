import { useSelector } from "react-redux";
import { selectTheme } from "../../redux/slices/uiSlice";
import SeatIcon from "./SeatIcon";
import {
  GOLD_PRICE,
  STANDARD_SINGLE_PRICE,
  STANDARD_COUPLE_PRICE,
} from "../../data/seatLayoutData";

export default function SeatPricingCards({ hallType = "standard" }) {
  const theme = useSelector(selectTheme);
  const isDark = theme === "dark";

  const glassCardStyle = {
    backgroundColor: isDark
      ? "var(--primary-color-30)"
      : "var(--primary-color-5)",
    borderColor: isDark
      ? "var(--border-dark-mode)"
      : "var(--border-light-mode)",
  };

  if (hallType === "gold") {
    return (
      <div className="flex items-center justify-center pt-2 select-none">
        <div
          className="w-44 sm:w-52 rounded-3xl border p-5 sm:p-6 text-center flex flex-col items-center justify-center space-y-2.5 shadow-sm backdrop-blur-md"
          style={glassCardStyle}
        >
          <SeatIcon status="available" size={38} />
          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-[#EAB308]">
              Gold Class
            </h4>
            <p className="font-black text-lg sm:text-xl text-neutral-900 dark:text-white">
              ${GOLD_PRICE.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-5 sm:gap-8 pt-2 select-none">
      {/* Single Seat Card */}
      <div
        className="w-40 sm:w-48 rounded-3xl border p-5 sm:p-6 text-center flex flex-col items-center justify-center space-y-2.5 shadow-sm backdrop-blur-md transition-all hover:scale-102"
        style={glassCardStyle}
      >
        <SeatIcon status="available" size={34} />
        <div>
          <h4 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
            Single Seat
          </h4>
          <p className="font-black text-lg sm:text-xl text-neutral-900 dark:text-white">
            ${STANDARD_SINGLE_PRICE.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Couple Seat Card */}
      <div
        className="w-40 sm:w-48 rounded-3xl border p-5 sm:p-6 text-center flex flex-col items-center justify-center space-y-2.5 shadow-sm backdrop-blur-md transition-all hover:scale-102"
        style={glassCardStyle}
      >
        <div className="flex items-center gap-1.5 justify-center">
          <SeatIcon status="available" size={30} />
          <SeatIcon status="available" size={30} />
        </div>
        <div>
          <h4 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
            Couple Seat
          </h4>
          <p className="font-black text-lg sm:text-xl text-neutral-900 dark:text-white">
            ${STANDARD_COUPLE_PRICE.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
