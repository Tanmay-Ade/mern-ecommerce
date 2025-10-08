require("dotenv").config();
const username = encodeURIComponent(process.env.MONGODB_USERNAME);
const password = encodeURIComponent(process.env.MONGODB_PASSWORD);
const cluster = process.env.MONGODB_CLUSTER;

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
require("./config/passport");

const authRouter = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/productsRoutes");
const shopProductsRouter = require("./routes/shop/productsRoutes");
const shopCartRouter = require("./routes/shop/cartRoutes");
const shopAddressRouter = require("./routes/shop/addressRoutes");
const paymentRouter = require("./routes/payment/payment-routes");
const shopOrderRoutes = require('./routes/shop/orderRoutes')
const adminOrderRoutes = require('./routes/admin/orderRoutes');
const shopReviewRoutes = require('./routes/shop/reviewRoutes');
const adminDashboardRoutes = require('./routes/admin/dashboardRoutes')
const bannerRoutes = require("./routes/admin/bannerRoutes");

mongoose
  .connect(`mongodb+srv://${username}:${password}@${cluster}/`)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log("MongoDB connection error:", error));

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced Security Headers
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://accounts.google.com https://api.stripe.com;"
  );
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
      "stripe-signature",
    ],
    credentials: true,
  })
);

// Raw body parsing for Stripe webhooks
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));

// Regular body parsing for other routes
app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1000, // 1 hour
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/shop/orders", shopOrderRoutes)
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/shop/reviews", shopReviewRoutes)
app.use("/api/admin/dashboard", adminDashboardRoutes)
app.use("/api/admin/banners", bannerRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

// This is server/server.js