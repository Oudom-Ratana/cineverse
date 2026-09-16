import { TMDB_100_MOVIES } from "./tmdbCatalog";

export const MOCK_MOVIES = TMDB_100_MOVIES;

export const MOCK_COMING_SOON = [
  {
    id: 301,
    title: "Godzilla x Kong: Supernova",
    banner:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
    logoText: "GODZILLA x KONG\nSUPERNOVA",
    release_date: "15 MAR 2025",
    color: "from-amber-600 to-rose-900",
  },
  {
    id: 302,
    title: "Star Wars: Starfighter",
    banner:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    logoText: "STAR WARS\nSTARFIGHTER",
    release_date: "22 APR 2025",
    color: "from-neutral-900 to-neutral-950",
  },
  {
    id: 303,
    title: "Sonic the Hedgehog 4",
    banner:
      "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80",
    logoText: "SONIC 4",
    release_date: "18 DEC 2025",
    color: "from-blue-600 to-pink-600",
  },
];

export const MOCK_CINEMAS = [
  {
    id: "cinema-1",
    name: "Major Cineplex - Aeon Mall 1",
    location: "Phnom Penh, Samdach Sothearos Blvd",
    halls: ["IMAX Laser Hall 1", "VIP Lounge Hall 2", "Digital 2D Hall 3"],
  },
  {
    id: "cinema-2",
    name: "Legend Cinema - Eden Garden",
    location: "Phnom Penh, Phnom Penh City Center",
    halls: ["ScreenX Hall 1", "Diamond Class VIP", "Standard Hall 2"],
  },
  {
    id: "cinema-3",
    name: "Prime Cineplex - Samai Square",
    location: "Phnom Penh, Toul Kork",
    halls: ["Dolby Atmos Hall 1", "Sweetbox Couple Hall 2"],
  },
];

export const MOCK_SHOWTIMES = [
  {
    id: "st-1",
    time: "10:30 AM",
    format: "2D Digital",
    price: 4.5,
    hall: "Hall 3",
  },
  {
    id: "st-2",
    time: "01:15 PM",
    format: "3D IMAX",
    price: 7.5,
    hall: "IMAX Laser Hall 1",
  },
  {
    id: "st-3",
    time: "04:00 PM",
    format: "VIP Dolby Atmos",
    price: 10.0,
    hall: "VIP Lounge Hall 2",
  },
  {
    id: "st-4",
    time: "07:30 PM",
    format: "3D IMAX",
    price: 8.5,
    hall: "IMAX Laser Hall 1",
  },
  {
    id: "st-5",
    time: "10:15 PM",
    format: "2D Digital",
    price: 5.0,
    hall: "Hall 3",
  },
];

export const MOCK_CONCESSIONS = [
  {
    id: "c1",
    name: "Caramel Popcorn Combo (L)",
    description: "1x Large Caramel Popcorn + 2x Soft Drinks (32oz)",
    price: 5.5,
    category: "Combo",
    image: "🍿",
  },
  {
    id: "c2",
    name: "Cheese Lover Popcorn (M)",
    description: "1x Medium Cheddar Cheese Popcorn + 1x Soda",
    price: 4.0,
    category: "Popcorn",
    image: "🧀",
  },
  {
    id: "c3",
    name: "Crispy Hot Dog & Nachos",
    description: "Warm cheese nachos paired with smoked sausage hot dog",
    price: 6.0,
    category: "Snacks",
    image: "🌭",
  },
  {
    id: "c4",
    name: "Iced Milk Tea / Coffee",
    description: "Freshly brewed brown sugar pearl milk tea",
    price: 3.0,
    category: "Beverage",
    image: "🧋",
  },
];

export const SEAT_LAYOUT_CONFIG = {
  rows: ["A", "B", "C", "D", "E", "F", "G", "H"],
  cols: 12,
  vipRows: ["F", "G"],
  coupleRows: ["H"],
  prices: {
    standard: 5.0,
    vip: 8.0,
    couple: 15.0,
  },
};
