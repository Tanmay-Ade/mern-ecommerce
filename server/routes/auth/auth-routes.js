const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const stripe = require('../../config/stripe');

const {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  forgotPassword,
  resetPassword,
} = require("../../controllers/auth/auth-controller");

const router = express.Router();

// Regular auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/check-auth", authMiddleware, (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    message: "Authenticated User!",
    user,
  });
});

// Payment route with auth
router.post("/create-payment-intent", authMiddleware, async (req, res) => {
  try {
    const { amount, orderId } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'inr',
      metadata: {
        userId: req.user.id,
        orderId: orderId
      }
    });
    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Payment intent creation failed',
      error: error.message
    });
  }
});

// Google OAuth routes remain unchanged
router.get(
  "/google",
  (req, res, next) => {
    console.log("Starting Google OAuth flow with config:", {
      clientID: process.env.GOOGLE_CLIENT_ID,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    });
    next();
  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
    accessType: "offline",
  })
);

router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", {
      failureRedirect: "http://localhost:5173/auth/login",
      session: false,
    })(req, res, next);
  },
  (req, res) => {
    try {
      const token = jwt.sign(
        {
          id: req.user._id,
          role: req.user.role,
          email: req.user.email,
          userName: req.user.userName,
        },
        process.env.SESSION_SECRET,
        { expiresIn: "60m" }
      );

      const data = {
        success: true,
        token,
        user: {
          id: req.user._id,
          email: req.user.email,
          role: req.user.role,
          userName: req.user.userName,
        },
      };

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 1000, // 1 hour
      });

      res.redirect(
        `http://localhost:5173/auth/google/callback?data=${encodeURIComponent(
          JSON.stringify(data)
        )}`
      );
    } catch (error) {
      console.error("Google callback error:", error);
      res.redirect(
        `http://localhost:5173/auth/login?error=${encodeURIComponent(
          "Authentication failed"
        )}`
      );
    }
  }
);

module.exports = router;

// This is server/routes/auth/auth-routes.js