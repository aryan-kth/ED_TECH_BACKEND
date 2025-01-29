const Course = require("../models/course.model");

createCourse = async (req, res) => {
  try {
    // Directly req.body ko pass kar rahe hain, mongoose validate karega
    const newCourse = await Course.create({ ...req.body, instructor: req.user.userId });

    res.status(201).json({ 
      message: "Course created successfully", 
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

module.exports = {
  createCourse
}


