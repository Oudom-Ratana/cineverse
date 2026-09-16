import { TICKER_ITEMS } from "../../data/promotionData";

export default function PromoTicker() {
  return (
    <div className="relative w-full overflow-x-hidden py-8">
      <section
        role="marquee"
        aria-label="Promotions"
        className="relative left-[-8%] w-[116%] overflow-hidden bg-[#FFD700] py-2.5 -rotate-2 origin-center shadow-lg"
      >
        <style>{`
          @keyframes promo-ticker-scroll {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
          .promo-ticker-track {
            animation: promo-ticker-scroll 70s linear infinite;
          }
          .promo-ticker-track:hover {
            animation-play-state: paused;
          }
          @media (prefers-reduced-motion: reduce) {
            .promo-ticker-track {
              animation: none;
            }
          }
        `}</style>

        <div className="flex w-max promo-ticker-track">
          {/* Real, screen-reader-visible copy */}
          <TickerHalf ariaHidden={false} />
          {/* Duplicate copy purely for the seamless visual loop */}
          <TickerHalf ariaHidden />
        </div>
      </section>
    </div>
  );
}

function TickerHalf({ ariaHidden }) {
  // Repeat items 4 times so one half is ~3,500px wide, eliminating any viewport gaps
  const items = [
    ...TICKER_ITEMS,
    ...TICKER_ITEMS,
    ...TICKER_ITEMS,
    ...TICKER_ITEMS,
  ];

  return (
    <div className="flex items-center shrink-0" aria-hidden={ariaHidden}>
      {items.map((label, i) => (
        <span key={i} className="flex items-center shrink-0 whitespace-nowrap">
          {label === "HOT DEALS ONLY" && <FireIcon />}
          <span className="text-neutral-900 font-extrabold text-sm uppercase tracking-wide">
            {label}
          </span>
          <DiamondIcon />
        </span>
      ))}
    </div>
  );
}

function FireIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="#B90101"
      stroke="#B90101"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4 mr-1.5 shrink-0 inline-block align-middle"
    >
      <path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" />
    </svg>
  );
}

function DiamondIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="#B90101"
      stroke="#B90101"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5 mx-6 shrink-0 inline-block align-middle"
      aria-hidden="true"
    >
      <path d="M12.983 21.186a1 1 0 0 1-1.966 0 10 10 0 0 0-8.203-8.203 1 1 0 0 1 0-1.966 10 10 0 0 0 8.203-8.203 1 1 0 0 1 1.966 0 10 10 0 0 0 8.203 8.203 1 1 0 0 1 0 1.966 10 10 0 0 0-8.203 8.203" />
    </svg>
  );
}
