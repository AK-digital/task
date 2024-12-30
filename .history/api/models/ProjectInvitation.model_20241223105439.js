import mongoose from "mongoose";
const { Schema } = mongoose;

const projectInvitationSchema = new Schema({
    invitedUser: 
});

export default mongoose.model("ProjectInvitation", projectInvitationSchema);
