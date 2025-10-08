import { Navigate, useLocation } from "react-router-dom";

const Checkauth = ({ isAuthenticated, user, children }) => {
  const location = useLocation();
  const hasToken = document.cookie.includes('token');
  const isAuth = isAuthenticated || hasToken;

  // Add Google callback path to allowed unauthenticated routes
  const allowedAuthPaths = [
    "/login",
    "/register",
    "/forgot-password",
    "/google/callback"
  ];

  // Allow unauthenticated users to access auth pages
  if (!isAuth && allowedAuthPaths.some(path => location.pathname.includes(path))) {
    return <>{children}</>;
  }

  // Redirect unauthenticated users to login
  if (!isAuth) {
    return <Navigate to="/auth/login" state={{ from: location }} />;
  }

  // Handle authenticated users trying to access auth pages
  if (isAuth && allowedAuthPaths.some(path => location.pathname.includes(path))) {
    const redirectPath = user?.role === "admin" ? "/admin/dashboard" : "/shop/home";
    return <Navigate to={redirectPath} />;
  }

  // Prevent non-admin users from accessing admin routes
  if (isAuth && user?.role !== "admin" && location.pathname.includes("admin")) {
    return <Navigate to="/unauth-page" />;
  }

  // Redirect admin users from shop routes to dashboard
  if (isAuth && user?.role === "admin" && location.pathname.includes("shop")) {
    return <Navigate to="/admin/dashboard" />;
  }

  return <>{children}</>;
};

export default Checkauth;
// This is client/src/components/common/Checkauth.jsx