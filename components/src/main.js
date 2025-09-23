// Create a gameboard that represents the state of the board
function gameBoard() {
    const rows = 3;
    const cols = 3;
    const board = [];

    // Create a 2D array to represent the board
    // For every row, create an array of cells
    

    // Create a method to get entire board --> UI needs this to render board


    // Create a method to print the board to console
    // Helpful to seeing the board after each turn


    // Return methods


}

// A Cell represents one square on the board:
// "" : Empty
// "X": Player 1
// "O": Player 2
function Cell() {
    let value = "";

    // Accept a players move to change the value of the cell


    // Method to retrieve the current value of the cell through closure


    // Return methods


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