import mongoose from "mongoose";
const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    senderId: { type: Schema.Types.ObjectId, ref: "User" },

    message: {
      title: { type: String, required: true },
      content: { type: String, required: true },
    },
    read: { type: Boolean, default: false },
    link: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Notification", notificationSchema);
