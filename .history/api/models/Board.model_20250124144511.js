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
      type: String,
      default: "#ffff",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Board", boardSchema);
