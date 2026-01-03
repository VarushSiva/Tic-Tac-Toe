import { createGameController } from "./components/gameLogic.js";
import {
  mustFind,
  isGameOver,
  isModalOpen,
  openModal,
  closeModal,
} from "./components/utils.js";
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
import {
  STORAGE_KEYS,
  ARIA,
  AI_MOVE_DELAY,
  AUTO_MOVE_HIGHLIGHT_DELAY,
  START_DELAY,
  ERROR_MESSAGE_DELAY,
  GRID_SIZE,
} from "./components/constants.js";
import type {
  AIDifficulty,
  Token,
  GameController,
  Cell,
} from "./components/types.js";

// Screen Controller - Visuals
function ScreenController() {
  // Initialize Error Boundary
  ErrorBoundary.setupGlobalErrorHandler();

  // Initiate State
  let game: GameController | null = null;
  let board: Cell[] = [];
  let playerXName = "Player X";
  let playerOName = "Player O";
  let isAIEnabled = false;
  let aiDifficulty: AIDifficulty = "medium";

  // Initialize Managers
  const gameState = new GameStateManager();
  const undoManager = new UndoManager();
  const eventManager = new EventManager();
  const keyboardManager = new KeyboardManager();

  // DOM Reference
  const playerTurnDiv = mustFind(
    document.querySelector<HTMLElement>(".turn"),
    ".turn"
  );
  const boardDiv = mustFind(
    document.querySelector<HTMLElement>(".board"),
    ".board"
  );
  const playerXScore = mustFind(
    document.querySelector<HTMLElement>("#playerXScore"),
    "#playerXScore"
  );
  const playerOScore = mustFind(
    document.querySelector<HTMLElement>("#playerOScore"),
    "#playerOScore"
  );
  const resetGameBtn = mustFind(
    document.querySelector<HTMLButtonElement>(".resetGame"),
    ".resetGame"
  );
  const resetScoreBtn = mustFind(
    document.querySelector<HTMLButtonElement>(".resetScore"),
    ".resetScore"
  );
  const undoBtn = mustFind(
    document.querySelector<HTMLButtonElement>(".undoBtn"),
    ".undoBtn"
  );

  // Settings Elements
  const settingsBtn = mustFind(
    document.querySelector<HTMLButtonElement>(".settingsBtn"),
    ".settingsBtn"
  );
  const settingsOverlay = mustFind(
    document.querySelector<HTMLElement>("#settingsOverlay"),
    "#settingsOverlay"
  );
  const settingsModal = mustFind(
    document.querySelector<HTMLElement>(".settingsModal"),
    ".settingsModal"
  );
  const closeSettingsBtn = mustFind(
    document.querySelector<HTMLButtonElement>(".closeSettings"),
    ".closeSettings"
  );

  // Player Setup Elements
  const playerSetupOverlay = mustFind(
    document.querySelector<HTMLElement>("#playerSetupOverlay"),
    "#playerSetupOverlay"
  );
  const playerSetupModal = mustFind(
    document.querySelector<HTMLElement>(".playerSetupModal"),
    ".playerSetupModal"
  );
  const playerXNameInput = mustFind(
    document.querySelector<HTMLInputElement>("#playerXName"),
    "#playerXName"
  );
  const playerONameInput = mustFind(
    document.querySelector<HTMLInputElement>("#playerOName"),
    "#playerOName"
  );
  const startGameBtn = mustFind(
    document.querySelector<HTMLButtonElement>(".startGameBtn"),
    ".startGameBtn"
  );
  const aiToggle = mustFind(
    document.querySelector<HTMLInputElement>("#aiToggle"),
    "#aiToggle"
  );
  const aiDifficultySelect = mustFind(
    document.querySelector<HTMLSelectElement>("#aiDifficulty"),
    "#aiDifficulty"
  );
  const aiDifficultyGroup = mustFind(
    document.querySelector<HTMLElement>("#aiDifficultyGroup"),
    "#aiDifficultyGroup"
  );
  const playerOGroup = mustFind(
    document.querySelector<HTMLElement>("#playerOGroup"),
    "#playerOGroup"
  );

  // Timer Elements
  const timerContainer = mustFind(
    document.querySelector<HTMLElement>(".timerContainer"),
    ".timerContainer"
  );
  const timerBar = mustFind(
    document.querySelector<HTMLElement>("#timerBar"),
    "#timerBar"
  );
  const timerText = mustFind(
    document.querySelector<HTMLElement>("#timerText"),
    "#timerText"
  );
  const enableTimerCheckbox = mustFind(
    document.querySelector<HTMLInputElement>("#enableTimer"),
    "#enableTimer"
  );
  const timerDurationSelect = mustFind(
    document.querySelector<HTMLSelectElement>("#timerDuration"),
    "#timerDuration"
  );
  const timerDurationSetting = mustFind(
    document.querySelector<HTMLElement>("#timerDurationSetting"),
    "#timerDurationSetting"
  );
  const enableTimerDescription = mustFind(
    document.querySelector<HTMLElement>("#enableTimerDescription"),
    "#enableTimerDescription"
  );

  // Shortcut Elements
  const shortcutsBtn = mustFind(
    document.querySelector<HTMLButtonElement>(".shortcutsBtn"),
    ".shortcutsBtn"
  );
  const shortcutsOverlay = mustFind(
    document.querySelector<HTMLElement>("#shortcutsOverlay"),
    "#shortcutsOverlay"
  );
  const shortcutsModal = mustFind(
    document.querySelector<HTMLElement>(".shortcutsModal"),
    ".shortcutsModal"
  );
  const closeShortcutsBtn = mustFind(
    document.querySelector<HTMLButtonElement>(".closeShortcuts"),
    ".closeShortcuts"
  );

  // Accessibility Elements
  const reduceMotionCheckbox = mustFind(
    document.querySelector<HTMLInputElement>("#reduceMotion"),
    "#reduceMotion"
  );
  const highContrastCheckbox = mustFind(
    document.querySelector<HTMLInputElement>("#highContrast"),
    "#highContrast"
  );
  const largeTextCheckbox = mustFind(
    document.querySelector<HTMLInputElement>("#largeText"),
    "#largeText"
  );

  // Theme Container
  const colourPalette = mustFind(
    document.querySelector<HTMLElement>(".colourPalette"),
    ".colourPalette"
  );

  // Timer Manager
  const timerManager = new TimerManager(
    timerBar,
    timerText,
    timerContainer,
    makeAutoMove
  );

  // Modal Manager
  const modalManager = new ModalManager(
    () => timerManager.pause(),
    () => {
      if (
        gameState.isInitialized() &&
        !isGameOver(board, playerTurnDiv.textContent || "")
      ) {
        timerManager.resume();
      }
    }
  );

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
  function initializeAccessibility(): void {
    accessibilityManager.setupToggle(
      reduceMotionCheckbox,
      STORAGE_KEYS.REDUCE_MOTION,
      "reduce-motion"
    );

    accessibilityManager.setupToggle(
      highContrastCheckbox,
      STORAGE_KEYS.HIGH_CONTRAST,
      "high-contrast",
      (enabled) => {
        colourPalette.style.display = enabled ? "none" : "flex";
      }
    );

    accessibilityManager.setupToggle(
      largeTextCheckbox,
      STORAGE_KEYS.LARGE_TEXT,
      "large-text"
    );

    // System Preferences
    accessibilityManager.setupSystemPreference(
      "(prefers-reduced-motion: reduce)",
      reduceMotionCheckbox,
      "reduce-motion",
      STORAGE_KEYS.REDUCE_MOTION
    );

    accessibilityManager.setupSystemPreference(
      "(prefers-contrast: high)",
      highContrastCheckbox,
      "high-contrast",
      STORAGE_KEYS.HIGH_CONTRAST
    );
  }

  // Timer Setup
  function initializeTimer(): void {
    enableTimerDescription.textContent = `Automatically place a random move after ${timerManager.getDuration()} seconds`;

    enableTimerCheckbox.checked = timerManager.isTimerEnabled();
    if (timerManager.isTimerEnabled()) {
      timerDurationSetting.style.display = "block";
    }

    timerDurationSelect.value = timerManager.getDuration().toString();
  }

  // Theme Setup
  function initializeThemes(): void {
    document.querySelectorAll<HTMLButtonElement>(".themeBtn").forEach((btn) => {
      eventManager.register(btn, "click", () => {
        const theme = btn.dataset.theme;
        if (theme) themeManager.applyTheme(theme);
      });
    });
  }

  // Keyboard Shortcuts
  function initializeKeyboardShortcuts(): void {
    keyboardManager.registerShortcut("b", (e) => {
      e.preventDefault();
      if (!gameState.isInitialized()) return;
      focusRandomAvailableCell();
    });

    keyboardManager.registerShortcut("z", (e) => {
      e.preventDefault();
      if (!undoBtn.disabled) performUndo();
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
      } else {
        openSettings();
      }
    });

    keyboardManager.registerShortcut("?", (e) => {
      e.preventDefault();
      if (isModalOpen(shortcutsOverlay)) {
        closeShortcuts();
      } else {
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
  function openSettings(): void {
    modalManager.open(settingsOverlay, settingsModal, closeSettingsBtn);
  }

  function closeSettings(): void {
    const returnFocus = gameState.isInitialized()
      ? document.querySelectorAll<HTMLButtonElement>(".cell")[
          gameState.getFocusedCellIndex()
        ]
      : settingsBtn;
    modalManager.close(settingsOverlay, returnFocus);
  }

  function openShortcuts(): void {
    modalManager.open(shortcutsOverlay, shortcutsModal, closeShortcutsBtn);
  }

  function closeShortcuts(): void {
    const returnFocus = gameState.isInitialized()
      ? document.querySelectorAll<HTMLButtonElement>(".cell")[
          gameState.getFocusedCellIndex()
        ]
      : shortcutsBtn;
    modalManager.close(shortcutsOverlay, returnFocus);
  }

  function handleSettingsKeydown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      closeSettings();
      return;
    }

    if (
      e.key === "Enter" &&
      e.target instanceof HTMLInputElement &&
      e.target.type === "checkbox"
    ) {
      e.preventDefault();
      e.target.checked = !e.target.checked;
      e.target.dispatchEvent(new Event("change", { bubbles: true }));
    }

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      navigateSettings(e);
    }
  }

  function navigateSettings(e: KeyboardEvent): void {
    const focusableElements = Array.from(
      settingsModal.querySelectorAll<HTMLElement>(
        'input[type="checkbox"], button'
      )
    );

    const currentIndex = focusableElements.indexOf(
      document.activeElement as HTMLElement
    );

    if (currentIndex !== -1) {
      e.preventDefault();
      const nextIndex =
        e.key === "ArrowDown"
          ? (currentIndex + 1) % focusableElements.length
          : (currentIndex - 1 + focusableElements.length) %
            focusableElements.length;

      focusableElements[nextIndex].focus();
    }
  }

  // AI Logic
  function makeAIMove(): void {
    if (!isAIEnabled || game!.getActivePlayer().token !== "O") return;

    gameState.setAIThinking(true);

    setTimeout(() => {
      ErrorBoundary.wrap(() => {
        const strategy = AIStrategyFactory.create(aiDifficulty);
        const selectedCell = strategy.selectMove(board, "O", "X");

        logger.info(
          `AI (${aiDifficulty}) placing token at position ${selectedCell}`
        );

        undoManager.recordMove(selectedCell, "O", false);

        updateScreen(game!.playRound(selectedCell));
        updateUndoButton();
        gameState.setAIThinking(false);
      });
    }, AI_MOVE_DELAY);
  }

  function makeAutoMove(): void {
    ErrorBoundary.wrap(() => {
      timerManager.stop();

      const availableCells = board
        .map((cell, index) => ({ cell, index }))
        .filter(({ cell }) => cell.getValue() === "")
        .map(({ index }) => index);

      if (availableCells.length > 0) {
        const randomCell =
          availableCells[Math.floor(Math.random() * availableCells.length)];

        logger.info(
          `Time's up! Auto placing ${
            game!.getActivePlayer().name
          }'s token at position ${randomCell}`
        );

        undoManager.recordMove(randomCell, game!.getActivePlayer().token, true);

        const cells = Array.from(
          document.querySelectorAll<HTMLButtonElement>(".cell")
        );
        const autoCell = cells[randomCell];

        if (autoCell) {
          autoCell.style.backgroundColor = "#C1CEFE";
          setTimeout(() => {
            autoCell.style.backgroundColor = "";
            updateScreen(game!.playRound(randomCell));
            updateUndoButton();
          }, AUTO_MOVE_HIGHLIGHT_DELAY);
        }
      }
    });
  }

  // Game Logic
  function initializeGame(xName: string, oName: string): void {
    playerXName = xName;
    playerOName = oName;
    game = createGameController(playerXName, playerOName);
    board = game.getBoard();
    gameState.setInitialized(true);

    updateScreen();
    updateScoreBoard();
  }

  function startGame(): void {
    ErrorBoundary.wrap(() => {
      const xName = playerXNameInput.value.trim() || "Player X";
      let oName: string;

      if (aiToggle.checked) {
        isAIEnabled = true;
        aiDifficulty = aiDifficultySelect.value as AIDifficulty;
        oName = `Varush AI (${
          aiDifficulty.charAt(0).toUpperCase() + aiDifficulty.slice(1)
        })`;
      } else {
        isAIEnabled = false;
        oName = playerONameInput.value.trim() || "Player O";
      }

      initializeGame(xName, oName);
      closeModal(playerSetupOverlay);

      // Focus first cell after starting
      setTimeout(() => {
        const firstCell = document.querySelector<HTMLButtonElement>(".cell");
        firstCell?.focus();
      }, START_DELAY);
    });
  }

  // Function to Reset Game
  function resetGame(): void {
    if (!gameState.isInitialized() || !game) return;

    ErrorBoundary.wrap(() => {
      console.clear();
      timerManager.stop();
      undoManager.clear();
      gameState.setAIThinking(false);
      renderBoard(board, "new");
      game!.resetPlayer();

      const activePlayer = game!.getActivePlayer().name;
      playerTurnDiv.textContent = `${activePlayer}'s Turn`;
      updateScoreBoard();

      // Re-enable buttons after game reset
      const cells = Array.from(
        boardDiv.querySelectorAll<HTMLButtonElement>(".cell")
      );
      cells.forEach((btn) => (btn.disabled = false));

      updateUndoButton();

      // Restart Timer if Enabled
      if (timerManager.isTimerEnabled()) timerManager.start();
    });
  }

  // Function to Reset Scoreboard
  function resetScore(): void {
    if (!gameState.isInitialized() || !game) return;

    ErrorBoundary.wrap(() => {
      // Reset Everything
      gameState.reset();
      undoManager.clear();
      timerManager.stop();
      timerContainer.classList.remove("active");
      isAIEnabled = false;

      game!.resetWins();
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

  function performUndo(): void {
    if (!game) return;

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
        if (game) game.undoMove(cellIndex);
      });

      if (timerManager.isTimerEnabled()) {
        timerManager.stop();
      }

      updateScreen();
      undoBtn.disabled = true;
      logger.info("Move(s) undone");
    });
  }

  function updateUndoButton(): void {
    undoBtn.disabled = !undoManager.canUndo();
  }

  function updateScoreBoard(): void {
    if (!gameState.isInitialized() || !game) return;

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
    } else {
      playerXScore.classList.remove("activePlayer");
      playerOScore.classList.add("activePlayer");
    }
  }

  // Update Screen method
  function updateScreen(
    isWinner: [number, number, number] | null = null
  ): void {
    if (!gameState.isInitialized() || !game) return;

    ErrorBoundary.wrap(() => {
      // Get New version of board + active Player
      const activePlayer = game!.getActivePlayer().name;
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
      if (timerManager.isTimerEnabled()) timerManager.start();

      // Trigger AI move if its AI's turn
      if (isAIEnabled && game!.getActivePlayer().token === "O") {
        makeAIMove();
      }
    });
  }

  function handleWin(
    winnerCells: [number, number, number],
    winnerName: string
  ): void {
    timerManager.stop();
    undoManager.clear();
    undoBtn.disabled = true;

    if (timerManager.isTimerEnabled()) {
      timerManager.showWaitingMessage();
    }

    const [a, b, c] = winnerCells;
    const cells = Array.from(
      boardDiv.querySelectorAll<HTMLButtonElement>(".cell")
    );

    [a, b, c].forEach((index) => cells[index]?.classList.add("winner"));
    cells.forEach((cell) => (cell.disabled = true));

    playerTurnDiv.textContent = `${winnerName} Wins!`;
    logger.info(`${winnerName} is the WINNER!`);
    game!.addWin();
    updateScoreBoard();
  }

  function handleDraw(): void {
    timerManager.stop();
    undoManager.clear();
    undoBtn.disabled = true;

    if (timerManager.isTimerEnabled()) {
      timerManager.showWaitingMessage();
    }

    playerTurnDiv.textContent = "It's a Draw!";
  }

  // Function to Render Board
  function renderBoard(
    boardState: Cell[],
    status: "existing" | "new" = "existing"
  ): void {
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
      } else {
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
    const cells = Array.from(
      boardDiv.querySelectorAll<HTMLButtonElement>(".cell")
    );
    cells[gameState.getFocusedCellIndex()]?.focus();
  }

  // Keyboard Navigation
  function handleKeyboardNavigation(e: KeyboardEvent): void {
    const cells = Array.from(
      boardDiv.querySelectorAll<HTMLButtonElement>(".cell")
    );

    const activeElement = document.activeElement;
    if (
      !(activeElement instanceof HTMLElement) ||
      !activeElement.classList.contains("cell")
    ) {
      return;
    }

    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();

      const direction = e.key.replace("Arrow", "").toLowerCase() as
        | "up"
        | "down"
        | "left"
        | "right";
      const newIndex = KeyboardManager.navigateGrid(
        gameState.getFocusedCellIndex(),
        direction
      );

      cells[gameState.getFocusedCellIndex()].tabIndex = -1;
      cells[newIndex].tabIndex = 0;
      cells[newIndex].focus();
      gameState.setFocusedCellIndex(newIndex);
    }

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const currentCell = cells[gameState.getFocusedCellIndex()];
      if (currentCell && !currentCell.disabled) currentCell.click();
    }
  }

  function handleCellFocus(e: Event): void {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const index = target.dataset.index;
    if (index !== undefined) {
      gameState.setFocusedCellIndex(Number(index));
    }
  }

  // Click Handlers
  function clickHandlerBoard(e: Event): void {
    if (!gameState.isInitialized() || !game) return;
    if (isAIEnabled && gameState.isAIThinking()) return;

    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    const indexOfCell = target.dataset.index;
    const selectedCell = Number(indexOfCell);
    if (Number.isNaN(selectedCell)) return;

    if (board[selectedCell]?.getValue() !== "") return;
    if (isAIEnabled && game.getActivePlayer().token !== "X") return;

    ErrorBoundary.wrap(() => {
      if (!game) return;
      undoManager.recordMove(selectedCell, game.getActivePlayer().token, false);
      updateScreen(game.playRound(selectedCell));
      updateUndoButton();
    });
  }

  // Helper Function
  function toggleAISetup(): void {
    if (aiToggle.checked) {
      playerOGroup.style.display = "none";
      aiDifficultyGroup.style.display = "block";
      isAIEnabled = true;
    } else {
      playerOGroup.style.display = "flex";
      aiDifficultyGroup.style.display = "none";
      isAIEnabled = false;
    }
  }

  function focusRandomAvailableCell(): void {
    const availableCells = board
      .map((cell, index) => ({ cell, index }))
      .filter(({ cell }) => cell.getValue() === "")
      .map(({ index }) => index);

    if (availableCells.length > 0) {
      const randomCell =
        availableCells[Math.floor(Math.random() * availableCells.length)];
      gameState.setFocusedCellIndex(randomCell);

      const cells = Array.from(
        document.querySelectorAll<HTMLButtonElement>(".cell")
      );
      cells.forEach((btn, i) => (btn.tabIndex = i === randomCell ? 0 : -1));
      cells[randomCell]?.focus();
    }
  }

  function refocusCell(): void {
    if (gameState.isInitialized()) {
      setTimeout(() => {
        const cells = Array.from(
          document.querySelectorAll<HTMLButtonElement>(".cell")
        );
        cells[gameState.getFocusedCellIndex()]?.focus();
      }, START_DELAY);
    }
  }

  function handlePlayerSetupKeydown(e: KeyboardEvent): void {
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

  function setupInitialFocus(): void {
    playerXNameInput.focus();
  }

  // Event Listeners
  function setupEventListeners(): void {
    // Board
    eventManager.register(
      boardDiv,
      "click",
      clickHandlerBoard as EventListener
    );
    eventManager.register(
      boardDiv,
      "keydown",
      handleKeyboardNavigation as EventListener
    );

    // Buttons
    eventManager.register(resetGameBtn, "click", resetGame);
    eventManager.register(resetScoreBtn, "click", resetScore);
    eventManager.register(undoBtn, "click", performUndo);

    // Settings
    eventManager.register(settingsBtn, "click", openSettings);
    eventManager.register(closeSettingsBtn, "click", closeSettings);
    eventManager.register(settingsOverlay, "click", (e) => {
      if (e.target === settingsOverlay) closeSettings();
    });
    eventManager.register(
      settingsOverlay,
      "keydown",
      handleSettingsKeydown as EventListener
    );

    // Shortcuts
    eventManager.register(shortcutsBtn, "click", openShortcuts);
    eventManager.register(closeShortcutsBtn, "click", closeShortcuts);
    eventManager.register(shortcutsOverlay, "click", (e) => {
      if (e.target === shortcutsOverlay) closeShortcuts();
    });
    eventManager.register(shortcutsOverlay, "keydown", (e) => {
      if ((e as KeyboardEvent).key === "Escape") closeShortcuts();
    });

    // Player Setup
    eventManager.register(startGameBtn, "click", startGame);
    eventManager.register(
      playerSetupOverlay,
      "keydown",
      handlePlayerSetupKeydown as EventListener
    );
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
