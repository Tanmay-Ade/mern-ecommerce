const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
    userId: String,
    address: String,
    city: String,
    pincode: String,
    phone: String,
    notes: String,
}, {timestamps: true})

module.exports = mongoose.model('Address', AddressSchema)

// This is server/models/Address.js