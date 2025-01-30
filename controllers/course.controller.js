const Course = require("../models/course.model");
const fileUploader = require("../utils/fileUploader");

const createCourse = async (req, res) => {
  try {
    // Directly req.body ko pass kar rahe hain, mongoose validate karega
    const newCourse = await Course.create({ ...req.body, instructor: req.user.userId });

    if (!req.body.courseThumbnail) {
      return res.status(400).json({ error: "No file selected" });
    }

    // File ko Cloudinary pe upload karte hain
    const uploadedFile = await fileUploader(req.body.courseThumbnail);


    res.status(201).json({ 
      message: "Course created successfully", 
      message: "Course thumbnail uploaded successfully",
      url: uploadedFile.url, // Cloudinary ka URL
      public_id: uploadedFile.public_id,
      data: newCourse 
    });
  } catch (error) {
    // Baaki errors ke liye generic response
    res.status(500).json({ 
      message: "Error creating course", 
      error: error.message 
    });
  }
};

const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({}).populate({path:"instructor",select:"firstName lastName email"});
    res.status(200).json({ 
      message: "Courses fetched successfully", 
      data: courses 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching courses", 
      error: error.message 
    });
  }
};

module.exports = { createCourse,getCourses };


