import mongoose from "mongoose";
const { Schema } = mongoose;

const milestoneSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 100,
    },
    description: {
      type: String,
      required: false,
      maxLength: 500,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    color: {
      type: String,
      required: true,
      default: "#3b82f6",
    },
    order: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index pour optimiser les requêtes
milestoneSchema.index({ projectId: 1, order: 1 });

export default mongoose.model("Milestone", milestoneSchema);
