const { createCourse,getCourses } = require("../controllers/course.controller");
const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create-course", authMiddleware, createCourse);
router.get("/get-courses", authMiddleware, getCourses);

module.exports = router;