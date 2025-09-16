import mongoose from "mongoose";
const { Schema } = mongoose;

const timeTrackingSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
    },
    subtaskId: {
      type: Schema.Types.ObjectId,
      ref: "Subtask",
    },
    taskText: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
    },
    isRunning: {
      type: Boolean,
      default: false,
    },
    duration: {
      type: Number,
      default: 0,
    },
    billable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Validation pour s'assurer qu'au moins taskId ou subtaskId est présent
timeTrackingSchema.pre('save', function(next) {
  if (!this.taskId && !this.subtaskId) {
    const error = new Error('Au moins taskId ou subtaskId doit être spécifié');
    return next(error);
  }
  next();
});

export default mongoose.model("TimeTracking", timeTrackingSchema);
