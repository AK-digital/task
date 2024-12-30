import mongoose from "mongoose";
const { Schema } = mongoose;

const projectInvitationSchema = new Schema({
  invitedUser: { type: Schema.Types.ObjectId, ref: "User" },
});

export default mongoose.model("ProjectInvitation", projectInvitationSchema);
