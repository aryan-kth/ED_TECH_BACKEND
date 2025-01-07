const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Set your SendGrid API Key
sgMail.setApiKey(process.env.TWILIO_API_KEY);

// Function to send OTP email
const sendOtpEmail = async (recipientEmail, otp, subject, html, text) => {
    try {
        const message = {
            to: recipientEmail,
            from: 'aryandeveloper41@gmail.com',
            subject: subject || 'OTP Verification',
            text: text || (otp ? `Your OTP code is: ${otp}` : ''),
            html: html || (otp ? `<strong>Your OTP code is: ${otp}</strong>` : '')
        };

        await sgMail.send(message);
        console.log(`Email sent to ${recipientEmail}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error.response ? error.response.body : error.message);
        throw error;
    }
};

module.exports = sendOtpEmail;