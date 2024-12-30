import mongoose from "mongoose";
const { Schema } = mongoose;

const taskSchema = new Schema(
  {
    task: {
      type: String,
      required: true,
      unique: true,
      minlength: [2, "Le nom de famille doit contenir au moins 2 caractères"],
      maxlength: [50, "Le nom de famille ne peut pas dépasser 50 caractères"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Task", taskSchema);
