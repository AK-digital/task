import mongoose from "mongoose";
const { Schema } = mongoose;

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    guests: {},
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Project", projectSchema);
