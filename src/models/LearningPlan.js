import mongoose from "mongoose";

const LearningPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LearningResource",
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Plan title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    planType: {
      type: String,
      enum: ["day-wise", "step-wise", "custom"],
      default: "day-wise",
    },
    startDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.LearningPlan || mongoose.model("LearningPlan", LearningPlanSchema);
