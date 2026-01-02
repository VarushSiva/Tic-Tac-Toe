// AIStrategy
import { Token, Cell } from "./types";
import { WIN_CONDITIONS } from "./constants";

export interface IAIStrategy {
  selectMove(board: Cell[], player: Token, opponent: Token): number;
}

abstract class BaseAIStrategy implements IAIStrategy {
  abstract selectMove(board: Cell[], player: Token, opponent: Token): number;

  protected findWinningMove(board: Cell[], player: Token): number | null {
    for (const [a, b, c] of WIN_CONDITIONS) {
      const values = [
        board[a].getValue(),
        board[b].getValue(),
        board[c].getValue(),
      ];
      const emptyIndex = values.indexOf("");

      if (emptyIndex !== -1) {
        const otherTwo = values.filter((value) => value !== "");
        if (
          otherTwo.length === 2 &&
          otherTwo[0] === player &&
          otherTwo[1] === player
        ) {
          return [a, b, c][emptyIndex];
        }
      }
    }
    return null;
  }

  protected getRandomMove(availableCells: number[]): number {
    return availableCells[Math.floor(Math.random() * availableCells.length)];
  }

  protected getAvailableCells(board: Cell[]): number[] {
    return board
      .map((cell, index) => ({ cell, index }))
      .filter(({ cell }) => cell.getValue() === "")
      .map(({ index }) => index);
  }
}

export class EasyAI extends BaseAIStrategy {
  selectMove(board: Cell[]): number {
    const available = this.getAvailableCells(board);
    return this.getRandomMove(available);
  }
}

export class MediumAI extends BaseAIStrategy {
  selectMove(board: Cell[], player: Token, opponent: Token): number {
    // Look for winning move
    const winMove = this.findWinningMove(board, player);
    if (winMove !== null) return winMove;

    // Look to block if no winning move
    const blockMove = this.findWinningMove(board, opponent);
    if (blockMove !== null) return blockMove;

    // Random Move if cannot win or block
    const available = this.getAvailableCells(board);
    return this.getRandomMove(available);
  }
}

export class HardAI extends BaseAIStrategy {
  selectMove(board: Cell[], player: Token, opponent: Token): number {
    // Look for winning move
    const winMove = this.findWinningMove(board, player);
    if (winMove !== null) return winMove;

    // Look to block if no winning move
    const blockMove = this.findWinningMove(board, opponent);
    if (blockMove !== null) return blockMove;

    // Take Center
    if (board[4].getValue() === "") return 4;

    // Take corners
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(
      (corner) => board[corner].getValue() === ""
    );
    if (availableCorners.length > 0) {
      return this.getRandomMove(availableCorners);
    }

    // Random Move if none of the above
    const available = this.getAvailableCells(board);
    return this.getRandomMove(available);
  }
}

export class AIStrategyFactory {
  static create(difficulty: "easy" | "medium" | "hard"): IAIStrategy {
    switch (difficulty) {
      case "easy":
        return new EasyAI();
      case "medium":
        return new MediumAI();
      case "hard":
        return new HardAI();
    }
  }
}
