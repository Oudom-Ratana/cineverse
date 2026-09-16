import { Check } from "lucide-react";
import { useSelector } from "react-redux";
import { selectTheme } from "../../redux/slices/uiSlice";

export default function BookingStepper({ currentStep = 2 }) {
  const theme = useSelector(selectTheme);
  const isDark = theme === "dark";

  const isStep1Done = currentStep >= 1;
  const isStep2Done = currentStep >= 2;
  const isStep3Done = currentStep >= 3;
  const isStep4Done = currentStep >= 4;

  return (
    <div
      className="w-full rounded-full border backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-sm select-none"
      style={{
        backgroundColor: isDark
          ? "var(--primary-color-30)"
          : "var(--primary-color-5)",
        borderColor: isDark
          ? "var(--border-dark-mode)"
          : "var(--border-light-mode)",
      }}
    >
      <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
        {/* Step 1: Showtime */}
        <div
          className={`flex items-center gap-2 ${
            isStep1Done
              ? "text-neutral-900 dark:text-white"
              : "text-neutral-400 dark:text-neutral-500"
          }`}
        >
          <span
            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shrink-0 ${
              isStep1Done
                ? "bg-[#B90101] text-white"
                : "border border-neutral-300 dark:border-white/20 text-neutral-400"
            }`}
          >
            <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
          </span>
          <span className="hidden xs:inline sm:inline">Show time</span>
        </div>

        {/* Connecting line 1-2 */}
        <div
          className={`flex-1 mx-2 sm:mx-4 h-0.5 ${
            isStep2Done ? "bg-[#B90101]" : "bg-neutral-300 dark:bg-white/20"
          }`}
        />

        {/* Step 2: Choose seat */}
        <div
          className={`flex items-center gap-2 ${
            isStep2Done
              ? "text-neutral-900 dark:text-white"
              : "text-neutral-400 dark:text-neutral-500"
          }`}
        >
          <span
            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shrink-0 ${
              isStep2Done
                ? "bg-[#B90101] text-white"
                : "border border-neutral-300 dark:border-white/20 text-neutral-400"
            }`}
          >
            <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
          </span>
          <span>Choose seat</span>
        </div>

        {/* Connecting line 2-3 */}
        <div
          className={`flex-1 mx-2 sm:mx-4 h-0.5 ${
            isStep3Done ? "bg-[#B90101]" : "bg-neutral-300 dark:bg-white/20"
          }`}
        />

        {/* Step 3: Booking Details */}
        <div
          className={`flex items-center gap-2 ${
            isStep3Done
              ? "text-neutral-900 dark:text-white"
              : "text-neutral-400 dark:text-neutral-500"
          }`}
        >
          <span
            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shrink-0 ${
              isStep3Done
                ? "bg-[#B90101] text-white"
                : "border border-neutral-300 dark:border-white/20 text-neutral-400"
            }`}
          >
            <Check
              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3] ${isStep3Done ? "text-white" : "opacity-40"}`}
            />
          </span>
          <span className="hidden sm:inline">Booking Details</span>
        </div>

        {/* Connecting line 3-4 */}
        <div
          className={`flex-1 mx-2 sm:mx-4 h-0.5 ${
            isStep4Done ? "bg-[#B90101]" : "bg-neutral-300 dark:bg-white/20"
          }`}
        />

        {/* Step 4: Confirmed */}
        <div
          className={`flex items-center gap-2 ${
            isStep4Done
              ? "text-neutral-900 dark:text-white"
              : "text-neutral-400 dark:text-neutral-500"
          }`}
        >
          <span
            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shrink-0 ${
              isStep4Done
                ? "bg-[#B90101] text-white"
                : "border border-neutral-300 dark:border-white/20 text-neutral-400"
            }`}
          >
            <Check
              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3] ${isStep4Done ? "text-white" : "opacity-40"}`}
            />
          </span>
          <span className="hidden md:inline">Confirmed</span>
        </div>
      </div>
    </div>
  );
}
