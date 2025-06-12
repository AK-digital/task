import mongoose from "mongoose";
const { Schema } = mongoose;

const templateSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 250,
    },
    description: {
      type: String,
      required: false,
      maxlength: 1000,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    boardId: {
      type: Schema.Types.ObjectId,
      ref: "Board",
      required: false,
    },
    private: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("BoardTemplate", templateSchema);
