/**
 * Hall Configurations and Date-Specific Schedule Architecture
 * 2 Hall Types (Standard, VIP) x 3 Screen Formats (2D, 3D, ScreenX) = 6 Configurations
 */

export const HALL_CATEGORIES = {
  STANDARD: "standard",
  VIP: "vip",
};

export const SCREEN_FORMATS = {
  FORMAT_2D: "2d",
  FORMAT_3D: "3d",
  SCREEN_X: "screenx",
};

export const HALL_TYPES = {
  STANDARD_2D: "standard_2d",
  STANDARD_3D: "standard_3d",
  STANDARD_SCREENX: "standard_screenx",
  VIP_2D: "vip_2d",
  VIP_3D: "vip_3d",
  VIP_SCREENX: "vip_screenx",
  // Backward compatibility aliases
  LASER_3D: "standard_3d",
  SCREEN_X: "standard_screenx",
  GOLD_CLASS: "vip_2d",
};

export const AVAILABLE_BRANCHES = [
  "Ciniverse SenSok",
  "Ciniverse Eden Garden",
  "Ciniverse MeanChey",
  "Ciniverse Aeon Mall SenSok",
  "Ciniverse Toul Kork",
];

export const HALL_CONFIGS = {
  // 1. Standard Hall - 2D Screen
  standard_2d: {
    id: "standard_2d",
    hallCategory: "standard",
    screenFormat: "2d",
    name: "Standard Hall - 2D Screen",
    badge: "2D SCREEN",
    badgeType: "2d",
    accentColor: "#cc0000",
    screenArcColor: "#cc0000",
    screenLabel: "2D Digital Projection Screen",
    totalCols: 12,
    rows: ["H", "G", "F", "E", "D", "C", "B", "A"],
    aisleIndices: [2, 10],
    pricing: {
      single: 5.0,
      couple: 10.0,
    },
    coupleRows: ["A"],
    features: ["4K Crystal Clear Projection", "Dolby Surround 7.1"],
  },

  // 2. Standard Hall - 3D RealD Laser
  standard_3d: {
    id: "standard_3d",
    hallCategory: "standard",
    screenFormat: "3d",
    name: "Standard Hall - 3D RealD Laser",
    badge: "3D REALD",
    badgeType: "3d",
    accentColor: "#00d2ff",
    screenArcColor: "#00d2ff",
    screenLabel: "3D RealD Laser Silver Screen",
    totalCols: 12,
    rows: ["H", "G", "F", "E", "D", "C", "B", "A"],
    aisleIndices: [2, 10],
    pricing: {
      single: 6.5,
      couple: 12.0,
    },
    coupleRows: ["A"],
    prime3dRows: ["D", "E", "F"],
    features: [
      "Includes Sanitized RealD 3D Glasses",
      "High-Contrast Silver Screen",
    ],
  },

  // 3. Standard Hall - ScreenX 270° Panoramic
  standard_screenx: {
    id: "standard_screenx",
    hallCategory: "standard",
    screenFormat: "screenx",
    name: "Standard Hall - ScreenX 270°",
    badge: "SCREEN X",
    badgeType: "screen_x",
    accentColor: "#ec4899",
    screenArcColor: "#ec4899",
    screenLabel: "ScreenX 270° Panoramic Multi-Screen",
    totalCols: 14,
    rows: ["G", "F", "E", "D", "C", "B", "A"],
    aisleIndices: [3, 11],
    pricing: {
      single: 8.0,
      couple: 15.0,
    },
    coupleRows: ["A"],
    features: ["270-Degree Tri-Screen Projections", "Immersive Surround Sound"],
  },

  // 4. VIP Lounge Hall - 2D Recliner
  vip_2d: {
    id: "vip_2d",
    hallCategory: "vip",
    screenFormat: "2d",
    name: "VIP Lounge Hall - 2D Recliner",
    badge: "2D VIP",
    badgeType: "gold_class",
    accentColor: "#f59e0b",
    screenArcColor: "#eab308",
    screenLabel: "VIP 2D Luxury Screen",
    totalCols: 6,
    rows: ["F", "E", "D", "C", "B", "A"],
    aisleIndices: [2, 4],
    pricing: {
      vip: 11.0,
    },
    coupleRows: [],
    features: [
      "Ultra-wide Motorized Leather Recliners",
      "Complimentary Welcome Drink & Blanket",
    ],
  },

  // 5. VIP Lounge Hall - 3D RealD VIP
  vip_3d: {
    id: "vip_3d",
    hallCategory: "vip",
    screenFormat: "3d",
    name: "VIP Lounge Hall - 3D VIP Laser",
    badge: "3D VIP",
    badgeType: "gold_class",
    accentColor: "#f59e0b",
    screenArcColor: "#00d2ff",
    screenLabel: "VIP 3D RealD Laser Screen",
    totalCols: 6,
    rows: ["F", "E", "D", "C", "B", "A"],
    aisleIndices: [2, 4],
    pricing: {
      vip: 13.0,
    },
    coupleRows: [],
    features: [
      "Motorized Leather Recliners",
      "RealD 3D Glasses Included",
      "VIP Service",
    ],
  },

  // 6. VIP Lounge Hall - ScreenX 270° VIP
  vip_screenx: {
    id: "vip_screenx",
    hallCategory: "vip",
    screenFormat: "screenx",
    name: "VIP Lounge Hall - ScreenX VIP",
    badge: "SCREEN X VIP",
    badgeType: "gold_class",
    accentColor: "#f59e0b",
    screenArcColor: "#ec4899",
    screenLabel: "VIP ScreenX 270° Panoramic",
    totalCols: 6,
    rows: ["F", "E", "D", "C", "B", "A"],
    aisleIndices: [2, 4],
    pricing: {
      vip: 15.0,
    },
    coupleRows: [],
    features: [
      "Motorized Leather Recliners",
      "270-Degree Tri-Screen Projections",
      "VIP Service",
    ],
  },
};

