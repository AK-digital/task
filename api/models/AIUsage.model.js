import mongoose from "mongoose";
const { Schema } = mongoose;

const AIUsageSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["project_generation", "task_generation", "other"],
      default: "project_generation",
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
    },
    success: {
      type: Boolean,
      default: true,
    },
    errorMessage: {
      type: String,
      trim: true,
    },
    tokensUsed: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour optimiser les requêtes de limitation par jour
AIUsageSchema.index({ userId: 1, date: 1 });
AIUsageSchema.index({ userId: 1, type: 1, date: 1 });

export default mongoose.model("AIUsage", AIUsageSchema);
