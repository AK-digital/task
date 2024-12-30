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
      ref: "Project",
    },
    task: {
      type: String,
      required: true,
      unique: true,
      minlength: 2,
      maxlength: 255,
    },
    responsibles: {
      type: [Schema.Types.ObjectId],
      ref: "User",
    },
    status: {
      type: String,
      enum: ["processing", "pending", "finished"],
      default: "pending",
    },
    deadline: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Task", taskSchema);
