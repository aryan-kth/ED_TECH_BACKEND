const User = require("../models/user.model");
const OTP = require("../models/otp.model");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const twilioSendOtp = require("../utils/sendPhoneOtp");
const sendOtpEmail = require("../utils/sendEmailOtp");
const jwt = require("jsonwebtoken");
require("dotenv").config();


const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone,role } = req.body;
    // Check if user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // Create OTP record
    await OTP.create({ otp, email });

    // Send OTP via email
    await sendOtpEmail(
      email,
      otp,
      "Verify Your Email",
      `<h1>Email Verification</h1><p>Your verification code is: ${otp}</p>`,
      "Please verify your email address"
    );

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      userType:role,
      isVerified: false
    });

    res.status(201).json({ 
      message: "User registered successfully. Please check your email for verification code.",
      user
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};



const login = async (req, res) => {
  try {
    const { email, password,role } = req.body;
    
    const user = await User.findOne({ email,userType:role });
    if (!user) {
      return res.status(404).json({ message: "User does not exist, kindly sign up first" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "User is not verified! Please verify your email first." });
    }

    // Generate JWT access token
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Generate refresh token
    const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

    // Set the refresh token as HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: 604800000, // 7 days expiration
      sameSite: "None"
    });

    // Set access token in response
    res.status(200).json({
      message: "Login successful",
      accessToken,
      user: { email: user.email,role:user.userType },
    });

  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
}

const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(403).json({ message: "No refresh token provided" });
    }

    // Verify the refresh token
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired refresh token" });
      }

      // Create a new access token
      const newAccessToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

      res.status(200).json({ accessToken: newAccessToken });
    });
    
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ message: "Error refreshing token", error: error.message });
  }
}




const sendOtpToPhone = async (req, res) => {
  try {
    const { phone } = req.body;
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    const otpData = await OTP.create({ otp, phone, otpType: "phone" });
    res
      .status(200)
      .json({ message: "OTP sent to phone successfully", otpData });
  } catch (error) {
    res.status(500).json({ message: "Error sending OTP to phone", error });
  }
};

const sendOtpToEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const otpData = await OTP.create({ otp, email, otpType: "email" });
    res
      .status(200)
      .json({ message: "OTP sent to email successfully", otpData });
  } catch (error) {
    res.status(500).json({ message: "Error sending OTP to email", error });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { otp: inputOtp, email } = req.body;

    const otp = Number(inputOtp);

    const emailOtpData = await OTP.findOne({
      email,
      otp,
    });
    
    if (!emailOtpData) {
      console.log('Invalid OTP - No matching OTP found');
      return res.status(400).json({ message: "Invalid OTP for email" });
    }

    await OTP.deleteOne({ _id: emailOtpData._id });

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found with email:', email);
      return res.status(400).json({ message: "User not found" });
    }

    user.isVerified = true;
    await user.save();

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error('Error in verifyOtp:', error);
    res.status(500).json({ message: "Error verifying OTP", error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ message: "Please provide email or phone" });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // Send OTP via email or phone
    if (user.email === identifier) {
      await OTP.create({ otp, email: user.email });
    } else if (user.phone === identifier) {
      await OTP.create({ otp, phone: user.phone });
    }

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error sending OTP to phone", error });
  }
};

const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    if (!identifier) {
      return res.status(400).json({ message: "Please provide email or phone" });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const otpData = await OTP.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });
    if (!otpData) {
      return res.status(404).json({ message: "OTP not found." });
    }

    if (otpData.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    await OTP.deleteOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error sending OTP to email", error });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { identifier, password, confirmPassword } = req.body;

    if (!identifier && !password) {
      return res.status(400).json({ message: "Please provide email or phone" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "password does not match" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successfully !" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password", error });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  sendOtpToPhone,
  sendOtpToEmail,
  verifyOtp,
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword,
};
