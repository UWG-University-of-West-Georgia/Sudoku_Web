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

