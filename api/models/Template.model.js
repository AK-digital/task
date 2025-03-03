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
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project", // Permet de dupliquer la structure d'un projet existant
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Template", templateSchema);
