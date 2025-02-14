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
      default: () => Date.now() + 14 * 24 * 60 * 60 * 1000, // 14 jours
      index: { expires: "14d" },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("RefreshToken", refreshTokenSchema);
