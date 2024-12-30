import mongoose from "mongoose";
const { Schema } = mongoose

const userSchema = new Schema({
    lastName: {
        type: String,
        required: true,
        trim: true,
        minlength: [2, "Le nom de famille doit contenir au moins 2 caractères"],
        maxlength: [50, "Le nom de famille ne peut pas dépasser 50 caractères"],
    },

})