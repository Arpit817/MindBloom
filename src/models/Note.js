import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
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
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Note title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    content: {
      type: String,
      default: "",
    },
    reviewStage: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    freshnessScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
      index: true,
    },
    nextReviewAt: {
      type: Date,
      default: () => new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Default: 2 days from creation
      index: true,
    },
    lastReviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

NoteSchema.index({ userId: 1, nextReviewAt: 1 });
NoteSchema.index({ userId: 1, subjectId: 1 });

export default mongoose.models.Note || mongoose.model("Note", NoteSchema);
