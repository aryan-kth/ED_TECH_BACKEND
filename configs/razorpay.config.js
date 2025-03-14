const Razorpay = require("razorpay");
require("dotenv").config();



// Razorpay instance create
 const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET,
  });

  module.exports = razorpay;