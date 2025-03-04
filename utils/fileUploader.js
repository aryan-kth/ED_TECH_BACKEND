// utils/fileUploader.js
const cloudinary = require("../configs/cloudinary.config");

// Media file upload karne ka function
const fileUploader = async (file) => {
  try {
    // File ko upload karna
    const uploadResult = await cloudinary.uploader.upload(file.path, {
      folder: "lectures", // Cloudinary folder
      resource_type: "auto", // Auto-detect file type (image/video/pdf)
    });

    // Upload hone par file URL return karo
    return {
      url: uploadResult.secure_url, // Cloudinary URL
      public_id: uploadResult.public_id, // Public ID for further reference
    };
  } catch (error) {
    console.error("File upload failed:", error);
    throw new Error(`File upload failed: ${error.message}`);
  }
};

module.exports = fileUploader;
