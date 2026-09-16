/**
 * Cinema default halls, seat configurations, and concession catalog for Ciniverse
 */

export const HALLS = [
  {
    id: 'hall-imax-1',
    name: 'Hall 1 — IMAX Laser Experience',
    screenType: 'IMAX 4K Laser 12-Channel Audio',
    capacity: 96,
    totalRows: 8,
    seatsPerRow: 12,
    rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    vipRows: ['G', 'H'],
    basePrice: 18.00,
    vipPrice: 26.50
  },
  {
    id: 'hall-dolby-2',
    name: 'Hall 2 — Dolby Cinema Atmos',
    screenType: 'Dolby Vision HDR & Dolby Atmos Sound',
    capacity: 72,
    totalRows: 6,
    seatsPerRow: 12,
    rows: ['A', 'B', 'C', 'D', 'E', 'F'],
    vipRows: ['E', 'F'],
    basePrice: 16.50,
    vipPrice: 24.00
  },
  {
    id: 'hall-vip-3',
    name: 'Hall 3 — VIP Luxe Recliner Lounge',
    screenType: 'Laser Projection with Heated Recliners',
    capacity: 48,
    totalRows: 4,
    seatsPerRow: 12,
    rows: ['A', 'B', 'C', 'D'],
    vipRows: ['A', 'B', 'C', 'D'],
    basePrice: 28.00,
    vipPrice: 28.00
  }
];

export const CONCESSIONS_CATALOG = [
  {
    id: 'popcorn-caramel-large',
    name: 'Gourmet Caramel Popcorn',
    category: 'Popcorn',
    size: 'Large Bucket',
    price: 8.50,
    image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=400&q=80',
    description: 'Freshly popped, coated in rich handcrafted golden caramel.'
  },
  {
    id: 'popcorn-butter-large',
    name: 'Classic Movie Butter Popcorn',
    category: 'Popcorn',
    size: 'Large Tub',
    price: 7.50,
    image: 'https://images.unsplash.com/photo-1512149177596-f817c7ef5d4c?auto=format&fit=crop&w=400&q=80',
    description: 'Crisp warm corn layered with creamy theater-style melted butter.'
  },
  {
    id: 'nachos-deluxe',
    name: 'Fiesta Nachos Supreme',
    category: 'Hot Snacks',
    size: 'Platter',
    price: 9.75,
    image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=400&q=80',
    description: 'Crispy corn tortilla chips with warm jalapeño cheese dip and spicy salsa.'
  },
  {
    id: 'icee-blue-raspberry',
    name: 'Artic Icee — Blue Raspberry',
    category: 'Beverages',
    size: '32 oz',
    price: 6.25,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80',
    description: 'Sub-zero slushie burst with tangy blue raspberry sweetness.'
  },
  {
    id: 'soda-fountain',
    name: 'Fountain Soda (Coca-Cola / Sprite)',
    category: 'Beverages',
    size: '32 oz',
    price: 5.50,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80',
    description: 'Chilled fountain soft drink with free single refill.'
  },
  {
    id: 'combo-blockbuster',
    name: 'Blockbuster Duo Combo',
    category: 'Combos',
    size: 'Serves 2',
    price: 18.50,
    badge: 'Best Value - Save $4.00',
    image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=400&q=80',
    description: '1 Large Popcorn + 2 Large Fountain Drinks + 1 Choice Candy Box.'
  },
  {
    id: 'combo-vip-luxe',
    name: 'VIP Luxe Truffle & Champagne Combo',
    category: 'Combos',
    size: 'Premium',
    price: 34.00,
    badge: 'VIP Signature',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=400&q=80',
    description: 'Black truffle parmesan popcorn paired with mini chilled champagne splits.'
  }
];

// Helper to generate dynamic upcoming showtime dates & slots
export function getUpcomingDates(daysCount = 7) {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < daysCount; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    dates.push({
      dateStr,
      dayName,
      monthDay,
      isToday: i === 0
    });
  }
  return dates;
}

export function generateDefaultShowtimes(movieId, movieTitle) {
  const dates = getUpcomingDates(7);
  const timeSlots = [
    { time: '11:00 AM', hallId: 'hall-imax-1', hallName: 'Hall 1 (IMAX)', price: 16.00, format: 'IMAX 2D' },
    { time: '02:15 PM', hallId: 'hall-dolby-2', hallName: 'Hall 2 (Dolby)', price: 17.50, format: 'Dolby Atmos' },
    { time: '05:30 PM', hallId: 'hall-imax-1', hallName: 'Hall 1 (IMAX)', price: 20.00, format: 'IMAX 3D' },
    { time: '08:45 PM', hallId: 'hall-vip-3', hallName: 'Hall 3 (VIP Lounge)', price: 28.00, format: 'VIP Recliner' },
    { time: '11:15 PM', hallId: 'hall-dolby-2', hallName: 'Hall 2 (Dolby)', price: 18.00, format: 'Late Night Dolby' },
  ];

  const showtimes = [];
  dates.forEach(dateObj => {
    timeSlots.forEach((slot, index) => {
      showtimes.push({
        id: `st_${movieId}_${dateObj.dateStr}_${index + 1}`,
        movieId: String(movieId),
        movieTitle,
        date: dateObj.dateStr,
        time: slot.time,
        hallId: slot.hallId,
        hallName: slot.hallName,
        format: slot.format,
        basePrice: slot.price,
        vipPrice: slot.price + 8.00
      });
    });
  });

  return showtimes;
}
