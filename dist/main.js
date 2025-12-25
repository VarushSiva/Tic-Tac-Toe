"use strict";
// Enforce DOM elements exist to prevent runtime crashs
function mustFind(element, name) {
    if (!element)
        throw new Error(`Missing required element: ${name}`);
    return element;
}
// Create a gameboard that represents the state of the board
function gameBoard() {
    const cellCount = 9;
    const board = [];
    for (let i = 0; i < cellCount; i++) {
        board.push(Cell());
    }
    // Create a method to get entire board --> UI needs this to render board
    const getBoard = () => board;
    // Display token when clicked on a valid cell
    const displayToken = (cellIndex, player) => {
        const selectedCell = board[cellIndex];
        if (!selectedCell)
            return;
        if (selectedCell.getValue() !== "")
            return;
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
function Cell() {
    let value = "";
    // Accept a players move to change the value of the cell
    const addToken = (player) => {
        value = player;
    };
    // Method to retrieve the current value of the cell through closure
    const getValue = () => value;
    // Reset Cell Value
    const resetValue = () => {
        value = "";
        return value;
    };
    // Return methods
    return { addToken, getValue, resetValue };
}
// GameController will be responsiblee for conttrolling the flow and state of the games turn
// Including Win Conditions
function GameController(playerOneName = "Player X", playerTwoName = "Player O") {
    // Set up gameboard
    const board = gameBoard();
    // Set up players
    const players = [
        {
            name: playerOneName,
            token: "X",
            wins: 0
        },
        {
            name: playerTwoName,
            token: "O",
            wins: 0
        }
    ];
    // Set active player
    let activePlayer = players[0];
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
    const checkForWinner = () => {
        const boardState = board.getBoard();
        // Win Condition combos
        const winCondition = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        // Check with each combo if there is a match
        for (const [a, b, c] of winCondition) {
            // Check if board[a] has a value (Not '') and then compare to board[b] and board[c]
            if (boardState[a].getValue() && boardState[a].getValue() === boardState[b].getValue() && boardState[a].getValue() === boardState[c].getValue()) {
                // Return index to add winner class later
                return [a, b, c];
            }
        }
        return null;
    };
    // Play Round Logic
    const playRound = (cellIndex) => {
        // If token is already present, return 
        const gameBoard = board.getBoard();
        const validPosition = gameBoard[cellIndex]?.getValue() === "";
        if (!validPosition)
            return null;
        // Add token for the current player
        console.log(`Adding ${getActivePlayer().name}'s Token into Position ${cellIndex}`);
        // Use displayToken method from gameboard using parameters --> row + column + Player Token Identification
        board.displayToken(cellIndex, getActivePlayer().token);
        /* Check for Winner + Win Message Logic */
        const winner = checkForWinner();
        if (winner)
            return winner;
        switchPlayerTurn();
        printNewRound();
        return null;
    };
    // Initial play game message --> printNewRound();
    printNewRound();
    // Return Methods:
    // Console playRound | UI Version = getActivePlayer + getBoard
    return { playRound, getActivePlayer, addWin, getPlayerXWins, resetWins, getPlayerOWins, resetPlayer, getBoard: board.getBoard };
}
// Add Screen Controller
function ScreenController() {
    // Set gameController
    const game = GameController();
    const board = game.getBoard();
    // Target HTML Div
    const playerTurnDiv = mustFind(document.querySelector(".turn"), ".turn");
    const boardDiv = mustFind(document.querySelector(".board"), ".board");
    const playerXScore = mustFind(document.querySelector("#playerXScore"), "#playerXScore");
    const playerOScore = mustFind(document.querySelector("#playerOScore"), "#playerOScore");
    const resetGameBtn = mustFind(document.querySelector(".resetGame"), ".resetGame");
    const resetScoreBtn = mustFind(document.querySelector(".resetScore"), ".resetScore");
    const settingsBtn = mustFind(document.querySelector(".settingsBtn"), ".settingsBtn");
    const settingsOverlay = mustFind(document.querySelector("#settingsOverlay"), "#settingsOverlay");
    const closeSettingsBtn = mustFind(document.querySelector(".closeSettings"), ".closeSettings");
    const reduceMotionCheckbox = mustFind(document.querySelector("#reduceMotion"), "#reduceMotion");
    // Settings Panel Functions
    function openSettings() {
        settingsOverlay.setAttribute("aria-hidden", "false");
        closeSettingsBtn.focus();
    }
    function closeSettings() {
        settingsOverlay.setAttribute("aria-hidden", "true");
        settingsBtn.focus();
    }
    function handleSettingsKeydown(e) {
        if (e.key === "Escape") {
            closeSettings();
        }
    }
    // Animation Settings
    let animationsEnabled = true;
    function toggleAnimations() {
        animationsEnabled = reduceMotionCheckbox.checked ? false : true;
        // Apply or remove no-animation class to body
        if (animationsEnabled) {
            document.body.classList.remove('reduce-motion');
        }
        else {
            document.body.classList.add('reduce-motion');
        }
        console.log(`Animations enabled: ${animationsEnabled}`);
    }
    // Load Saved Preference from localStorage if available
    const savedMotionPref = localStorage.getItem('reduceMotion');
    if (savedMotionPref === 'true') {
        reduceMotionCheckbox.checked = true;
        toggleAnimations();
    }
    // Check for System Preference 
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches && !savedMotionPref) {
        reduceMotionCheckbox.checked = true;
        toggleAnimations();
    }
    // Set State to localStorage
    reduceMotionCheckbox.addEventListener("change", () => {
        toggleAnimations();
        localStorage.setItem('reduceMotion', reduceMotionCheckbox.checked.toString());
    });
    let focusedCellIndex = 0;
    // Keyboard Navigation Handler
    function handleKeyboardNavigation(e) {
        const cells = Array.from(boardDiv.querySelectorAll(".cell"));
        // Only handle if Focus is on a Cell
        const activeElement = document.activeElement;
        if (!(activeElement instanceof HTMLElement) || !activeElement.classList.contains('cell'))
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
            if (currentCell && !currentCell.disabled)
                currentCell.click();
        }
    }
    // Track Focused Cell
    function handleCellFocus(e) {
        const target = e.target;
        if (!(target instanceof HTMLElement))
            return;
        const index = target.dataset.index;
        if (index !== undefined) {
            focusedCellIndex = Number(index);
        }
    }
    const updateScoreBoard = () => {
        // Remove and Readd Active player class
        const activePlayer = game.getActivePlayer().name;
        if (activePlayer === "Player X") {
            playerOScore.classList.remove('activePlayer');
            playerXScore.classList.add('activePlayer');
        }
        else {
            playerXScore.classList.remove('activePlayer');
            playerOScore.classList.add('activePlayer');
        }
        // Get new version of number of wins per player
        const playerXWins = game.getPlayerXWins();
        const playerOWins = game.getPlayerOWins();
        // Update Scoreboard
        playerXScore.textContent = `Player X: ${playerXWins}`;
        playerOScore.textContent = `Player O: ${playerOWins}`;
    };
    // Add eventListeners for the board
    function clickHandlerBoard(e) {
        const target = e.target;
        if (!(target instanceof HTMLElement))
            return;
        // Target the element with the dataset name previously set
        const indexOfCell = target.dataset.index;
        const selectedCell = Number(indexOfCell);
        // Make sure a column was clicked and not the gaps
        if (Number.isNaN(selectedCell))
            return;
        // Play round and after every round --> Update Screen
        updateScreen(game.playRound(selectedCell));
    }
    // Function to Reset Game
    function resetGame() {
        console.clear();
        renderBoard(board, "new");
        game.resetPlayer();
        const activePlayer = game.getActivePlayer().name;
        playerTurnDiv.textContent = `${activePlayer}'s Turn`;
        updateScoreBoard();
        // Re-enable buttons after game reset
        const cells = Array.from(boardDiv.querySelectorAll(".cell"));
        cells.forEach((btn) => (btn.disabled = false));
    }
    // Function to Render Board
    function renderBoard(boardState, status = "existing") {
        // Clear Board
        boardDiv.textContent = "";
        boardState.forEach((cell, index) => {
            // Create Buttons
            const cellButton = document.createElement("button");
            cellButton.type = "button";
            cellButton.classList.add('cell');
            // Create a data attribute to identify the column + set textContent to cell value
            cellButton.dataset.index = String(index);
            // Make Keyboard Focusable
            cellButton.tabIndex = index === focusedCellIndex ? 0 : -1;
            if (status === "existing") {
                cellButton.textContent = cell.getValue();
            }
            else {
                cellButton.textContent = cell.resetValue();
            }
            // Label each cell for Screen reader users
            const row = Math.floor(index / 3) + 1;
            const col = (index % 3) + 1;
            const value = cell.getValue();
            const state = value === "" ? "empty" : value;
            cellButton.setAttribute("aria-label", `Row ${row} Column ${col}, ${state}`);
            // Add Focus Event Listener
            cellButton.addEventListener("focus", handleCellFocus);
            boardDiv.appendChild(cellButton);
        });
        // Sticky Focus
        const cells = Array.from(boardDiv.querySelectorAll(".cell"));
        cells[focusedCellIndex]?.focus();
    }
    // Update Screen method 
    const updateScreen = (isWinner = null) => {
        // Get New version of board + active Player
        const activePlayer = game.getActivePlayer().name;
        updateScoreBoard();
        renderBoard(board);
        if (isWinner) {
            // Set variables for isWinner Values
            const [a, b, c] = isWinner;
            const cells = Array.from(boardDiv.querySelectorAll(".cell"));
            [a, b, c].forEach(index => cells[index]?.classList.add("winner"));
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
            playerTurnDiv.textContent = `Its a Draw!`;
            return;
        }
        playerTurnDiv.textContent = `${activePlayer}'s Turn`;
    };
    // Function to Reset Scoreboard
    function resetScore() {
        game.resetWins();
        updateScoreBoard();
        playerTurnDiv.textContent = "Scoreboard reset.";
    }
    boardDiv.addEventListener("click", clickHandlerBoard);
    boardDiv.addEventListener("keydown", handleKeyboardNavigation);
    resetGameBtn.addEventListener("click", resetGame);
    resetScoreBtn.addEventListener("click", resetScore);
    // Settings Event Listeners
    settingsBtn.addEventListener("click", openSettings);
    closeSettingsBtn.addEventListener("click", closeSettings);
    settingsOverlay.addEventListener("click", (e) => {
        if (e.target === settingsOverlay)
            closeSettings();
    });
    settingsOverlay.addEventListener("keydown", handleSettingsKeydown);
    // Initial Render
    updateScreen();
}
ScreenController();
