import mongoose from "mongoose";
const { Schema } = mongoose;

const projectInvitationSchema = new Schema(
  {
    invitedUser: { type: Schema.Types.ObjectId, ref: "User" },
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

export default mongoose.model("ProjectInvitation", projectInvitationSchema);
