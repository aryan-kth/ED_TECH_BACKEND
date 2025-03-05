const {
  createCourse,
  getCourses,
  createSection,
  createSubSection,
  getAllCourseSection,
  getIndividualCourse,
  updateCourse,
  deleteCourse,
  updateSection,
  deleteSection,
  updateSubSection,
  deleteSubSection,
} = require("../controllers/course.controller");
const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const { upload } = require("../middleware/multer.middleware");

// Use upload.single for single file upload, 'courseThumbnail' is the field name
router.post(
  "/create-course",
  authMiddleware,
  upload.single("courseThumbnail"),
  createCourse
);
router.post("/create-section/:courseId", authMiddleware, createSection);
router.get("/course-sections/:courseId", authMiddleware, getAllCourseSection);
// router.get("/subsections-of-sections/:sectionId", authMiddleware, getAllSubSectionOfSection);
router.post(
  "/create-subsection/:sectionId/:courseId",
  authMiddleware,
  upload.single("videoUrl"),
  createSubSection
);
router.get("/get-courses", authMiddleware, getCourses);
router.get("/individual-course/:id", authMiddleware, getIndividualCourse);
router.put(
  "/update-course/:courseId",
  authMiddleware,
  upload.single("courseThumbnail"),
  updateCourse
);
router.delete("/delete-course/:courseId", authMiddleware, deleteCourse);
router.put(
  "/update-section/:sectionId/:courseId",
  authMiddleware,
  updateSection
);
router.delete(
  "/delete-section/:sectionId/:courseId",
  authMiddleware,
  deleteSection
);
router.put(
  "/update-subsection/:subSectionId/:sectionId/:courseId",
  upload.single("videoUrl"),
  authMiddleware,
  updateSubSection
);
router.delete(
  "/delete-subsection/:subSectionId/:sectionId/:courseId",
  authMiddleware,
  deleteSubSection
);

module.exports = router;
