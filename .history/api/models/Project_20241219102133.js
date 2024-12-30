import mongoose from "mongoose";
const { Schema } = mongoose;

const projectSchema = new Schema(
  {
    creator: {},
    name: {
      type: String,
      required: true,
    },
    boards: [],
    guests: {},
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Project", projectSchema);
