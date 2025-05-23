import mongoose from "mongoose";
const { Schema } = mongoose;

const customStatusSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    status: {
      type: String,
      required: true,
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

// Status and color must be unique for each project
customStatusSchema.index({ projectId: 1, status: 1 }, { unique: true });
customStatusSchema.index({ projectId: 1, color: 1 }, { unique: true });

export default mongoose.model("CustomStatus", customStatusSchema);
