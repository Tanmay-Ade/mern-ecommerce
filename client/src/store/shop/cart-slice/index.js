import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import API_BASE_URL from '@/config/api';
import axios from "axios";

const initialState = {
  cartItems: JSON.parse(localStorage.getItem("cartItems")) || { items: [] },
  isLoading: false,
  selectedAddress: null,
  error: null,
  stockLevels: {},
};

const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/shop/cart`,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const updateProductStockLevel = async (productId) => {
  const response = await axios.get(
    `${API_BASE_URL}/api/shop/products/get/${productId}`
  );
  return response.data.data.stock;
};

export const updateCartItemQty = createAsyncThunk(
  "cart/updateCartItemQty",
  async (
    { userId, productId, quantity },
    { rejectWithValue, getState, dispatch }
  ) => {
    try {
      // Check latest stock
      const stockResponse = await axios.get(
        `${API_BASE_URL}/api/shop/products/get/${productId}`
      );
      const availableStock = stockResponse.data.data.stock;
      console.log('availableStock', availableStock);
      

      if (quantity > availableStock) {
        return rejectWithValue(`Stock updated: Only ${availableStock} left`);
      }

      // Proceed with updating cart
      const response = await axiosInstance.put(`/update/${userId}`, {
        productId,
        quantity,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update cart"
      );
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ userId, productId, quantity }, { rejectWithValue }) => {
    try {
      // First check stock availability
      const stockResponse = await axios.get(
        `${API_BASE_URL}/api/shop/products/get/${productId}`
      );
      const availableStock = stockResponse.data.data.stock;
      console.log("Bhakkkkkk Bhakkkkkk", availableStock);
      

      if (quantity > availableStock) {
        return rejectWithValue(`Only ${availableStock} items available`);
      }

      // Proceed with cart addition
      const response = await axiosInstance.post("/add", {
        userId,
        productId,
        quantity,
      });

      return {
        ...response.data,
        stockLevel: availableStock - quantity,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add to cart"
      );
    }
  }
);

export const fetchCartItems = createAsyncThunk(
  "cart/fetchItems",
  async (userId, { rejectWithValue }) => {
    try {
      if (!userId) return { data: { items: [] } };
      const response = await axiosInstance.get(`/get/${userId}`);
      console.log("fetchItems", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch cart items"
      );
    }
  }
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async ({ userId, productId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/${userId}/${productId}`);
      console.log("Delete API Response:", response.data); // ✅ API response check karo
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete cart item"
      );
    }
  }
);

export const updateProductStock = createAsyncThunk(
  "cart/updateProductStock",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/shop/products/update-stock`,
        {
          items: [{ productId, quantity }],
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update stock"
      );
    }
  }
);

export const completeCheckout = createAsyncThunk(
  "cart/completeCheckout",
  async (orderData, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/checkout", orderData);

      // Update stock for each item in the order
      for (const item of orderData.items) {
        await dispatch(
          updateProductStock({
            productId: item.productId,
            quantity: item.quantity,
          })
        );
      }

      // Clear the cart after successful checkout
      dispatch(clearCart());

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Checkout failed"
      );
    }
  }
);

const shoppingCartSlice = createSlice({
  name: "shopCart", // Changed from "shoppingCart" to "shopCart"
  initialState: {
    ...initialState,
    totalItems: 0,
  },
  reducers: {
    // Add this new reducer
    updateTotalItems: (state, action) => {
      state.totalItems = action.payload;
    },
    clearCart: (state) => {
      state.cartItems = { items: [] };
      state.isLoading = false;
      state.error = null;
      state.totalItems = 0;
      localStorage.removeItem("cartItems");
    },
    setSelectedAddress: (state, action) => {
      state.selectedAddress = action.payload;
    },
    updateStockLevel: (state, action) => {
      const { productId, stock } = action.payload;
      state.stockLevels[productId] = stock;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;

        // Ensure cart state updates
        state.cartItems.items = action.payload.data.items;
        localStorage.setItem("cartItems", JSON.stringify(state.cartItems));

        // Immediately update stock level for badge
        if (action.payload.stockLevel) {
          state.stockLevels[action.meta.arg.productId] =
            action.payload.stockLevel;
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchCartItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
        state.error = null;
        console.log("state.cartItems", state.cartItems);
        localStorage.setItem("cartItems", JSON.stringify(action.payload.data));
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateCartItemQty.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartItemQty.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
        state.error = null;

        if (action.payload.stockLevel) {
          state.stockLevels[action.payload.productId] =
            action.payload.stockLevel;
          console.log("Updated stock level:", action.payload.stockLevel);
        }

        // Ensure the stock badge updates immediately
        state.stockLevels[action.meta.arg.productId] =
          action.payload.stockLevel;
        console.log("Updated stock level:", action.payload.stockLevel);

        localStorage.setItem("cartItems", JSON.stringify(action.payload.data));
      })
      .addCase(updateCartItemQty.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteCartItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        console.log("Delete Response:", action.payload); // ✅ Response check
        state.isLoading = false;
        state.error = null;

        // 🔥 Cart se manually item hatao
        state.cartItems = state.cartItems.items.filter(
          (item) => item.productId !== action.meta.arg.productId
        );

        // ✅ Local storage update karo
        localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
      })
      .addCase(deleteCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateProductStock.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(updateProductStock.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(completeCheckout.fulfilled, (state) => {
        state.cartItems = { items: [] };
        state.isLoading = false;
        state.error = null;
        localStorage.removeItem("cartItems");
      });
  },
});

export const {
  clearCart,
  setSelectedAddress,
  updateStockLevel,
  updateTotalItems,
} = shoppingCartSlice.actions;
export default shoppingCartSlice.reducer;

// This is client/src/store/shop/cart-slice/index.js