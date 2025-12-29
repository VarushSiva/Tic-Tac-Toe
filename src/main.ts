// Types
type Token = "X" | "O";
type CellValue = "" | Token;
type WinnerLine = [number, number, number] | null;
type AIDifficulty = "easy" | "medium" | "hard";

interface Cell {
  addToken: (player: Token) => void;
  getValue: () => CellValue;
  resetValue: () => CellValue;
}

interface GameBoard {
  getBoard: () => Cell[];
  displayToken: (cellIndex: number, player: Token) => void;
  printBoard: () => void;
}

interface Player {
  name: string;
  token: Token;
  wins: number;
}

interface GameController {
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

interface MoveHistory {
  cellIndex: number;
  player: Token;
  wasAutoMove: boolean;
}

// Enforce DOM elements exist to prevent runtime crashs
function mustFind<T extends Element>(element: T | null, name: string): T {
  if (!element) throw new Error(`Missing required element: ${name}`);
  return element;
}

// Create a gameboard that represents the state of the board
function gameBoard(): GameBoard {
  const cellCount = 9;
  const board: Cell[] = [];

  for (let i = 0; i < cellCount; i++) {
    board.push(Cell());
  }

  // Create a method to get entire board --> UI needs this to render board
  const getBoard = () => board;

  // Display token when clicked on a valid cell
  const displayToken = (cellIndex: number, player: Token) => {
    const selectedCell = board[cellIndex];
    if (!selectedCell) return;
    if (selectedCell.getValue() !== "") return;

    // Else add token to the available cell
    selectedCell.addToken(player);
  };

  // Create a method to print the board to console
  // Helpful to seeing the board after each turn
  const printBoard = () => {
    const boardWithCellValues = board.map((cell) => cell.getValue());
    console.log(boardWithCellValues);
  };

  // Return methods
  return { getBoard, displayToken, printBoard };
}

// A Cell represents one square on the board:
// "" : Empty
// "X": Player 1
// "O": Player 2
function Cell(): Cell {
  let value: CellValue = "";

  // Accept a players move to change the value of the cell
  const addToken = (player: Token) => {
    value = player;
  };

  // Method to retrieve the current value of the cell through closure
  const getValue = () => value;

  // Reset Cell Value
  const resetValue = (): CellValue => {
    value = "";
    return value;
  };

  // Return methods
  return { addToken, getValue, resetValue };
}

// GameController will be responsiblee for conttrolling the flow and state of the games turn
// Including Win Conditions
function GameController(
  playerOneName = "Player X",
  playerTwoName = "Player O"
): GameController {
  // Set up gameboard
  const board = gameBoard();

  // Set up players
  const players: [Player, Player] = [
    {
      name: playerOneName,
      token: "X",
      wins: 0,
    },
    {
      name: playerTwoName,
      token: "O",
      wins: 0,
    },
  ];

  // Set active player
  let activePlayer: Player = players[0];

  // Set up turn control --> if Player 1 --> Next = Player 2
  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };

  // Method to get current active player
  const getActivePlayer = () => activePlayer;

  // Method to add Win to current active player
  const addWin = () => (activePlayer.wins += 1);

  // Method to get the wins of the players
  const getPlayerXWins = () => players[0].wins;
  const getPlayerOWins = () => players[1].wins;

  // Method to reset wins
  const resetWins = () => {
    players[0].wins = 0;
    players[1].wins = 0;
  };

  const resetPlayer = () => (activePlayer = players[0]);

  // Print new round
  const printNewRound = () => {
    // Print board using method + Print/Log Players turn using method getActivePlayer
    board.printBoard();
    console.log(`${getActivePlayer().name}'s Turn`);
  };

