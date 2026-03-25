import test from "node:test";
import assert from "node:assert/strict";
import {
  createInitialState,
  queueDirection,
  step,
  restart,
  placeFood
} from "../src/gameLogic.js";

test("step moves snake in current direction", () => {
  const state = createInitialState({ width: 10, height: 10 });
  const next = step(state);

  assert.deepEqual(next.snake[0], { x: state.snake[0].x + 1, y: state.snake[0].y });
  assert.equal(next.score, 0);
  assert.equal(next.gameOver, false);
});

test("snake grows and score increments when eating food", () => {
  const base = createInitialState({ width: 10, height: 10 });
  const state = {
    ...base,
    food: { x: base.snake[0].x + 1, y: base.snake[0].y }
  };

  const next = step(state);

  assert.equal(next.snake.length, state.snake.length + 1);
  assert.equal(next.score, 1);
});

test("queueDirection prevents reversing into itself", () => {
  const state = createInitialState({ width: 10, height: 10 });
  const same = queueDirection(state, "left");
  assert.equal(same.queuedDirection, "right");

  const turned = queueDirection(state, "up");
  assert.equal(turned.queuedDirection, "up");
});

test("collision with boundary sets game over", () => {
  const state = {
    ...createInitialState({ width: 4, height: 4 }),
    snake: [{ x: 3, y: 2 }, { x: 2, y: 2 }, { x: 1, y: 2 }],
    direction: "right",
    queuedDirection: "right"
  };

  const next = step(state);
  assert.equal(next.gameOver, true);
});

test("collision with self sets game over", () => {
  const state = {
    ...createInitialState({ width: 6, height: 6 }),
    snake: [
      { x: 3, y: 2 },
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 4, y: 3 },
      { x: 4, y: 2 }
    ],
    direction: "up",
    queuedDirection: "left"
  };

  const next = step(state);
  assert.equal(next.gameOver, true);
});

test("restart resets score and game state", () => {
  const state = {
    ...createInitialState({ width: 10, height: 10 }),
    score: 3,
    gameOver: true
  };

  const next = restart(state);

  assert.equal(next.score, 0);
  assert.equal(next.gameOver, false);
  assert.equal(next.width, 10);
  assert.equal(next.height, 10);
});

test("placeFood avoids snake cells", () => {
  const snake = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 }
  ];

  for (let i = 0; i < 100; i += 1) {
    const food = placeFood(snake, 3, 3);
    const overlap = snake.some((segment) => segment.x === food.x && segment.y === food.y);
    assert.equal(overlap, false);
  }
});