/*
 * Problem skoczka szachowego polega na obejściu skoczkiem wszystkich 
 * pól planszy tak, żeby na każdym polu stanąć raz i tylko raz.
 */

var kBoardWidth = 0;
var kBoardHeight = 0;
var kPieceWidth = 50;
var kPieceHeight = 50;
var kPixelWidth = 0;
var kPixelHeight = 0;

var gCanvasElement;
var gDrawingContext;
var gPattern;

var gMoves;
var gMovesNum;
var gLastMove;
var gLastMove2;
var gMoveCount;
var gMoveCountElem;
var gNextMoves;
var gPrevNextMoves;
var gGameInfo;
var gGameInfoElem;
var gGameInProgress;

/* Inicjalizacja gry */
function initGame(canvasElement, moveCountElement, gameInfoElement, size) {
	if (!canvasElement) {
		canvasElement = document.createElement("canvas");
		canvasElement.id = "chess_canvas";
		document.body.appendChild(canvasElement);
	}
	if (!moveCountElement) {
		moveCountElement = document.createElement("span");
		document.body.appendChild(moveCountElement);
	}
	if (!gameInfoElement) {
		gameInfoElement = document.createElement("span");
		document.body.appendChild(gameInfoElement);
	}

	localStorage.getItem("gameMoves");

	kBoardWidth = size;
	kBoardHeight = size;
	kPixelWidth = 1 + (kBoardWidth * kPieceWidth);
	kPixelHeight = 1 + (kBoardHeight * kPieceHeight);
	gCanvasElement = canvasElement;
	gCanvasElement.width = kPixelWidth;
	gCanvasElement.height = kPixelHeight;
	gCanvasElement.addEventListener("click", onClick, false);
	gMoveCountElem = moveCountElement;
	gGameInfoElem = gameInfoElement;
	gDrawingContext = gCanvasElement.getContext("2d");
	newGame();
}

/* Rozpoczęcie nowej gry */
function newGame() {
	gMoves = [];
	gNextMoves = [];
	gMovesNum = gMoves.length;
	gMoveCount = 0;
	gGameInfo = "Ruszaj!";
	gGameInProgress = true;
	drawBoard();
}

/* Koniec gry */
function endGame() {
	gGameInProgress = false;
}
/* Sprawdzanie zakończenia gry */
function isTheGameOver() {
	if (gMoves.length == (kBoardWidth * kBoardHeight)) {
		gGameInfo = "Gratulacje!!!";
		return true;
	}
}

/* Cell model */
function Cell(row, column) {
	this.row = row;
	this.column = column;
}

/* Pobranie pozycji kursora */
function getCursorPosition(e) {
	var x;
	var y;
	if (e.pageX != undefined && e.pageY != undefined) {
		x = e.pageX;
		y = e.pageY;
	} else {
		x = e.clientX + document.body.scrollLeft
				+ document.documentElement.scrollLeft;
		y = e.clientY + document.body.scrollTop
				+ document.documentElement.scrollTop;
	}
	x -= gCanvasElement.offsetLeft;
	y -= gCanvasElement.offsetTop;
	x = Math.min(x, kBoardWidth * kPieceWidth);
	y = Math.min(y, kBoardHeight * kPieceHeight);
	var cell = new Cell(Math.floor(y / kPieceHeight), Math.floor(x
			/ kPieceWidth));
	return cell;
}

/* Akcja po kliknięciu */
function onClick(e) {
	if (!gGameInProgress) {
		return;
	}
	var cell = getCursorPosition(e);

	gLastMove = gMoves[gMoves.length - 1];
	gLastMove2 = gMoves[gMoves.length - 2];
	if (gLastMove == null) {
		gLastMove = -1;
	}

	/* Klikniecie w ten sam punkt aby cofnac ruch */
	if (compareCell(cell, gLastMove, gLastMove2)) {
		gMoves.pop();
		gMovesNum = gMoves.length;
		gMoveCount++;
		gNextMoves = [];
		if (gMovesNum > 0) {
			nextMoves(gLastMove2);
		}
		gGameInfo = "Ruch cofniety";
		drawBoard();
		return;
	}

	/* Klikniecie w instejacy juz punkt */
	if (sameMove(cell)) {
		gGameInfo = "Nieprawidłowy ruch!";
		drawBoard();
		return;
	}

	/* Sprawdzanie poprawnoci ruchu */
	if (gLastMove == -1 || correctMove(cell, gLastMove)) {
		gMoveCount++;
		nextMoves(cell);
		if (gNextMoves.length < 1) {
			gGameInfo = "Brak możliwych ruchów!";
			gGameInfoElem.innerHTML = gGameInfo;
			gMoves.push(cell);
			gMovesNum = gMoves.length;
			drawBoard();
			return;
		}
		clickOnEmptyCell(cell);
	}
}

/* Porównanie dwówch komórek */
function compareCell(newCell, oldCell) {
	if (newCell.row == oldCell.row & newCell.column == oldCell.column) {
		return true;
	} else
		return false;
}

/* Kliknięcie w dozwoloną komórkę */
function clickOnEmptyCell(cell) {
	gMoves.push(cell);
	localStorage.setItem("gameMoves", gMoves);
	gMovesNum = gMoves.length;
	gGameInfo = ":-)";
	drawBoard();
}

