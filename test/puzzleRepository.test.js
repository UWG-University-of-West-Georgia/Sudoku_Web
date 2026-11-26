import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { getDifficultyLabel, getRandomPuzzle } from "../src/puzzleRepository.js";

test("getDifficultyLabel maps dataset scores to the four levels", () => {
  assert.equal(getDifficultyLabel(0.9), "Easy");
  assert.equal(getDifficultyLabel(1), "Medium");
  assert.equal(getDifficultyLabel(1.8), "Medium");
  assert.equal(getDifficultyLabel(2), "Hard");
  assert.equal(getDifficultyLabel(3), "Hard");
  assert.equal(getDifficultyLabel(3.1), "Expert");
  assert.throws(() => getDifficultyLabel(-1), TypeError);
});

test("getRandomPuzzle reads a matching puzzle from a CSV file", async (context) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "sudoku-csv-test-"));
  context.after(() => rm(directory, { recursive: true, force: true }));
  const filePath = path.join(directory, "puzzles.csv");
  const puzzle = ".".repeat(81);
  const solution = "123456789".repeat(9);
  const rows = Array.from({ length: 20 }, (_, index) =>
    `${index + 1},${puzzle},${solution},25,0.5`,
  );
  await writeFile(filePath, `id,puzzle,solution,clues,difficulty\n${rows.join("\n")}\n`);

  const result = await getRandomPuzzle("Easy", filePath);

  assert.equal(result.difficulty, "Easy");
  assert.equal(result.puzzle, puzzle);
  assert.equal(result.solution, solution);
});

test("getRandomPuzzle rejects an unknown difficulty", async () => {
  await assert.rejects(() => getRandomPuzzle("Unknown", "unused.csv"), TypeError);
});
