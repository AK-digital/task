import mongoose from "mongoose";
const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    senderId: { type: Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      required: true,
      enum: [
        "mention",
        "reaction",
        "task_assigned",
        "project_invitation",
        "generic",
      ],
    },
    params: {
      type: Object,
      default: {},
    },
    read: { type: Boolean, default: false },
    link: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Notification", notificationSchema);
