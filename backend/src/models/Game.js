import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    board: {
      type: [String],
      default: () => Array(9).fill("")
    },
    currentPlayer: {
      type: String,
      enum: ["X", "O"],
      default: "X"
    },
    status: {
      type: String,
      enum: ["active", "ended"],
      default: "active"
    },
    winner: {
      type: String,
      enum: ["X", "O", "draw", null],
      default: null
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    endedAt: {
      type: Date,
      default: null
    }
  },
  { versionKey: false, timestamps: true }
);

export const Game = mongoose.model("Game", gameSchema);