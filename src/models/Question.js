import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
  {
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      required: true,
      index: true,
    },
    questionText: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },
    answerText: {
      type: String,
      required: [true, "Answer text is required"],
      trim: true,
    },
    position: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Question || mongoose.model("Question", QuestionSchema);
