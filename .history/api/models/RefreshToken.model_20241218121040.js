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
    expireAt: { type: Date, required: true }, // Champ utilisé pour le TTL
  },
  {
    expires: "1m",
    timestamps: true,
  }
);

export default mongoose.model("RefreshToken", refreshTokenSchema);
