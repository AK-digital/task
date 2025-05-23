import mongoose from "mongoose";
const { Schema } = mongoose;

const customStatusSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    statuses: [
      {
        status: {
          type: String,
          required: true,
        },
        color: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("CustomStatus", customStatusSchema);
