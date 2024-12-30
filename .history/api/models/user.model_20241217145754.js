import mongoose from "mongoose";
const { Schema } = mongoose

const userSchema = new Schema({
    lastName: {
        type: String,
        required: true,
        trim: true,
    },

})