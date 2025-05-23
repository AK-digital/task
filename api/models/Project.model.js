import mongoose from "mongoose";
import MessageModel from "../models/Message.model.js";
import BoardModel from "../models/Board.model.js";
import TaskModel from "../models/Task.model.js";
const { Schema } = mongoose;

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 250,
    },
    logo: {
      type: String,
      trim: true,
      required: false,
    },
    note: {
      type: String,
      required: false,
    },
    members: {
      type: [
        {
          user: {
            type: Schema.Types.ObjectId,
            ref: "User",
          },
          role: {
            type: String,
            enum: ["owner", "manager", "team", "customer", "guest"],
            default: "guest",
          },
          order: {
            type: Number,
          },
        },
      ],
    },
    urls: {
      type: [
        {
          url: {
            type: String,
            required: true,
          },
          icon: {
            type: String,
            required: true,
          },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.pre("findOneAndDelete", async function (next) {
  const query = this;
  const projectToDelete = await query.model.findOne(query.getQuery());

  if (!projectToDelete) return next();

  const projectId = projectToDelete._id;

  await BoardModel.deleteMany({ projectId });
  await TaskModel.deleteMany({ projectId });
  await MessageModel.deleteMany({ projectId });

  next();
});

export default mongoose.model("Project", projectSchema);
