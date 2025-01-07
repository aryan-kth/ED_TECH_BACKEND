const User = require("../models/user.model");
const OTP = require("../models/otp.model");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const twilioSendOtp = require("../utils/sendPhoneOtp");
const sendOtpEmail = require("../utils/sendEmailOtp");

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;
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

    // Send custom SMS
    const sendMessage = await twilioSendOtp(phone, null, "hello bhai");
    
    // Send custom email
    const sendEmail = await sendOtpEmail(
      email,
      null,
      "Welcome to Our Platform",
      "<h1>Hello World</h1>",
      "hello bhai"
    );

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
};

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
    const { phoneOtp, emailOtp, phone, email } = req.body;
    const emailOtpData = await OTP.findOne({
      email,
      otp: emailOtp,
      otpType: "email",
    });
    if (!emailOtpData) {
      return res.status(400).json({ message: "Invalid OTP for email" });
    }
    await OTP.deleteOne({ otp: emailOtp });
    const phoneOtpData = await OTP.findOne({
      phone,
      otp: phoneOtp,
      otpType: "phone",
    });
    if (!phoneOtpData) {
      return res.status(400).json({ message: "Invalid OTP for phone" });
    }
    await OTP.deleteOne({ otp: phoneOtp });

    const user = await User.findOne({ email, phone });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error verifying OTP", error });
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

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password", error });
  }
};

module.exports = {
  register,
  sendOtpToPhone,
  sendOtpToEmail,
  verifyOtp,
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword,
};
