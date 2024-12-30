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
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    text: {
      type: String,
      required: true,
      unique: true,
      minlength: 2,
      maxlength: 255,
    },
    description: {
      type: String,
      minlength: 2,
      maxlength: 1250,
    },
    responsibles: {
      type: [Schema.Types.ObjectId],
      ref: "User",
    },
    timeTracking: {
      totalTime: {
        type: Number, // Temps total passé sur la tâche (en millisecondes)
        default: 0,
      },
      sessions: [
        {
          userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          startTime: {
            type: Date, // Début de la session
            required: true,
          },
          endTime: {
            type: Date, // Fin de la session
          },
          duration: {
            type: Number, // Durée en millisecondes
            default: 0, // Calculé automatiquement si endTime est fourni
          },
        },
      ],
    },
    status: {
      type: String,
      enum: ["processing", "pending", "finished", "todo", "blocked"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "low",
    },
    deadline: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Task", taskSchema);