// Aliases for backward compatibility with existing data
HALL_CONFIGS.laser_3d = HALL_CONFIGS.standard_3d;
HALL_CONFIGS.screen_x = HALL_CONFIGS.standard_screenx;
HALL_CONFIGS.gold_class = HALL_CONFIGS.vip_2d;

/**
 * Base template halls for a branch (Defaults with the 6 configurations)
 */
export function getBaseHallsTemplate(branchName = "Ciniverse SenSok") {
  return [
    {
      id: "hall-std-2d",
      name: branchName,
      hallName: "Standard Hall - 2D Screen",
      hallType: "standard_2d",
      hallCategory: "standard",
      screenFormat: "2d",
      price: 5.0,
      badges: ["2D SCREEN", "KH", "EN"],
      times: ["10:30 AM", "01:15 PM", "04:30 PM"],
    },
    {
      id: "hall-std-3d",
      name: branchName,
      hallName: "Standard Hall - 3D RealD",
      hallType: "standard_3d",
      hallCategory: "standard",
      screenFormat: "3d",
      price: 6.5,
      badges: ["3D REALD", "KH", "EN"],
      times: ["02:00 PM", "07:00 PM"],
    },
    {
      id: "hall-std-screenx",
      name: branchName,
      hallName: "Standard Hall - ScreenX 270°",
      hallType: "standard_screenx",
      hallCategory: "standard",
      screenFormat: "screenx",
      price: 8.0,
      badges: ["SCREEN X", "KH", "EN"],
      times: ["08:30 PM", "11:15 PM"],
    },
    {
      id: "hall-vip-2d",
      name: branchName,
      hallName: "VIP Lounge Hall - 2D Recliner",
      hallType: "vip_2d",
      hallCategory: "vip",
      screenFormat: "2d",
      price: 11.0,
      badges: ["VIP LOUNGE", "2D VIP", "KH", "EN"],
      times: ["11:00 AM", "03:30 PM"],
    },
    {
      id: "hall-vip-3d",
      name: branchName,
      hallName: "VIP Lounge Hall - 3D VIP Laser",
      hallType: "vip_3d",
      hallCategory: "vip",
      screenFormat: "3d",
      price: 13.0,
      badges: ["VIP LOUNGE", "3D VIP", "KH", "EN"],
      times: ["06:00 PM"],
    },
    {
      id: "hall-vip-screenx",
      name: branchName,
      hallName: "VIP Lounge Hall - ScreenX VIP",
      hallType: "vip_screenx",
      hallCategory: "vip",
      screenFormat: "screenx",
      price: 15.0,
      badges: ["VIP LOUNGE", "SCREEN X VIP", "KH", "EN"],
      times: ["09:00 PM"],
    },
  ];
}

