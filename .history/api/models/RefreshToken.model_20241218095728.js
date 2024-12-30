import { Schema } from "mongoose";

const refreshTokenSchema = new Schema({
  userId: {
    type: { Schema },
    required: true,
  },
});
