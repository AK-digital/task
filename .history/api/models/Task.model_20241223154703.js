import mongoose from "mongoose";
const { Schema } = mongoose;

const taskSchema = new Schema(
  {},
  {
    timestamps: true,
  }
);

export default mongoose.model("Task", taskSchema);
