// GameLogic
import {
  Token,
  Cell as CellInterface,
  GameBoard,
  Player,
  GameController,
  WinnerLine,
} from "./types";
import { WIN_CONDITIONS, CELL_COUNT } from "./constants";

// Create a Cell
export function Cell(): CellInterface {
  let value: "" | Token = "";

  const addToken = (player: Token): void => {
    value = player;
  };

  const getValue = (): "" | Token => value;

  const resetValue = (): "" | Token => {
    value = "";
    return value;
  };

  return { addToken, getValue, resetValue };
}

// Create GameBoard
function gameBoard(): GameBoard {
  const cellCount = CELL_COUNT;
  const board: CellInterface[] = [];

  for (let i = 0; i < cellCount; i++) {
    board.push(Cell());
  }

  const getBoard = (): CellInterface[] => board;

  const displayToken = (cellIndex: number, player: Token): void => {
    const selectedCell = board[cellIndex];
    if (!selectedCell) return;
    if (selectedCell.getValue() !== "") return;

    selectedCell.addToken(player);
  };

  const printBoard = (): void => {
    const boardWithCellValues = board.map((cell) => cell.getValue());
    console.log(boardWithCellValues);
  };

  return { getBoard, displayToken, printBoard };
}

// GameController
export function GameController(
  playerOneName = "Player X",
  playerTwoName = "Player O"
): GameController {
  const board = gameBoard();

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

  let activePlayer: Player = players[0];

  const switchPlayerTurn = (): void => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };

  const getActivePlayer = (): Player => activePlayer;

  const addWin = (): number => (activePlayer.wins += 1);

  const getPlayerXWins = (): number => players[0].wins;

  const getPlayerOWins = (): number => players[1].wins;

  const resetWins = (): void => {
    players[0].wins = 0;
    players[1].wins = 0;
  };

  const resetPlayer = (): Player => {
    activePlayer = players[0];
    return activePlayer;
  };

  const printNewRound = (): void => {
    board.printBoard();
    console.log(`${getActivePlayer().name}'s Turn`);
  };

  const checkForWinner = (): WinnerLine => {
    const boardState = board.getBoard();

    for (const [a, b, c] of WIN_CONDITIONS) {
      if (
        boardState[a].getValue() &&
        boardState[a].getValue() === boardState[b].getValue() &&
        boardState[a].getValue() === boardState[c].getValue()
      ) {
        return [a, b, c];
      }
    }
    return null;
  };

  const playRound = (cellIndex: number): WinnerLine => {
    const gameBoard = board.getBoard();

    const validPosition = gameBoard[cellIndex]?.getValue() === "";
    if (!validPosition) return null;

    console.log(
      `Adding ${getActivePlayer().name}'s Token into Position ${cellIndex}`
    );

    board.displayToken(cellIndex, getActivePlayer().token);

    const winner = checkForWinner();
    if (winner) return winner;

    switchPlayerTurn();
    printNewRound();
    return null;
  };

  const undoMove = (cellIndex: number): void => {
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
