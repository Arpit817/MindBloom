import mongoose from "mongoose";

const LearningResourceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      default: null,
      index: true,
    },
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Resource title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    url: {
      type: String,
      required: [true, "URL is required"],
      trim: true,
    },
    platform: {
      type: String,
      enum: ["YouTube", "Other"],
      default: "Other",
    },
    resourceType: {
      type: String,
      enum: ["video", "playlist", "link"],
      default: "link",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.LearningResource || mongoose.model("LearningResource", LearningResourceSchema);
