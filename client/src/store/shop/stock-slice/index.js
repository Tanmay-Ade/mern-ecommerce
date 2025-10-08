import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial state for stock management
const initialState = {
  stockLevels: {},
  reservations: {},
  isLoading: false,
  error: null
};

// Async thunk for stock reservation
export const reserveStock = createAsyncThunk(
  'stock/reserve',
  async ({ productId, quantity }) => {
    console.log('Sending request:', { productId, quantity }); // ✅ Debug log

    const response = await fetch(`/api/shop/products/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity })
    });

    const data = await response.json();
    console.log('Response:', data); // ✅ Log API response
    return data;
  }
);


// Async thunk for updating stock
export const updateStock = createAsyncThunk(
  'stock/update',
  async ({ productId, quantity, action }) => {
    const response = await fetch(`/api/shop/products/update-stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ productId, quantity }], action })
    });
    return response.json();
  }
);

const stockSlice = createSlice({
  name: 'stock',
  initialState,
  reducers: {
    setStockLevel: (state, action) => {
      const { productId, stock } = action.payload;
      state.stockLevels[productId] = stock;
    },
    addReservation: (state, action) => {
      const { productId, reservationId, expiresAt } = action.payload;
      state.reservations[productId] = { reservationId, expiresAt };
    },
    removeReservation: (state, action) => {
      const { productId } = action.payload;
      delete state.reservations[productId];
    },
    clearStockData: (state) => {
      state.stockLevels = {};
      state.reservations = {};
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(reserveStock.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(reserveStock.fulfilled, (state, action) => {
        state.isLoading = false;
        const { productId, reservationId, expiresAt } = action.payload;
        state.reservations[productId] = { reservationId, expiresAt };
      })
      .addCase(reserveStock.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(updateStock.fulfilled, (state, action) => {
        const { productId, stock } = action.payload;
        state.stockLevels[productId] = stock;
      });
  }
});

export const { 
  setStockLevel, 
  addReservation, 
  removeReservation, 
  clearStockData 
} = stockSlice.actions;

export default stockSlice.reducer;

// This is client/src/store/shop/stock-slice/index.js