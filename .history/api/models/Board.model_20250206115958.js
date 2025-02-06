import mongoose from "mongoose";
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
      default: ["#ffffff", "#007bff", "#28a745", "#ffc107", "#dc3545"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Board", boardSchema);
