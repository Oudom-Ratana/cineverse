/**
 * seatLayoutData.js
 * Configurations, prices, and constants for cinema seat selection
 */

export const GOLD_PRICE = 11.0;
export const STANDARD_SINGLE_PRICE = 5.0;
export const STANDARD_COUPLE_PRICE = 10.0;

// Gold Class Seat Grid Definition: 6 Rows (F down to A), 6 Cols (1-2, 3-4, 5-6)
export const GOLD_ROWS = ["F", "E", "D", "C", "B", "A"];
export const GOLD_COL_GROUPS = [
  [1, 2],
  [3, 4],
  [5, 6],
];

// Standard Hall Seat Grid Definition: 8 Rows (H down to A)
export const STANDARD_ROWS = ["H", "G", "F", "E", "D", "C", "B", "A"];
export const STANDARD_COL_GROUPS = [
  [1, 2],
  [3, 4, 5, 6, 7, 8, 9, 10],
  [11, 12],
];

// Row A Couple Seat Pairs matching Figma layout:
// Pair 1: [1, 2] under cols 1, 2
// Pair 2: [3, 4] under cols 3, 4
// Pair 3: [5, 6] under cols 5, 6
// Pair 4: [8, 9] under cols 8, 9
// Pair 5: [11, 12] under cols 11, 12
export const COUPLE_PAIRS = [
  [1, 2],
  [3, 4],
  [5, 6],
  [8, 9],
  [11, 12],
];

export const getCouplePair = (col) =>
  COUPLE_PAIRS.find((p) => p.includes(col)) || null;

// Realistic default reserved seats matching mockups
export const DEFAULT_GOLD_RESERVED = new Set([
  // Cols 1 and 2 (all 6 rows reserved)
  "F1",
  "F2",
  "E1",
  "E2",
  "D1",
  "D2",
  "C1",
  "C2",
  "B1",
  "B2",
  "A1",
  "A2",
  // Cols 3 and 4 (F, E, B, A reserved; D3-D4 and C3-C4 available for selection)
  "F3",
  "F4",
  "E3",
  "E4",
  "B3",
  "B4",
  "A3",
  "A4",
]);

export const DEFAULT_STANDARD_RESERVED = new Set([
  // Row H
  "H1",
  "H2",
  // Row G
  "G1",
  "G2",
  // Row F
  "F1",
  "F2",
  "F3",
  "F4",
  "F5",
  "F6",
  "F7",
  "F8",
  // Row E (all reserved)
  "E1",
  "E2",
  "E3",
  "E4",
  "E5",
  "E6",
  "E7",
  "E8",
  "E9",
  "E10",
  "E11",
  "E12",
  // Row D (D1-D2 & D5-D12 reserved; D3-D4 available to select)
  "D1",
  "D2",
  "D5",
  "D6",
  "D7",
  "D8",
  "D9",
  "D10",
  "D11",
  "D12",
  // Row C (all reserved)
  "C1",
  "C2",
  "C3",
  "C4",
  "C5",
  "C6",
  "C7",
  "C8",
  "C9",
  "C10",
  "C11",
  "C12",
  // Row B (all reserved)
  "B1",
  "B2",
  "B3",
  "B4",
  "B5",
  "B6",
  "B7",
  "B8",
  "B9",
  "B10",
  "B11",
  "B12",
  // Row A Couple pairs (A1-A2, A3-A4, A8-A9 reserved; A5-A6 & A11-A12 available)
  "A1",
  "A2",
  "A3",
  "A4",
  "A8",
  "A9",
]);

/**
 * Generates unique, realistic reserved seats for each specific showtime
 * using a deterministic hash of (movieId + date + time + hallType).
 */
export function getReservedSeatsForShowtime(hallType, movieId, date, time) {
  const seedStr = `${movieId || "m"}-${date || "d"}-${time || "t"}-${hallType}`;
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  const reserved = new Set();

  if (hallType === "gold") {
    GOLD_ROWS.forEach((row, rIdx) => {
      for (let col = 1; col <= 6; col++) {
        const seatVal = (absHash + rIdx * 11 + col * 7) % 100;
        const isCenter =
          (row === "D" || row === "C") && (col === 3 || col === 4);
        if (!isCenter && seatVal < 35) {
          reserved.add(`${row}${col}`);
        }
      }
    });
    if (reserved.size < 6) {
      DEFAULT_GOLD_RESERVED.forEach((s) => reserved.add(s));
    }
  } else {
    STANDARD_ROWS.forEach((row, rIdx) => {
      if (row === "A") {
        COUPLE_PAIRS.forEach((pair, pIdx) => {
          const pairVal = (absHash + pIdx * 17) % 100;
          if (pairVal < 40) {
            reserved.add(`A${pair[0]}`);
            reserved.add(`A${pair[1]}`);
          }
        });
      } else {
        for (let col = 1; col <= 12; col++) {
          const seatVal = (absHash + rIdx * 17 + col * 13) % 100;
          const isCenter = (row === "D" || row === "E") && col >= 5 && col <= 8;
          if (!isCenter && seatVal < 32) {
            reserved.add(`${row}${col}`);
          }
        }
      }
    });
    if (reserved.size < 12) {
      DEFAULT_STANDARD_RESERVED.forEach((s) => reserved.add(s));
    }
  }

  return reserved;
}
