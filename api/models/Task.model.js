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
      type: String,
      enum: [
        "En cours",
        "En attente",
        "Terminée",
        "À faire",
        "À vérifier",
        "Bloquée",
      ],
      default: "En attente",
    },
    priority: {
      type: String,
      enum: ["Basse", "Moyenne", "Haute", "Urgent"],
      default: "Moyenne",
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
