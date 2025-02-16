const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
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
    subSections: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "SubSection"
    }
},{timestamps:true});

module.exports = mongoose.model("Section", sectionSchema);