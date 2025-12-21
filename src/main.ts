// Types
type Token = "X" | "O";
type CellValue = "" | Token;
type WinnerLine = [number, number, number] | null;

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

    for (let  i = 0; i < cellCount; i++) {
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
    }

    // Create a method to print the board to console
    // Helpful to seeing the board after each turn
    const printBoard = () => {
        const boardWithCellValues = board.map((cell) => cell.getValue())
        console.log(boardWithCellValues)
    }

    // Return methods
    return { getBoard, displayToken, printBoard }

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
    } 

    // Method to retrieve the current value of the cell through closure
    const getValue = () => value;

    // Reset Cell Value
    const resetValue = (): CellValue => {
        value = '';
        return value;
    }

    // Return methods
    return { addToken, getValue, resetValue }

}

// GameController will be responsiblee for conttrolling the flow and state of the games turn
// Including Win Conditions
function GameController(playerOneName = "Player X", playerTwoName = "Player O"): GameController {
    // Set up gameboard
    const board = gameBoard();

    // Set up players
    const players: [Player, Player] = [
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
    let activePlayer: Player = players[0];

    // Set up turn control --> if Player 1 --> Next = Player 2
    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0]
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
    }

    const resetPlayer = () => (activePlayer = players[0]);

    // Print new round 
    const printNewRound = () => {
        // Print board using method + Print/Log Players turn using method getActivePlayer 
        board.printBoard();
        console.log(`${getActivePlayer().name}'s Turn`)
    }

    // Check for Winner
    const checkForWinner = (): WinnerLine => {
        const gameBoard = board.getBoard();
        // Win Condition combos
        const winCondition: [number, number, number][] = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ]
        // Check with each combo if there is a match
        for (const [a, b, c] of winCondition) {
            // Check if board[a] has a value (Not '') and then compare to board[b] and board[c]
            if (gameBoard[a].getValue() && gameBoard[a].getValue() == gameBoard[b].getValue() && gameBoard[a].getValue() == gameBoard[c].getValue()) {
                // Return index to add winner class later
                return [a, b, c];
            }
        }
        return null;
    }

    // Play Round Logic
    const playRound = (cellIndex: number): WinnerLine => {
        // If token is already present, return 
        const gameBoard = board.getBoard();

        const validPosition = gameBoard[cellIndex]?.getValue() === "";
        if (!validPosition) return null;

        // Add token for the current player
        console.log(`Adding ${getActivePlayer().name}'s Token into Position ${cellIndex}`);

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
    return { playRound, getActivePlayer, addWin, getPlayerXWins, resetWins, getPlayerOWins, resetPlayer, getBoard: board.getBoard }
}

// Add Screen Controller
function ScreenController() {
    // Set gameController
    const game = GameController();
    const board = game.getBoard();

    // Target HTML Div
    const playerTurnDiv = mustFind(document.querySelector<HTMLElement>(".turn"), ".turn");
    const boardDiv = mustFind(document.querySelector<HTMLElement>(".board"), ".board");
    const playerXScore = mustFind(document.querySelector<HTMLElement>("#playerXScore"), "#playerXScore");
    const playerOScore = mustFind(document.querySelector<HTMLElement>("#playerOScore"), "#playerOScore");
    const resetGameBtn = mustFind(document.querySelector<HTMLButtonElement>(".resetGame"), ".resetGame");
    const resetScoreBtn = mustFind(document.querySelector<HTMLButtonElement>(".resetScore"), ".resetScore");

    const updateScoreBoard = () => {
        // Remove and Readd Active player class
        const activePlayer = game.getActivePlayer().name;
        if (activePlayer === "Player X") {
            playerOScore.classList.remove('activePlayer')
            playerXScore.classList.add('activePlayer')
        } else {
            playerXScore.classList.remove('activePlayer')
            playerOScore.classList.add('activePlayer')
        }
        // Get new version of number of wins per player
        const playerXWins = game.getPlayerXWins();
        const playerOWins = game.getPlayerOWins();

        // Update Scoreboard
        playerXScore.textContent = `Player X: ${playerXWins}`;
        playerOScore.textContent = `Player O: ${playerOWins}`;

    }


    // Add eventListeners for the board
    function clickHandlerBoard(e: MouseEvent) {
        const target = e.target;
        if (!(target instanceof HTMLElement)) return;
        // Target the element with the dataset name previously set
        const indexOfCell = target.dataset.index;
        const selectedCell = Number(indexOfCell);
        // Make sure a column was clicked and not the gaps
        if (Number.isNaN(selectedCell)) return;

        // Play round and after every round --> Update Screen
        updateScreen(game.playRound(selectedCell));
    }

    // Function to Reset Game
    function resetGame() {
        console.clear();
        renderBoard(board, "new");
        game.resetPlayer()

        const activePlayer = game.getActivePlayer().name;
        playerTurnDiv.textContent = `${activePlayer}'s Turn`;
        updateScoreBoard();

        // Re-enable buttons after game reset
        const cells = Array.from(document.querySelectorAll<HTMLButtonElement>(".cell"));
        cells.forEach((btn) => (btn.disabled = false));
    }

    // Function to Render Board
    function renderBoard(boardState: Cell[], status: "existing" | "new" = "existing") {
        // Clear Board
        boardDiv.textContent = "";
        
        boardState.forEach((cell, index) => {
            // Create Buttons
            const cellButton = document.createElement("button");
            cellButton.type = "button";
            cellButton.classList.add('cell');
            // Create a data attribute to identify the column + set textContent to cell value
            cellButton.dataset.index = String(index);
            
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
            cellButton.setAttribute("aria-label", `Row ${row} Column ${col}, ${state}`);

            boardDiv.appendChild(cellButton);
        })
    }

    // Update Screen method 
    const updateScreen = (isWinner: WinnerLine = null) => {
        // Get New version of board + active Player
        const activePlayer = game.getActivePlayer().name;
        updateScoreBoard();
        renderBoard(board);

        if (isWinner) {
            // Set variables for isWinner Values
            const [a, b, c] = isWinner;
            const cells = Array.from(document.querySelectorAll<HTMLButtonElement>(".cell"));

            [a, b, c].forEach(index => cells[index]?.classList.add("winner"));
            cells.forEach((cellBtn) => (cellBtn.disabled = true));

            // Print Winner
            playerTurnDiv.textContent = `${activePlayer} Wins!`;
            console.log(`${activePlayer} is the WINNER!`)
            game.addWin();
            updateScoreBoard();
            // Can redirect to transparent Game Over screen
            return;
        }

        const availableCells = board.filter((cells) => cells.getValue() === "")
        if (availableCells.length === 0) {
            playerTurnDiv.textContent = `Its a Draw!`;
            return;
        }

        playerTurnDiv.textContent = `${activePlayer}'s Turn`;
    }

    // Function to Reset Scoreboard
    function resetScore() {
        game.resetWins();
        updateScoreBoard();
        playerTurnDiv.textContent = "Scoreboard reset."
    }

    boardDiv.addEventListener("click", clickHandlerBoard);
    resetGameBtn.addEventListener("click", resetGame);
    resetScoreBtn.addEventListener("click", resetScore);

    // Initial Render
    updateScreen();
}


ScreenController();