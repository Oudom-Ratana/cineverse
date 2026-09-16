import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  movie: null,
  cinema: null,
  showtime: null,
  selectedSeats: [], // Array of { id, row, number, type, price }
  concessions: [], // Array of { id, name, price, quantity, image }
  customerInfo: {
    name: "",
    email: "",
    phone: "",
  },
  paymentMethod: "credit_card", // credit_card, aba_khqr, wing, cash
  step: 1, // 1: Seat Selection, 2: Concessions & Details, 3: Payment/Success
  bookingReference: null,
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setMovie: (state, action) => {
      state.movie = action.payload;
    },
    setCinema: (state, action) => {
      state.cinema = action.payload;
    },
    setShowtime: (state, action) => {
      state.showtime = action.payload;
    },
    toggleSeat: (state, action) => {
      const seat = action.payload;
      const index = state.selectedSeats.findIndex((s) => s.id === seat.id);
      if (index >= 0) {
        state.selectedSeats.splice(index, 1);
      } else {
        state.selectedSeats.push(seat);
      }
    },
    setSelectedSeats: (state, action) => {
      state.selectedSeats = action.payload;
    },
    clearSeats: (state) => {
      state.selectedSeats = [];
    },
    updateConcessionQuantity: (state, action) => {
      const { item, delta } = action.payload;
      const existing = state.concessions.find((c) => c.id === item.id);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) {
          state.concessions = state.concessions.filter((c) => c.id !== item.id);
        } else {
          existing.quantity = newQty;
        }
      } else if (delta > 0) {
        state.concessions.push({ ...item, quantity: 1 });
      }
    },
    setCustomerInfo: (state, action) => {
      state.customerInfo = { ...state.customerInfo, ...action.payload };
    },
    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
    setBookingStep: (state, action) => {
      state.step = action.payload;
    },
    setBookingConfirmation: (state, action) => {
      state.bookingReference = action.payload;
      state.step = 4;
    },
    resetBooking: () => initialState,
  },
});

export const {
  setMovie,
  setCinema,
  setShowtime,
  toggleSeat,
  setSelectedSeats,
  clearSeats,
  updateConcessionQuantity,
  setCustomerInfo,
  setPaymentMethod,
  setBookingStep,
  setBookingConfirmation,
  resetBooking,
} = bookingSlice.actions;

// Compatibility aliases
export const setSelectedShowtime = setShowtime;
export const setBookingMovie = setMovie;
export const setStep = setBookingStep;
export const setGroupMode = (payload) => ({ type: 'booking/setGroupMode', payload });

export const selectBooking = (state) => state.booking;
export const selectSelectedSeats = (state) => state.booking.selectedSeats;
export const selectSeatsTotal = (state) =>
  state.booking.selectedSeats.reduce((acc, seat) => acc + (seat.price || 0), 0);
export const selectConcessionsTotal = (state) =>
  state.booking.concessions.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
export const selectGrandTotal = (state) => {
  const seatsTotal = state.booking.selectedSeats.reduce(
    (acc, s) => acc + (s.price || 0),
    0,
  );
  const concessionsTotal = state.booking.concessions.reduce(
    (acc, c) => acc + c.price * c.quantity,
    0,
  );
  return seatsTotal + concessionsTotal;
};

export default bookingSlice.reducer;
