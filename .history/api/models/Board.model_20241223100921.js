import mongoose from "mongoose";
const { Schema } = mongoose;

const boardSchema = new Schema({});

export default mongoose.model("Board", boardSchema);
