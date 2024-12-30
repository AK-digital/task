import mongoose from "mongoose";
const { Schema } = mongoose;

const responseSchema = new Schema(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    message: {
      type: String,
      required: true,
    },
    taggedUsers: {
      type: [Schema.Types.ObjectId],
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Response", responseSchema);
