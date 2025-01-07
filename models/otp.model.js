const mongoose = require("mongoose");
const sendOtpEmail = require("../utils/sendEmailOtp");
const twilioSendOtp = require("../utils/sendPhoneOtp");

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    otp: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300, // 5 minutes
    }
});

// Pre-save middleware to handle OTP sending
otpSchema.pre('save', async function(next) {
    try {
        if (this.email) {
            // Send OTP only to email
            await sendOtpEmail(this.email, this.otp);
        } else if (this.phone) {
            // Send OTP only to phone
            await twilioSendOtp(this.phone, this.otp);
        } else {
            throw new Error('Invalid OTP type or missing required fields');
        }   
        
        next();
    } catch (error) {
        next(error);
    }
});

const OTP = mongoose.model("OTP", otpSchema);
module.exports = OTP;