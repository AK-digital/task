import mongoose from "mongoose";
const { Schema } = mongoose;

const favoriteSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index composé pour éviter les doublons
favoriteSchema.index({ user: 1, project: 1 }, { unique: true });

export default mongoose.model("Favorite", favoriteSchema);
