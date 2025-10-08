import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice";
import dashboardReducer from './admin/dashboard-slice/index'
import adminProductsSlice from "./admin/products-slice";
import shopProductsSlice from "./shop/product-slice";
import shopCartSlice from "./shop/cart-slice";
import shopAddressSlice from "./shop/address-slice";
import shopOrderSlice from './shop/order-slice';
import adminBannerSlice from './admin/banner-slice';
import shopBannerSlice from './shop/banner-slice';
import stockSlice from './shop/stock-slice';
import logger from 'redux-logger';

const store = configureStore({
  reducer: {
    auth: authReducer,
    adminProducts: adminProductsSlice,
    shopProducts: shopProductsSlice,
    shopCart: shopCartSlice,
    shopAddress: shopAddressSlice,
    shopOrder: shopOrderSlice,
    adminBanners: adminBannerSlice,
    shopBanners: shopBannerSlice,
    dashboard: dashboardReducer,
    stock: stockSlice,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

export default store;

// This is client/src/store/store.js