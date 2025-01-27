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
      type: String,
      minlength: 2,
      maxlength: 1250,
    },
    files: {
      type: [String],
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
          },
          startTime: {
            type: Date, // Début de la session
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
      enum: ["En cours", "En attente", "Terminée", "À faire", "bloquée"],
      default: "En attente",
    },
    priority: {
      type: String,
      enum: ["Basse", "Moyenne", "Haute", "Urgent"],
      default: "Basse",
    },
    deadline: {
      type: Date,
    },
    order: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Task", taskSchema);
