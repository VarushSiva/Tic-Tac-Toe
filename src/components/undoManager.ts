// Undo Manager
import { MoveHistory, Token, Cell } from "./types.js";

export class UndoManager {
  private history: MoveHistory[] = [];

  recordMove(cellIndex: number, player: Token, wasAutoMove: boolean): void {
    this.history.push({ cellIndex, player, wasAutoMove });
  }

  canUndo(isAIMode: boolean = false): boolean {
    if (this.history.length === 0) return false;

    const lastMove = this.history[this.history.length - 1];
    if (lastMove.wasAutoMove) return false;

    if (isAIMode && lastMove.player === "O") {
      // Undo removes AI move + player move.
      const previous = this.history[this.history.length - 2];
      if (previous && previous.wasAutoMove) return false;
    }

    return true;
  }

  getLastMove(): MoveHistory | null {
    return this.history.length > 0
      ? this.history[this.history.length - 1]
      : null;
  }

  undoMove(
    isAIMode: boolean,
    undoCallback: (cellIndex: number) => void
  ): number {
    if (!this.canUndo(isAIMode)) return 0;

    const movesToUndo: MoveHistory[] = [];

    if (isAIMode) {
      // In AI mode, need to undo both AI and player moves
      const lastMove = this.history[this.history.length - 1];

      if (lastMove.player === "O") {
        // If last move was AI undo that first
        movesToUndo.push(this.history.pop()!);

        // Also undo the player's move
        if (this.history.length > 0) {
          movesToUndo.push(this.history.pop()!);
        }
      } else if (lastMove.player === "X") {
        // If AI hasnt moved yet
        movesToUndo.push(this.history.pop()!);
      }
    } else {
      // In Player vs Player, undo last move only
      movesToUndo.push(this.history.pop()!);
    }

    // Run undo callbacks
    movesToUndo.forEach((move) => undoCallback(move.cellIndex));

    return movesToUndo.length;
  }

  clear(): void {
    this.history = [];
  }

  getHistory(): MoveHistory[] {
    return [...this.history];
  }
}
