import mongoose from "mongoose";
import BoardModel from "./Board.model.js";
import TaskModel from "./Task.model.js";
import StatusModel from "./Status.model.js";
import PriorityModel from "./Priority.model.js";
import ProjectInvitationModel from "./ProjectInvitation.model.js";
import TimeTrackingModel from "./TimeTracking.model.js";
import FavoriteModel from "./Favorite.model.js";
import MessageModel from "./Message.model.js";
import DraftModel from "./Draft.model.js";
import { getMatches } from "../utils/utils.js";
import {
  destroyFile,
  destroyMessageFiles,
  destroyTaskFiles,
} from "../helpers/cloudinary.js";

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

projectSchema.pre("aggregate", function () {
  this.lookup({
    from: "users",
    localField: "members.user",
    foreignField: "_id",
    as: "membersData",
    pipeline: [
      { $project: { lastName: 1, firstName: 1, email: 1, picture: 1 } },
    ],
  });
  this.lookup({
    from: "status",
    localField: "_id",
    foreignField: "projectId",
    as: "status",
  });
  this.lookup({
    from: "boards",
    localField: "_id",
    foreignField: "projectId",
    as: "boards",
  });
  this.lookup({
    from: "tasks",
    localField: "_id",
    foreignField: "projectId",
    as: "tasks",
  });
  this.lookup({
    from: "favorites",
    localField: "_id",
    foreignField: "project",
    as: "favorites",
    pipeline: [{ $project: { _id: 1, user: 1 } }],
  });
  this.addFields({
    members: {
      $map: {
        input: "$members",
        as: "member",
        in: {
          role: "$$member.role",
          order: "$$member.order",
          user: {
            $first: {
              $filter: {
                input: "$membersData",
                cond: { $eq: ["$$this._id", "$$member.user"] },
              },
            },
          },
        },
      },
    },
    statuses: {
      $map: {
        input: "$status",
        as: "status",
        in: {
          _id: "$$status._id",
          name: "$$status.name",
          color: "$$status.color",
          count: {
            $size: {
              $filter: {
                input: "$tasks",
                cond: { $eq: ["$$this.status", "$$status._id"] },
              },
            },
          },
        },
      },
    },
    tasksCount: { $size: "$tasks" },
    boardsCount: { $size: "$boards" },
  });
  // We don't want to return the tasks and boards and membersData in the response
  this.project({
    tasks: 0,
    boards: 0,
    membersData: 0,
    status: 0,
  });
});

// Middleware pour la suppression en cascade
projectSchema.pre(["deleteOne", "findOneAndDelete"], async function () {
  const projectId = this.getQuery()._id;

  // Suppression en cascade des éléments liés au projet
  await BoardModel.deleteMany({ projectId: projectId });
  await StatusModel.deleteMany({ projectId: projectId });
  await PriorityModel.deleteMany({ projectId: projectId });
  await TimeTrackingModel.deleteMany({ projectId: projectId });
  await ProjectInvitationModel.deleteMany({ projectId: projectId });
  await FavoriteModel.deleteMany({ project: projectId });
  await DraftModel.deleteMany({ projectId: projectId });

  const tasks = await TaskModel.find({ projectId: projectId });

  for (const task of tasks) {
    await destroyTaskFiles(task);
  }

  await TaskModel.deleteMany({ projectId: projectId });

  const messages = await MessageModel.find({ projectId: projectId });

  for (const message of messages) {
    await destroyMessageFiles(message);
  }

  await MessageModel.deleteMany({ projectId: projectId });
});

export default mongoose.model("Project", projectSchema);
