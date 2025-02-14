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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ProjectInvitation", projectInvitationSchema);
