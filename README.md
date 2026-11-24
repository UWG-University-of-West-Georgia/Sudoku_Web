# Sudoku Web

Web version of the JavaFX Sudoku project, built with Node.js and vanilla JavaScript (no dependencies required).

## Run the application

Requires Node.js 20 or later:

```bash
git lfs install
git lfs pull
npm start
```

The dataset is stored in `data/sudoku-3m.csv` using Git LFS. Once the server starts, open [http://localhost:3000](http://localhost:3000). To use a different port, set the `PORT` environment variable.

## How to play

- Choose Easy, Medium, Hard, or Expert, then click **New Puzzle**.
- Select an empty cell and enter a number using the buttons or your keyboard.
- Click a cell to select it. Answers are checked immediately; an incorrect answer costs one life.
- **Clear** removes the number from the selected cell.

Puzzles are read directly from `data/sudoku-3m.csv` through `GET /api/puzzle?difficulty=Easy`. Git LFS is configured in `.gitattributes` to track this large file.

## Project structure

- `src/`: Node.js server and dataset access.
- `public/`: web interface and browser-side logic.
- `data/`: Sudoku dataset tracked with Git LFS.
- `test/`: automated tests.
- `docs/backlog/`: project backlog files and notes.

## Tests

```bash
npm test
npm run build
```
