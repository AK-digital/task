import mongoose from "mongoose";
const { Schema } = mongoose;

const emailChangeSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  oldEmail: {
    type: String,
    required: true,
  },
  newEmail: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // Token expires after 1 hour (3600 seconds)
  },
});

export default mongoose.model("EmailChange", emailChangeSchema);
