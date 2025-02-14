

const jwt = require("jsonwebtoken");
require("dotenv").config();

 const authMiddleware = (req, res, next) => {
    // Authorization header check
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "User not authorized" });
    }

    // Token extract karna
    const token = authHeader.split(" ")[1]; // "Bearer <token>" format assume kiya gaya hai

    if (!token) {
        return res.status(401).json({ message: "Token missing in authorization header" });
    }

    try {
        // JWT token verify karna
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded // User data ko request object me save karna
        console.log("decoded data",req.user) // JWT_SECRET ko .env file me define karo
        next(); // Middleware se aage badhna
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token", error });
    }
};

module.exports = authMiddleware;
