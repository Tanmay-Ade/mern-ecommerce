import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import API_BASE_URL from '@/config/api';
import axios from "axios";

export const fetchBanners = createAsyncThunk(
  "shop/banners/fetch",
  async () => {
    const result = await axios.get(
      `${API_BASE_URL}/api/admin/banners/get`
    );
    return result?.data;
  }
);

const bannerSlice = createSlice({
  name: "shopBanners",
  initialState: {
    banners: [],
    isLoading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanners.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.isLoading = false;
        state.banners = action.payload.message;
      })
      .addCase(fetchBanners.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default bannerSlice.reducer;

// This is client/src/store/shop/banner-slice/index.js