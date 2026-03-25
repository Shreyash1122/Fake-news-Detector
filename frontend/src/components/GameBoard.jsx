import React from "react";

export default function GameBoard({ board, disabled, onCellClick }) {
  return (
    <div className="board">
      {board.map((value, index) => (
        <button
          key={index}
          className="cell"
          onClick={() => onCellClick(index)}
          disabled={disabled || Boolean(value)}
          type="button"
        >
          {value}
        </button>
      ))}
    </div>
  );
}