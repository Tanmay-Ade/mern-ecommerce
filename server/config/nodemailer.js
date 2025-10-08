const nodemailer = require('nodemailer');
console.log('Nodemailer Config - Email User:', process.env.EMAIL_USER);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

module.exports = transporter;

// This is server/config/nodemailer.js