/**
 * Get halls and showtimes for a specific date from a branch (100% independent per date)
 */
export function getHallsForDate(branch, dateStr) {
  if (!branch) return [];

  if (branch.scheduleByDate && dateStr && branch.scheduleByDate[dateStr]) {
    return branch.scheduleByDate[dateStr];
  }

  if (branch.halls && Array.isArray(branch.halls) && branch.halls.length > 0) {
    return branch.halls;
  }

  return getBaseHallsTemplate(branch.branchName);
}

/**
 * Helper to generate default branch schedules with independent day schedules
 */
export function createDefaultBranchSchedules() {
  const baseSenSokHalls = [
    {
      id: "sensok-2d",
      name: "Ciniverse SenSok",
      hallName: "Regular Hall - 2D Screen",
      hallType: "standard_2d",
      hallCategory: "standard",
      screenFormat: "2d",
      screenType: "2D",
      goldClass: false,
      price: 5.0,
      badges: ["2D SCREEN", "KH", "EN"],
      audio: "EN",
      subtitle: "KH",
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
      name: "Ciniverse SenSok",
      hallName: "Regular Hall - ScreenX 270°",
      hallType: "standard_screenx",
      hallCategory: "standard",
      screenFormat: "screenx",
      screenType: "SCREEN X",
      goldClass: false,
      price: 8.0,
      badges: ["SCREEN X", "KH", "EN"],
      audio: "EN",
      subtitle: "KH",
      times: ["09:00 PM", "12:45 PM", "03:45 PM"],
    },
    {
      id: "sensok-gold",
      name: "Ciniverse SenSok",
      hallName: "Gold Class VIP Recliner",
      hallType: "vip_2d",
      hallCategory: "vip",
      screenFormat: "2d",
      screenType: "GOLD",
      goldClass: true,
      price: 11.0,
      badges: ["GOLD CLASS", "VIP", "KH", "EN"],
      audio: "EN",
      subtitle: "KH",
      times: ["10:30 AM", "02:00 PM", "05:30 PM"],
    },
  ];

  const baseEdenHalls = [
    {
      id: "eden-2d",
      name: "Ciniverse Eden Garden",
      hallName: "Regular Hall - 2D Screen",
      hallType: "standard_2d",
      hallCategory: "standard",
      screenFormat: "2d",
      screenType: "2D",
      goldClass: false,
      price: 5.0,
      badges: ["2D SCREEN", "KH", "EN"],
      audio: "EN",
      subtitle: "KH",
      times: ["11:00 AM", "02:30 PM", "06:00 PM", "08:45 PM"],
    },
    {
      id: "eden-gold",
      name: "Ciniverse Eden Garden",
      hallName: "Gold Class VIP Recliner",
      hallType: "vip_2d",
      hallCategory: "vip",
      screenFormat: "2d",
      screenType: "GOLD",
      goldClass: true,
      price: 11.0,
      badges: ["GOLD CLASS", "VIP", "KH", "EN"],
      audio: "EN",
      subtitle: "KH",
      times: ["01:00 PM", "05:30 PM", "09:15 PM"],
    },
  ];

  const baseMeanCheyHalls = [
    {
      id: "meanchey-2d",
      name: "Ciniverse MeanChey",
      hallName: "Regular Hall - 2D Screen",
      hallType: "standard_2d",
      hallCategory: "standard",
      screenFormat: "2d",
      screenType: "2D",
      goldClass: false,
      price: 5.0,
      badges: ["2D SCREEN", "KH", "EN"],
      audio: "EN",
      subtitle: "KH",
      times: ["10:00 AM", "01:00 PM", "04:30 PM", "08:00 PM"],
    },
  ];

  const baseAeonHalls = [
    {
      id: "aeon-2d",
      name: "Ciniverse Aeon Mall SenSok",
      hallName: "Regular Hall - 2D Screen",
      hallType: "standard_2d",
      hallCategory: "standard",
      screenFormat: "2d",
      screenType: "2D",
      goldClass: false,
      price: 5.0,
      badges: ["2D SCREEN", "KH", "EN"],
      audio: "EN",
      subtitle: "KH",
      times: ["09:30 AM", "12:00 PM", "03:15 PM", "06:30 PM"],
    },
    {
      id: "aeon-gold",
      name: "Ciniverse Aeon Mall SenSok",
      hallName: "Gold Class VIP Recliner",
      hallType: "vip_2d",
      hallCategory: "vip",
      screenFormat: "2d",
      screenType: "GOLD",
      goldClass: true,
      price: 11.0,
      badges: ["GOLD CLASS", "VIP", "KH", "EN"],
      audio: "EN",
      subtitle: "KH",
      times: ["11:00 AM", "03:00 PM", "07:00 PM"],
    },
  ];

  const baseToulKorkHalls = [
    {
      id: "toulkork-2d",
      name: "Ciniverse Toul Kork",
      hallName: "Regular Hall - 2D Screen",
      hallType: "standard_2d",
      hallCategory: "standard",
      screenFormat: "2d",
      screenType: "2D",
      goldClass: false,
      price: 5.0,
      badges: ["2D SCREEN", "KH", "EN"],
      audio: "EN",
      subtitle: "KH",
      times: ["10:00 AM", "01:00 PM", "04:30 PM", "08:00 PM"],
    },
    {
      id: "toulkork-gold",
      name: "Ciniverse Toul Kork",
      hallName: "Gold Class VIP Recliner",
      hallType: "vip_2d",
      hallCategory: "vip",
      screenFormat: "2d",
      screenType: "GOLD",
      goldClass: true,
      price: 11.0,
      badges: ["GOLD CLASS", "VIP", "KH", "EN"],
      audio: "EN",
      subtitle: "KH",
      times: ["11:30 AM", "03:30 PM", "07:30 PM"],
    },
  ];

  const defaultDates = [
    "2026-08-25",
    "2026-08-26",
    "2026-08-27",
    "2026-08-28",
    "2026-08-29",
    "2026-08-30",
    "2026-08-31",
    "2026-09-01",
  ];

  const buildScheduleByDate = (halls) => {
    const map = {};
    defaultDates.forEach((d) => {
      map[d] = JSON.parse(JSON.stringify(halls));
    });
    return map;
  };

  return [
    {
      id: "sensok",
      branchName: "Ciniverse SenSok",
      location: "Ciniverse SenSok",
      halls: JSON.parse(JSON.stringify(baseSenSokHalls)),
      scheduleByDate: buildScheduleByDate(baseSenSokHalls),
    },
    {
      id: "eden",
      branchName: "Ciniverse Eden Garden",
      location: "Ciniverse Eden Garden",
      halls: JSON.parse(JSON.stringify(baseEdenHalls)),
      scheduleByDate: buildScheduleByDate(baseEdenHalls),
    },
    {
      id: "meanchey",
      branchName: "Ciniverse MeanChey",
      location: "Ciniverse MeanChey",
      halls: JSON.parse(JSON.stringify(baseMeanCheyHalls)),
      scheduleByDate: buildScheduleByDate(baseMeanCheyHalls),
    },
    {
      id: "aeon",
      branchName: "Ciniverse Aeon Mall SenSok",
      location: "Ciniverse Aeon Mall SenSok",
      halls: JSON.parse(JSON.stringify(baseAeonHalls)),
      scheduleByDate: buildScheduleByDate(baseAeonHalls),
    },
    {
      id: "toulkork",
      branchName: "Ciniverse Toul Kork",
      location: "Ciniverse Toul Kork",
      halls: JSON.parse(JSON.stringify(baseToulKorkHalls)),
      scheduleByDate: buildScheduleByDate(baseToulKorkHalls),
    },
  ];
}

