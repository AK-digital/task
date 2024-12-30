import mongoose, { Schema, SchemaType } from "mongoose";
import { date } from "zod";

const refreshTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    expireAt: { type: Date, default: Date.now() + 30 * 30 },
  },
  {
    timestamps: true,
  }
);

refreshTokenSchema.index({ expireAt: 1 }, { expireAfterSeconds: 60 });

export default mongoose.model("RefreshToken", refreshTokenSchema);
