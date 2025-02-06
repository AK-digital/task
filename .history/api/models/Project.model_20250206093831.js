import mongoose from "mongoose";
const { Schema } = mongoose;

const projectSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 250,
    },
    logo: {
      type: String,
      trim: true,
      required: false,
    },
    guests: {
      type: [Schema.Types.ObjectId],
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Project", projectSchema);
