import mongoose from "mongoose";
const { Schema } = mongoose;

const subtaskSchema = new Schema(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 255,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
    },
    completedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: Schema.Types.ObjectId,
      ref: "Status",
    },
    priority: {
      type: Schema.Types.ObjectId,
      ref: "Priority",
    },
    deadline: {
      type: Date,
    },
    estimation: {
      type: Number, // en heures
    },
    responsibles: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
  },
  {
    timestamps: true,
  }
);

// Index pour optimiser les requêtes
subtaskSchema.index({ taskId: 1, order: 1 });

export default mongoose.model("Subtask", subtaskSchema);
