const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

const OPPOSITES = {
  up: "down",
  down: "up",
  left: "right",
  right: "left"
};

export function createInitialState(options = {}) {
  const width = options.width ?? 20;
  const height = options.height ?? 20;
  const snake = [
    { x: Math.floor(width / 2), y: Math.floor(height / 2) },
    { x: Math.floor(width / 2) - 1, y: Math.floor(height / 2) },
    { x: Math.floor(width / 2) - 2, y: Math.floor(height / 2) }
  ];

  return {
    width,
    height,
    snake,
    direction: "right",
    queuedDirection: "right",
    food: placeFood(snake, width, height),
    score: 0,
    gameOver: false,
    paused: false
  };
}

export function queueDirection(state, nextDirection) {
  if (!DIRECTIONS[nextDirection]) {
    return state;
  }

  if (state.snake.length > 1 && OPPOSITES[state.direction] === nextDirection) {
    return state;
  }

  return {
    ...state,
    queuedDirection: nextDirection
  };
}

export function step(state) {
  if (state.gameOver || state.paused) {
    return state;
  }

  const direction = state.queuedDirection;
  const vector = DIRECTIONS[direction];
  const head = state.snake[0];
  const newHead = {
    x: head.x + vector.x,
    y: head.y + vector.y
  };

  const hitWall =
    newHead.x < 0 ||
    newHead.x >= state.width ||
    newHead.y < 0 ||
    newHead.y >= state.height;

  if (hitWall) {
    return {
      ...state,
      direction,
      gameOver: true
    };
  }

  const willEat = newHead.x === state.food.x && newHead.y === state.food.y;
  const nextBody = willEat ? state.snake : state.snake.slice(0, -1);
  const hitSelf = nextBody.some((segment) => segment.x === newHead.x && segment.y === newHead.y);

  if (hitSelf) {
    return {
      ...state,
      direction,
      gameOver: true
    };
  }

  const snake = [newHead, ...nextBody];

  if (!willEat) {
    return {
      ...state,
      snake,
      direction
    };
  }

  return {
    ...state,
    snake,
    direction,
    score: state.score + 1,
    food: placeFood(snake, state.width, state.height)
  };
}

export function togglePause(state) {
  if (state.gameOver) {
    return state;
  }

  return {
    ...state,
    paused: !state.paused
  };
}

export function restart(state) {
  return createInitialState({
    width: state.width,
    height: state.height
  });
}

export function placeFood(snake, width, height) {
  const occupied = new Set(snake.map((segment) => `${segment.x},${segment.y}`));
  const available = [];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) {
        available.push({ x, y });
      }
    }
  }

  if (available.length === 0) {
    return { x: -1, y: -1 };
  }

  const index = Math.floor(Math.random() * available.length);
  return available[index];
}