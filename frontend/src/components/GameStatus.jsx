import React from "react";

export default function GameStatus({ game }) {
  if (!game) {
    return <p className="status">Press Start Game to begin.</p>;
  }

  if (game.status === "ended") {
    if (game.winner === "draw") {
      return <p className="status">Game ended: Draw.</p>;
    }

    if (game.winner) {
      return <p className="status">Game ended: Winner is {game.winner}.</p>;
    }

    return <p className="status">Game ended.</p>;
  }

  return <p className="status">Current player: {game.currentPlayer}</p>;
}