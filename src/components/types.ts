// Types
export type Token = "X" | "O";
export type CellValue = "" | Token;
export type WinnerLine = [number, number, number] | null;
export type AIDifficulty = "easy" | "medium" | "hard";
export type ModalType = "settings" | "shortcuts" | "playerSetup";

export interface Cell {
  addToken: (player: Token) => void;
  getValue: () => CellValue;
  resetValue: () => CellValue;
}

export interface GameBoard {
  getBoard: () => Cell[];
  displayToken: (cellIndex: number, player: Token) => void;
  printBoard: () => void;
}

export interface Player {
  name: string;
  token: Token;
  wins: number;
}

export interface GameController {
  playRound: (cellIndex: number) => WinnerLine;
  getActivePlayer: () => Player;
  addWin: () => number;
  getPlayerXWins: () => number;
  getPlayerOWins: () => number;
  resetWins: () => void;
  resetPlayer: () => Player;
  getBoard: () => Cell[];
  undoMove: (cellIndex: number) => void;
}

export interface MoveHistory {
  cellIndex: number;
  player: Token;
  wasAutoMove: boolean;
}

export interface GameState {
    isInitialized: boolean;
    isAIThinking: boolean;
    focusedCellIndex: number;
}
