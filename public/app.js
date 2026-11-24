import { checkBoard, parsePuzzle, SIZE } from "./sudoku.js";

const MAX_LIVES = 3;
const boardElement = document.querySelector("#board");
const statusElement = document.querySelector("#status");
const livesElement = document.querySelector("#lives");
const difficultyElement = document.querySelector("#difficulty");
const startDialog = document.querySelector("#start-dialog");
const startForm = document.querySelector("#start-form");
const startDifficultyElement = document.querySelector("#start-difficulty");
const newGameButton = document.querySelector("#new-game");
const checkBoardButton = document.querySelector("#check-board");
const numberPad = document.querySelector("#number-pad");

let game;
let selectedIndex = -1;
let lives = MAX_LIVES;
let gameOver = false;
let wrongCells = new Set();
let correctCells = new Set();
let boardCells = [];

function renderNumberPad() {
  for (let digit = 1; digit <= SIZE; digit += 1) {
    const button = document.createElement("button");
    button.className = "number-button";
    button.type = "button";
    button.textContent = String(digit);
    button.setAttribute("aria-label", `Enter ${digit}`);
    button.addEventListener("click", () => enterDigit(digit));
    numberPad.append(button);
  }

  const clearButton = document.createElement("button");
  clearButton.className = "number-button clear-button";
  clearButton.type = "button";
  clearButton.textContent = "Clear";
  clearButton.setAttribute("aria-label", "Clear selected cell");
  clearButton.addEventListener("click", clearCell);
  numberPad.append(clearButton);
}

function createBoard() {
  boardElement.replaceChildren();
  boardCells = [];

  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      const index = row * SIZE + col;
      const cell = document.createElement("button");
      cell.className = "cell";
      cell.type = "button";
      cell.setAttribute("aria-label", `Row ${row + 1}, column ${col + 1}`);
      if (col === 2 || col === 5) cell.classList.add("box-right");
      if (row === 2 || row === 5) cell.classList.add("box-bottom");
      cell.addEventListener("click", () => {
        if (!gameOver) {
          selectedIndex = index;
          renderBoard();
        }
      });
      boardElement.append(cell);
      boardCells.push(cell);
    }
  }
}

function renderBoard() {
  if (!game) return;

  for (let index = 0; index < SIZE * SIZE; index += 1) {
    const row = Math.floor(index / SIZE);
    const col = index % SIZE;
    const cell = boardCells[index];
    const value = game.values[row][col];
    const isGiven = game.givens[row][col];
    cell.classList.toggle("given", isGiven);
    cell.classList.toggle("correct", correctCells.has(index));
    cell.classList.toggle("selected", index === selectedIndex);
    cell.classList.toggle("wrong", wrongCells.has(index));
    cell.disabled = isGiven || gameOver;
    cell.replaceChildren();

    if (value !== 0) {
      cell.textContent = String(value);
      cell.setAttribute("aria-label", `Row ${row + 1}, column ${col + 1}, ${value}${isGiven ? ", given clue" : ""}`);
      continue;
    }

    cell.setAttribute("aria-label", `Row ${row + 1}, column ${col + 1}, empty`);
  }
}

function updateLives() {
  livesElement.textContent = `Lives: ${lives} / ${MAX_LIVES}`;
}

function clearWrongMark(index) {
  wrongCells.delete(index);
  boardCells[index]?.classList.remove("wrong");
}

function enterDigit(digit) {
  if (!game || gameOver || selectedIndex < 0) {
    statusElement.textContent = "Select an empty cell first.";
    return;
  }

  const row = Math.floor(selectedIndex / SIZE);
  const col = selectedIndex % SIZE;
  if (game.givens[row][col]) return;

  if (game.values[row][col] === digit) return;

  game.values[row][col] = digit;
  clearWrongMark(selectedIndex);
  correctCells.delete(selectedIndex);
  statusElement.textContent = "Answer entered. Check the grid when you’re ready.";
  renderBoard();
}

function clearCell() {
  if (!game || gameOver || selectedIndex < 0) return;
  const row = Math.floor(selectedIndex / SIZE);
  const col = selectedIndex % SIZE;
  if (game.givens[row][col]) return;

  game.values[row][col] = 0;

  clearWrongMark(selectedIndex);
  correctCells.delete(selectedIndex);
  statusElement.textContent = "Cell cleared.";
  renderBoard();
}

function validateBoard() {
  if (!game || gameOver) return;

  const result = checkBoard(game.values, game.solution);
  wrongCells = new Set(result.wrongCells.map(({ row, col }) => row * SIZE + col));
  correctCells = new Set(result.correctCells.map(({ row, col }) => row * SIZE + col));

  if (result.solved) {
    gameOver = true;
    statusElement.textContent = "Congratulations, you solved the puzzle!";
  } else if (wrongCells.size > 0) {
    lives -= 1;
    updateLives();
    if (lives === 0) {
      gameOver = true;
      statusElement.textContent = "Game over: you are out of lives. Start a new puzzle to play again.";
    } else {
      statusElement.textContent = `Incorrect answers highlighted. One life lost; ${lives} ${lives === 1 ? "life" : "lives"} remaining.`;
    }
  } else {
    statusElement.textContent = `No incorrect answers. ${result.emptyCount} ${result.emptyCount === 1 ? "cell" : "cells"} remaining.`;
  }

  renderBoard();
  checkBoardButton.disabled = gameOver;
}

async function startNewGame() {
  newGameButton.disabled = true;
  checkBoardButton.disabled = true;
  statusElement.textContent = "Loading puzzle…";
  try {
    const response = await fetch(`/api/puzzle?difficulty=${encodeURIComponent(difficultyElement.value)}`);
    const puzzle = await response.json();
    if (!response.ok) throw new Error(puzzle.error ?? "Unable to load a puzzle.");

    const initial = parsePuzzle(puzzle.puzzle);
    game = {
      puzzle,
      values: initial.map((row) => [...row]),
      givens: initial.map((row) => row.map((value) => value !== 0)),
      solution: parsePuzzle(puzzle.solution),
    };
    selectedIndex = -1;
    lives = MAX_LIVES;
    gameOver = false;
    wrongCells = new Set();
    correctCells = new Set();
    updateLives();
    createBoard();
    renderBoard();
    checkBoardButton.disabled = false;
    statusElement.textContent = `${difficultyElement.options[difficultyElement.selectedIndex].text} puzzle loaded.`;
  } catch (error) {
    console.error("Failed to load puzzle:", error);
    statusElement.textContent = error.message;
  } finally {
    newGameButton.disabled = false;
    checkBoardButton.disabled = !game;
  }
}

newGameButton.addEventListener("click", startNewGame);
checkBoardButton.addEventListener("click", validateBoard);
startForm.addEventListener("submit", (event) => {
  event.preventDefault();
  difficultyElement.value = startDifficultyElement.value;
  startDialog.close();
  startNewGame();
});
startDialog.addEventListener("cancel", (event) => {
  if (!game) event.preventDefault();
});

document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.target instanceof HTMLSelectElement) return;
  if (/^[1-9]$/.test(event.key)) {
    event.preventDefault();
    enterDigit(Number(event.key));
  } else if (event.key === "Backspace" || event.key === "Delete") {
    event.preventDefault();
    clearCell();
  }
});

renderNumberPad();
createBoard();
startDialog.showModal();
