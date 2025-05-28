import mongoose from "mongoose";
const { Schema } = mongoose;

const prioritySchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    name: {
      type: String,
    },
    color: {
      type: String,
      required: true,
      trim: true,
      match: /^#([0-9A-Fa-f]{6})$/,
    },
  },
  {
    timestamps: true,
  }
);

// Color must be unique for each project
prioritySchema.index({ projectId: 1, color: 1 }, { unique: true });

export default mongoose.model("Priority", prioritySchema);
