import mongoose from "mongoose";
const { Schema } = mongoose;

const boardSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Board", boardSchema);
