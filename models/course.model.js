const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    duration: {
      type: Number,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Web Development",
        "Data Science",
        "AI/ML",
        "Blockchain",
        "Others",
      ],
      required: true,
    },
    tag: {
      type: String,
      required: true,
    },
    courseThumbnail: {
      type: String,
      required: true,
    },
    benifits: {
      type: [String],
      required: true,
    },
    requirements: {
      type: [String],
      required: true,
    },
    courseStatus: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
    },
    courseSections: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Section",
    },
    students: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
    },
  },
  { timestamps: true }
);

// Middleware to update `courseStatus` before saving
courseSchema.pre("save", function (next) {
  if (this.courseSections.length > 0 ) {
    this.courseStatus = "Published";
  } else {
    this.courseStatus = "Draft";
  }
  next();
});

module.exports = mongoose.model("Course", courseSchema);
