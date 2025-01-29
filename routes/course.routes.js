const { createCourse } = require("../controllers/course.controller");
const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create-course", authMiddleware, createCourse);

module.exports = router;