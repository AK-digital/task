import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 1200,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", FeedbackSchema);
