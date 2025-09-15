import mongoose from "mongoose";

const betaRequestSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index TTL conditionnel pour supprimer automatiquement les documents non vérifiés après 30 jours
betaRequestSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 60 * 60 * 24 * 30, // 30 jours en secondes,
    partialFilterExpression: { verified: false },
  }
);

export default mongoose.model("BetaRequest", betaRequestSchema);