  // Check for Winner
  const checkForWinner = (): WinnerLine => {
    const boardState = board.getBoard();
    // Win Condition combos
    const winCondition: [number, number, number][] = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // Rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // Columns
      [0, 4, 8],
      [2, 4, 6], // Diagonals
    ];
    // Check with each combo if there is a match
    for (const [a, b, c] of winCondition) {
      // Check if board[a] has a value (Not '') and then compare to board[b] and board[c]
      if (
        boardState[a].getValue() &&
        boardState[a].getValue() === boardState[b].getValue() &&
        boardState[a].getValue() === boardState[c].getValue()
      ) {
        // Return index to add winner class later
        return [a, b, c];
      }
    }
    return null;
  };

  // Play Round Logic
  const playRound = (cellIndex: number): WinnerLine => {
    // If token is already present, return
    const gameBoard = board.getBoard();

    const validPosition = gameBoard[cellIndex]?.getValue() === "";
    if (!validPosition) return null;

    // Add token for the current player
    console.log(
      `Adding ${getActivePlayer().name}'s Token into Position ${cellIndex}`
    );

    // Use displayToken method from gameboard using parameters --> row + column + Player Token Identification
    board.displayToken(cellIndex, getActivePlayer().token);

    /* Check for Winner + Win Message Logic */
    const winner = checkForWinner();
    if (winner) return winner;

    switchPlayerTurn();
    printNewRound();
    return null;
  };

  // Initial play game message --> printNewRound();
  printNewRound();

  // Return Methods:
  // Console playRound | UI Version = getActivePlayer + getBoard
  return {
    playRound,
    getActivePlayer,
    addWin,
    getPlayerXWins,
    resetWins,
    getPlayerOWins,
    resetPlayer,
    getBoard: board.getBoard,
    undoMove: (cellIndex: number) => {
      // Reset the cell
      board.getBoard()[cellIndex]?.resetValue();
      // Switch Player back
      switchPlayerTurn();
      printNewRound();
    },
  };
}

