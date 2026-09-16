import SeatIcon from "./SeatIcon";
import { GOLD_ROWS, GOLD_COL_GROUPS } from "../../data/seatLayoutData";

export default function GoldClassSeatMap({
  isSeatReserved,
  isSeatSelected,
  onSeatClick,
}) {
  return (
    <div className="min-w-[420px] max-w-lg mx-auto space-y-3.5 sm:space-y-4 select-none">
      {/* Column Numbers Header: 1-2, 3-4, 5-6 (Aligned with seats) */}
      <div className="flex items-center justify-between gap-2 text-xs font-bold text-neutral-600 dark:text-neutral-400">
        <span className="w-6 sm:w-8" />
        <div className="flex items-center gap-8 sm:gap-14">
          {GOLD_COL_GROUPS.map((group, gIdx) => (
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

      {/* Rows F down to A */}
      <div className="space-y-3 sm:space-y-3.5">
        {GOLD_ROWS.map((rowLetter) => (
          <div
            key={rowLetter}
            className="flex items-center justify-between gap-2"
          >
            {/* Left Row Letter */}
            <span className="w-6 sm:w-8 text-center font-bold text-sm sm:text-base text-neutral-900 dark:text-neutral-100">
              {rowLetter}
            </span>

            {/* 3 Blocks of 2 VIP Recliners with wide aisles */}
            <div className="flex items-center gap-8 sm:gap-14">
              {GOLD_COL_GROUPS.map((group, gIdx) => (
                <div key={gIdx} className="flex items-center gap-1.5 sm:gap-2">
                  {group.map((col) => {
                    const seatId = `${rowLetter}${col}`;
                    const isReserved = isSeatReserved(seatId);
                    const isSelected = isSeatSelected(seatId);
                    const status = isReserved
                      ? "reserved"
                      : isSelected
                        ? "selected"
                        : "available";

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
                        title={`Gold Class Seat ${seatId} (${status})`}
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
    </div>
  );
}
