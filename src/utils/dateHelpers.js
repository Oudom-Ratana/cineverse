/**
 * Date generation utilities for cinema scheduling
 */

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Generate an array of structured date objects from a startDate and total days or endDate
 */
export function generateDateList(
  startDateStr = "2026-08-25",
  totalDays = 7,
  endDateStr = null,
) {
  const dates = [];
  const start = new Date(startDateStr);

  // If invalid date fallback
  if (isNaN(start.getTime())) {
    return [
      { full: "2026-08-25", month: "Aug", day: "25", weekday: "Tue" },
      { full: "2026-08-26", month: "Aug", day: "26", weekday: "Wed" },
      { full: "2026-08-27", month: "Aug", day: "27", weekday: "Thu" },
    ];
  }

  let count = totalDays;
  if (endDateStr) {
    const end = new Date(endDateStr);
    if (!isNaN(end.getTime())) {
      const diffTime = Math.abs(end - start);
      count = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
    }
  }

  // Cap at 60 days to keep performance snappy
  count = Math.min(count, 60);

  for (let i = 0; i < count; i++) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);

    const year = current.getFullYear();
    const monthIndex = current.getMonth();
    const monthNum = String(monthIndex + 1).padStart(2, "0");
    const dayNum = String(current.getDate()).padStart(2, "0");

    dates.push({
      full: `${year}-${monthNum}-${dayNum}`,
      month: MONTH_NAMES[monthIndex],
      day: String(current.getDate()),
      weekday: WEEKDAY_NAMES[current.getDay()],
      dayIndex: i,
    });
  }

  return dates;
}
