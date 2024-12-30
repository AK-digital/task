import { Schema, SchemaType } from "mongoose";

const refreshTokenSchema = new Schema({
  userId: {
    type: { type: Schema.Types.ObjectId, ref: "User" },
    required: true,
  },
});
