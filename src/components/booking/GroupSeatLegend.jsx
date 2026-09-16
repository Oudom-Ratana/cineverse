import { useSelector } from "react-redux";
import { selectTheme } from "../../redux/slices/uiSlice";
import { Users, Info } from "lucide-react";

/**
 * Group members data matching the Figma designs:
 * - You (Host/Guest): curly-haired smiling young man (Gold ring: #FFD700)
 * - Capibarra: woman with scarf (Blue ring: #3B82F6)
 * - Kapoy: man with sunglasses/hat (Green ring: #10B981)
 */
export const GROUP_MEMBERS = [
  {
    id: "you",
    name: "You",
    avatar:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    fallbackBg: "#EAB308",
    initials: "U",
    color: "#FFD700",
    defaultSeat: "C3",
  },
  {
    id: "capibarra",
    name: "Capibarra",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    fallbackBg: "#3B82F6",
    initials: "C",
    color: "#3B82F6",
    defaultSeat: "F6",
  },
  {
    id: "kapoy",
    name: "Kapoy",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    fallbackBg: "#10B981",
    initials: "K",
    color: "#10B981",
    defaultSeat: "B8",
  },
];

const getFallbackSvg = (initials, bg) =>
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="${encodeURIComponent(bg)}"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="38" fill="%23ffffff">${initials}</text></svg>`;

export default function GroupSeatLegend({ mySeats = [] }) {
  const theme = useSelector(selectTheme);
  const isDark = theme === "dark";

  const me = GROUP_MEMBERS[0];
  const capibarra = GROUP_MEMBERS[1];
  const kapoy = GROUP_MEMBERS[2];

  const mySeatLabel = mySeats.length > 0 ? mySeats.join(", ") : "Select a seat";

  // Exact project Glassmorphic tokens
  const glassCardStyle = {
    backgroundColor: isDark
      ? "var(--primary-color-30)"
      : "var(--primary-color-5)",
    borderColor: isDark
      ? "var(--border-dark-mode)"
      : "var(--border-light-mode)",
  };

  return (
    <div className="w-full space-y-3 pt-2 select-none">
      {/* 2-Card Layout matching Figma */}
      <div className="flex flex-col md:flex-row items-stretch gap-4">
        {/* ── Left Card: Legend + Your Seat / Friends Seat ── */}
        <div
          className="flex-1 rounded-2xl sm:rounded-3xl border p-5 sm:p-6 space-y-4 shadow-sm backdrop-blur-md transition-all"
          style={glassCardStyle}
        >
          {/* Row 1: AVAILABLE / SELECTED / RESERVED Status Dots */}
          <div className="flex items-center justify-around text-xs sm:text-sm font-black tracking-wider">
            {/* Available */}
            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
              <span className="w-4 h-4 rounded-full bg-[#B5B0B0] shadow-xs" />
              <span className="uppercase">AVAILABLE</span>
            </div>

            {/* Selected */}
            <div className="flex items-center gap-2 text-[#EAB308]">
              <span className="w-4 h-4 rounded-full bg-[#FFD700] shadow-xs" />
              <span className="uppercase">SELECTED</span>
            </div>

            {/* Reserved */}
            <div className="flex items-center gap-2 text-[#B90101]">
              <span className="w-4 h-4 rounded-full bg-[#B90101] shadow-xs" />
              <span className="uppercase">RESERVED</span>
            </div>
          </div>

          {/* Thin subtle divider */}
          <div className="border-t border-neutral-300/60 dark:border-white/15 my-2" />

          {/* Row 2: YOUR SEAT / FRIENDS SEAT */}
          <div className="flex items-center justify-around pt-1">
            {/* YOUR SEAT */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-12 h-12 rounded-full overflow-hidden border-[3px] shadow-md transition-transform hover:scale-105"
                style={{ borderColor: me.color }}
              >
                <img
                  src={me.avatar}
                  alt="Your avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = getFallbackSvg(
                      me.initials,
                      me.fallbackBg,
                    );
                  }}
                />
              </div>
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                YOUR SEAT
              </span>
            </div>

            {/* FRIENDS SEAT */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center -space-x-2.5">
                <div
                  className="w-12 h-12 rounded-full overflow-hidden border-[3px] shadow-md relative z-10 transition-transform hover:scale-105"
                  style={{ borderColor: capibarra.color }}
                >
                  <img
                    src={capibarra.avatar}
                    alt={capibarra.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = getFallbackSvg(
                        capibarra.initials,
                        capibarra.fallbackBg,
                      );
                    }}
                  />
                </div>
                <div
                  className="w-12 h-12 rounded-full overflow-hidden border-[3px] shadow-md relative z-0 transition-transform hover:scale-105"
                  style={{ borderColor: kapoy.color }}
                >
                  <img
                    src={kapoy.avatar}
                    alt={kapoy.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = getFallbackSvg(
                        kapoy.initials,
                        kapoy.fallbackBg,
                      );
                    }}
                  />
                </div>
              </div>
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                FRIENDS SEAT
              </span>
            </div>
          </div>
        </div>

        {/* ── Right Card: LIVE PRESENCE ── */}
        <div
          className="w-full md:w-64 rounded-2xl sm:rounded-3xl border p-5 sm:p-6 shadow-sm backdrop-blur-md flex flex-col justify-between"
          style={glassCardStyle}
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-sm sm:text-base font-black text-[#B90101] uppercase tracking-wider">
                LIVE PRESENCE
              </h4>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-3">
              {/* You */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full overflow-hidden border-[2.5px] shadow-sm shrink-0"
                  style={{ borderColor: me.color }}
                >
                  <img
                    src={me.avatar}
                    alt={me.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = getFallbackSvg(
                        me.initials,
                        me.fallbackBg,
                      );
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white truncate">
                    {me.name} (You)
                  </p>
                  <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                    Seat {mySeatLabel}
                  </p>
                </div>
              </div>

              {/* Capibarra */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full overflow-hidden border-[2.5px] shadow-sm shrink-0"
                  style={{ borderColor: capibarra.color }}
                >
                  <img
                    src={capibarra.avatar}
                    alt={capibarra.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = getFallbackSvg(
                        capibarra.initials,
                        capibarra.fallbackBg,
                      );
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white truncate">
                    {capibarra.name}
                  </p>
                  <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                    Seat {capibarra.defaultSeat}
                  </p>
                </div>
              </div>

              {/* Kapoy */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full overflow-hidden border-[2.5px] shadow-sm shrink-0"
                  style={{ borderColor: kapoy.color }}
                >
                  <img
                    src={kapoy.avatar}
                    alt={kapoy.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = getFallbackSvg(
                        kapoy.initials,
                        kapoy.fallbackBg,
                      );
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white truncate">
                    {kapoy.name}
                  </p>
                  <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                    Seat {kapoy.defaultSeat}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Group Booking Live Helper Pill */}
      <div
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs text-neutral-700 dark:text-neutral-300 backdrop-blur-md"
        style={glassCardStyle}
      >
        <Info className="w-4 h-4 text-[#B90101] shrink-0" />
        <p className="leading-snug">
          <strong className="text-neutral-900 dark:text-white">
            Group Booking:
          </strong>{" "}
          Pick your seats together in real time. Each member selects and pays
          for their own seat individually.
        </p>
      </div>
    </div>
  );
}
