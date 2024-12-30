import mongoose from "mongoose";
const { Schema } = mongoose;

const taskSchema = new Schema(
  {
    task: {
      type: String,
      required: true,
      unique: true,
      minlength: 2,
      maxlength: 255,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Task", taskSchema);
