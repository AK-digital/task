import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
  lastName: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, "Le nom de famille doit contenir au moins 2 caractères"],
    maxlength: [50, "Le nom de famille ne peut pas dépasser 50 caractères"],
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, "Le prénom doit contenir au moins 2 caractères"],
    maxlength: [50, "Le prénom ne peut pas dépasser 50 caractères"],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: "Une adresse mail est requise",
  },
  password: {
    type: String,
    trim: true,
    required: "Un mot de passe est requis",
  },
  picture: {
    type: String,
    trim: true,
    required: false,
    default: "", // Photo de profil par défaut de Task
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin"],
  },
});

export default mongoose.model("User", userSchema);
