import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API_BASE_URL from '@/config/api';
import axios from "axios";

const initialState = {
  isLoading: false,
  addressList: [],
  selectedAddress: null,  // Added for address selection
  error: null
};

export const addNewAddress = createAsyncThunk(
  "/addresses/addNewAddress",
  async (formData) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/shop/address/add`,
      formData
    );
    return response.data;
  }
);

export const fetchAllAddresses = createAsyncThunk(
  "/addresses/fetchAllAddresses",
  async (userId) => {
    const response = await axios.get(
      `${API_BASE_URL}/api/shop/address/get/${userId}`
    );
    return response.data;
  }
);

export const editAddress = createAsyncThunk(
  "/addresses/editAddress",
  async ({userId, addressId, formData}) => {
      console.log('Editing address with ID:', addressId); // Add this to verify the ID
      const response = await axios.put(
          `${API_BASE_URL}/api/shop/address/update/${userId}/${addressId}`,
          formData
      );
      return response.data;
  }
);

export const deleteAddress = createAsyncThunk(
  "/addresses/deleteAddress",
  async ({userId, addressId}) => {
    const response = await axios.delete(
      `${API_BASE_URL}/api/shop/address/delete/${userId}/${addressId}`
    );
    return response.data;
  }
);

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    selectAddress: (state, action) => {
      state.selectedAddress = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Add New Address
      .addCase(addNewAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addNewAddress.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(addNewAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Fetch All Addresses
      .addCase(fetchAllAddresses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllAddresses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addressList = action.payload.data;
        state.error = null;
      })
      .addCase(fetchAllAddresses.rejected, (state, action) => {
        state.isLoading = false;
        state.addressList = [];
        state.error = action.error.message;
      })
      // Edit Address
      .addCase(editAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(editAddress.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(editAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Delete Address
      .addCase(deleteAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAddress.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { selectAddress } = addressSlice.actions;
export default addressSlice.reducer;

// This is client/src/store/shop/address-slice/index.js