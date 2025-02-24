import mongoose, { Schema } from "mongoose";

const refreshTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      default: () => Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 jours
      index: { expires: "7d" },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("RefreshToken", refreshTokenSchema);
