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
        const selectedCell = board[cell];
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
function Cell() {
    let value = "";

    // Accept a players move to change the value of the cell
    const addToken = (player) => {
        value = player;
    } 

    // Method to retrieve the current value of the cell through closure
    const getValue = () => value;

    // Reset Cell Value
    const resetValue = () => {
        value = '';
        return value;
    }

    // Return methods
    return { addToken, getValue, resetValue }

}

// GameController will be responsiblee for conttrolling the flow and state of the games turn
// Including Win Conditions
function GameController(playerOneName = "Player X", playerTwoName = "Player O") {
    // Set up gameboard
    const board = gameBoard();

    // Set up players
    const player = [
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
    ]

    // Set active player
    let activePlayer = player[0]

    // Set up turn control --> if Player 1 --> Next = Player 2
    const switchPlayerTurn = () => {
        activePlayer = activePlayer === player[0] ? player[1] : player[0]
    }

    // Method to get current active player
    const getActivePlayer = () => activePlayer;

    // Method to add Win to current active player
    const addWin = () => activePlayer.wins += 1;

    // Method to get the wins of the players
    const getPlayerXWins = () => player[0].wins;
    const getPlayerOWins = () => player[1].wins;

    // Method to reset wins
    const resetWins = () => {
        player[0].wins = 0;
        player[1].wins = 0;
    }

    const resetPlayer = () => activePlayer = player[0];

    // Print new round 
    const printNewRound = () => {
        // Print board using method + Print/Log Players turn using method getActivePlayer 
        board.printBoard();
        console.log(`${getActivePlayer().name}'s Turn`)
    }

    // Check for Winner
    const checkForWinner = () => {
        const gameBoard = board.getBoard();
        // Win Condition combos
        const winCondition = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
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
        const winner = checkForWinner();
        if (winner.length === 3) return winner;

        switchPlayerTurn();
        printNewRound();
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
    const playerTurnDiv = document.querySelector('.turn');
    const boardDiv = document.querySelector('.board');
    const playerXScore = document.querySelector('#playerXScore')
    const playerOScore = document.querySelector('#playerOScore')
    const resetGameBtn = document.querySelector('.resetGame');
    const resetScoreBtn = document.querySelector('.resetScore');

    // Update Screen method 
    const updateScreen = (isWinner = []) => {
        // Get New version of board + active Player
        const activePlayer = game.getActivePlayer().name;
        updateScoreBoard();

        renderBoard(board);

        if (isWinner.length > 0) {
            // Set variables for isWinner Values
            const [a, b, c] = isWinner;
            const cells = document.querySelectorAll(".cell");

            [a, b, c].forEach(index => cells[index].classList.add("winner"));
            cells.forEach(cell => cell.disabled = true);

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
    function clickHandlerBoard(e) {
        // Target the element with the dataset name previously set
        const selectedCell = Number(e.target.dataset.index);
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
    }

    // Function to Render Board
    function renderBoard(board, status="existing") {
        // Clear Board
        boardDiv.textContent = "";
        
        board.forEach((cell, index) => {
            // Create Buttons
            const cellButton = document.createElement("button");
            cellButton.classList.add('cell');
            // Create a data attribute to identify the column + set textContent to cell value
            cellButton.dataset.index = index;
            if (status === "existing") {
                cellButton.textContent = cell.getValue();
            } else {
            cellButton.textContent = cell.resetValue();
            }
            boardDiv.appendChild(cellButton);
        })
    }

    // Function to Reset Scoreboard
    function resetScore() {
        game.resetWins();
        updateScoreBoard();
    }

    boardDiv.addEventListener("click", clickHandlerBoard);
    resetGameBtn.addEventListener("click", resetGame);
    resetScoreBtn.addEventListener("click", resetScore);

    // Initial Render
    updateScreen();
}


ScreenController();