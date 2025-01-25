const Course = require("../models/course.model");

createCourse = async (req, res) => {
  try {
    // Directly req.body ko pass kar rahe hain, mongoose validate karega
    const newCourse = await Course.create(req.body);

    res.status(201).json({ 
      message: "Course created successfully", 
      data: newCourse 
    });
  } catch (error) {
    // Agar Mongoose Validation Error hai toh use handle karo
    if (error.name === "ValidationError") {
      return res.status(400).json({ 
        message: "Validation failed", 
        error: error.errors // Yeh mongoose ke validation errors batayega
      });
    }

    // Baaki errors ke liye generic response
    res.status(500).json({ 
      message: "Error creating course", 
      error: error.message 
    });
  }
};

module.exports = {
  createCourse
}


