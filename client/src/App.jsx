import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Skeleton } from "@/components/ui/skeleton";
import Checkauth from "./components/common/Checkauth";
import AuthLayout from "./components/auth/Layout";
import AdminLayout from "./components/admin-view/Layout";
import ShoppingLayout from "./components/shopping-view/Layout";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/admin-view/Dashboard";
import Products from "./pages/admin-view/Products";
import Features from "./pages/admin-view/Features";
import Orders from "./pages/admin-view/Orders";
import Account from "./pages/shopping-view/Account";
import Checkout from "./pages/shopping-view/Checkout";
import Home from "./pages/shopping-view/Home";
import Listing from "./pages/shopping-view/Listing";
import OrderHistory from "./pages/shopping-view/OrderHistory";
import ForgotPassword from "./pages/auth/ForgotPassword";
import GoogleCallback from "./components/auth/GoogleCallback";
import OrderSuccess from "./pages/order/OrderSuccess";
import UnauthPage from "./pages/unauth-page/Index";
import NotFound from "./pages/not-found";
import Banners from './pages/admin-view/Banners'

import { useEffect } from "react";
import { checkAuthStatus } from "./store/auth-slice";
import { fetchCartItems } from "./store/shop/cart-slice";
import { fetchAllAddresses } from "./store/shop/address-slice";
import { fetchUserOrders } from "./store/shop/order-slice";

const PageLoader = () => (
  <Skeleton className="w-[100px] h-[20px] rounded-full" />
);

function App() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCartItems(user.id));
      dispatch(fetchAllAddresses(user.id));
      dispatch(fetchUserOrders(user.id));
    }
  }, [user]);

  if (isLoading)
    return <Skeleton className="w-[100px] h-[20px] rounded-full" />;

  return (
    <div className="flex flex-col overflow-hidden bg-white">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="google/callback" element={<GoogleCallback />} />
          </Route>

          <Route
            path="/admin"
            element={
              <Checkauth isAuthenticated={isAuthenticated} user={user}>
                <AdminLayout />
              </Checkauth>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="features" element={<Features />} />
            <Route path="orders" element={<Orders />} />
            <Route path="banners" element={<Banners />} />
          </Route>

          <Route
            path="/shop"
            element={
              <Checkauth isAuthenticated={isAuthenticated} user={user}>
                <ShoppingLayout />
              </Checkauth>
            }
          >
            <Route path="account" element={<Account />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="home" element={<Home />} />
            <Route path="listing" element={<Listing />} />
            <Route path="orders" element={<OrderHistory />} />
          </Route>

          <Route path="order/success" element={<OrderSuccess />} />

          <Route path="/unauth-page" element={<UnauthPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;

// This is client/src/App.jsx