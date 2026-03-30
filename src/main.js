import {
  createInitialState,
  queueDirection,
  step,
  togglePause,
  restart
} from "./gameLogic.js";

const BEST_SCORE_KEY = "neon-snake-best-score";
const SPEEDS = {
  chill: 180,
  classic: 130,
  turbo: 90
};

const boardEl = document.getElementById("board");
const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("best-score");
const statusEl = document.getElementById("status");
const pauseBtn = document.getElementById("pause");
const restartBtn = document.getElementById("restart");
const difficultyEl = document.getElementById("difficulty");
const controlButtons = Array.from(document.querySelectorAll("[data-dir]"));

let state = createInitialState({ width: 20, height: 20 });
let bestScore = readBestScore();
let tickTimer = null;

function directionFromKey(key) {
  const normalized = key.toLowerCase();

  if (normalized === "arrowup" || normalized === "w") return "up";
  if (normalized === "arrowdown" || normalized === "s") return "down";
  if (normalized === "arrowleft" || normalized === "a") return "left";
  if (normalized === "arrowright" || normalized === "d") return "right";
  return null;
}

function readBestScore() {
  const saved = Number.parseInt(window.localStorage.getItem(BEST_SCORE_KEY) ?? "0", 10);
  return Number.isFinite(saved) ? saved : 0;
}

function syncBestScore(nextScore) {
  if (nextScore <= bestScore) {
    return;
  }

  bestScore = nextScore;
  window.localStorage.setItem(BEST_SCORE_KEY, String(bestScore));
}

function getTickMs() {
  return SPEEDS[difficultyEl.value] ?? SPEEDS.classic;
}

function restartLoop() {
  window.clearInterval(tickTimer);
  tickTimer = window.setInterval(() => {
    state = step(state);
    syncBestScore(state.score);
    render();
  }, getTickMs());
}

function render() {
  scoreEl.textContent = String(state.score);
  bestScoreEl.textContent = String(bestScore);

  if (state.gameOver) {
    statusEl.textContent = "Run over. Hit Restart Run and go again.";
  } else if (state.paused) {
    statusEl.textContent = "Paused. Press Space or Resume when you’re ready.";
  } else {
    statusEl.textContent = `Use arrows or WASD to move. ${difficultyEl.selectedOptions[0].text} speed is active.`;
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

difficultyEl.addEventListener("change", () => {
  state = restart(state);
  restartLoop();
  render();
});

restartBtn.addEventListener("click", () => {
  state = restart(state);
  restartLoop();
  render();
});

restartLoop();
render();
