// Create a gameboard that represents the state of the board
function gameBoard() {
    const rows = 3;
    const cols = 3;
    const board = [];

    // Create a 2D array to represent the board
    // For every row, create an array of cells
    for (let  i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < cols; j++) {
            board[i].push(Cell());
        }
    }

    // Create a method to get entire board --> UI needs this to render board
    const getBoard = () => board;

    // Display token when clicked on a valid cell
    const displayToken = (row, col, player) => {
        const availableCells = board.filter((row) => row[col].getValue() === "")

        // if No cells are empty --> Return / Check for win condition
        if (!availableCells.length) return;

        // Else add token to the available cell
        board[row][col].addToken(player);
    }

    // Create a method to print the board to console
    // Helpful to seeing the board after each turn
    const printBoard = () => {
        const boardWithCellValues = board.map((row) => row.map((cell) => cell.getValue()))
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
        board.getBoard();
        console.log(`${getActivePlayer().name}'s Turn.`)
    }

    // Play Round Logic
    const playRound = (row, col) => {
        // Add token for the current player
        console.log(`Adding ${getActivePlayer().name}'s Token into row ${row}, column ${col}`);
        // Use displayToken method from gameboard using parameters --> row + column + Player Token Identification
        board.displayToken(row, col, getActivePlayer().token);

        /* Check for Winner + Win Message Logic */


        switchPlayerTurn();
        printNewRound();
    };

    // Initial play game message --> printNewRound();
    printNewRound();


    // Return Methods:
    // Console playRound | UI Version = getActivePlayer + getBoard
    return { playRound, getActivePlayer, getBoard: board.getBoard() }
}

