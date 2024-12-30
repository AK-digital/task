import mongoose from "mongoose";
const { Schema } = mongoose;

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    color: {
      type: String,
    },
    tasks: {
      type: [Schema.Types.ObjectId],
      ref: "Task",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Task", taskSchema);
