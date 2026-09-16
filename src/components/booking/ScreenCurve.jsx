export default function ScreenCurve() {
  return (
    <div className="relative w-full max-w-2xl mx-auto pt-2 pb-6 text-center select-none">
      <svg
        className="w-full h-8 sm:h-10 text-amber-500 dark:text-[#B90101] overflow-visible"
        viewBox="0 0 600 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 28 Q 300 2 590 28"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          className="filter drop-shadow-[0_0_8px_currentColor]"
        />
      </svg>
      <span className="block -mt-1 text-xs sm:text-sm font-bold tracking-wider text-[#B90101] dark:text-[#FFD700] uppercase">
        Screen
      </span>
    </div>
  );
}
