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
    const { firstName, lastName, email, password, phone, role,googleAuth } = req.body;
    
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
      googleAuth,
      phone,
      userType: role,
      isVerified: false,
    });

    res.status(201).json({
      message:
        "User registered successfully. Please check your email for verification code.",
      user,
    });
  } catch (error) {
    console.error("Error in register:", error);
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email});
    if (!user) {
      return res
        .status(404)
        .json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified && !user.googleAuth) {
      return res
        .status(403)
        .json({
          message: "User is not verified! Please verify your email first.",
        });
    }

    // Generate JWT access token
    const accessToken = jwt.sign({ userId: user._id,role:user.userType }, process.env.JWT_SECRET, {
      expiresIn: "5h",
    });

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // Set the refresh token as HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: 604800000, // 7 days expiration
      sameSite: "None",
    });

    // Set access token in response
    res.status(200).json({
      message: "Login successful",
      accessToken,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role:user.userType,
        id:user._id
      },
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

const logout = async (req, res) => {
  try {

    console.log("cookies bete",req.cookies)

    // Invalidate the refresh token by clearing the cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'None',
    });
  
    // Send a success response
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({ message: 'Error logging out' });
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
        return res
          .status(403)
          .json({ message: "Invalid or expired refresh token" });
      }

      // Create a new access token
      const newAccessToken = jwt.sign(
        { userId: decoded.userId },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.status(200).json({ accessToken: newAccessToken });
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res
      .status(500)
      .json({ message: "Error refreshing token", error: error.message });
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
    const { otp: inputOtp, email } = req.body;

    const otp = Number(inputOtp);

    const emailOtpData = await OTP.findOne({
      email,
      otp,
    });

    if (!emailOtpData) {
      console.log("Invalid OTP - No matching OTP found");
      return res.status(400).json({ message: "Invalid OTP for email" });
    }

    await OTP.deleteOne({ _id: emailOtpData._id });

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found with email:", email);
      return res.status(400).json({ message: "User not found" });
    }

    user.isVerified = true;
    await user.save();

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error in verifyOtp:", error);
    res
      .status(500)
      .json({ message: "Error verifying OTP", error: error.message });
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

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res
      .status(200)
      .json({
        message: "User found",
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role:user.userType,
          id:user._id
        },
      });
  } catch (error) {
    res.status(500).json({ message: "Error getting user", error });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  sendOtpToPhone,
  sendOtpToEmail,
  verifyOtp,
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword,
  getUser,
};
