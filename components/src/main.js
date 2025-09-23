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

    // Create a method to print the board to console
    // Helpful to seeing the board after each turn
    const printBoard = () => {
        const boardWithCellValues = board.map((row) => row.map((cell) => cell.getValue()))
        console.log(boardWithCellValues)
    }

    // Return methods
    return { getBoard, printBoard }

}

// A Cell represents one square on the board:
// "" : Empty
// "X": Player 1
// "O": Player 2
function Cell() {
    let value = "";

    // Accept a players move to change the value of the cell
    const validMove = (player) => {
        value = player;
    } 

    // Method to retrieve the current value of the cell through closure
    const getValue = () => value;

    // Return methods
    return { validMove, getValue }

}

// GameController will be responsiblee for conttrolling the flow and state of the games turn
// Including Win Conditions
function GameController(playerOneName = "Player One", playerTwoName = "Player Two") {
    // Set up gameboard
    

    // Set up players


    // Set active player


    // Set up turn control --> if Player 1 --> Next = Player 2


    // Method to get current active player


    // Print new round + Print/Log Players turn using method getActivePlayer


    // Play Round Logic


    // Initial play game message --> printNewRound();


    // Return Methods:
    // Console playRound | UI Version = getActivePlayer + getBoard
}