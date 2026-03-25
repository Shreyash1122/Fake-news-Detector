import {
  createInitialState,
  queueDirection,
  step,
  togglePause,
  restart
} from "./gameLogic.js";

const TICK_MS = 130;

const boardEl = document.getElementById("board");
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");
const pauseBtn = document.getElementById("pause");
const restartBtn = document.getElementById("restart");
const controlButtons = Array.from(document.querySelectorAll("[data-dir]"));

let state = createInitialState({ width: 20, height: 20 });

function directionFromKey(key) {
  const normalized = key.toLowerCase();

  if (normalized === "arrowup" || normalized === "w") return "up";
  if (normalized === "arrowdown" || normalized === "s") return "down";
  if (normalized === "arrowleft" || normalized === "a") return "left";
  if (normalized === "arrowright" || normalized === "d") return "right";
  return null;
}

function render() {
  scoreEl.textContent = `Score: ${state.score}`;

  if (state.gameOver) {
    statusEl.textContent = "Game over. Press Restart to play again.";
  } else if (state.paused) {
    statusEl.textContent = "Paused.";
  } else {
    statusEl.textContent = "Use arrows or WASD to move.";
  }

  pauseBtn.textContent = state.paused ? "Resume" : "Pause";

  boardEl.innerHTML = "";
  const snakeSet = new Set(state.snake.map((segment) => `${segment.x},${segment.y}`));
  const foodKey = `${state.food.x},${state.food.y}`;

  for (let y = 0; y < state.height; y += 1) {
    for (let x = 0; x < state.width; x += 1) {
      const cell = document.createElement("div");
      const key = `${x},${y}`;
      cell.className = "cell";

      if (snakeSet.has(key)) {
        cell.classList.add("snake");
      } else if (key === foodKey) {
        cell.classList.add("food");
      }

      boardEl.appendChild(cell);
    }
  }
}

document.addEventListener("keydown", (event) => {
  if (event.key === " ") {
    state = togglePause(state);
    render();
    return;
  }

  const direction = directionFromKey(event.key);
  if (!direction) {
    return;
  }

  event.preventDefault();
  state = queueDirection(state, direction);
});

controlButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const direction = button.getAttribute("data-dir");
    state = queueDirection(state, direction);
  });
});

pauseBtn.addEventListener("click", () => {
  state = togglePause(state);
  render();
});

restartBtn.addEventListener("click", () => {
  state = restart(state);
  render();
});

setInterval(() => {
  state = step(state);
  render();
}, TICK_MS);

render();