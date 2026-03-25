import { Router } from "express";
import { Game } from "../models/Game.js";

const router = Router();

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

function calculateWinner(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return board[a];
    }
  }

  if (board.every((cell) => cell)) {
    return "draw";
  }

  return null;
}

router.post("/start", async (_req, res) => {
  const game = await Game.create({});
  res.status(201).json(game);
});

router.get("/:id", async (req, res) => {
  const game = await Game.findById(req.params.id);
  if (!game) {
    return res.status(404).json({ message: "Game not found" });
  }

  return res.json(game);
});

router.post("/:id/move", async (req, res) => {
  const { index } = req.body;
  if (!Number.isInteger(index) || index < 0 || index > 8) {
    return res.status(400).json({ message: "index must be an integer between 0 and 8" });
  }

  const game = await Game.findById(req.params.id);
  if (!game) {
    return res.status(404).json({ message: "Game not found" });
  }

  if (game.status === "ended") {
    return res.status(400).json({ message: "Game already ended" });
  }

  if (game.board[index]) {
    return res.status(400).json({ message: "Cell already occupied" });
  }

  game.board[index] = game.currentPlayer;

  const winner = calculateWinner(game.board);
  if (winner) {
    game.winner = winner;
    game.status = "ended";
    game.endedAt = new Date();
  } else {
    game.currentPlayer = game.currentPlayer === "X" ? "O" : "X";
  }

  await game.save();
  return res.json(game);
});

router.post("/:id/end", async (req, res) => {
  const { winner = null } = req.body;
  if (!["X", "O", "draw", null].includes(winner)) {
    return res.status(400).json({ message: "winner must be X, O, draw or null" });
  }

  const game = await Game.findById(req.params.id);
  if (!game) {
    return res.status(404).json({ message: "Game not found" });
  }

  game.status = "ended";
  game.winner = winner;
  game.endedAt = new Date();
  await game.save();

  return res.json(game);
});

export default router;