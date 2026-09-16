import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { X, Calendar, MapPin } from "lucide-react";
import { selectTheme } from "../../redux/slices/uiSlice";
import {
  HERO_PROMOTION,
  HERO_SLIDES,
  ACTIVE_PROMOTIONS,
} from "../../data/promotionData";

/**
 * Renders on top of PromotionPage (via nested route + <Outlet />) whenever
 * the URL is /promo/:id, so the promo grid stays visible behind it.
 * Closing navigates back to /promo, which drops this route match.
 */
export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useSelector(selectTheme);
  const isDark = theme === "dark";

  const promo = findPromoById(id);

  // Lock background scroll while the modal is open.
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close on Escape.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => navigate("/promo");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={promo ? promo.title : "Promotion details"}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default"
      />

      {/* Modal card */}
      <div
        className={`relative w-full max-w-3xl rounded-[28px] p-6 sm:p-8 shadow-2xl ${
          isDark ? "bg-neutral-900 border border-white/10" : "bg-white"
        }`}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute top-5 right-5 text-[#B90101] hover:opacity-70 transition-opacity duration-200"
        >
          <X className="w-6 h-6" strokeWidth={2.5} />
        </button>

        {promo ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-start">
            {/* Image */}
            <div
              className="relative rounded-2xl overflow-hidden aspect-square md:aspect-[4/5]"
              style={{
                background: "linear-gradient(135deg, #B90101 0%, #6d0808 100%)",
              }}
            >
              <img
                src={promo.image}
                alt={promo.title}
                className="w-full h-full object-cover"
              />
              {promo.offerTag && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-white font-black italic leading-none text-center px-4">
                    {groupIntoLines(promo.offerTag).map((line) => (
                      <span
                        key={line}
                        className="text-4xl sm:text-5xl [text-shadow:_2px_2px_0_#FFD700]"
                      >
                        {line}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Content */}
            <div className="pt-1 sm:pt-4 pr-8">
              <h2
                className={`font-extrabold text-3xl sm:text-4xl leading-[1.1] ${
                  isDark ? "text-white" : "text-neutral-700"
                }`}
              >
                {promo.title}
              </h2>

              <div className="mt-5 space-y-2.5">
                {promo.dateRange && (
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-[18px] h-[18px] text-[#B90101] shrink-0" />
                    <span
                      className={`text-[15px] ${isDark ? "text-neutral-300" : "text-neutral-700"}`}
                    >
                      {promo.dateRange}
                    </span>
                  </div>
                )}
                {promo.location && (
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-[18px] h-[18px] text-[#B90101] shrink-0" />
                    <span
                      className={`text-[15px] ${isDark ? "text-neutral-300" : "text-neutral-700"}`}
                    >
                      {promo.location}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 h-px bg-[#B90101]" />

              <p
                className={`mt-5 text-[15px] leading-relaxed ${isDark ? "text-neutral-300" : "text-neutral-700"}`}
              >
                <strong className={isDark ? "text-white" : "text-neutral-900"}>
                  {promo.title}
                </strong>
                {" — "}
                {promo.description}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p
              className={`text-[15px] ${isDark ? "text-neutral-300" : "text-neutral-700"}`}
            >
              This promotion couldn't be found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function findPromoById(id) {
  const heroSlide = HERO_SLIDES?.find((slide) => slide.id === id);
  if (heroSlide) return heroSlide;
  if (HERO_PROMOTION.id === id) return HERO_PROMOTION;
  return ACTIVE_PROMOTIONS.find((promo) => String(promo.id) === id) || null;
}

function groupIntoLines(text) {
  return text.split(" ").reduce((lines, word, i) => {
    if (i % 2 === 0) lines.push(word);
    else lines[lines.length - 1] += ` ${word}`;
    return lines;
  }, []);
}
