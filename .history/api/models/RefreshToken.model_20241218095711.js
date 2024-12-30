import { Schema } from "mongoose";

const refreshTokenSchema = new Schema({
  userId: {
    type: { Object },
    required: true,
  },
});
