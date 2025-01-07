const twilio = require('twilio');
require('dotenv').config();

// Twilio credentials from the Twilio Console
const accountSid = process.env.TWILIO_ACCOUNT_SID; // Replace with your Account SID
const authToken = process.env.TWILIO_AUTH_TOKEN; // Replace with your Auth Token
const client = new twilio(accountSid, authToken);

// Function to send OTP
const twilioSendOtp = async (phoneNumber, otp, body) => {
    try {
        const messageBody = body || `Your OTP code is: ${otp}`;
        const message = await client.messages.create({
            body: messageBody,
            from: '+1 229 850 5979', // Replace with your Twilio phone number
            to: phoneNumber, // The recipient's phone number
        });
        console.log('Message sent:', message.sid);
        return message.sid; // SID can be used for tracking
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

module.exports = twilioSendOtp;