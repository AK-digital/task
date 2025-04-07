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
        },
      ],
    },
    urls: {
      type: {
        website: {
          type: String,
          required: false,
        },
        admin: {
          type: String,
          required: false,
        },
        figma: {
          type: String,
          required: false,
        },
        github: {
          type: String,
          required: false,
        },
      },
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Project", projectSchema);
