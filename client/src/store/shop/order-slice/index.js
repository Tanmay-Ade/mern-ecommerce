import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  orders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,
};

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  };
};

export const fetchUserOrders = createAsyncThunk(
  "orders/fetchUserOrders",
  async (userId) => {
    const response = await axios.get(
      `http://localhost:5000/api/shop/orders/user/${userId}`,
      getAuthHeader()
    );
    return response.data;
  }
);

export const getOrderDetails = createAsyncThunk(
  "orders/getOrderDetails",
  async (orderId) => {
    const response = await axios.get(
      `http://localhost:5000/api/shop/orders/${orderId}`,
      getAuthHeader()
    );
    return response.data;
  }
);

export const updateOrderStatus = createAsyncThunk(
  "orders/updateStatus",
  async ({ orderId, status, note }) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/admin/orders/update-status/${orderId}`,
        { 
          status: status.toLowerCase(),
          note 
        },
        getAuthHeader()
      );
      
      const updatedOrders = await axios.get(
        "http://localhost:5000/api/admin/orders/all",
        getAuthHeader()
      );
      
      return {
        success: true,
        data: response.data.data,
        allOrders: updatedOrders.data.data
      };
    } catch (error) {
      console.log('Update Error:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to update order status');
    }
  }
);

export const fetchAllOrders = createAsyncThunk("orders/fetchAll", async () => {
  const response = await axios.get(
    "http://localhost:5000/api/admin/orders/all",
    getAuthHeader()
  );
  return response.data;
});

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.data;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(getOrderDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedOrder = action.payload.data;
      })
      .addCase(getOrderDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchAllOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.data;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.allOrders;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export default orderSlice.reducer;

// This is client/src/store/shop/order-slice/index.js