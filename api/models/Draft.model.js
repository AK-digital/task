import mongoose from "mongoose";
const { Schema } = mongoose;

const draftSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["message", "description"], // Type de brouillon : message ou description
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String, // Contenu du brouillon (message ou description)
      required: true,
    },
  },
  {
    timestamps: true, // Ajoute createdAt et updatedAt automatiquement
  }
);

export default mongoose.model("Draft", draftSchema);
