import test from "node:test";
import assert from "node:assert/strict";
import { isValidMove, parsePuzzle } from "../public/sudoku.js";

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

test("isValidMove detects row, column, and 3-by-3 conflicts", () => {
  assert.equal(isValidMove(solvedGrid, 0, 0, 5), true);
  assert.equal(isValidMove(solvedGrid, 0, 1, 5), false);
  assert.equal(isValidMove(solvedGrid, 1, 0, 5), false);
  assert.equal(isValidMove(solvedGrid, 1, 1, 5), false);
});

