import mongoose from "mongoose";
const { Schema } = mongoose;

const projectSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
    },
    name: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 250,
    },
    boards: {
      type: [Schema.Types.ObjectId],
      ref: "Board",
      unique: true,
    },
    guests: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Project", projectSchema);
