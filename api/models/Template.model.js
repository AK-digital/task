import mongoose from "mongoose";
const { Schema } = mongoose;

const templateSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 250,
    },
    description: {
      type: String,
      required: false,
      maxlength: 1000,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project", // Permet de dupliquer la structure d'un projet existant
      required: false,
    },
    private: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

templateSchema.pre("aggregate", function () {
  this.lookup({
    from: "boards",
    localField: "project",
    foreignField: "projectId",
    as: "boards",
  });
  this.lookup({
    from: "tasks",
    localField: "project",
    foreignField: "projectId",
    as: "tasks",
  });
  this.lookup({
    from: "users",
    localField: "author",
    foreignField: "_id",
    as: "creator",
  });
  this.addFields({
    boardsCount: { $size: "$boards" },
    tasksCount: { $size: "$tasks" },
    creator: { $arrayElemAt: ["$creator", 0] },
    // Grouper les tâches par board
    boardsWithTasks: {
      $map: {
        input: "$boards",
        as: "board",
        in: {
          _id: "$$board._id",
          title: "$$board.title",
          color: "$$board.color",
          tasks: {
            $filter: {
              input: "$tasks",
              as: "task",
              cond: { $eq: ["$$task.boardId", "$$board._id"] }
            }
          }
        }
      }
    }
  });

  this.project({
    name: 1,
    description: 1,
    author: 1,
    project: 1,
    private: 1,
    createdAt: 1,
    updatedAt: 1,
    boardsCount: 1,
    tasksCount: 1,
    boardsWithTasks: 1,
    "creator.name": 1,
    "creator.picture": 1
  })
});

export default mongoose.model("Template", templateSchema);
