// KeyboardManager
import { GRID_SIZE } from "./constants.js";
import { getCellPosition, getIndexFromPosition } from "./utils.js";
export class KeyboardManager {
    constructor() {
        this.shortcuts = new Map();
        this.boundHandler = null;
    }
    registerShortcut(key, callback) {
        this.shortcuts.set(key.toLowerCase(), callback);
    }
    unregisterShortcut(key) {
        this.shortcuts.delete(key.toLowerCase());
    }
    enable() {
        if (this.boundHandler)
            return;
        this.boundHandler = (e) => this.handleKeydown(e);
        document.addEventListener("keydown", this.boundHandler);
    }
    disable() {
        if (this.boundHandler) {
            document.removeEventListener("keydown", this.boundHandler);
            this.boundHandler = null;
        }
    }
    handleKeydown(e) {
        const key = e.key.toLowerCase();
        const callback = this.shortcuts.get(key);
        if (callback) {
            callback(e);
        }
    }
    // Grid Navigation
    static navigateGrid(currentIndex, direction) {
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
