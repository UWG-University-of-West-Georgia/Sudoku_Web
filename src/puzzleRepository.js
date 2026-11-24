import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createInterface } from "node:readline";

const DIFFICULTIES = new Set(["Easy", "Medium", "Hard", "Expert"]);
const MAX_RANDOM_OFFSETS = 100;

export function getDifficultyLabel(score) {
  if (!Number.isFinite(score) || score < 0) {
    throw new TypeError("The difficulty score must be a non-negative number.");
  }
  if (score < 1) return "Easy";
  if (score <= 1.8) return "Medium";
  if (score <= 3) return "Hard";
  return "Expert";
}

function parseCsvRow(line) {
  const parts = line.split(",");
  if (parts.length < 5 || parts[1].length !== 81 || parts[2].length !== 81) return null;

  const score = Number(parts[4]);
  if (!Number.isFinite(score)) return null;

  return {
    id: parts[0],
    puzzle: parts[1],
    solution: parts[2],
    difficulty: getDifficultyLabel(score),
  };
}

async function readRowAfterOffset(filePath, offset) {
  const lines = createInterface({
    input: createReadStream(filePath, { start: offset, encoding: "utf8" }),
    crlfDelay: Infinity,
  });
  let firstLine = true;

  for await (const line of lines) {
    if (firstLine) {
      firstLine = false;
      continue;
    }
    if (line.trim()) return parseCsvRow(line);
  }

  return null;
}

export async function getRandomPuzzle(difficulty, filePath) {
  if (!DIFFICULTIES.has(difficulty)) {
    throw new TypeError("Invalid difficulty level.");
  }

  const file = await stat(filePath);
  if (file.size === 0) throw new Error("The CSV file is empty.");

  for (let attempt = 0; attempt < MAX_RANDOM_OFFSETS; attempt += 1) {
    const offset = Math.floor(Math.random() * file.size);
    const puzzle = await readRowAfterOffset(filePath, offset);
    if (puzzle?.difficulty === difficulty) return puzzle;
  }

  throw new Error(`No ${difficulty} puzzle found after ${MAX_RANDOM_OFFSETS} random attempts.`);
}