/* Odrzucenie kliknięcia w komórkę już zaznaczoną */
function sameMove(cell) {
	for (var i = 0; i < gMoves.length; i++) {
		if (compareCell(cell, gMoves[i])) {
			gGameInfo = ":-)";
			return true;
		}
	}
	return false;
}

/* Sprawdzenie poprawności ruchu */
function correctMove(cell, oldCell) {
	var correctMoves = [];
	correctMoves[0] = [ -1, -2 ];
	correctMoves[1] = [ -2, -1 ];
	correctMoves[2] = [ -2, 1 ];
	correctMoves[3] = [ -1, 2 ];
	correctMoves[4] = [ 1, 2 ];
	correctMoves[5] = [ 2, 1 ];
	correctMoves[6] = [ 2, -1 ];
	correctMoves[7] = [ 1, -2 ];

	for (var i = 0; i < 8; i++) {
		var newCell = new Cell(oldCell.row + correctMoves[i][1], oldCell.column
				+ correctMoves[i][0]);
		if (compareCell(cell, newCell)) {
			return true;
		}
	}
	gGameInfo = "Nieprawidłowy ruch!";
	drawBoard();
	return false;

}

function nextMoves(currentCell) {
	var correctMoves = [];
	correctMoves[0] = [ -1, -2 ];
	correctMoves[1] = [ -2, -1 ];
	correctMoves[2] = [ -2, 1 ];
	correctMoves[3] = [ -1, 2 ];
	correctMoves[4] = [ 1, 2 ];
	correctMoves[5] = [ 2, 1 ];
	correctMoves[6] = [ 2, -1 ];
	correctMoves[7] = [ 1, -2 ];

	gNextMoves = [];

	for (var i = 0; i < 8; i++) {
		if (gMoves.length == 0) {
			gNextMoves.push(new Cell(currentCell.row + correctMoves[i][1],
					currentCell.column + correctMoves[i][0]));
		} else {
			var nextMove = null;
			var flag = false;
			for (var x = 0; x < gMoves.length; x++) {
				var oldMove = new Cell(gMoves[x].row, gMoves[x].column);
				nextMove = new Cell(currentCell.row + correctMoves[i][1],
						currentCell.column + correctMoves[i][0]);
				if (compareCell(nextMove, oldMove)) {
					flag = true;
					break;
				}
			}
			if (flag == false) {
				/* Sprawdzanie czy ruch nie wykracza poza plansze */
				if (nextMove.row > -1 & nextMove.column > -1
						& nextMove.row < kBoardWidth
						& nextMove.column < kBoardWidth) {
					gNextMoves.push(nextMove);
				}
			}
		}
	}
}

/* Rysowanie planszy */
function drawBoard() {
	if (gGameInProgress && isTheGameOver()) {
		gGameInfoElem.innerHTML = gGameInfo;
		endGame();
	}

	gDrawingContext.clearRect(0, 0, kPixelWidth, kPixelHeight);
	gDrawingContext.beginPath();

	/* Linie pionowe */
	for (var x = 0; x <= kPixelWidth; x += kPieceWidth) {
		gDrawingContext.moveTo(0.5 + x, 0);
		gDrawingContext.lineTo(0.5 + x, kPixelHeight);
	}

	/* Linie poziome */
	for (var y = 0; y <= kPixelHeight; y += kPieceHeight) {
		gDrawingContext.moveTo(0, 0.5 + y);
		gDrawingContext.lineTo(kPixelWidth, 0.5 + y);
	}

	/* Rysowanie */
	gDrawingContext.strokeStyle = "#ccc";
	gDrawingContext.stroke();

	for (var i = 0; i < gMovesNum; i++) {
		drawPoint(gMoves[i], i + 1);
	}

	for (var i = 0; i < gNextMoves.length; i++) {
		drawNextMoves(gNextMoves[i]);
	}

	gMoveCountElem.innerHTML = gMoveCount;
	gGameInfoElem.innerHTML = gGameInfo;

	saveGameState();
}

/* Rysowanie punktu */
function drawPoint(p, index) {
	var column = p.column;
	var row = p.row;
	var x = (column * kPieceWidth) + (kPieceWidth / 2);
	var y = (row * kPieceHeight) + (kPieceHeight / 2);
	var radius = (kPieceWidth / 2) - (kPieceWidth / 10);
	/* Rysowanie kółka */
	gDrawingContext.fillStyle = "black";
	gDrawingContext.beginPath();
	gDrawingContext.arc(x, y, radius, 0, Math.PI * 2, false);
	gDrawingContext.closePath();
	gDrawingContext.strokeStyle = "#000";
	gDrawingContext.stroke();
	/* Rysowanie numeru ruchu */
	gDrawingContext.font = "20px Georgia";
	gDrawingContext.fillText(index, x - 5, y + 3);
}

function drawNextMoves(p) {
	var column = p.column;
	var row = p.row;
	var x = (column * kPieceWidth) + (kPieceWidth / 2);
	var y = (row * kPieceHeight) + (kPieceHeight / 2);
	/* Rysowanie możliwych ruchów */
	gDrawingContext.strokeStyle = "red";
	gDrawingContext.fillStyle = "#99CCFF";
	gDrawingContext.fillRect(x - 23, y - 23, 47, 47);
	gDrawingContext.stroke();
}
