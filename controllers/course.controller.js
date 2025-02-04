const Course = require("../models/course.model");
const fileUploader = require("../utils/fileUploader");

const createCourse = async (req, res) => {
  try {
    // Check if all required fields are present
    const { title, description, price, category, tag, benifits, requirements } = req.body;
    
    if (!title || !description || !price || !category || !tag || !benifits || !requirements) {
      return res.status(400).json({
        message: "All fields are required",
        receivedData: req.body
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        message: "Course thumbnail is required"
      });
    }

    try {
      // Upload to cloudinary
      const result = await fileUploader(req.file.path);

      // Create course with cloudinary URL
      const newCourse = await Course.create({
        title,
        description,
        price,
        category,
        tag,
        benifits: Array.isArray(benifits) ? benifits : [benifits],
        requirements: Array.isArray(requirements) ? requirements : [requirements],
        courseThumbnail: result.url,
        instructor: req.user.userId
      });

      res.status(201).json({
        message: "Course created successfully",
        data: newCourse,
        thumbnailInfo: {
          url: result.secure_url,
          public_id: result.public_id
        }
      });
    } catch (uploadError) {
      console.error("Error during file upload:", uploadError);
      return res.status(500).json({
        message: "Error uploading file to Cloudinary",
        error: uploadError.message
      });
    }
  } catch (error) {
    console.error("Error in createCourse:", error);
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
