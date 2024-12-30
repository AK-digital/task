import mongoose, { Schema, SchemaType } from "mongoose";

const refreshTokenSchema = new Schema({
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
  createdAt: { type: Date, expires: "1m", default: Date.now },
});

refreshTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 });

export default mongoose.model("RefreshToken", refreshTokenSchema);
