const mongoose = require("mongoose");

const cartReservationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  expiresAt: { type: Date, required: true } // Reservation expiry time
});

module.exports = mongoose.model("CartReservation", cartReservationSchema);
// This is server/models/CartReservation.js