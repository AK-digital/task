import mongoose, { Schema } from "mongoose";

const tokenBlackListSchema = new Schema(
  {
    refreshToken: {
      type: String,
      required: true,
    },
    expireAt: { type: Date, default: Date.now() },
  },
  {
    timestamps: true,
  }
);

refreshTokenSchema.index({ expireAt: 1 }, { expires: "1m" });

export default mongoose.model("TokenBlackList", tokenBlackListSchema);
