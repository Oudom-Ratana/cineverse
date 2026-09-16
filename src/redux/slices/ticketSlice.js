import { createSlice } from "@reduxjs/toolkit";
import { MOCK_TICKETS } from "../../data/ticketData";

const STORAGE_KEY = "Ciniverse_booked_tickets";

// Load user-booked tickets from localStorage
const loadInitialTickets = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const initialState = {
  userTickets: loadInitialTickets(),
};

export const ticketSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {
    setUserTickets: (state, action) => {
      const tickets = action.payload || [];
      state.userTickets = tickets;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
      } catch (e) {}
    },
    addTicket: (state, action) => {
      const newTicket = action.payload;
      if (!newTicket || !newTicket.id) return;

      // Prevent duplicate entry by ticket ID
      const index = state.userTickets.findIndex(
        (t) => t.id === newTicket.id || t.bookingRef === newTicket.id,
      );
      if (index >= 0) {
        state.userTickets[index] = {
          ...state.userTickets[index],
          ...newTicket,
        };
      } else {
        state.userTickets.unshift(newTicket);
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.userTickets));
        if (newTicket.userId) {
          localStorage.setItem(
            `Ciniverse_tickets_${newTicket.userId}`,
            JSON.stringify(state.userTickets),
          );
        }
      } catch (e) {
        console.error("Failed to persist booked ticket to localStorage", e);
      }
    },
    clearAllUserTickets: (state) => {
      state.userTickets = [];
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.error("Failed to clear booked tickets from localStorage", e);
      }
    },
  },
});

export const { addTicket, setUserTickets, clearAllUserTickets } =
  ticketSlice.actions;

export const selectUserTickets = (state) => state.tickets.userTickets;
export const selectAllTickets = (state) => {
  const userTickets = state.tickets.userTickets || [];
  // If user has real booked tickets, display their authentic tickets with priority
  if (userTickets.length > 0) {
    return userTickets;
  }
  return MOCK_TICKETS;
};

export default ticketSlice.reducer;
