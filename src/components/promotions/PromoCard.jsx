import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectTheme } from "../../redux/slices/uiSlice";

const BADGE_STYLES = {
  discount: "bg-[#B90101] text-white",
  event: "bg-[#FFD700] text-neutral-900",
};

export default function PromoCard({ promo }) {
  const theme = useSelector(selectTheme);
  const isDark = theme === "dark";
  const { id, title, description, badge, badgeType, image, type } = promo;
  const isWide = type === "wide";

  return (
    <Link
      to={`/promo/${id}`}
      className={`group block rounded-xl border transition-shadow duration-200 hover:shadow-lg ${
        isDark ? "border-white/10" : "border-neutral-200"
      }`}
      style={{
        backgroundColor: isDark
          ? "var(--primary-color-30)"
          : "var(--primary-color-5)",
      }}
    >
      {/* Wrapper is NOT overflow-hidden, so the badge can float past the
          image's top-left corner instead of getting clipped. */}
      <div className="relative">
        <div
          className={`overflow-hidden rounded-t-xl ${isWide ? "aspect-[16/9]" : "aspect-[4/3]"}`}
        >
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {badge && (
          <span
            // Slight counter-clockwise tilt to match the promo ticker's angle:
            className={`absolute -top-2 -left-2 sm:-top-3 sm:-left-3 z-10 uppercase font-extrabold text-[10px] sm:text-xs tracking-wide px-3 py-1 sm:px-4 sm:py-1.5 rounded-full shadow-lg -rotate-6 origin-center ${
              BADGE_STYLES[badgeType] || BADGE_STYLES.discount
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="p-3">
        <h3
          className={`font-extrabold text-xs sm:text-sm uppercase tracking-wide ${
            isDark ? "text-white" : "text-neutral-900"
          }`}
        >
          {title}
        </h3>
        <p
          
          className={`mt-1 text-[18px] leading-relaxed line-clamp-2 ${
            isDark ? "text-neutral-400" : "text-neutral-600"
          }`}
        >
          {description}
        </p>
      </div>
    </Link>
  );
}
