import mongoose from "mongoose";
import MessageModel from "./Message.model.js";
import TaskModel from "./Task.model.js";
import {
  destroyMessageFiles,
  destroyTaskFiles,
} from "../helpers/cloudinary.js";
const { Schema } = mongoose;

const boardSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    title: {
      type: String,
      required: true,
    },
    colors: {
      type: [String], // Tableau de chaînes
      default: [
        "#007bff",
        "#28a745",
        "#ffc107",
        "#dc3545",
        "#4ECDC4",
        "#556270",
        "#aa51c4",
        "#D35400",
        "#2574A9",
        "#26A65B",
        "#F5D76E",
        "#663399",
        "#E74C3C",
      ],
    },
    color: {
      type: String,
      required: true,
      default: "#ffffff",
    },
    archived: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

boardSchema.pre(["deleteOne", "findOneAndDelete"], async function () {
  const boardId = this.getQuery()._id;

  const tasks = await TaskModel.find({ boardId: boardId });

  for (const task of tasks) {
    await destroyTaskFiles(task);
    const messages = await MessageModel.find({ taskId: task._id });

    for (const message of messages) {
      await destroyMessageFiles(message);
    }

    await MessageModel.deleteMany({ taskId: task._id });
  }

  await TaskModel.deleteMany({ boardId: boardId });
});

export default mongoose.model("Board", boardSchema);
