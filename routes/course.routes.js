const { createCourse } = require("../controllers/course.controller");
const router = require("express").Router();


router.post("/create-course", createCourse);

module.exports = router;