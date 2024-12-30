import mongoose from "mongoose";
const { Schema } = mongoose;

const boardSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  color: {
    type: String,
  },
});

export default mongoose.model("Board", boardSchema);
