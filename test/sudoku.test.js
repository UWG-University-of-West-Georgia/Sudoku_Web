import test from "node:test";
import assert from "node:assert/strict";
import { checkBoard, isValidMove, parsePuzzle, toggleNote } from "../public/sudoku.js";

const solvedString = "534678912672195348198342567859761423426853791713924856961537284287419635345286179";
const solvedGrid = parsePuzzle(solvedString);

test("parsePuzzle creates a 9 by 9 grid and treats dots as empty", () => {
  const grid = parsePuzzle(`.${solvedString.slice(1)}`);
  assert.equal(grid.length, 9);
  assert.equal(grid[0].length, 9);
  assert.equal(grid[0][0], 0);
});

test("parsePuzzle rejects grids with an invalid length or character", () => {
  assert.throws(() => parsePuzzle("123"), TypeError);
  assert.throws(() => parsePuzzle("x".repeat(81)), TypeError);
});

test("toggleNote adds and removes candidates independently for each cell", () => {
  const firstCellNotes = new Set();
  const secondCellNotes = new Set();

  assert.equal(toggleNote(firstCellNotes, 3), true);
  assert.equal(toggleNote(firstCellNotes, 7), true);
  assert.equal(toggleNote(secondCellNotes, 3), true);
  assert.equal(toggleNote(firstCellNotes, 3), false);

  assert.deepEqual([...firstCellNotes], [7]);
  assert.deepEqual([...secondCellNotes], [3]);
});

test("toggleNote rejects invalid candidates", () => {
  assert.throws(() => toggleNote(new Set(), 0), TypeError);
});

test("isValidMove detects row, column, and 3-by-3 conflicts", () => {
  assert.equal(isValidMove(solvedGrid, 0, 0, 5), true);
  assert.equal(isValidMove(solvedGrid, 0, 1, 5), false);
  assert.equal(isValidMove(solvedGrid, 1, 0, 5), false);
  assert.equal(isValidMove(solvedGrid, 1, 1, 5), false);
});

test("checkBoard reports incorrect and empty cells without changing the board", () => {
  const board = solvedGrid.map((row) => [...row]);
  board[0][0] = 9;
  board[0][1] = 0;

  const result = checkBoard(board, solvedGrid);

  assert.deepEqual(result.wrongCells, [{ row: 0, col: 0 }]);
  assert.equal(result.correctCells.length, 79);
  assert.equal(result.emptyCount, 1);
  assert.equal(result.solved, false);
  assert.equal(board[0][0], 9);
  assert.equal(board[0][1], 0);
});

test("checkBoard reports an incomplete board with no incorrect answers", () => {
  const board = solvedGrid.map((row) => [...row]);
  board[0][0] = 0;

  const result = checkBoard(board, solvedGrid);

  assert.deepEqual(result.wrongCells, []);
  assert.equal(result.correctCells.length, 80);
  assert.equal(result.emptyCount, 1);
  assert.equal(result.solved, false);
});

test("checkBoard recognizes a complete solution", () => {
  const result = checkBoard(solvedGrid, solvedGrid);

  assert.deepEqual(result.wrongCells, []);
  assert.equal(result.correctCells.length, 81);
  assert.equal(result.emptyCount, 0);
  assert.equal(result.solved, true);
});

test("checkBoard rejects malformed grids", () => {
  assert.throws(() => checkBoard([[1]], solvedGrid), TypeError);
});

