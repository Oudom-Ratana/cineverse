// Mock ticket data for My Tickets page
// Replace with real API data from bookingApi when booking process is complete

export const MOCK_TICKETS = [
  // ─── UPCOMING ────────────────────────────────────────────
  {
    id: "TKT-001",
    status: "upcoming",
    movie: {
      title: "Spider-Man: Brand New Day",
      poster:
        "https://i.pinimg.com/1200x/95/26/68/9526684fe11e38cf6bb6fbd48e37de6a.jpg",
      duration: "2h 12m",
      genres: ["Action", "Adventure"],
    },
    showtime: {
      date: "Jul 13, 2026",
      time: "6:30 PM",
      format: "3D",
      hall: "Hall 3",
      location: "Aeon Mall 1",
    },
    seats: ["D8", "D9"],
    pricePerSeat: 4.0,
    totalSeats: 2,
    totalPrice: 8.0,
  },
  {
    id: "TKT-002",
    status: "upcoming",
    movie: {
      title: "Spider-Man: Brand New Day",
      poster:
        "https://i.pinimg.com/736x/2a/ef/c6/2aefc65b2901088e81f0037221f75031.jpg",
      duration: "2h 12m",
      genres: ["Action", "Adventure"],
    },
    showtime: {
      date: "Jul 13, 2026",
      time: "6:30 PM",
      format: "3D",
      hall: "Hall 3",
      location: "Aeon Mall 1",
    },
    seats: ["D8", "D9"],
    pricePerSeat: 4.0,
    totalSeats: 2,
    totalPrice: 8.0,
  },
  {
    id: "TKT-003",
    status: "upcoming",
    movie: {
      title: "Avengers: Secret Wars",
      poster:
        "https://i.pinimg.com/736x/f2/9e/81/f29e81c4527a8d05f00e6a2f13d2b510.jpg",
      duration: "3h 5m",
      genres: ["Action", "Sci-Fi"],
    },
    showtime: {
      date: "Aug 20, 2026",
      time: "9:00 PM",
      format: "IMAX",
      hall: "Hall 5",
      location: "Ciniverse SenSok",
    },
    seats: ["F3", "F4", "F5"],
    pricePerSeat: 11.0,
    totalSeats: 3,
    totalPrice: 33.0,
  },
  {
    id: "TKT-004",
    status: "upcoming",
    movie: {
      title: "Deadpool & Wolverine",
      poster:
        "https://i.pinimg.com/1200x/e2/dd/2d/e2dd2d4cacab4081ac8a16fd4bcaa69d.jpg",
      duration: "2h 8m",
      genres: ["Action", "Comedy"],
    },
    showtime: {
      date: "Sep 5, 2026",
      time: "12:45 PM",
      format: "3D",
      hall: "Hall 2",
      location: "Legend 271 Mega Mall",
    },
    seats: ["B10", "B11"],
    pricePerSeat: 5.0,
    totalSeats: 2,
    totalPrice: 10.0,
  },
  {
    id: "TKT-005",
    status: "upcoming",
    movie: {
      title: "Mission Impossible: Final Reckoning",
      poster:
        "https://i.pinimg.com/736x/e5/96/a7/e596a7d880bfdb93715e0d71c39ccdf8.jpg",
      duration: "2h 49m",
      genres: ["Action", "Thriller"],
    },
    showtime: {
      date: "Sep 12, 2026",
      time: "3:45 PM",
      format: "ScreenX",
      hall: "Hall 1",
      location: "Ciniverse Eden Garden",
    },
    seats: ["H7", "H8"],
    pricePerSeat: 10.0,
    totalSeats: 2,
    totalPrice: 20.0,
  },
  {
    id: "TKT-006",
    status: "upcoming",
    movie: {
      title: "Jurassic World Rebirth",
      poster:
        "https://i.pinimg.com/1200x/95/26/68/9526684fe11e38cf6bb6fbd48e37de6a.jpg",
      duration: "2h 31m",
      genres: ["Adventure", "Sci-Fi"],
    },
    showtime: {
      date: "Sep 20, 2026",
      time: "6:30 PM",
      format: "3D",
      hall: "Hall 4",
      location: "Aeon Mall 1",
    },
    seats: ["C5"],
    pricePerSeat: 5.0,
    totalSeats: 1,
    totalPrice: 5.0,
  },

  // ─── HISTORY ─────────────────────────────────────────────
  {
    id: "TKT-H001",
    status: "completed",
    movie: {
      title: "Spider-Man: Brand New Day",
      poster:
        "https://i.pinimg.com/1200x/95/26/68/9526684fe11e38cf6bb6fbd48e37de6a.jpg",
      duration: "2h 12m",
      genres: ["Action", "Adventure"],
    },
    showtime: {
      date: "Jul 13, 2026",
      time: "6:30 PM",
      format: "3D",
      hall: "Hall 3",
      location: "Aeon Mall 1",
    },
    seats: ["D8", "D9"],
    pricePerSeat: 4.0,
    totalSeats: 2,
    totalPrice: 8.0,
  },
  {
    id: "TKT-H002",
    status: "completed",
    movie: {
      title: "Spider-Man: Brand New Day",
      poster:
        "https://i.pinimg.com/736x/2a/ef/c6/2aefc65b2901088e81f0037221f75031.jpg",
      duration: "2h 12m",
      genres: ["Action", "Adventure"],
    },
    showtime: {
      date: "Jul 13, 2026",
      time: "6:30 PM",
      format: "3D",
      hall: "Hall 3",
      location: "Aeon Mall 1",
    },
    seats: ["D8", "D9"],
    pricePerSeat: 4.0,
    totalSeats: 2,
    totalPrice: 8.0,
  },
  {
    id: "TKT-H003",
    status: "completed",
    movie: {
      title: "Avengers: Endgame",
      poster:
        "https://i.pinimg.com/736x/f2/9e/81/f29e81c4527a8d05f00e6a2f13d2b510.jpg",
      duration: "3h 1m",
      genres: ["Action", "Drama"],
    },
    showtime: {
      date: "May 4, 2026",
      time: "7:00 PM",
      format: "IMAX",
      hall: "Hall 5",
      location: "Ciniverse SenSok",
    },
    seats: ["A1", "A2"],
    pricePerSeat: 11.0,
    totalSeats: 2,
    totalPrice: 22.0,
  },
  {
    id: "TKT-H004",
    status: "completed",
    movie: {
      title: "Guardians of the Galaxy Vol. 3",
      poster:
        "https://i.pinimg.com/1200x/e2/dd/2d/e2dd2d4cacab4081ac8a16fd4bcaa69d.jpg",
      duration: "2h 30m",
      genres: ["Action", "Comedy"],
    },
    showtime: {
      date: "Apr 28, 2026",
      time: "2:00 PM",
      format: "3D",
      hall: "Hall 2",
      location: "Legend 271 Mega Mall",
    },
    seats: ["G6", "G7"],
    pricePerSeat: 5.0,
    totalSeats: 2,
    totalPrice: 10.0,
  },
  {
    id: "TKT-H005",
    status: "completed",
    movie: {
      title: "The Batman",
      poster:
        "https://i.pinimg.com/736x/e5/96/a7/e596a7d880bfdb93715e0d71c39ccdf8.jpg",
      duration: "2h 56m",
      genres: ["Action", "Mystery"],
    },
    showtime: {
      date: "Mar 10, 2026",
      time: "9:15 PM",
      format: "2D",
      hall: "Hall 1",
      location: "Aeon Mall 1",
    },
    seats: ["E4"],
    pricePerSeat: 4.0,
    totalSeats: 1,
    totalPrice: 4.0,
  },
  {
    id: "TKT-H006",
    status: "completed",
    movie: {
      title: "Oppenheimer",
      poster:
        "https://i.pinimg.com/1200x/95/26/68/9526684fe11e38cf6bb6fbd48e37de6a.jpg",
      duration: "3h 0m",
      genres: ["Biography", "Drama"],
    },
    showtime: {
      date: "Feb 14, 2026",
      time: "8:00 PM",
      format: "IMAX",
      hall: "Hall 4",
      location: "Ciniverse SenSok",
    },
    seats: ["F8", "F9"],
    pricePerSeat: 10.0,
    totalSeats: 2,
    totalPrice: 20.0,
  },
  {
    id: "TKT-H007",
    status: "completed",
    movie: {
      title: "Avatar: The Way of Water",
      poster:
        "https://i.pinimg.com/736x/2a/ef/c6/2aefc65b2901088e81f0037221f75031.jpg",
      duration: "3h 12m",
      genres: ["Action", "Sci-Fi"],
    },
    showtime: {
      date: "Jan 25, 2026",
      time: "5:30 PM",
      format: "3D",
      hall: "Hall 2",
      location: "Legend 271 Mega Mall",
    },
    seats: ["D5", "D6"],
    pricePerSeat: 5.0,
    totalSeats: 2,
    totalPrice: 10.0,
  },
];

export const TICKETS_PER_PAGE = 4;
