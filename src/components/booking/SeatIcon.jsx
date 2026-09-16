/**
 * SeatIcon.jsx
 * Uses the exact chair SVG imported from Figma:
 *   - EmptyChair   (available)  → #B5B0B0
 *   - SelectedChair (selected)  → #FFD700
 *   - BookedChair   (reserved)  → #B90101
 *
 * The path data is identical across all three; only the fill colour differs.
 */

const CHAIR_PATH =
  "M34.5705 0H17.6114C10.7756 0 5.21819 5.62953 5.21819 12.5541V23.7868C10.2537 23.7868 14.35 27.9362 14.35 33.0372V35.7991C22.0207 33.8961 30.1611 33.8961 37.8319 35.7991V33.0372C37.8319 27.9362 41.9281 23.7868 46.9637 23.7868V12.5541C46.9637 5.62953 41.4063 0 34.5705 0ZM7.17501 52.8595H10.4364V33.0372C10.4364 31.6352 9.8866 30.2907 8.908 29.2994C7.9294 28.3081 6.60214 27.7512 5.21819 27.7512C3.83424 27.7512 2.50697 28.3081 1.52837 29.2994C0.549771 30.2907 0 31.6352 0 33.0372V45.5913C0.00344855 47.5179 0.760492 49.3645 2.10532 50.7268C3.45015 52.0891 5.27314 52.856 7.17501 52.8595ZM41.7455 52.8595H45.0069C46.9087 52.856 48.7317 52.0891 50.0765 50.7268C51.4214 49.3645 52.1784 47.5179 52.1819 45.5913V33.0372C52.1819 31.6352 51.6321 30.2907 50.6535 29.2994C49.6749 28.3081 48.3476 27.7512 46.9637 27.7512C45.5797 27.7512 44.2525 28.3081 43.2739 29.2994C42.2953 30.2907 41.7455 31.6352 41.7455 33.0372V52.8595ZM14.35 52.8595V39.9221C21.9947 37.8474 30.1872 37.8474 37.8319 39.9221V52.8595H14.35Z";

const COLORS = {
  available: "#B5B0B0", // EmptyChair
  selected: "#FFD700", // SelectedChair
  reserved: "#B90101", // BookedChair
};

export default function SeatIcon({
  status = "available", // 'available' | 'selected' | 'reserved'
  size = 28,
  className = "",
}) {
  const fill = COLORS[status] ?? COLORS.available;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 53 53"
      fill="none"
      className={`inline-block transition-transform duration-150 ${className}`}
    >
      <path fillRule="evenodd" clipRule="evenodd" d={CHAIR_PATH} fill={fill} />
    </svg>
  );
}
