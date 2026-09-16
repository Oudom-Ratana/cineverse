import { useState } from "react";
import SeatIcon from "./SeatIcon";
import {
  STANDARD_ROWS,
  STANDARD_COL_GROUPS,
  STANDARD_COUPLE_PRICE,
  COUPLE_PAIRS,
} from "../../data/seatLayoutData";

const getFallbackSvg = (initials, bg) =>
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><circle cx="30" cy="30" r="30" fill="${encodeURIComponent(bg)}"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="24" fill="%23ffffff">${initials}</text></svg>`;

export default function StandardHallSeatMap({
  isSeatReserved,
  isSeatSelected,
  onSeatClick,
  groupSeatAvatars = {},
}) {
  const [hoveredCouple, setHoveredCouple] = useState(null);

  return (
    <div className="min-w-[660px] max-w-3xl mx-auto space-y-3 sm:space-y-3.5 select-none">
      {/* Column Numbers Header: 1-2, 3-10, 11-12 (Aligned with seats) */}
      <div className="flex items-center justify-between gap-2 text-xs font-bold text-neutral-600 dark:text-neutral-400">
        <span className="w-6 sm:w-8" />
        <div className="flex items-center gap-3.5 sm:gap-6">
          {STANDARD_COL_GROUPS.map((group, gIdx) => (
            <div key={gIdx} className="flex items-center gap-1.5 sm:gap-2">
              {group.map((col) => (
                <div
                  key={col}
                  className="p-0.5 flex items-center justify-center text-center font-bold text-xs sm:text-sm text-neutral-800 dark:text-neutral-200"
                  style={{ width: 34, minWidth: 34 }}
                >
                  <span>{col}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <span className="w-6 sm:w-8" />
      </div>

      {/* Upper Rows: H down to B */}
      <div className="space-y-3 sm:space-y-3.5">
        {STANDARD_ROWS.filter((r) => r !== "A").map((rowLetter) => (
          <div
            key={rowLetter}
            className="flex items-center justify-between gap-2"
          >
            {/* Left Row Letter */}
            <span className="w-6 sm:w-8 text-center font-bold text-sm sm:text-base text-neutral-900 dark:text-neutral-100">
              {rowLetter}
            </span>

            {/* Columns: Left (1-2), Center (3-10), Right (11-12) */}
            <div className="flex items-center gap-3.5 sm:gap-6">
              {STANDARD_COL_GROUPS.map((group, gIdx) => (
                <div key={gIdx} className="flex items-center gap-1.5 sm:gap-2">
                  {group.map((col) => {
                    const seatId = `${rowLetter}${col}`;
                    const isReserved = isSeatReserved(seatId);
                    const isSelected = isSeatSelected(seatId);
                    const avatarInfo = groupSeatAvatars[seatId];
                    const status = isReserved
                      ? "reserved"
                      : isSelected
                        ? "selected"
                        : "available";

                    // If seat has a member avatar assigned (You or Friend)
                    if (avatarInfo) {
                      return (
                        <button
                          key={seatId}
                          type="button"
                          onClick={() => {
                            if (!avatarInfo.isLocked) {
                              onSeatClick(rowLetter, col, false);
                            }
                          }}
                          className={`p-0.5 rounded-lg transition-transform ${
                            avatarInfo.isLocked
                              ? "cursor-default opacity-95"
                              : "hover:scale-110 active:scale-95 cursor-pointer"
                          }`}
                          aria-label={`Seat ${seatId} (${avatarInfo.name})`}
                          title={`Seat ${seatId} • ${avatarInfo.name}`}
                        >
                          <div
                            className="w-[30px] h-[30px] rounded-full overflow-hidden border-2 shadow-sm flex items-center justify-center bg-neutral-800"
                            style={{ borderColor: avatarInfo.color }}
                          >
                            <img
                              src={avatarInfo.avatar}
                              alt={avatarInfo.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = getFallbackSvg(
                                  avatarInfo.initials || "U",
                                  avatarInfo.color,
                                );
                              }}
                            />
                          </div>
                        </button>
                      );
                    }

                    return (
                      <button
                        key={seatId}
                        type="button"
                        onClick={() => onSeatClick(rowLetter, col, false)}
                        disabled={isReserved}
                        className={`p-0.5 rounded-lg transition-transform ${
                          isReserved
                            ? "cursor-not-allowed opacity-95"
                            : "hover:scale-110 active:scale-95 cursor-pointer"
                        }`}
                        aria-label={`Seat ${seatId} ${status}`}
                        title={`Seat ${seatId} (${status})`}
                      >
                        <SeatIcon status={status} size={30} />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Right Row Letter */}
            <span className="w-6 sm:w-8 text-center font-bold text-sm sm:text-base text-neutral-900 dark:text-neutral-100">
              {rowLetter}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom Row A: Couple Seat Pairs */}
      <div className="pt-5 sm:pt-6">
        <div className="flex items-center justify-between gap-2">
          {/* Left Row Letter */}
          <span className="w-6 sm:w-8 text-center font-bold text-sm sm:text-base text-neutral-900 dark:text-neutral-100">
            A
          </span>

          {/* Column Groups */}
          <div className="flex items-center gap-3.5 sm:gap-6">
            {STANDARD_COL_GROUPS.map((group, gIdx) => (
              <div key={gIdx} className="flex items-center gap-1.5 sm:gap-2">
                {group.map((col) => {
                  if (col === 7 || col === 10) {
                    return (
                      <div
                        key={col}
                        className="p-0.5"
                        style={{ width: 34, minWidth: 34 }}
                      />
                    );
                  }

                  const seatId = `A${col}`;
                  const isReserved = isSeatReserved(seatId);
                  const isSelected = isSeatSelected(seatId);
                  const avatarInfo = groupSeatAvatars[seatId];
                  const status = isReserved
                    ? "reserved"
                    : isSelected
                      ? "selected"
                      : "available";

                  const pair = COUPLE_PAIRS.find((p) => p.includes(col));
                  const pairKey = pair ? `A-${pair[0]}-${pair[1]}` : null;
                  const isPairHovered = hoveredCouple === pairKey;

                  if (avatarInfo) {
                    return (
                      <button
                        key={seatId}
                        type="button"
                        onClick={() => {
                          if (!avatarInfo.isLocked) {
                            onSeatClick("A", col, true);
                          }
                        }}
                        className="p-0.5 rounded-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                        aria-label={`Couple Seat ${seatId} (${avatarInfo.name})`}
                        title={`Couple Seat ${seatId} • ${avatarInfo.name}`}
                      >
                        <div
                          className="w-[30px] h-[30px] rounded-full overflow-hidden border-2 shadow-sm flex items-center justify-center bg-neutral-800"
                          style={{ borderColor: avatarInfo.color }}
                        >
                          <img
                            src={avatarInfo.avatar}
                            alt={avatarInfo.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = getFallbackSvg(
                                avatarInfo.initials || "U",
                                avatarInfo.color,
                              );
                            }}
                          />
                        </div>
                      </button>
                    );
                  }

                  return (
                    <button
                      key={seatId}
                      type="button"
                      onClick={() => onSeatClick("A", col, true)}
                      disabled={isReserved}
                      onMouseEnter={() => pairKey && setHoveredCouple(pairKey)}
                      onMouseLeave={() => setHoveredCouple(null)}
                      className={`p-0.5 rounded-lg transition-transform ${
                        isReserved
                          ? "cursor-not-allowed opacity-95"
                          : isPairHovered
                            ? "scale-110 active:scale-95 cursor-pointer"
                            : "hover:scale-110 active:scale-95 cursor-pointer"
                      }`}
                      aria-label={`Couple Seat ${seatId} ${status}`}
                      title={
                        pair
                          ? `Couple Seat Pair A${pair[0]}-A${pair[1]} ($${STANDARD_COUPLE_PRICE.toFixed(2)})`
                          : ""
                      }
                    >
                      <SeatIcon status={status} size={30} />
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Right Row Letter */}
          <span className="w-6 sm:w-8 text-center font-bold text-sm sm:text-base text-neutral-900 dark:text-neutral-100">
            A
          </span>
        </div>
      </div>
    </div>
  );
}
