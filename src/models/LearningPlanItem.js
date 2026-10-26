import mongoose from "mongoose";

const LearningPlanItemSchema = new mongoose.Schema(
  {
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LearningPlan",
      required: true,
      index: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LearningResource",
      default: null,
    },
    title: {
      type: String,
      required: [true, "Item title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    stepNumber: {
      type: Number,
      default: null,
    },
    dayNumber: {
      type: Number,
      default: null,
    },
    scheduledDate: {
      type: Date,
      default: null,
      index: true,
    },
    completed: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.LearningPlanItem || mongoose.model("LearningPlanItem", LearningPlanItemSchema);
