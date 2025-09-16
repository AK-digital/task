import mongoose from "mongoose";
const { Schema } = mongoose;

const subtaskSchema = new Schema(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 255,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 255,
      default: function() { return this.title; }
    },
    description: {
      author: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      text: {
        type: String,
        maxlength: 1250,
      },
      createdAt: {
        type: Date,
      },
      updatedAt: {
        type: Date,
      },
      reactions: [
        {
          userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
          },
          emoji: {
            type: String,
          },
        },
      ],
      files: [
        {
          name: {
            type: String,
          },
          url: {
            type: String,
          },
          size: {
            type: Number,
          },
        },
      ],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
    },
    completedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: Schema.Types.ObjectId,
      ref: "Status",
    },
    priority: {
      type: Schema.Types.ObjectId,
      ref: "Priority",
    },
    deadline: {
      type: Date,
    },
    estimation: {
      type: String, // même format que les tâches (ex: "2 heures", "30 minutes")
    },
    responsibles: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    timeTrackings: [{
      type: Schema.Types.ObjectId,
      ref: "TimeTracking",
    }],
    messages: [{
      type: Schema.Types.ObjectId,
      ref: "Message",
    }],
  },
  {
    timestamps: true,
  }
);

// Index pour optimiser les requêtes
subtaskSchema.index({ taskId: 1, order: 1 });

export default mongoose.model("Subtask", subtaskSchema);
