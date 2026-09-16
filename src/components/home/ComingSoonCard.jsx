import { Link } from "react-router-dom";

export default function ComingSoonCard({ item }) {
  if (!item) return null;

  const title = item.title || item.name || "Coming Soon";

  // Format release date to 'Month Day, Year'
  const formatReleaseDate = (dateStr) => {
    if (!dateStr) return "Coming Soon";
    if (/^[A-Za-z]+\s+\d{1,2},\s+\d{4}$/.test(dateStr)) return dateStr;
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
    return dateStr;
  };

  const formattedDate = formatReleaseDate(
    item.release_date || item.first_air_date,
  );

  const bannerUrl =
    item.banner ||
    (item.backdrop_path
      ? (item.backdrop_path.startsWith("http")
          ? item.backdrop_path
          : `https://image.tmdb.org/t/p/w780${item.backdrop_path}`)
      : item.poster_path
        ? (item.poster_path.startsWith("http")
            ? item.poster_path
            : `https://image.tmdb.org/t/p/w780${item.poster_path}`)
        : "https://image.tmdb.org/t/p/original/euYIwmwkmz95mnXvufEmbL69ovr.jpg");

  return (
    <Link
      to={item.id ? `/movies/${item.id}` : "#"}
      className="group block cursor-pointer space-y-3 font-sans select-none"
    >
      {/* Landscape Banner with smooth rounded corners */}
      <div className="relative aspect-[16/10] w-full rounded-[22px] overflow-hidden bg-neutral-900 shadow-sm group-hover:shadow-lg transition-all duration-300">
        <img
          src={bannerUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src =
              item.poster_path && item.poster_path.startsWith("http")
                ? item.poster_path
                : "https://image.tmdb.org/t/p/original/euYIwmwkmz95mnXvufEmbL69ovr.jpg";
          }}
        />
      </div>

      {/* Title & Release Date */}
      <div className="space-y-1 pt-0.5">
        <h3
          className="font-black text-[21px] sm:text-[22px] leading-snug tracking-tight group-hover:brightness-110 transition line-clamp-1"
          style={{ color: "#9E0505" }}
        >
          {title}
        </h3>
        <p
          className="font-semibold text-[18px] tracking-wide"
          style={{ color: "#C8961E" }}
        >
          {formattedDate}
        </p>
      </div>
    </Link>
  );
}
