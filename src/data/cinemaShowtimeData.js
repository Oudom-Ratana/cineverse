/**
 * cinemaShowtimeData.js
 * Cinema branches and showtime schedules for ticket booking.
 * Each branch can have multiple halls — each hall routes to a different seat map.
 */

export const LOCATIONS = [
  "All Locations",
  "Ciniverse SenSok",
  "Ciniverse Eden Garden",
  "Ciniverse MeanChey",
  "Ciniverse Aeon Mall SenSok",
  "Ciniverse Toul Kork",
];

export const DATES = [
  { id: "2026-08-25", month: "Aug", day: "25", weekday: "Tue" },
  { id: "2026-08-26", month: "Aug", day: "26", weekday: "Tue" },
  { id: "2026-08-27", month: "Aug", day: "27", weekday: "Tue" },
  { id: "2026-08-28", month: "Aug", day: "28", weekday: "Wed" },
  { id: "2026-08-29", month: "Aug", day: "29", weekday: "Thu" },
];

/**
 * BRANCH_SHOWTIMES
 *
 * Each entry is a cinema branch.
 * A branch has a `halls` array — each hall has its own screen type & times.
 *
 * goldClass: true  → routes to /booking/seats?hall=gold
 * goldClass: false → routes to /booking/seats?hall=standard
 */
export const BRANCH_SHOWTIMES = [
  {
    id: "sensok",
    branchName: "Ciniverse SenSok",
    location: "Ciniverse SenSok",
    halls: [
      {
        id: "sensok-2d",
        hallName: "Regular Hall",
        screenType: "2D",
        goldClass: false,
        subtitle: "KH",
        audio: "EN",
        times: [
          "10:00 AM",
          "01:10 PM",
          "02:40 PM",
          "04:20 PM",
          "07:30 PM",
          "09:00 PM",
        ],
      },
      {
        id: "sensok-screenx",
        hallName: "Regular Hall",
        screenType: "SCREEN X",
        goldClass: false,
        subtitle: "KH",
        audio: "EN",
        times: ["09:00 PM", "12:45 PM", "03:45 PM"],
      },
      {
        id: "sensok-gold",
        hallName: "Gold Class",
        screenType: "GOLD",
        goldClass: true,
        subtitle: "KH",
        audio: "EN",
        times: ["10:30 AM", "02:00 PM", "05:30 PM"],
      },
    ],
  },
  {
    id: "eden",
    branchName: "Ciniverse Eden Garden",
    location: "Ciniverse Eden Garden",
    halls: [
      {
        id: "eden-2d",
        hallName: "Regular Hall",
        screenType: "2D",
        goldClass: false,
        subtitle: "KH",
        audio: "EN",
        times: ["11:00 AM", "02:30 PM", "06:00 PM", "08:45 PM"],
      },
      {
        id: "eden-gold",
        hallName: "Gold Class",
        screenType: "GOLD",
        goldClass: true,
        subtitle: "KH",
        audio: "EN",
        times: ["01:00 PM", "05:30 PM", "09:15 PM"],
      },
    ],
  },
  {
    id: "meanchey",
    branchName: "Ciniverse MeanChey",
    location: "Ciniverse MeanChey",
    halls: [
      {
        id: "meanchey-2d",
        hallName: "Regular Hall",
        screenType: "2D",
        goldClass: false,
        subtitle: "KH",
        audio: "EN",
        times: ["10:00 AM", "01:00 PM", "04:30 PM", "08:00 PM"],
      },
    ],
  },
  {
    id: "aeon",
    branchName: "Ciniverse Aeon Mall SenSok",
    location: "Ciniverse Aeon Mall SenSok",
    halls: [
      {
        id: "aeon-2d",
        hallName: "Regular Hall",
        screenType: "2D",
        goldClass: false,
        subtitle: "KH",
        audio: "EN",
        times: ["09:30 AM", "12:00 PM", "03:15 PM", "06:30 PM"],
      },
      {
        id: "aeon-gold",
        hallName: "Gold Class",
        screenType: "GOLD",
        goldClass: true,
        subtitle: "KH",
        audio: "EN",
        times: ["11:00 AM", "03:00 PM", "07:00 PM"],
      },
    ],
  },
  {
    id: "toulkork",
    branchName: "Ciniverse Toul Kork",
    location: "Ciniverse Toul Kork",
    halls: [
      {
        id: "toulkork-2d",
        hallName: "Regular Hall",
        screenType: "2D",
        goldClass: false,
        subtitle: "KH",
        audio: "EN",
        times: ["10:15 AM", "01:30 PM", "05:00 PM", "08:30 PM"],
      },
    ],
  },
];
