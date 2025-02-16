const multer = require("multer");

// Configure storage (Keep original filename)
const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

// File type validation (Allow images & videos)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
        cb(null, true);
    } else {
        cb(new Error("Only images and videos are allowed!"), false);
    }
};

// Initialize multer with updated config
exports.upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 30 * 1024 * 1024, // 30MB max file size
    }
});
