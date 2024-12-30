import mongoose from "mongoose";
const { Schema } = mongoose;

const taskSchema = new Schema(
  {
    projectId: {}
    task: {
      type: String,
      required: true,
      unique: true,
      minlength: 2,
      maxlength: 255,
    },
    responsibles: {
      type: [Schema.Types.ObjectId],
      ref: "User",
    },
    status: {
      type: String,
      enum: ["processing", "pending", "finished"],
      default: "pending",
    },
    deadline: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Task", taskSchema);
