# Neon Snake Sprint

A polished mini project built at the repo root: a browser-based snake game with a neon arcade theme, selectable speed modes, and persistent local best-score tracking.

## Mini Project Features
- Responsive single-page game UI.
- Keyboard controls with arrow keys or `WASD`.
- Three speed presets: `Chill`, `Classic`, and `Turbo`.
- Pause and resume with the space bar.
- Best score saved in `localStorage`.
- Game logic covered by Node tests.

## Run The Mini Project
Open `index.html` in a browser, or serve the repository root with any static file server.

## Test
```bash
npm test
```

## Project Files
- `index.html` contains the game layout.
- `styles.css` contains the arcade-inspired styling.
- `src/main.js` wires the UI to the game loop.
- `src/gameLogic.js` contains the pure game logic.
- `tests/gameLogic.test.js` verifies movement, collisions, restart logic, and food placement.

## Other Repo Folders
This repository also includes an unfinished `frontend/` and `backend/` app from an earlier fake-news detector prototype, but the primary completed mini project for this push is `Neon Snake Sprint` at the repository root.
