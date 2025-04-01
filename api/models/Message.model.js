import mongoose from "mongoose";
const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    message: {
      type: String,
    },
    taggedUsers: {
      type: [Schema.Types.ObjectId],
      ref: "User",
    },
    files: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Message", messageSchema);
