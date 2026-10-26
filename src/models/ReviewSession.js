import mongoose from "mongoose";

const ReviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      required: true,
      index: true,
    },
    result: {
      type: String,
      enum: ["forgot", "partial", "remembered"],
      required: true,
    },
    previousStage: {
      type: Number,
      default: null,
    },
    newStage: {
      type: Number,
      default: null,
    },
    previousNextReviewAt: {
      type: Date,
      default: null,
    },
    newNextReviewAt: {
      type: Date,
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ReviewSession || mongoose.model("ReviewSession", ReviewSessionSchema);
