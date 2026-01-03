// Utility Functions
import { ARIA } from "./constants.js";
// DOM Utility
export function mustFind(element, name) {
    if (!element)
        throw new Error(`Missing required elements: ${name}`);
    return element;
}
// Modal Utilities
export function isModalOpen(modalElement) {
    return modalElement.getAttribute(ARIA.HIDDEN) === ARIA.FALSE;
}
export function openModal(modalElement) {
    modalElement.setAttribute(ARIA.HIDDEN, ARIA.FALSE);
}
export function closeModal(modalElement) {
    modalElement.setAttribute(ARIA.HIDDEN, ARIA.TRUE);
}
// GameState Utility
export function isGameOver(board, turnText) {
    const availableCells = board.filter((cell) => cell.getValue() === "");
    return availableCells.length === 0 || turnText.includes("Wins!");
}
// Grid Utilities
export function getCellPosition(index, gridSize) {
    return {
        row: Math.floor(index / gridSize),
        col: index % gridSize,
    };
}
export function getIndexFromPosition(row, col, gridSize) {
    return row * gridSize + col;
}
// Storage Utilities
export function saveToStorage(key, value) {
    localStorage.setItem(key, value);
}
export function loadFromStorage(key) {
    return localStorage.getItem(key);
}