/**
 * Helper to get Hall Config by key
 */
export function getHallConfig(typeKey) {
  if (!typeKey) return HALL_CONFIGS.standard_2d;
  const key = typeKey.toLowerCase().replace(/[\s-]/g, "_");

  // Check direct key match
  if (HALL_CONFIGS[key]) return HALL_CONFIGS[key];

  // VIP Hall variations
  if (key.includes("vip") || key.includes("gold")) {
    if (key.includes("screenx") || key.includes("screen_x"))
      return HALL_CONFIGS.vip_screenx;
    if (key.includes("3d") || key.includes("reald") || key.includes("laser"))
      return HALL_CONFIGS.vip_3d;
    return HALL_CONFIGS.vip_2d;
  }

  // Standard Hall variations
  if (key.includes("screenx") || key.includes("screen_x"))
    return HALL_CONFIGS.standard_screenx;
  if (key.includes("3d") || key.includes("reald") || key.includes("laser"))
    return HALL_CONFIGS.standard_3d;

  return HALL_CONFIGS.standard_2d;
}

/**
 * Generate Initial Seats Grid based on Hall Config
 */
export function generateHallSeats(hallConfig) {
  const seats = [];
  const isVipHall =
    hallConfig.hallCategory === "vip" ||
    hallConfig.id.startsWith("vip_") ||
    hallConfig.id === "gold_class";

  hallConfig.rows.forEach((rowLetter) => {
    const isCoupleRow = hallConfig.coupleRows?.includes(rowLetter);

    for (let col = 1; col <= hallConfig.totalCols; col++) {
      const seatId = `${rowLetter}${col}`;

      let isReserved = false;
      if (isVipHall) {
        if (
          (rowLetter === "F" ||
            rowLetter === "E" ||
            rowLetter === "B" ||
            rowLetter === "A") &&
          (col === 1 || col === 2)
        ) {
          isReserved = true;
        }
      } else {
        if (
          ((rowLetter === "H" || rowLetter === "G") &&
            (col === 1 || col === 2)) ||
          (rowLetter === "F" && col >= 3 && col <= 10) ||
          ((rowLetter === "E" ||
            rowLetter === "D" ||
            rowLetter === "C" ||
            rowLetter === "B") &&
            ((col >= 1 && col <= 2) ||
              (col >= 3 && col <= 10) ||
              (col >= 11 && col <= 12))) ||
          (rowLetter === "A" &&
            (col === 1 ||
              col === 2 ||
              col === 3 ||
              col === 4 ||
              col === 9 ||
              col === 10))
        ) {
          isReserved = true;
        }
      }

      let type = "single";
      let price = hallConfig.pricing.single || 5.0;

      if (isVipHall) {
        type = "vip";
        price = hallConfig.pricing.vip || 11.0;
      } else if (isCoupleRow) {
        type = "couple";
        price = hallConfig.pricing.couple || 10.0;
      }

      seats.push({
        id: seatId,
        row: rowLetter,
        number: col,
        type,
        price,
        isReserved,
        isPrime3D: hallConfig.prime3dRows?.includes(rowLetter) || false,
      });
    }
  });

  return seats;
}
