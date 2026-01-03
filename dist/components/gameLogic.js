import { WIN_CONDITIONS, CELL_COUNT } from "./constants.js";
// Create a Cell
export function createCell() {
    let value = "";
    const addToken = (player) => {
        value = player;
    };
    const getValue = () => value;
    const resetValue = () => {
        value = "";
        return value;
    };
    return { addToken, getValue, resetValue };
}
// Create GameBoard
function createGameBoard() {
    const cellCount = CELL_COUNT;
    const board = [];
    for (let i = 0; i < cellCount; i++) {
        board.push(createCell());
    }
    const getBoard = () => board;
    const displayToken = (cellIndex, player) => {
        const selectedCell = board[cellIndex];
        if (!selectedCell)
            return;
        if (selectedCell.getValue() !== "")
            return;
        selectedCell.addToken(player);
    };
    const printBoard = () => {
        const boardWithCellValues = board.map((cell) => cell.getValue());
        console.log(boardWithCellValues);
    };
    return { getBoard, displayToken, printBoard };
}
// GameController
export function createGameController(playerOneName = "Player X", playerTwoName = "Player O") {
    const board = createGameBoard();
    const players = [
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
    let activePlayer = players[0];
    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };
    const getActivePlayer = () => activePlayer;
    const addWin = () => (activePlayer.wins += 1);
    const getPlayerXWins = () => players[0].wins;
    const getPlayerOWins = () => players[1].wins;
    const resetWins = () => {
        players[0].wins = 0;
        players[1].wins = 0;
    };
    const resetPlayer = () => {
        activePlayer = players[0];
        return activePlayer;
    };
    const printNewRound = () => {
        board.printBoard();
        console.log(`${getActivePlayer().name}'s Turn`);
    };
    const checkForWinner = () => {
        const boardState = board.getBoard();
        for (const [a, b, c] of WIN_CONDITIONS) {
            if (boardState[a].getValue() &&
                boardState[a].getValue() === boardState[b].getValue() &&
                boardState[a].getValue() === boardState[c].getValue()) {
                return [a, b, c];
            }
        }
        return null;
    };
    const playRound = (cellIndex) => {
        const gameBoard = board.getBoard();
        const validPosition = gameBoard[cellIndex]?.getValue() === "";
        if (!validPosition)
            return null;
        console.log(`Adding ${getActivePlayer().name}'s Token into Position ${cellIndex}`);
        board.displayToken(cellIndex, getActivePlayer().token);
        const winner = checkForWinner();
        if (winner)
            return winner;
        switchPlayerTurn();
        printNewRound();
        return null;
    };
    const undoMove = (cellIndex) => {
        board.getBoard()[cellIndex]?.resetValue();
        switchPlayerTurn();
        printNewRound();
    };
    // Initial game messaage
    printNewRound();
    return {
        playRound,
        getActivePlayer,
        addWin,
        getPlayerXWins,
        getPlayerOWins,
        resetWins,
        resetPlayer,
        getBoard: board.getBoard,
        undoMove,
    };
}
