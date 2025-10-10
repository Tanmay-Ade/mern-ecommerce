import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import API_BASE_URL from '@/config/api';
import axios from "axios";

const initialState = {
  isLoading: false,
  productList: [],
  productDetails: null,
  stockUpdates: {},
  lastStockCheck: null,
};

const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/shop`,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchAllFilteredProducts = createAsyncThunk(
  "/products/fetchallfilteredproducts",
  async ({ filterParams, sortParams }) => {
    const query = new URLSearchParams({
      filterParams: JSON.stringify(filterParams),
      sortParams
    });
    const result = await axiosInstance.get(`/products/get-filtered?${query}`);
    return result?.data;
  }
);

export const fetchProductDetails = createAsyncThunk(
  "/products/fetchproductdetails",
  async (id) => {
    const result = await axiosInstance.get(`/products/get/${id}`);
    return result?.data;
  }
);

export const fetchProductById = createAsyncThunk(
  "/products/fetchProductById",
  async (productId) => {
    const response = await axiosInstance.get(`/products/get/${productId}`);
    return { 
      productId, 
      ...response.data.data 
    };
  }
);

export const checkProductStock = createAsyncThunk(
  "/products/checkStock",
  async (productId) => {
    const response = await axiosInstance.get(`/products/stock/${productId}`);
    return {
      productId,
      stock: response.data.stock,
      status: response.data.stockStatus
    };
  }
);

export const batchCheckStock = createAsyncThunk(
  "/products/batchCheckStock",
  async (productIds) => {
    const response = await axiosInstance.post(`/products/batch-stock`, {
      productIds
    });
    return response.data;
  }
);

const shoppingProductSlice = createSlice({
  name: "shoppingProducts",
  initialState,
  reducers: {
    setProductDetails: (state) => {
      state.productDetails = null;
    },
    updateProductStock: (state, action) => {
      const { productId, newStock, status } = action.payload;
      
      // Update in product list
      state.productList = state.productList.map((product) =>
        product._id === productId 
          ? { 
              ...product, 
              stock: newStock,
              stockStatus: status,
              lastUpdated: Date.now()
            } 
          : product
      );

      // Update in product details if currently viewing
      if (state.productDetails?._id === productId) {
        state.productDetails = {
          ...state.productDetails,
          stock: newStock,
          stockStatus: status,
          lastUpdated: Date.now()
        };
      }

      // Track stock updates
      state.stockUpdates[productId] = {
        previousStock: state.stockUpdates[productId]?.currentStock || newStock,
        currentStock: newStock,
        lastUpdated: Date.now()
      };
    },
    clearStockUpdates: (state) => {
      state.stockUpdates = {};
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFilteredProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllFilteredProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = action.payload.data;
        state.lastStockCheck = Date.now();
      })
      .addCase(fetchAllFilteredProducts.rejected, (state) => {
        state.isLoading = false;
        state.productList = [];
      })
      .addCase(fetchProductDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productDetails = action.payload.data;
      })
      .addCase(fetchProductDetails.rejected, (state) => {
        state.isLoading = false;
        state.productDetails = null;
      })
      .addCase(checkProductStock.fulfilled, (state, action) => {
        const { productId, stock, status } = action.payload;
        state.stockUpdates[productId] = {
          previousStock: state.stockUpdates[productId]?.currentStock || stock,
          currentStock: stock,
          status,
          lastUpdated: Date.now()
        };
      })
      .addCase(batchCheckStock.fulfilled, (state, action) => {
        action.payload.forEach(update => {
          state.stockUpdates[update.productId] = {
            previousStock: state.stockUpdates[update.productId]?.currentStock || update.stock,
            currentStock: update.stock,
            status: update.status,
            lastUpdated: Date.now()
          };
        });
      });
  },
});

export const { 
  setProductDetails, 
  updateProductStock, 
  clearStockUpdates 
} = shoppingProductSlice.actions;

export default shoppingProductSlice.reducer;

// This is client/src/store/shop/product-slice/index.js