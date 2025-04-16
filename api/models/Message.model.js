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
    readBy: {
      type: [Schema.Types.ObjectId],
      ref: "User"
    },
    reactions: {
      heart: {
        type: [Schema.Types.ObjectId],
        ref: "User",
      },
      laugh: {
        type: [Schema.Types.ObjectId],
        ref: "User",
      },
      sad: {
        type: [Schema.Types.ObjectId],
        ref: "User",
      },
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Message", messageSchema);
