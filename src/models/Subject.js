import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true,
      maxlength: [80, "Subject name cannot exceed 80 characters"],
    },
    color: {
      type: String,
      default: "#0e87e8",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

SubjectSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.models.Subject || mongoose.model("Subject", SubjectSchema);
