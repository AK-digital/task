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
      default: ["#ffffff", "#f4a261", "#2a9d8f", "#e9c46a", "#264653"],
    },
    color: {
      type: String,
      default: "#ffffff",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Board", boardSchema);
