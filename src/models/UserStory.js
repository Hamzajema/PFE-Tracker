// models/UserStory.js
const mongoose = require("mongoose");

const userStorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    acceptanceCriteria: [
      {
        type: String,
      },
    ],
    sprint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sprint",
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    storyPoints: {
      type: Number,
      min: 1,
      max: 100,
    },
    status: {
      type: String,
      enum: ["todo", "inprogress", "done"],
      default: "todo",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UserStory", userStorySchema);
