export const SIZE = 9;

export function parsePuzzle(puzzle) {
  if (typeof puzzle !== "string" || puzzle.length !== SIZE * SIZE || /[^0-9.]/.test(puzzle)) {
    throw new TypeError("A puzzle must contain 81 digits or dots.");
  }

  return Array.from({ length: SIZE }, (_, row) =>
    Array.from({ length: SIZE }, (_, col) => {
      const character = puzzle[row * SIZE + col];
      return character === "." || character === "0" ? 0 : Number(character);
    }),
  );
}

export function isValidMove(board, row, col, value) {
  if (
    !Array.isArray(board)
    || board.length !== SIZE
    || !Number.isInteger(row)
    || !Number.isInteger(col)
    || row < 0
    || row >= SIZE
    || col < 0
    || col >= SIZE
    || !Number.isInteger(value)
    || value < 1
    || value > SIZE
  ) {
    throw new TypeError("Invalid Sudoku coordinates or value.");
  }

  const blockRow = Math.floor(row / 3) * 3;
  const blockCol = Math.floor(col / 3) * 3;

  for (let index = 0; index < SIZE; index += 1) {
    if ((index !== col && board[row][index] === value)
      || (index !== row && board[index][col] === value)) {
      return false;
    }
  }

  for (let currentRow = blockRow; currentRow < blockRow + 3; currentRow += 1) {
    for (let currentCol = blockCol; currentCol < blockCol + 3; currentCol += 1) {
      if ((currentRow !== row || currentCol !== col) && board[currentRow][currentCol] === value) {
        return false;
      }
    }
  }

  return true;
}

export function checkBoard(board, solution) {
  if (
    !Array.isArray(board)
    || !Array.isArray(solution)
    || board.length !== SIZE
    || solution.length !== SIZE
    || board.some((row) => !Array.isArray(row) || row.length !== SIZE)
    || solution.some((row) => !Array.isArray(row) || row.length !== SIZE)
  ) {
    throw new TypeError("Both Sudoku boards must be 9 by 9 grids.");
  }

  const wrongCells = [];
  const correctCells = [];
  let emptyCount = 0;

  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      const value = board[row][col];
      const solutionValue = solution[row][col];
      if (!Number.isInteger(value) || value < 0 || value > SIZE) {
        throw new TypeError("Board values must be integers from 0 to 9.");
      }
      if (!Number.isInteger(solutionValue) || solutionValue < 1 || solutionValue > SIZE) {
        throw new TypeError("Solution values must be integers from 1 to 9.");
      }

      if (value === 0) {
        emptyCount += 1;
      } else if (value === solutionValue) {
        correctCells.push({ row, col });
      } else {
        wrongCells.push({ row, col });
      }
    }
  }

  return {
    wrongCells,
    correctCells,
    emptyCount,
    solved: emptyCount === 0 && wrongCells.length === 0,
  };
}

