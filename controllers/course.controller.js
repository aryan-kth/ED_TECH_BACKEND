const Course = require("../models/course.model");
const fileUploader = require("../utils/fileUploader");
const Section = require("../models/section.model");
const SubSection = require("../models/subSection.model");
const User = require("../models/user.model");

const createCourse = async (req, res) => {
  try {
    // Check if all required fields are present
    const { title, description, price, category, tag, benifits, requirements } =
      req.body;

    if (
      !title ||
      !description ||
      !price ||
      !category ||
      !tag ||
      !benifits ||
      !requirements
    ) {
      return res.status(400).json({
        message: "All fields are required",
        receivedData: req.body,
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        message: "Course thumbnail is required",
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
        requirements: Array.isArray(requirements)
          ? requirements
          : [requirements],
        courseThumbnail: result.url,
        instructor: req.user.userId,
      });

      const updateUserByAddingCourse = await User.findOneAndUpdate(
        { _id: req.user.userId },
        { $push: { courses: newCourse._id } },
        { new: true }
      );
      if (!updateUserByAddingCourse) {
        throw new Error("Failed to update user");
      }

      res.status(201).json({
        message: "Course created successfully",
        data: newCourse,
        thumbnailInfo: {
          url: result.secure_url,
          public_id: result.public_id,
        },
      });
    } catch (uploadError) {
      console.error("Error during file upload:", uploadError);
      return res.status(500).json({
        message: "Error uploading file to Cloudinary",
        error: uploadError.message,
      });
    }
  } catch (error) {
    console.error("Error in createCourse:", error);
    res.status(500).json({
      message: "Error creating course",
      error: error.message,
    });
  }
};

const createSection = async (req, res) => {
  try {
    const { courseId } = req.params;
    const newSection = await Section.create({
      ...req.body,
      course: courseId,
    });

    const updateCourse = await Course.findOneAndUpdate(
      { _id: courseId },
      { $push: { courseSections: newSection._id } },
      { new: true }
    );
    if (!updateCourse) {
      throw new Error("Failed to update course");
    }

    res.status(201).json({
      message: "Section created successfully",
      data: newSection,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getAllCourseSection = async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!courseId) {
      throw new Error("Course ID is required");
    }
    const courseSections = await Section.find({ course: courseId }).populate({
      path: "subSections",
    });
    res.status(200).json({
      message: "Course sections fetched successfully",
      data: courseSections,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// const getAllSubSectionOfSection = async (req, res) => {
//   try {
//     const { sectionId } = req.params;
//     if (!sectionId) {
//       throw new Error("Section ID is required");
//     }
//     const subSections = await SubSection.find({ section: sectionId });
//     res.status(200).json({
//       message: "SubSections fetched successfully",
//       data: subSections,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// }

const createSubSection = async (req, res) => {
  try {
    const { sectionId, courseId } = req.params;
    const { title, description } = req.body;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        message: "Video is required",
      });
    }

    console.log("req.file", req.file);

    // Upload to cloudinary
    const result = await fileUploader(req.file.path);

    const newSubSection = await SubSection.create({
      title,
      description,
      videoUrl: result.url,
      section: sectionId,
      course: courseId,
    });

    const updateSection = await Section.findOneAndUpdate(
      { _id: sectionId },
      { $push: { subSections: newSubSection._id } },
      { new: true }
    );

    if (!updateSection) {
      throw new Error("Failed to update section");
    }

    res.status(201).json({
      message: "SubSection created successfully",
      data: newSubSection,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating SubSection",
      error: error.message,
    });
  }
};

const getCourses = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const courses = await Course.find()
      .populate({ path: "instructor", select: "firstName lastName email" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const totalDocuments = await Course.countDocuments();
    const totalPages = Math.ceil(totalDocuments / limit);

    res.status(200).json({
      message: "Courses fetched successfully",
      totalPages,
      totalDocuments,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching courses",
      error: error.message,
    });
  }
};

const getIndividualCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate({
      path: "courseSections",
      populate: { path: "subSections" },
    });

    if (!course) {
      throw new Error("Course not found");
    }

    res.status(200).json({
      message: "Course fetched successfully",
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching course",
      error: error.message,
    });
  }
};

module.exports = {
  createCourse,
  getCourses,
  createSubSection,
  createSection,
  getAllCourseSection,
  getIndividualCourse,
};
