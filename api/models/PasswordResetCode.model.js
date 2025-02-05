import mongoose from "mongoose";
const { Schema } = mongoose;

const PasswordResetCodeSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    resetCode: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("PasswordResetCode", PasswordResetCodeSchema);
