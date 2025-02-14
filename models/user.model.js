const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
    },
    googleAuth:{
        type: Boolean,
        default: false,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    phone:{
        type: String,
        required: true,
        unique: true
    },
    userType: {
        type: String,
       enum: ["Student", "Instructor", "Admin"],
       default: "Student",
    },
});

module.exports = mongoose.model("User", userSchema);