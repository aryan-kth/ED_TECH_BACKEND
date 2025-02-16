const mongoose = require("mongoose");

const subSectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section",
        required: true  
    },
    videoUrl: {
        type: String,
        required: true
    }
},{timestamps:true});

module.exports = mongoose.model("SubSection", subSectionSchema);