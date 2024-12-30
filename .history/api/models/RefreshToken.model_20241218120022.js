import mongoose, { Schema, SchemaType } from "mongoose";

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
  },
  {
    timestamps: true,
  }
);

refreshTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

export default mongoose.model("RefreshToken", refreshTokenSchema);
