import { createGameController } from "./components/gameLogic.js";
import { mustFind, isGameOver, isModalOpen, openModal, closeModal, } from "./components/utils.js";
import { ModalManager } from "./components/modalManager.js";
import { AccessibilityManager } from "./components/accessibilityManager.js";
import { AIStrategyFactory } from "./components/aiStrategy.js";
import { TimerManager } from "./components/timerManager.js";
import { ThemeManager } from "./components/themeManager.js";
import { UndoManager } from "./components/undoManager.js";
import { KeyboardManager } from "./components/keyboardManager.js";
import { GameStateManager } from "./components/gameStateManager.js";
import { EventManager } from "./components/eventManager.js";
import { ErrorBoundary } from "./components/errorBoundary.js";
import { logger } from "./components/logger.js";
import { STORAGE_KEYS, ARIA, AI_MOVE_DELAY, AUTO_MOVE_HIGHLIGHT_DELAY, START_DELAY, ERROR_MESSAGE_DELAY, GRID_SIZE, } from "./components/constants.js";
// Screen Controller - Visuals
function ScreenController() {
    // Initialize Error Boundary
    ErrorBoundary.setupGlobalErrorHandler();
    // Initiate State
    let game = null;
    let board = [];
    let playerXName = "Player X";
    let playerOName = "Player O";
    let isAIEnabled = false;
    let aiDifficulty = "medium";
    // Initialize Managers
    const gameState = new GameStateManager();
    const undoManager = new UndoManager();
    const eventManager = new EventManager();
    const keyboardManager = new KeyboardManager();
    // DOM Reference
    const playerTurnDiv = mustFind(document.querySelector(".turn"), ".turn");
    const boardDiv = mustFind(document.querySelector(".board"), ".board");
    const playerXScore = mustFind(document.querySelector("#playerXScore"), "#playerXScore");
    const playerOScore = mustFind(document.querySelector("#playerOScore"), "#playerOScore");
    const resetGameBtn = mustFind(document.querySelector(".resetGame"), ".resetGame");
    const resetScoreBtn = mustFind(document.querySelector(".resetScore"), ".resetScore");
    const undoBtn = mustFind(document.querySelector(".undoBtn"), ".undoBtn");
    // Settings Elements
    const settingsBtn = mustFind(document.querySelector(".settingsBtn"), ".settingsBtn");
    const settingsOverlay = mustFind(document.querySelector("#settingsOverlay"), "#settingsOverlay");
    const settingsModal = mustFind(document.querySelector(".settingsModal"), ".settingsModal");
    const closeSettingsBtn = mustFind(document.querySelector(".closeSettings"), ".closeSettings");
    // Player Setup Elements
    const playerSetupOverlay = mustFind(document.querySelector("#playerSetupOverlay"), "#playerSetupOverlay");
    const playerSetupModal = mustFind(document.querySelector(".playerSetupModal"), ".playerSetupModal");
    const playerXNameInput = mustFind(document.querySelector("#playerXName"), "#playerXName");
    const playerONameInput = mustFind(document.querySelector("#playerOName"), "#playerOName");
    const startGameBtn = mustFind(document.querySelector(".startGameBtn"), ".startGameBtn");
    const aiToggle = mustFind(document.querySelector("#aiToggle"), "#aiToggle");
    const aiDifficultySelect = mustFind(document.querySelector("#aiDifficulty"), "#aiDifficulty");
    const aiDifficultyGroup = mustFind(document.querySelector("#aiDifficultyGroup"), "#aiDifficultyGroup");
    const playerOGroup = mustFind(document.querySelector("#playerOGroup"), "#playerOGroup");
    // Timer Elements
    const timerContainer = mustFind(document.querySelector(".timerContainer"), ".timerContainer");
    const timerBar = mustFind(document.querySelector("#timerBar"), "#timerBar");
    const timerText = mustFind(document.querySelector("#timerText"), "#timerText");
    const enableTimerCheckbox = mustFind(document.querySelector("#enableTimer"), "#enableTimer");
    const timerDurationSelect = mustFind(document.querySelector("#timerDuration"), "#timerDuration");
    const timerDurationSetting = mustFind(document.querySelector("#timerDurationSetting"), "#timerDurationSetting");
    const enableTimerDescription = mustFind(document.querySelector("#enableTimerDescription"), "#enableTimerDescription");
    // Shortcut Elements
    const shortcutsBtn = mustFind(document.querySelector(".shortcutsBtn"), ".shortcutsBtn");
    const shortcutsOverlay = mustFind(document.querySelector("#shortcutsOverlay"), "#shortcutsOverlay");
    const shortcutsModal = mustFind(document.querySelector(".shortcutsModal"), ".shortcutsModal");
    const closeShortcutsBtn = mustFind(document.querySelector(".closeShortcuts"), ".closeShortcuts");
    // Accessibility Elements
    const reduceMotionCheckbox = mustFind(document.querySelector("#reduceMotion"), "#reduceMotion");
    const highContrastCheckbox = mustFind(document.querySelector("#highContrast"), "#highContrast");
    const largeTextCheckbox = mustFind(document.querySelector("#largeText"), "#largeText");
    // Theme Container
    const colourPalette = mustFind(document.querySelector(".colourPalette"), ".colourPalette");
    // Timer Manager
    const timerManager = new TimerManager(timerBar, timerText, timerContainer, makeAutoMove);
    // Modal Manager
    const modalManager = new ModalManager(() => timerManager.pause(), () => {
        if (gameState.isInitialized() &&
            !isGameOver(board, playerTurnDiv.textContent || "")) {
            timerManager.resume();
        }
    });
    // Accessibility Manager
    const accessibilityManager = new AccessibilityManager();
    // Theme Manager
    const themeManager = new ThemeManager({
        default: {
            backgroundLight: "#A0DDFF",
            backgroundMedium: "#758ECD",
            backgroundContainer: "#C1CEFE",
            highlight: "#7189FF",
            highlightRgb: "113, 137, 255",
            text: "#624CAB",
        },
        halloween: {
            backgroundLight: "#F4A259",
            backgroundMedium: "#4A4A4A",
            backgroundContainer: "#2D2D2D",
            highlight: "#8B4513",
            highlightRgb: "139, 69, 19",
            text: "#FF6B35",
        },
        christmas: {
            backgroundLight: "#C41E3A",
            backgroundMedium: "#B97B3A",
            backgroundContainer: "#0F8A5F",
            highlight: "#50C952",
            highlightRgb: "80, 201, 82",
            text: "#FFE5B4",
        },
        valentine: {
            backgroundLight: "#FF6B9D",
            backgroundMedium: "#A4133C",
            backgroundContainer: "#FFB3BA",
            highlight: "#FFC9DE",
            highlightRgb: "255, 201, 222",
            text: "#C9184A",
        },
    });
    // Initialization
    initializeAccessibility();
    initializeTimer();
    initializeThemes();
    initializeKeyboardShortcuts();
    setupEventListeners();
    setupInitialFocus();
    // Accessibility Setup
    function initializeAccessibility() {
        accessibilityManager.setupToggle(reduceMotionCheckbox, STORAGE_KEYS.REDUCE_MOTION, "reduce-motion");
        accessibilityManager.setupToggle(highContrastCheckbox, STORAGE_KEYS.HIGH_CONTRAST, "high-contrast", (enabled) => {
            colourPalette.style.display = enabled ? "none" : "flex";
        });
        accessibilityManager.setupToggle(largeTextCheckbox, STORAGE_KEYS.LARGE_TEXT, "large-text");
        // System Preferences
        accessibilityManager.setupSystemPreference("(prefers-reduced-motion: reduce)", reduceMotionCheckbox, "reduce-motion", STORAGE_KEYS.REDUCE_MOTION);
        accessibilityManager.setupSystemPreference("(prefers-contrast: high)", highContrastCheckbox, "high-contrast", STORAGE_KEYS.HIGH_CONTRAST);
    }
    // Timer Setup
    function initializeTimer() {
        enableTimerDescription.textContent = `Automatically place a random move after ${timerManager.getDuration()} seconds`;
        enableTimerCheckbox.checked = timerManager.isTimerEnabled();
        if (timerManager.isTimerEnabled()) {
            timerDurationSetting.style.display = "block";
        }
        timerDurationSelect.value = timerManager.getDuration().toString();
    }
    // Theme Setup
    function initializeThemes() {
        document.querySelectorAll(".themeBtn").forEach((btn) => {
            eventManager.register(btn, "click", () => {
                const theme = btn.dataset.theme;
                if (theme)
                    themeManager.applyTheme(theme);
            });
        });
    }
    // Keyboard Shortcuts
    function initializeKeyboardShortcuts() {
        keyboardManager.registerShortcut("b", (e) => {
            e.preventDefault();
            if (!gameState.isInitialized())
                return;
            focusRandomAvailableCell();
        });
        keyboardManager.registerShortcut("z", (e) => {
            e.preventDefault();
            if (!undoBtn.disabled)
                performUndo();
        });
        keyboardManager.registerShortcut("n", (e) => {
            e.preventDefault();
            resetGame();
        });
        keyboardManager.registerShortcut("r", (e) => {
            e.preventDefault();
            resetScore();
        });
        keyboardManager.registerShortcut("s", (e) => {
            e.preventDefault();
            if (isModalOpen(settingsOverlay)) {
                closeSettings();
            }
            else {
                openSettings();
            }
        });
        keyboardManager.registerShortcut("?", (e) => {
            e.preventDefault();
            if (isModalOpen(shortcutsOverlay)) {
                closeShortcuts();
            }
            else {
                openShortcuts();
            }
        });
        keyboardManager.registerShortcut("t", (e) => {
            e.preventDefault();
            themeManager.cycleTheme();
            refocusCell();
        });
        keyboardManager.enable();
    }
    // Modals
    function openSettings() {
        modalManager.open(settingsOverlay, settingsModal, closeSettingsBtn);
    }
    function closeSettings() {
        const returnFocus = gameState.isInitialized()
            ? document.querySelectorAll(".cell")[gameState.getFocusedCellIndex()]
            : settingsBtn;
        modalManager.close(settingsOverlay, returnFocus);
    }
    function openShortcuts() {
        modalManager.open(shortcutsOverlay, shortcutsModal, closeShortcutsBtn);
    }
    function closeShortcuts() {
        const returnFocus = gameState.isInitialized()
            ? document.querySelectorAll(".cell")[gameState.getFocusedCellIndex()]
            : shortcutsBtn;
        modalManager.close(shortcutsOverlay, returnFocus);
    }
    function handleSettingsKeydown(e) {
        if (e.key === "Escape") {
            closeSettings();
            return;
        }
        if (e.key === "Enter" &&
            e.target instanceof HTMLInputElement &&
            e.target.type === "checkbox") {
            e.preventDefault();
            e.target.checked = !e.target.checked;
            e.target.dispatchEvent(new Event("change", { bubbles: true }));
        }
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            navigateSettings(e);
        }
    }
    function navigateSettings(e) {
        const focusableElements = Array.from(settingsModal.querySelectorAll('input[type="checkbox"], button'));
        const currentIndex = focusableElements.indexOf(document.activeElement);
        if (currentIndex !== -1) {
            e.preventDefault();
            const nextIndex = e.key === "ArrowDown"
                ? (currentIndex + 1) % focusableElements.length
                : (currentIndex - 1 + focusableElements.length) %
                    focusableElements.length;
            focusableElements[nextIndex].focus();
        }
    }
    // AI Logic
    function makeAIMove() {
        if (!isAIEnabled || game.getActivePlayer().token !== "O")
            return;
        gameState.setAIThinking(true);
        setTimeout(() => {
            ErrorBoundary.wrap(() => {
                const strategy = AIStrategyFactory.create(aiDifficulty);
                const selectedCell = strategy.selectMove(board, "O", "X");
                logger.info(`AI (${aiDifficulty}) placing token at position ${selectedCell}`);
                undoManager.recordMove(selectedCell, "O", false);
                updateScreen(game.playRound(selectedCell));
                updateUndoButton();
                gameState.setAIThinking(false);
            });
        }, AI_MOVE_DELAY);
    }
    function makeAutoMove() {
        ErrorBoundary.wrap(() => {
            timerManager.stop();
            const availableCells = board
                .map((cell, index) => ({ cell, index }))
                .filter(({ cell }) => cell.getValue() === "")
                .map(({ index }) => index);
            if (availableCells.length > 0) {
                const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
                logger.info(`Time's up! Auto placing ${game.getActivePlayer().name}'s token at position ${randomCell}`);
                undoManager.recordMove(randomCell, game.getActivePlayer().token, true);
                const cells = Array.from(document.querySelectorAll(".cell"));
                const autoCell = cells[randomCell];
                if (autoCell) {
                    autoCell.style.backgroundColor = "#C1CEFE";
                    setTimeout(() => {
                        autoCell.style.backgroundColor = "";
                        updateScreen(game.playRound(randomCell));
                        updateUndoButton();
                    }, AUTO_MOVE_HIGHLIGHT_DELAY);
                }
            }
        });
    }
    // Game Logic
    function initializeGame(xName, oName) {
        playerXName = xName;
        playerOName = oName;
        game = createGameController(playerXName, playerOName);
        board = game.getBoard();
        gameState.setInitialized(true);
        updateScreen();
        updateScoreBoard();
    }
    function startGame() {
        ErrorBoundary.wrap(() => {
            const xName = playerXNameInput.value.trim() || "Player X";
            let oName;
            if (aiToggle.checked) {
                isAIEnabled = true;
                aiDifficulty = aiDifficultySelect.value;
                oName = `Varush AI (${aiDifficulty.charAt(0).toUpperCase() + aiDifficulty.slice(1)})`;
            }
            else {
                isAIEnabled = false;
                oName = playerONameInput.value.trim() || "Player O";
            }
            initializeGame(xName, oName);
            closeModal(playerSetupOverlay);
            // Focus first cell after starting
            setTimeout(() => {
                const firstCell = document.querySelector(".cell");
                firstCell?.focus();
            }, START_DELAY);
        });
    }
    // Function to Reset Game
    function resetGame() {
        if (!gameState.isInitialized() || !game)
            return;
        ErrorBoundary.wrap(() => {
            console.clear();
            timerManager.stop();
            undoManager.clear();
            gameState.setAIThinking(false);
            renderBoard(board, "new");
            game.resetPlayer();
            const activePlayer = game.getActivePlayer().name;
            playerTurnDiv.textContent = `${activePlayer}'s Turn`;
            updateScoreBoard();
            // Re-enable buttons after game reset
            const cells = Array.from(boardDiv.querySelectorAll(".cell"));
            cells.forEach((btn) => (btn.disabled = false));
            updateUndoButton();
            // Restart Timer if Enabled
            if (timerManager.isTimerEnabled())
                timerManager.start();
        });
    }
    // Function to Reset Scoreboard
    function resetScore() {
        if (!gameState.isInitialized() || !game)
            return;
        ErrorBoundary.wrap(() => {
            // Reset Everything
            gameState.reset();
            undoManager.clear();
            timerManager.stop();
            timerContainer.classList.remove("active");
            isAIEnabled = false;
            game.resetWins();
            updateScoreBoard();
            // Clear board
            playerTurnDiv.textContent = "";
            boardDiv.textContent = "";
            updateUndoButton();
            // Show player name customization modal
            openModal(playerSetupOverlay);
            playerXNameInput.value = "";
            playerONameInput.value = "";
            aiToggle.checked = false;
            toggleAISetup();
            playerXNameInput.focus();
        });
    }
    function performUndo() {
        if (!game)
            return;
        if (!undoManager.canUndo()) {
            playerTurnDiv.textContent = "Cannot Undo Automatic Moves!";
            setTimeout(() => {
                if (game) {
                    playerTurnDiv.textContent = `${game.getActivePlayer().name}'s Turn`;
                }
            }, ERROR_MESSAGE_DELAY);
            return;
        }
        ErrorBoundary.wrap(() => {
            undoManager.undoMove(isAIEnabled, (cellIndex) => {
                if (game)
                    game.undoMove(cellIndex);
            });
            if (timerManager.isTimerEnabled()) {
                timerManager.stop();
            }
            updateScreen();
            undoBtn.disabled = true;
            logger.info("Move(s) undone");
        });
    }
    function updateUndoButton() {
        undoBtn.disabled = !undoManager.canUndo();
    }
    function updateScoreBoard() {
        if (!gameState.isInitialized() || !game)
            return;
        // Get new version of number of wins per player
        const playerXWins = game.getPlayerXWins();
        const playerOWins = game.getPlayerOWins();
        // Update Scoreboard with player names
        playerXScore.textContent = `${playerXName}: ${playerXWins}`;
        playerOScore.textContent = `${playerOName}: ${playerOWins}`;
        // Remove and Read Active player class
        const activePlayer = game.getActivePlayer();
        if (activePlayer.token === "X") {
            playerOScore.classList.remove("activePlayer");
            playerXScore.classList.add("activePlayer");
        }
        else {
            playerXScore.classList.remove("activePlayer");
            playerOScore.classList.add("activePlayer");
        }
    }
    // Update Screen method
    function updateScreen(isWinner = null) {
        if (!gameState.isInitialized() || !game)
            return;
        ErrorBoundary.wrap(() => {
            // Get New version of board + active Player
            const activePlayer = game.getActivePlayer().name;
            updateScoreBoard();
            renderBoard(board);
            if (isWinner) {
                handleWin(isWinner, activePlayer);
                return;
            }
            const availableCells = board.filter((cells) => cells.getValue() === "");
            if (availableCells.length === 0) {
                handleDraw();
                return;
            }
            playerTurnDiv.textContent = `${activePlayer}'s Turn`;
            // Start/Restart timer for next move
            if (timerManager.isTimerEnabled())
                timerManager.start();
            // Trigger AI move if its AI's turn
            if (isAIEnabled && game.getActivePlayer().token === "O") {
                makeAIMove();
            }
        });
    }
    function handleWin(winnerCells, winnerName) {
        timerManager.stop();
        undoManager.clear();
        undoBtn.disabled = true;
        if (timerManager.isTimerEnabled()) {
            timerManager.showWaitingMessage();
        }
        const [a, b, c] = winnerCells;
        const cells = Array.from(boardDiv.querySelectorAll(".cell"));
        [a, b, c].forEach((index) => cells[index]?.classList.add("winner"));
        cells.forEach((cell) => (cell.disabled = true));
        playerTurnDiv.textContent = `${winnerName} Wins!`;
        logger.info(`${winnerName} is the WINNER!`);
        game.addWin();
        updateScoreBoard();
    }
    function handleDraw() {
        timerManager.stop();
        undoManager.clear();
        undoBtn.disabled = true;
        if (timerManager.isTimerEnabled()) {
            timerManager.showWaitingMessage();
        }
        playerTurnDiv.textContent = "It's a Draw!";
    }
    // Function to Render Board
    function renderBoard(boardState, status = "existing") {
        // Clear Board
        boardDiv.textContent = "";
        boardState.forEach((cell, index) => {
            // Create Buttons
            const cellButton = document.createElement("button");
            cellButton.type = "button";
            cellButton.classList.add("cell");
            // Create a data attribute to identify the column + set textContent to cell value
            cellButton.dataset.index = String(index);
            // Make Keyboard Focusable
            cellButton.tabIndex = index === gameState.getFocusedCellIndex() ? 0 : -1;
            if (status === "existing") {
                cellButton.textContent = cell.getValue();
            }
            else {
                cellButton.textContent = cell.resetValue();
            }
            // Label each cell for Screen reader users
            const row = Math.floor(index / GRID_SIZE) + 1;
            const col = (index % GRID_SIZE) + 1;
            const value = cell.getValue();
            const state = value === "" ? "empty" : value;
            cellButton.setAttribute(ARIA.LABEL, `Row ${row} Column ${col}, ${state}`);
            // Add Focus Event Listener
            eventManager.register(cellButton, "focus", handleCellFocus);
            boardDiv.appendChild(cellButton);
        });
        // Sticky Focus
        const cells = Array.from(boardDiv.querySelectorAll(".cell"));
        cells[gameState.getFocusedCellIndex()]?.focus();
    }
    // Keyboard Navigation
    function handleKeyboardNavigation(e) {
        const cells = Array.from(boardDiv.querySelectorAll(".cell"));
        const activeElement = document.activeElement;
        if (!(activeElement instanceof HTMLElement) ||
            !activeElement.classList.contains("cell")) {
            return;
        }
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
            e.preventDefault();
            const direction = e.key.replace("Arrow", "").toLowerCase();
            const newIndex = KeyboardManager.navigateGrid(gameState.getFocusedCellIndex(), direction);
            cells[gameState.getFocusedCellIndex()].tabIndex = -1;
            cells[newIndex].tabIndex = 0;
            cells[newIndex].focus();
            gameState.setFocusedCellIndex(newIndex);
        }
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            const currentCell = cells[gameState.getFocusedCellIndex()];
            if (currentCell && !currentCell.disabled)
                currentCell.click();
        }
    }
    function handleCellFocus(e) {
        const target = e.target;
        if (!(target instanceof HTMLElement))
            return;
        const index = target.dataset.index;
        if (index !== undefined) {
            gameState.setFocusedCellIndex(Number(index));
        }
    }
    // Click Handlers
    function clickHandlerBoard(e) {
        if (!gameState.isInitialized() || !game)
            return;
        if (isAIEnabled && gameState.isAIThinking())
            return;
        const target = e.target;
        if (!(target instanceof HTMLElement))
            return;
        const indexOfCell = target.dataset.index;
        const selectedCell = Number(indexOfCell);
        if (Number.isNaN(selectedCell))
            return;
        if (board[selectedCell]?.getValue() !== "")
            return;
        if (isAIEnabled && game.getActivePlayer().token !== "X")
            return;
        ErrorBoundary.wrap(() => {
            if (!game)
                return;
            undoManager.recordMove(selectedCell, game.getActivePlayer().token, false);
            updateScreen(game.playRound(selectedCell));
            updateUndoButton();
        });
    }
    // Helper Function
    function toggleAISetup() {
        if (aiToggle.checked) {
            playerOGroup.style.display = "none";
            aiDifficultyGroup.style.display = "block";
            isAIEnabled = true;
        }
        else {
            playerOGroup.style.display = "flex";
            aiDifficultyGroup.style.display = "none";
            isAIEnabled = false;
        }
    }
    function focusRandomAvailableCell() {
        const availableCells = board
            .map((cell, index) => ({ cell, index }))
            .filter(({ cell }) => cell.getValue() === "")
            .map(({ index }) => index);
        if (availableCells.length > 0) {
            const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
            gameState.setFocusedCellIndex(randomCell);
            const cells = Array.from(document.querySelectorAll(".cell"));
            cells.forEach((btn, i) => (btn.tabIndex = i === randomCell ? 0 : -1));
            cells[randomCell]?.focus();
        }
    }
    function refocusCell() {
        if (gameState.isInitialized()) {
            setTimeout(() => {
                const cells = Array.from(document.querySelectorAll(".cell"));
                cells[gameState.getFocusedCellIndex()]?.focus();
            }, START_DELAY);
        }
    }
    function handlePlayerSetupKeydown(e) {
        if (e.key === "Enter" && e.target === startGameBtn) {
            e.preventDefault();
            e.stopPropagation();
            startGame();
            return;
        }
        if (e.key === "Enter" && e.target === aiToggle) {
            e.preventDefault();
            aiToggle.checked = !aiToggle.checked;
            toggleAISetup();
        }
    }
    function setupInitialFocus() {
        playerXNameInput.focus();
    }
    // Event Listeners
    function setupEventListeners() {
        // Board
        eventManager.register(boardDiv, "click", clickHandlerBoard);
        eventManager.register(boardDiv, "keydown", handleKeyboardNavigation);
        // Buttons
        eventManager.register(resetGameBtn, "click", resetGame);
        eventManager.register(resetScoreBtn, "click", resetScore);
        eventManager.register(undoBtn, "click", performUndo);
        // Settings
        eventManager.register(settingsBtn, "click", openSettings);
        eventManager.register(closeSettingsBtn, "click", closeSettings);
        eventManager.register(settingsOverlay, "click", (e) => {
            if (e.target === settingsOverlay)
                closeSettings();
        });
        eventManager.register(settingsOverlay, "keydown", handleSettingsKeydown);
        // Shortcuts
        eventManager.register(shortcutsBtn, "click", openShortcuts);
        eventManager.register(closeShortcutsBtn, "click", closeShortcuts);
        eventManager.register(shortcutsOverlay, "click", (e) => {
            if (e.target === shortcutsOverlay)
                closeShortcuts();
        });
        eventManager.register(shortcutsOverlay, "keydown", (e) => {
            if (e.key === "Escape")
                closeShortcuts();
        });
        // Player Setup
        eventManager.register(startGameBtn, "click", startGame);
        eventManager.register(playerSetupOverlay, "keydown", handlePlayerSetupKeydown);
        eventManager.register(aiToggle, "change", toggleAISetup);
        // Timer
        eventManager.register(enableTimerCheckbox, "change", () => {
            timerManager.setEnabled(enableTimerCheckbox.checked);
            timerDurationSetting.style.display = enableTimerCheckbox.checked
                ? "block"
                : "none";
        });
        eventManager.register(timerDurationSelect, "change", () => {
            const newDuration = parseInt(timerDurationSelect.value);
            timerManager.setDuration(newDuration);
            enableTimerDescription.textContent = `Automatically place a random move after ${newDuration} seconds`;
        });
    }
    // Cleanup on unload
    window.addEventListener("beforeunload", () => {
        eventManager.cleanup();
        keyboardManager.disable();
    });
}
// Start Application
ScreenController();
