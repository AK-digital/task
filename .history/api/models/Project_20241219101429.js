import mongoose from "mongoose";
const { Schema } = mongoose;

const projectSchema = new Schema(
  {
    users: {},
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Project", projectSchema);
