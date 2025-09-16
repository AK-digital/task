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
    subtaskId: {
      type: Schema.Types.ObjectId,
      ref: "Subtask",
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
    files: [
      {
        name: {
          type: String,
        },
        url: {
          type: String,
        },
        size: {
          type: Number,
        },
      },
    ],
    readBy: {
      type: [Schema.Types.ObjectId],
      ref: "User",
    },
    reactions: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        emoji: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Validation pour s'assurer qu'au moins taskId ou subtaskId est présent
messageSchema.pre('save', function(next) {
  if (!this.taskId && !this.subtaskId) {
    const error = new Error('Au moins taskId ou subtaskId doit être spécifié');
    return next(error);
  }
  next();
});

export default mongoose.model("Message", messageSchema);
