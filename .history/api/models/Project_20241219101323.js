import mongoose from "mongoose";
const { Schema } = mongoose;

const projectSchema = new Schema(
  {},
  {
    timestamps: true,
  }
);

export default mongoose.model("Project", projectSchema);
