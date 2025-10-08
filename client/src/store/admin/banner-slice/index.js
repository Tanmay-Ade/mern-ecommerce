import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  bannerList: [],
};

export const addNewBanner = createAsyncThunk(
  "/banners/addnewbanner",
  async (formData) => {
    const result = await axios.post(
      "http://localhost:5000/api/admin/banners/add",
      formData
    );
    return result?.data;
  }
);

export const fetchAllBanners = createAsyncThunk(
  "/banners/fetchallbanners",
  async () => {
    const result = await axios.get(
      "http://localhost:5000/api/admin/banners/get"
    );
    return result?.data;
  }
);

export const deleteBanner = createAsyncThunk(
  "/banners/deletebanner",
  async (id) => {
    const result = await axios.delete(
      `http://localhost:5000/api/admin/banners/delete/${id}`
    );
    return result?.data;
  }
);

const bannerSlice = createSlice({
  name: "banners",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllBanners.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllBanners.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bannerList = action.payload.message;
      })
      .addCase(fetchAllBanners.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(addNewBanner.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addNewBanner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bannerList = [...state.bannerList, action.payload.data];
      })
      .addCase(addNewBanner.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteBanner.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteBanner.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteBanner.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default bannerSlice.reducer;

// This is client/src/store/admin/banner-slice/index.js