import mongoose, { Schema } from "mongoose";

const tokenBlackListSchema = new Schema(
  {
    accessToken: {
      type: String,
      required: true,
      unique: true,
    },
    refreshToken: {
      type: String,
      required: true,
      unique: true,
    },
    expireAt: { type: Date, default: Date.now() },
  },
  {
    timestamps: true,
  }
);

refreshTokenSchema.index({ expireAt: 1 }, { expires: "1m" });

export default mongoose.model("TokenBlackList", tokenBlackListSchema);
