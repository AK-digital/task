import mongoose from "mongoose";
const { Schema } = mongoose;

const projectInvitationSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    guestEmail: {
      type: String,
      trim: true,
      lowercase: true,
      required: "Une adresse mail est requise",
    },
    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending",
    },
    expireAt: { type: Date, default: Date.now() },
  },
  {
    timestamps: true,
  }
);

projectInvitationSchema.index({ expireAt: 1 }, { expires: "1h" });

export default mongoose.model("ProjectInvitation", projectInvitationSchema);
