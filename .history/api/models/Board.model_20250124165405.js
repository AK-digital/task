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
      default: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"],
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
