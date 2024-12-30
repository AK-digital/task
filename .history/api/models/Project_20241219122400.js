import mongoose from "mongoose";
const { Schema } = mongoose;

const projectSchema = new Schema(
  {
    creator: {},
    name: {
      type: String,
      required: true,
    },
    boards: {
      type: [Schema.Types.ObjectId],
      ref: "User",
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