// Add Screen Controller
function ScreenController() {
  // Initiate Game after Player Names
  let game: GameController;
  let board: Cell[];
  let isGameInitialized = false;

  // Store Player Names
  let playerXName = "Player X";
  let playerOName = "Player O";
  let focusedCellIndex = 0;

  // AI Variables
  let isAIEnabled = false;
  let aiDifficulty: AIDifficulty = "medium";

  // Theme Data
  const themes = {
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
  };

  // Timer Variables
  let timerEnabled = false;
  let timerDuration = 10;
  let timerInterval: number | null = null;
  let currentTime = timerDuration;
  let isAutoMove = false;

  // Move History for Undo
  let moveHistory: MoveHistory[] = [];

  // Target HTML Div
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
  const enableTimerDescription = mustFind(
    document.querySelector<HTMLElement>("#enableTimerDescription"),
    "#enableTimerDescription"
  );
  const closeSettingsBtn = mustFind(
    document.querySelector<HTMLButtonElement>(".closeSettings"),
    ".closeSettings"
  );
  const reduceMotionCheckbox = mustFind(
    document.querySelector<HTMLInputElement>("#reduceMotion"),
    "#reduceMotion"
  );

  // Player Setup Elements
  const playerSetupOverlay = mustFind(
    document.querySelector<HTMLElement>("#playerSetupOverlay"),
    "#playerSetupOverlay"
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

  // AI Toggle Elements
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

  // Shortcut Elements
  const shortcutsBtn = mustFind(
    document.querySelector<HTMLButtonElement>(".shortcutsBtn"),
    ".shortcutsBtn"
  );
  const shortcutsOverlay = mustFind(
    document.querySelector<HTMLElement>("#shortcutsOverlay"),
    "#shortcutsOverlay"
  );
  const closeShortcutsBtn = mustFind(
    document.querySelector<HTMLButtonElement>(".closeShortcuts"),
    ".closeShortcuts"
  );

  // Settings Panel Functions
  function openSettings() {
    settingsOverlay.setAttribute("aria-hidden", "false");
    closeSettingsBtn.focus();
  }

  function closeSettings() {
    settingsOverlay.setAttribute("aria-hidden", "true");
    settingsBtn.focus();
  }

  function handleSettingsKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      closeSettings();
    }
  }

  // Shortcuts Panel Functions
  function openShortcuts() {
    shortcutsOverlay.setAttribute("aria-hidden", "false");
    closeShortcutsBtn.focus();
  }

  function closeShortcuts() {
    shortcutsOverlay.setAttribute("aria-hidden", "true");
    shortcutsBtn.focus();
  }

  function handleShortcutsKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      closeShortcuts();
    }
  }

  // Animation Settings
  let animationsEnabled = true;

  function toggleAnimations() {
    animationsEnabled = reduceMotionCheckbox.checked ? false : true;
    // Apply or remove no-animation class to body
    if (animationsEnabled) {
      document.body.classList.remove("reduce-motion");
    } else {
      document.body.classList.add("reduce-motion");
    }
    console.log(`Animations enabled: ${animationsEnabled}`);
  }

  // Load Saved Preference from localStorage if available
  const savedMotionPref = localStorage.getItem("reduceMotion");
  if (savedMotionPref === "true") {
    reduceMotionCheckbox.checked = true;
    toggleAnimations();
  }

  // Check for System Preference
  if (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    !savedMotionPref
  ) {
    reduceMotionCheckbox.checked = true;
    toggleAnimations();
  }

  // Player Setup Functions
  function initializeGame(xName: string, oName: string) {
    playerXName = xName;
    playerOName = oName;
    game = GameController(playerXName, playerOName);
    board = game.getBoard();
    isGameInitialized = true;

    updateScreen();
    updateScoreBoard();
  }

  // AI Toggle + Functions
  function toggleAISetup() {
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

  function makeAIMove() {
    if (!isAIEnabled || game.getActivePlayer().token !== "O") return;

    // Set Delayed AI move
    setTimeout(() => {
      const availableCells = board
        .map((cell, index) => ({ cell, index }))
        .filter(({ cell }) => cell.getValue() === "");

      if (availableCells.length === 0) return;

      let selectedCell: number;

      switch (aiDifficulty) {
        case "easy":
          selectedCell = makeEasyMove(availableCells);
          break;
        case "medium":
          selectedCell = makeMediumMove(availableCells);
          break;
        case "hard":
          selectedCell = makeHardMove(availableCells);
          break;
        default:
          selectedCell = makeMediumMove(availableCells);
      }

      console.log(
        `AI (${aiDifficulty}) placing token at position ${selectedCell}`
      );

      updateScreen(game.playRound(selectedCell));
      updateUndoButton();
    }, 500);
  }

  // Easy AI - Random Moves
  function makeEasyMove(
    availableCells: { cell: Cell; index: number }[]
  ): number {
    const randomIndex = Math.floor(Math.random() * availableCells.length);
    return availableCells[randomIndex].index;
  }

  // Medium AI - Block wins, if nothing to block --> random
  function makeMediumMove(
    availableCells: { cell: Cell; index: number }[]
  ): number {
    // Check if AI can win
    const winningMove = findWinningMove("O");
    if (winningMove !== null) return winningMove;

    // Check if Player needs to be blocked
    const blockingMove = findWinningMove("X");
    if (blockingMove !== null) return blockingMove;

    // If neither --> Random
    return makeEasyMove(availableCells);
  }

  // Hard AI - Medium AI + Take Center / Corners before random
  function makeHardMove(
    availableCells: { cell: Cell; index: number }[]
  ): number {
    // Check if AI can win
    const winningMove = findWinningMove("O");
    if (winningMove !== null) return winningMove;

    // Check if Player needs to be blocked
    const blockingMove = findWinningMove("X");
    if (blockingMove !== null) return blockingMove;

    // Take center if available
    if (board[4].getValue() === "") return 4;

    // Take corners if available
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(
      (corner) => board[corner].getValue() === ""
    );
    if (availableCorners.length > 0) {
      return availableCorners[
        Math.floor(Math.random() * availableCorners.length)
      ];
    }

    // If neither --> Random
    return makeEasyMove(availableCells);
  }

  // Find Winning Move
  function findWinningMove(player: Token): number | null {
    const winCondition: [number, number, number][] = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // Rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // Columns
      [0, 4, 8],
      [2, 4, 6], // Diagonals
    ];

    for (const [a, b, c] of winCondition) {
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

  // Theme Functions
  let currentTheme = "default";

  function applyTheme(themeName: keyof typeof themes) {
    const theme = themes[themeName];
    const root = document.documentElement;

    // Set Colours from theme data to css variables
    root.style.setProperty("--color-background-light", theme.backgroundLight);
    root.style.setProperty("--color-background-medium", theme.backgroundMedium);
    root.style.setProperty(
      "--color-background-container",
      theme.backgroundContainer
    );
    root.style.setProperty("--color-highlight", theme.highlight);
    root.style.setProperty("--color-highlight-rgb", theme.highlightRgb);
    root.style.setProperty("--color-text", theme.text);

    // Set data-theme attribute for background pattern
    document.body.setAttribute("data-theme", themeName);

    currentTheme = themeName;
    localStorage.setItem("theme", themeName);

    // Update active state on theme buttons
    document.querySelectorAll(".themeBtn").forEach((button) => {
      button.classList.remove("active");
    });
    const activeBtn = document.querySelector<HTMLButtonElement>(
      `[data-theme="${themeName}"]`
    );
    activeBtn?.classList.add("active");

    console.log(`Applied ${themeName} theme`);
  }

  function setupThemeButtons() {
    const themeButtons =
      document.querySelectorAll<HTMLButtonElement>(".themeBtn");
    themeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const theme = btn.dataset.theme as keyof typeof themes;
        applyTheme(theme);
      });
    });
  }

  // Load Saved Theme
  const savedTheme = localStorage.getItem("theme") as
    | keyof typeof themes
    | null;
  if (savedTheme && themes[savedTheme]) {
    applyTheme(savedTheme);
  } else {
    applyTheme("default");
  }

  setupThemeButtons();

  // Set Dynamic Description for Enable Timer
  enableTimerDescription.textContent = `Automatically place a random move after ${timerDuration} seconds`;

  // Timer Functions
  function startTimer() {
    if (!timerEnabled || !isGameInitialized) return;

    const availableCells = board.filter((cell) => cell.getValue() === "");
    const isGameOver =
      availableCells.length === 0 ||
      playerTurnDiv.textContent.includes("Wins!");
    if (isGameOver) return;

    // Clear any existing timer
    stopTimer();
    currentTime = timerDuration;
    isAutoMove = false;
    updateTimerDisplay();

    timerContainer.classList.add("active");

    timerInterval = window.setInterval(() => {
      currentTime--;
      updateTimerDisplay();

      if (currentTime <= 5) {
        timerBar.classList.add("warning");
      }

      if (currentTime <= 0) {
        makeAutoMove();
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    timerBar.classList.remove("warning");
  }

  function updateTimerDisplay() {
    const percentage = (currentTime / timerDuration) * 100;
    timerBar.style.width = `${percentage}%`;
    timerText.textContent = `${currentTime}s`;
  }

  function makeAutoMove() {
    stopTimer();
    isAutoMove = true;

    // Find available cells
    const availableCells = board
      .map((cell, index) => ({ cell, index }))
      .filter(({ cell }) => cell.getValue() === "");

    if (availableCells.length > 0) {
      // Pick Random Available Cell
      const randomCell =
        availableCells[Math.floor(Math.random() * availableCells.length)];
      console.log(
        `Time's up! Auto placing ${
          game.getActivePlayer().name
        }'s token at position ${randomCell.index}`
      );

      // Record auto move in history
      moveHistory.push({
        cellIndex: randomCell.index,
        player: game.getActivePlayer().token,
        wasAutoMove: true,
      });

      // Highlight the auto selected cell
      const cells = Array.from(
        document.querySelectorAll<HTMLButtonElement>(".cell")
      );
      const autoCell = cells[randomCell.index];
      if (autoCell) {
        autoCell.style.backgroundColor = "#C1CEFE";
        setTimeout(() => {
          autoCell.style.backgroundColor = "";
          updateScreen(game.playRound(randomCell.index));
          updateUndoButton();
        }, 500);
      }
    }
  }

  function toggleTimer() {
    timerEnabled = enableTimerCheckbox.checked;
    localStorage.setItem("timerEnabled", timerEnabled.toString());

    const availableCells = board.filter((cell) => cell.getValue() === "");
    const isGameOver =
      availableCells.length === 0 ||
      playerTurnDiv.textContent.includes("Wins!");

    if (timerEnabled && isGameInitialized) {
      if (isGameOver) {
        // Show timer container but dont start countdown
        timerContainer.classList.add("active");
        timerBar.style.width = "100%";
        timerText.textContent = "Waiting For Next Round";
        timerBar.classList.remove("warning");
      } else {
        startTimer();
      }
    } else {
      stopTimer();
      timerContainer.classList.remove("active");
    }

    console.log(`Timer enabled: ${timerEnabled}`);
  }

  const savedTimerPref = localStorage.getItem("timerEnabled");
  if (savedTimerPref === "true") {
    enableTimerCheckbox.checked = true;
    timerEnabled = true;
  }

  // Undo Function
  function undoMove() {
    if (moveHistory.length === 0) return;

    const lastMove = moveHistory[moveHistory.length - 1];

    // Prevent undo if last move was auto placed
    if (lastMove.wasAutoMove) {
      playerTurnDiv.textContent = "Cannot Undo Automatic Moves!";
      setTimeout(() => {
        playerTurnDiv.textContent = `${game.getActivePlayer().name}'s Turn`;
      }, 2000);
      return;
    }

    // Remove last move from history + undo move in game
    moveHistory.pop();
    game.undoMove(lastMove.cellIndex);

    if (timerEnabled) stopTimer();
    updateScreen();
    undoBtn.disabled = true;
    console.log(`Undid move at position ${lastMove.cellIndex}`);
  }

  function updateUndoButton() {
    // Allow undo if there is atleast one move and the last move wasnt auto placed
    if (moveHistory.length === 0) {
      undoBtn.disabled = true;
    } else {
      const lastMove = moveHistory[moveHistory.length - 1];
      undoBtn.disabled = lastMove.wasAutoMove;
    }
  }

  function startGame() {
    const playerXName = playerXNameInput.value.trim() || "Player X";
    let playerOName: string;

    if (aiToggle.checked) {
      isAIEnabled = true;
      aiDifficulty = aiDifficultySelect.value as AIDifficulty;
      playerOName = `Varush AI (${
        aiDifficulty.charAt(0).toUpperCase() + aiDifficulty.slice(1)
      })`;
    } else {
      isAIEnabled = false;
      playerOName = playerONameInput.value.trim() || "Player O";
    }

    initializeGame(playerXName, playerOName);
    playerSetupOverlay.setAttribute("aria-hidden", "true");

    // Focus first cell after starting
    setTimeout(() => {
      const firstCell = document.querySelector<HTMLButtonElement>(".cell");
      firstCell?.focus();
    }, 100);
  }

  function handlePlayerSetupKeydown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      // Prevent event from bubbling
      e.stopPropagation();
      startGame();
    }
  }

  // Keyboard Navigation Handler
  function handleKeyboardNavigation(e: KeyboardEvent) {
    const cells = Array.from(
      boardDiv.querySelectorAll<HTMLButtonElement>(".cell")
    );

    // Only handle if Focus is on a Cell
    const activeElement = document.activeElement;
    if (
      !(activeElement instanceof HTMLElement) ||
      !activeElement.classList.contains("cell")
    )
      return;

    // Handle Arrow Keys
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();

      const currentRow = Math.floor(focusedCellIndex / 3);
      const currentCol = focusedCellIndex % 3;
      let newIndex = focusedCellIndex;

      switch (e.key) {
        case "ArrowUp":
          newIndex = currentRow > 0 ? focusedCellIndex - 3 : focusedCellIndex;
          break;
        case "ArrowDown":
          newIndex = currentRow < 2 ? focusedCellIndex + 3 : focusedCellIndex;
          break;
        case "ArrowLeft":
          newIndex = currentCol > 0 ? focusedCellIndex - 1 : focusedCellIndex;
          break;
        case "ArrowRight":
          newIndex = currentCol < 2 ? focusedCellIndex + 1 : focusedCellIndex;
          break;
      }

      // TabIndex Update
      cells[focusedCellIndex].tabIndex = -1;
      cells[newIndex].tabIndex = 0;
      cells[newIndex].focus();
      focusedCellIndex = newIndex;
    }

    // Handle Enter/Space to Place Token
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const currentCell = cells[focusedCellIndex];
      if (currentCell && !currentCell.disabled) currentCell.click();
    }
  }

  // Track Focused Cell
  function handleCellFocus(e: FocusEvent) {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const index = target.dataset.index;
    if (index !== undefined) {
      focusedCellIndex = Number(index);
    }
  }

  const updateScoreBoard = () => {
    if (!isGameInitialized) return;

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
  };

  // Add eventListeners for the board
  function clickHandlerBoard(e: MouseEvent) {
    if (!isGameInitialized) return;

    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    // Target the element with the dataset name previously set
    const indexOfCell = target.dataset.index;
    const selectedCell = Number(indexOfCell);
    // Make sure a column was clicked and not the gaps
    if (Number.isNaN(selectedCell)) return;

    // Check if move is valid before recording
    if (board[selectedCell]?.getValue() !== "") return;

    // Record move in history
    isAutoMove = false;
    moveHistory.push({
      cellIndex: selectedCell,
      player: game.getActivePlayer().token,
      wasAutoMove: false,
    });

    // Play round and after every round --> Update Screen
    updateScreen(game.playRound(selectedCell));
    updateUndoButton();
  }

  // Function to Reset Game
  function resetGame() {
    if (!isGameInitialized) return;

    console.clear();
    stopTimer();
    moveHistory = [];
    renderBoard(board, "new");
    game.resetPlayer();

    const activePlayer = game.getActivePlayer().name;
    playerTurnDiv.textContent = `${activePlayer}'s Turn`;
    updateScoreBoard();

    // Re-enable buttons after game reset
    const cells = Array.from(
      boardDiv.querySelectorAll<HTMLButtonElement>(".cell")
    );
    cells.forEach((btn) => (btn.disabled = false));

    updateUndoButton();

    // Restart Timer if Enabled
    if (timerEnabled) startTimer();
  }

  // Function to Render Board
  function renderBoard(
    boardState: Cell[],
    status: "existing" | "new" = "existing"
  ) {
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
      cellButton.tabIndex = index === focusedCellIndex ? 0 : -1;

      if (status === "existing") {
        cellButton.textContent = cell.getValue();
      } else {
        cellButton.textContent = cell.resetValue();
      }

      // Label each cell for Screen reader users
      const row = Math.floor(index / 3) + 1;
      const col = (index % 3) + 1;
      const value = cell.getValue();
      const state = value === "" ? "empty" : value;
      cellButton.setAttribute(
        "aria-label",
        `Row ${row} Column ${col}, ${state}`
      );

      // Add Focus Event Listener
      cellButton.addEventListener("focus", handleCellFocus);

      boardDiv.appendChild(cellButton);
    });

    // Sticky Focus
    const cells = Array.from(
      boardDiv.querySelectorAll<HTMLButtonElement>(".cell")
    );
    cells[focusedCellIndex]?.focus();
  }

  // Update Screen method
  const updateScreen = (isWinner: WinnerLine = null) => {
    if (!isGameInitialized) return;

    // Get New version of board + active Player
    const activePlayer = game.getActivePlayer().name;
    updateScoreBoard();
    renderBoard(board);

    if (isWinner) {
      // Stop Timer on Win
      stopTimer();
      moveHistory = [];
      undoBtn.disabled = true;

      // Show Next Round message if timer is enabled
      if (timerEnabled) {
        timerContainer.classList.add("active");
        timerBar.style.width = "100%";
        timerText.textContent = "Waiting For Next Round";
        timerBar.classList.remove("warning");
      }

      // Set variables for isWinner Values
      const [a, b, c] = isWinner;
      const cells = Array.from(
        boardDiv.querySelectorAll<HTMLButtonElement>(".cell")
      );

      [a, b, c].forEach((index) => cells[index]?.classList.add("winner"));
      cells.forEach((cellBtn) => (cellBtn.disabled = true));

      // Print Winner
      playerTurnDiv.textContent = `${activePlayer} Wins!`;
      console.log(`${activePlayer} is the WINNER!`);
      game.addWin();
      updateScoreBoard();
      // Can redirect to transparent Game Over screen
      return;
    }

    const availableCells = board.filter((cells) => cells.getValue() === "");
    if (availableCells.length === 0) {
      stopTimer();
      moveHistory = [];
      undoBtn.disabled = true;

      // Show Next Round message if timer is enabled
      if (timerEnabled) {
        timerContainer.classList.add("active");
        timerBar.style.width = "100%";
        timerText.textContent = "Waiting For Next Round";
        timerBar.classList.remove("warning");
      }
      playerTurnDiv.textContent = `Its a Draw!`;
      return;
    }

    playerTurnDiv.textContent = `${activePlayer}'s Turn`;

    // Start/Restart timer for next move
    if (timerEnabled) startTimer();

    // Trigger AI move if its AI's turn
    if (isAIEnabled && game.getActivePlayer().token === "O") {
      makeAIMove();
    }
  };

  // Function to Reset Scoreboard
  function resetScore() {
    if (!isGameInitialized) return;

    // Reset Everything
    isGameInitialized = false;
    focusedCellIndex = 0;
    moveHistory = [];
    stopTimer();
    timerContainer.classList.remove("active");
    isAIEnabled = false;

    game.resetWins();
    updateScoreBoard();

    // Clear board
    playerTurnDiv.textContent = "";
    boardDiv.textContent = "";

    updateUndoButton();

    // Show player name customization modal
    playerSetupOverlay.setAttribute("aria-hidden", "false");
    playerXNameInput.value = "";
    playerONameInput.value = "";
    aiToggle.checked = false;
    toggleAISetup();
    playerXNameInput.focus();
  }

  // Board Event Listeners
  boardDiv.addEventListener("click", clickHandlerBoard);
  boardDiv.addEventListener("keydown", handleKeyboardNavigation);
  resetGameBtn.addEventListener("click", resetGame);
  resetScoreBtn.addEventListener("click", resetScore);
  undoBtn.addEventListener("click", undoMove);

  // Settings Event Listeners
  settingsBtn.addEventListener("click", openSettings);
  closeSettingsBtn.addEventListener("click", closeSettings);
  settingsOverlay.addEventListener("click", (e) => {
    if (e.target === settingsOverlay) closeSettings();
  });
  settingsOverlay.addEventListener("keydown", handleSettingsKeydown);

  // Player Setup Event Listeners
  startGameBtn.addEventListener("click", startGame);
  playerSetupOverlay.addEventListener("keydown", handlePlayerSetupKeydown);
  playerXNameInput.focus();

  // Accessibility Event Listener
  reduceMotionCheckbox.addEventListener("change", () => {
    toggleAnimations();
    localStorage.setItem(
      "reduceMotion",
      reduceMotionCheckbox.checked.toString()
    );
  });
  enableTimerCheckbox.addEventListener("change", toggleTimer);

  // AI Event Listeners
  aiToggle.addEventListener("change", toggleAISetup);

  // Shortcuts Event Listeners
  shortcutsBtn.addEventListener("click", openShortcuts);
  closeShortcutsBtn.addEventListener("click", closeShortcuts);
  shortcutsOverlay.addEventListener("click", (e) => {
    if (e.target === shortcutsOverlay) closeShortcuts();
  });
  shortcutsOverlay.addEventListener("keydown", handleShortcutsKeydown);
}

ScreenController();
