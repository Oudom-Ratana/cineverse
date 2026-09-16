import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedItems: {}, // Key: concessionId, Value: { item, quantity }
};

const concessionsSlice = createSlice({
  name: 'concessions',
  initialState,
  reducers: {
    addItem: (state, action) => {
      const item = action.payload;
      if (state.selectedItems[item.id]) {
        state.selectedItems[item.id].quantity += 1;
      } else {
        state.selectedItems[item.id] = { ...item, quantity: 1 };
      }
    },
    removeItem: (state, action) => {
      const id = action.payload;
      if (state.selectedItems[id]) {
        if (state.selectedItems[id].quantity > 1) {
          state.selectedItems[id].quantity -= 1;
        } else {
          delete state.selectedItems[id];
        }
      }
    },
    setQuantity: (state, action) => {
      const { id, quantity, item } = action.payload;
      if (quantity <= 0) {
        delete state.selectedItems[id];
      } else {
        state.selectedItems[id] = { ...(item || state.selectedItems[id]), quantity };
      }
    },
    clearConcessions: (state) => {
      state.selectedItems = {};
    },
  },
});

export const {
  addItem,
  removeItem,
  setQuantity,
  clearConcessions,
} = concessionsSlice.actions;

export default concessionsSlice.reducer;
