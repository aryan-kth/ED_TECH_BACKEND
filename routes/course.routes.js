const { createCourse, getCourses } = require("../controllers/course.controller");
const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const { upload } = require("../middleware/multer.middleware");

// Use upload.single for single file upload, 'courseThumbnail' is the field name
router.post("/create-course", authMiddleware, upload.single('courseThumbnail'), createCourse);
router.get("/get-courses", authMiddleware, getCourses);

module.exports = router;