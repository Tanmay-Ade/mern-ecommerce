const transporter = require('../config/nodemailer');
const createOrderConfirmationEmail = require('../helpers/emailTemplates/orderConfirmation');

const sendOrderConfirmationEmail = async (order, user) => {
    console.log('Email Service - Starting to send email');
    console.log('Email Service - User:', user.email);
    console.log('Email Service - Order:', order._id);
    
    const emailContent = createOrderConfirmationEmail(order, user);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html
    };
    
    console.log('Email Service - Mail Options:', mailOptions);
    return await transporter.sendMail(mailOptions);
  };

module.exports = {
  sendOrderConfirmationEmail
};

// This is server/services/emailService.js