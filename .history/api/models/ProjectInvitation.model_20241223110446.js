import mongoose from "mongoose";
const { Schema } = mongoose;

const projectInvitationSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    guestEmail: { type: Schema.Types.ObjectId, ref: "User", unique: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

tokenBlackListSchema.index({ expireAt: 1 }, { expires: "24h" });

export default mongoose.model("ProjectInvitation", projectInvitationSchema);
