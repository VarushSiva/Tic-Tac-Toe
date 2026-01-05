// KeyboardManager
import { GRID_SIZE } from "./constants.js";
import { getCellPosition, getIndexFromPosition } from "./utils.js";

export type ShortcutCallback = (event: KeyboardEvent) => void;
export type ShortcutGuard = (event: KeyboardEvent) => boolean;

export class KeyboardManager {
  private shortcuts = new Map<string, ShortcutCallback>();
  private boundHandler: ((e: KeyboardEvent) => void) | null = null;
  private guard: ShortcutGuard | null = null;

  // Global guard that decides whether shortcuts should run
  setGuard(guard: ShortcutGuard | null): void {
    this.guard = guard;
  }

  registerShortcut(key: string, callback: ShortcutCallback): void {
    this.shortcuts.set(key.toLowerCase(), callback);
  }

  unregisterShortcut(key: string): void {
    this.shortcuts.delete(key.toLowerCase());
  }

  enable(): void {
    if (this.boundHandler) return;

    this.boundHandler = (e: KeyboardEvent) => this.handleKeydown(e);
    document.addEventListener("keydown", this.boundHandler);
  }

  disable(): void {
    if (this.boundHandler) {
      document.removeEventListener("keydown", this.boundHandler);
      this.boundHandler = null;
    }
  }

  private handleKeydown(e: KeyboardEvent): void {
    if (this.guard && !this.guard(e)) return;
    const key = e.key.toLowerCase();
    const callback = this.shortcuts.get(key);

    if (callback) {
      callback(e);
    }
  }

  // Grid Navigation
  static navigateGrid(
    currentIndex: number,
    direction: "up" | "down" | "left" | "right"
  ): number {
    const { row, col } = getCellPosition(currentIndex, GRID_SIZE);
    let newRow = row;
    let newCol = col;

    switch (direction) {
      case "up":
        newRow = Math.max(0, row - 1);
        break;
      case "down":
        newRow = Math.min(GRID_SIZE - 1, row + 1);
        break;
      case "left":
        newCol = Math.max(0, col - 1);
        break;
      case "right":
        newCol = Math.min(GRID_SIZE - 1, col + 1);
        break;
    }

    return getIndexFromPosition(newRow, newCol, GRID_SIZE);
  }
}
