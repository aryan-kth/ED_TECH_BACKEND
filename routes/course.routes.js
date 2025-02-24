const { createCourse, getCourses,createSection,createSubSection,getAllCourseSection } = require("../controllers/course.controller");
const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const { upload } = require("../middleware/multer.middleware");

// Use upload.single for single file upload, 'courseThumbnail' is the field name
router.post("/create-course", authMiddleware, upload.single('courseThumbnail'), createCourse);
router.post("/create-section/:courseId", authMiddleware, createSection);
router.get("/course-sections/:courseId", authMiddleware, getAllCourseSection);
// router.get("/subsections-of-sections/:sectionId", authMiddleware, getAllSubSectionOfSection);
router.post("/create-subsection/:sectionId/:courseId", authMiddleware, upload.single('videoUrl'), createSubSection);
router.get("/get-courses", authMiddleware, getCourses);

module.exports = router;