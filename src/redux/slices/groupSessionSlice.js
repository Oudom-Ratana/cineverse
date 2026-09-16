import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  groupId: null,
  leaderId: null,
  isLeader: false,
  movie: null,
  showtime: null,
  members: [],
  remoteCursors: {}, // Key: clientId, Value: { seatId, user, color, lastActive }
  groupSelectedSeats: {}, // Key: seatId, Value: { uid, displayName, color }
  isCheckoutTriggered: false,
};

const groupSessionSlice = createSlice({
  name: 'groupSession',
  initialState,
  reducers: {
    setGroupSession: (state, action) => {
      const { groupId, leaderId, movie, showtime, isLeader } = action.payload;
      state.groupId = groupId;
      state.leaderId = leaderId;
      state.movie = movie;
      state.showtime = showtime;
      state.isLeader = isLeader;
      state.isCheckoutTriggered = false;
    },
    setGroupMembers: (state, action) => {
      state.members = action.payload;
    },
    updateRemoteCursor: (state, action) => {
      const { clientId, seatId, user } = action.payload;
      if (!clientId) return;
      state.remoteCursors[clientId] = {
        seatId,
        user,
        color: user?.color || '#06b6d4',
        lastActive: Date.now(),
      };
    },
    removeRemoteCursor: (state, action) => {
      const clientId = action.payload;
      delete state.remoteCursors[clientId];
    },
    setGroupSelectedSeats: (state, action) => {
      state.groupSelectedSeats = action.payload;
    },
    updateSeatSelection: (state, action) => {
      const { seatId, action: selectAction, user } = action.payload;
      if (selectAction === 'select') {
        state.groupSelectedSeats[seatId] = {
          uid: user.uid,
          displayName: user.displayName,
          color: user.color,
        };
      } else {
        delete state.groupSelectedSeats[seatId];
      }
    },
    triggerCheckout: (state) => {
      state.isCheckoutTriggered = true;
    },
    resetGroupSession: (state) => {
      state.groupId = null;
      state.leaderId = null;
      state.isLeader = false;
      state.movie = null;
      state.showtime = null;
      state.members = [];
      state.remoteCursors = {};
      state.groupSelectedSeats = {};
      state.isCheckoutTriggered = false;
    },
  },
});

export const {
  setGroupSession,
  setGroupMembers,
  updateRemoteCursor,
  removeRemoteCursor,
  setGroupSelectedSeats,
  updateSeatSelection,
  triggerCheckout,
  resetGroupSession,
} = groupSessionSlice.actions;

export default groupSessionSlice.reducer;
