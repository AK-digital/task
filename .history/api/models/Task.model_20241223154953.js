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
    responsibles: {
      type: [Schema.Types.ObjectId],
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Task", taskSchema);
