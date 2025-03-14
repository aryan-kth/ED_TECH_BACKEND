const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/user.model");

exports.authMiddleware = (req, res, next) => {
  // Authorization header check
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "User not authorized" });
  }

  // Token extract karna
  const token = authHeader.split(" ")[1]; // "Bearer <token>" format assume kiya gaya hai

  if (!token) {
    return res
      .status(401)
      .json({ message: "Token missing in authorization header" });
  }

  try {
    // JWT token verify karna
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // User data ko request object me save karna
    console.log("decoded data", req.user); // JWT_SECRET ko .env file me define karo
    next(); // Middleware se aage badhna
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token", error });
  }
};

exports.isStudent = async(req, res, next) => {
   try {
    const { userId } = req.user;
    const user = await User.findById(userId);
    if (!user || user.userType !== "Student") {
      return res.status(403).json({ message: "This is protected route for students only" });
    }
    next();
   } catch (error) {
    return res.status(500).json({ message: "Error checking user type", error });
   }
    
};

exports.isTeacher = async(req, res, next) => {
   try {
    const { userId } = req.user;
    const user = await User.findById(userId);
    if (!user || user.userType !== "Instructor") {
      return res.status(403).json({ message: "This is protected route for teachers only" });
    }
    next();
   } catch (error) {
    return res.status(500).json({ message: "Error checking user type", error });
   }
    
};
