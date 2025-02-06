import mongoose from "mongoose";
const { Schema } = mongoose;

const notificationSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: String,
  read: Boolean,
});
