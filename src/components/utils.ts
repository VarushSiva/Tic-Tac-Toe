// Utility Functions
import { ARIA } from "./constants.js";
import { Cell } from "./types.js";

// DOM Utility
export function mustFind<T extends Element>(
  element: T | null,
  name: string
): T {
  if (!element) throw new Error(`Missing required elements: ${name}`);
  return element;
}

// Modal Utilities
export function isModalOpen(modalElement: HTMLElement): boolean {
  return modalElement.getAttribute(ARIA.HIDDEN) === ARIA.FALSE;
}

export function openModal(modalElement: HTMLElement): void {
  modalElement.setAttribute(ARIA.HIDDEN, ARIA.FALSE);
}

export function closeModal(modalElement: HTMLElement): void {
  modalElement.setAttribute(ARIA.HIDDEN, ARIA.TRUE);
}

// GameState Utility
export function isGameOver(board: Cell[], turnText: string): boolean {
  const availableCells = board.filter((cell) => cell.getValue() === "");
  return availableCells.length === 0 || turnText.includes("Wins!");
}

// Grid Utilities
export function getCellPosition(index: number, gridSize: number) {
  return {
    row: Math.floor(index / gridSize),
    col: index % gridSize,
  };
}

export function getIndexFromPosition(
  row: number,
  col: number,
  gridSize: number
): number {
  return row * gridSize + col;
}

// Storage Utilities
export function saveToStorage(key: string, value: string): void {
  localStorage.setItem(key, value);
}

export function loadFromStorage(key: string): string | null {
  return localStorage.getItem(key);
}
