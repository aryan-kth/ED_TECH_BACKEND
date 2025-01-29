const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    duration: {
        type: Number,
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        enum: ["Web Development", "Data Science", "AI/ML", "Blockchain", "Others"],
        required: true
    },
    tag: {
        type: String,
        required: true
    },
    courseThumbnail: {
        type: String,
        required: true
    },
    benifits: {
        type: [String],
        required: true
    },
    requirements: {
        type: [String],
        required: true
    }, 
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Course", courseSchema);