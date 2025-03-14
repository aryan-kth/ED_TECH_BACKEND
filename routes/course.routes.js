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
  createOrder,
  getAllCoursesForStudent,
  verifyPayment
} = require("../controllers/course.controller");
const router = require("express").Router();
const {authMiddleware,isTeacher,isStudent} = require("../middleware/AuthMiddleware");
const { upload } = require("../middleware/multer.middleware");

// Use upload.single for single file upload, 'courseThumbnail' is the field name
router.post(
  "/create-course",
  authMiddleware,
  isTeacher,
  upload.single("courseThumbnail"),
  createCourse
);
router.post("/create-section/:courseId", authMiddleware, isTeacher, createSection);
router.get("/course-sections/:courseId", authMiddleware,isTeacher, getAllCourseSection);
router.post(
  "/create-subsection/:sectionId/:courseId",
  authMiddleware,
  isTeacher,
  upload.single("videoUrl"),
  createSubSection
);
router.get("/get-courses", authMiddleware, isTeacher, getCourses);
router.get("/individual-course/:id", authMiddleware, getIndividualCourse);
router.put(
  "/update-course/:courseId",
  authMiddleware,
  isTeacher,
  upload.single("courseThumbnail"),
  updateCourse
);
router.delete("/delete-course/:courseId", authMiddleware, isTeacher, deleteCourse);
router.put(
  "/update-section/:sectionId/:courseId",
  authMiddleware,
  isTeacher,
  updateSection
);

router.delete(
  "/delete-section/:sectionId/:courseId",
  authMiddleware,
  isTeacher,
  deleteSection
);

router.put(
  "/update-subsection/:subSectionId/:sectionId/:courseId",
  authMiddleware,
  isTeacher,
  upload.single("videoUrl"),
  updateSubSection
);


router.delete(
  "/delete-subsection/:subSectionId/:sectionId/:courseId",
  authMiddleware,
  isTeacher,
  deleteSubSection
);


router.post("/create-order",authMiddleware,isStudent,createOrder)

router.post("/verify-payment",authMiddleware,isStudent,verifyPayment)

router.get("/",authMiddleware,isStudent,getAllCoursesForStudent)
module.exports = router;
