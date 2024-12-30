import mongoose from "mongoose";
const { Schema } = mongoose;

const taskSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    boardId: {
      type: Schema.Types.ObjectId,
      ref: "Board",
    },
    text: {
      type: String,
      required: true,
      unique: true,
      minlength: 2,
      maxlength: 255,
    },
    description: {
      type: String,
      minlength: 2,
      maxlength: 1250,
    },
    responsibles: {
      type: [Schema.Types.ObjectId],
      ref: "User",
    },
    status: {
      type: String,
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "low",
    },
    deadline: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Task", taskSchema);
