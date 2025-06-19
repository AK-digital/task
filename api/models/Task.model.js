import mongoose from "mongoose";
import { allowedPriorities, allowedStatus } from "../utils/utils.js";
import MessageModel from "./Message.model.js";
import { destroyMessageFiles } from "../helpers/cloudinary.js";
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
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    text: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 255,
    },
    description: {
      author: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      text: {
        type: String,
        maxlength: 1250,
      },
      createdAt: {
        type: Date,
      },
      updatedAt: {
        type: Date,
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
    },
    messages: {
      type: [Schema.Types.ObjectId],
      ref: "Message",
    },
    files: {
      type: [String],
    },
    responsibles: {
      type: [Schema.Types.ObjectId],
      ref: "User",
    },
    status: {
      type: Schema.Types.ObjectId,
      ref: "Status",
    },
    priority: {
      type: Schema.Types.ObjectId,
      ref: "Priority",
    },
    timeTrackings: {
      type: [Schema.Types.ObjectId],
      ref: "TimeTracking",
    },
    deadline: {
      type: Date,
    },
    estimation: {
      type: String,
    },
    taggedUsers: {
      type: [Schema.Types.ObjectId],
      ref: "User",
    },
    order: {
      type: Number,
    },
    archived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Task", taskSchema);
