// Create a gameboard that represents the state of the board
function gameBoard() {
    const cell = 9;
    const board = [];

    for (let  i = 0; i < cell; i++) {
        board.push(Cell());
    }

    // Create a method to get entire board --> UI needs this to render board
    const getBoard = () => board;

    // Display token when clicked on a valid cell
    const displayToken = (cell, player) => {
        const availableCells = board.filter((cell) => cell.getValue() === "")

        // if No cells are empty --> Return / Check for win condition
        if (!availableCells.length) return;

        // Else add token to the available cell
        board[cell].addToken(player);
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
function Cell() {
    let value = "";

    // Accept a players move to change the value of the cell
    const addToken = (player) => {
        value = player;
    } 

    // Method to retrieve the current value of the cell through closure
    const getValue = () => value;

    // Return methods
    return { addToken, getValue }

}

// GameController will be responsiblee for conttrolling the flow and state of the games turn
// Including Win Conditions
function GameController(playerOneName = "Player One", playerTwoName = "Player Two") {
    // Set up gameboard
    const board = gameBoard();

    // Set up players
    const player = [
        {
            name: playerOneName,
            token: "X"
        },
        {
            name: playerTwoName,
            token: "O"
        }
    ]

    // Set active player
    let activePlayer = player[0]

    // Set up turn control --> if Player 1 --> Next = Player 2
    const switchPlayerTurn = () => {
        activePlayer = activePlayer === player[0] ? player[1] : player[0]
    }

    // Method to get current active player
    const getActivePlayer = () => activePlayer;

    // Print new round 
    const printNewRound = () => {
        // Print board using method + Print/Log Players turn using method getActivePlayer 
        board.printBoard();
        console.log(`${getActivePlayer().name}'s Turn.`)
    }

    // Check for Winner
    const checkForWinner = () => {
        const gameBoard = board.getBoard();
        // Win Condition combos
        winCondition = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ]
        // Check with each combo if there is a match
        for (let win of winCondition) {
            const [a, b, c] = win;
            // Check if board[a] has a value (Not '') and then compare to board[b] and board[c]
            if (gameBoard[a].getValue() && gameBoard[a].getValue() == gameBoard[b].getValue() && gameBoard[a].getValue() == gameBoard[c].getValue()) {
                // Return index to add winner class later
                return [a, b, c];
            }
        }
        return [];
    }

    // Play Round Logic
    const playRound = (cell) => {
        // If token is already present, return 
        const gameBoard = board.getBoard();
        const validPosition = gameBoard[cell].getValue() === "";
        if (!validPosition) {
            return;
        }

        // Add token for the current player
        console.log(`Adding ${getActivePlayer().name}'s Token into Position ${cell}`);

        // Use displayToken method from gameboard using parameters --> row + column + Player Token Identification
        board.displayToken(cell, getActivePlayer().token);

        /* Check for Winner + Win Message Logic */
        if (checkForWinner().length === 3) {
            return checkForWinner();
        }

        switchPlayerTurn();
        printNewRound();
    };

    // Initial play game message --> printNewRound();
    printNewRound();


    // Return Methods:
    // Console playRound | UI Version = getActivePlayer + getBoard
    return { playRound, getActivePlayer, getBoard: board.getBoard }
}

// Add Screen Controller
function ScreenController() {
    // Set gameController
    const game = GameController();

    // Target HTML Div
    const playerTurnDiv = document.querySelector('.turn');
    const boardDiv = document.querySelector('.board');

    // Update Screen method 
    const updateScreen = (isWinner = []) => {
        // Clear Board
        boardDiv.textContent = "";

        // Get New version of board + active Player
        const board = game.getBoard();
        const activePlayer = game.getActivePlayer().name;

        // Render board squares
        board.forEach((cell, index) => {
            // Create Buttons
            const cellButton = document.createElement("button");
            cellButton.classList.add('cell');
            // Create a data attribute to identify the column + set textContent to cell value
            cellButton.dataset.index = index;
            cellButton.textContent = cell.getValue();
            boardDiv.appendChild(cellButton);
        })

        if (isWinner.length > 0) {
            // Set variables for isWinner Values
            const [a, b, c] = isWinner;
            const cells = document.querySelectorAll(".cell");

            [a, b, c].forEach(index => cells[index].classList.add("winner"));
            cells.forEach(cell => cell.disabled = true);

            // Print Winner
            playerTurnDiv.textContent = `${activePlayer} Wins!`;
            console.log(`${activePlayer} is the WINNER!`)
            // Can redirect to transparent Game Over screen
            return;
        }
        playerTurnDiv.textContent = `${activePlayer}'s Turn.`;
    }


    // Add eventListeners for the board
    function clickHandlerBoard(e) {
        // Target the element with the dataset name previously set
        const selectedCell = e.target.dataset.index;
        // Make sure a column was clicked and not the gaps
        if (!selectedCell) return;

        // Play round and after every round --> Update Screen

        updateScreen(game.playRound(selectedCell));
    }

    boardDiv.addEventListener("click", clickHandlerBoard)

    // Initial Render
    updateScreen();
}

ScreenController();