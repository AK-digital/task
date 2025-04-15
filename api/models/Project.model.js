import mongoose from "mongoose";
const { Schema } = mongoose;

const projectSchema = new Schema(
  {
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
    note: {
      type: String,
      required: false,
    },
    members: {
      type: [
        {
          user: {
            type: Schema.Types.ObjectId,
            ref: "User",
          },
          role: {
            type: String,
            enum: ["owner", "manager", "team", "customer", "guest"],
            default: "guest",
          },
          order: {
            type: Number,
          },
        },
      ],
    },
    urls: {
      type: [
        {
          url: {
            type: String,
            required: false,
          },
          icon: {
            type: String,
            required: false,
          }
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Project", projectSchema);
