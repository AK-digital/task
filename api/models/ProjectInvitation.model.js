import mongoose from "mongoose";
const { Schema } = mongoose;

const projectInvitationSchema = new Schema({
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
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // Token expires after 1 hour (3600 seconds)
  },
});

export default mongoose.model("ProjectInvitation", projectInvitationSchema);
