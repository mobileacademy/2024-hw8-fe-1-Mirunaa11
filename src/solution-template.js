/*
*
* "board" is a matrix that holds data about the
* game board, in a form of BoardSquare objects
*
* openedSquares holds the position of the opened squares
*
* flaggedSquares holds the position of the flagged squares
*
 */
let board = [];
let openedSquares = [];
let flaggedSquares = [];
let bombCount = 0;
let squaresLeft = 0;


/*
*
* the probability of a bomb in each square
*
 */
let bombProbability = 3;
let maxProbability = 15;


function minesweeperGameBootstrapper(rowCount, colCount) {
    let easy = {
        'rowCount': 9,
        'colCount': 9,
    };
    // TODO you can declare here the medium and expert difficulties

    let medium = {
        'rowCount': 16,
        'colCount': 16,
    };
    let expert = {
        'rowCount': 16,
        'colCount': 30,
    };


    if (rowCount == null && colCount == null) {
        // TODO have a default difficulty
        generateBoard(easy);
    } else {
        generateBoard({'rowCount': rowCount, 'colCount': colCount});
    }
}

function generateBoard(boardMetadata) {
    squaresLeft = boardMetadata.colCount * boardMetadata.rowCount;
    bombCount = 0;
    /*
    *
    * "generate" an empty matrix
    *
     */
    for (let i = 0; i < boardMetadata.colCount; i++) {
        board[i] = new Array(boardMetadata.rowCount);
    }

    /*
    *
    * TODO fill the matrix with "BoardSquare" objects, that are in a pre-initialized state
    *
    */
    for (let i = 0; i < boardMetadata.rowCount; i++) {
        for (let j = 0; j < boardMetadata.colCount; j++) {
            board[i][j] = new BoardSquare(false, 0);
        }
    }

    /*
    *
    * "place" bombs according to the probabilities declared at the top of the file
    * those could be read from a config file or env variable, but for the
    * simplicity of the solution, I will not do that
    *
    */
    for (let i = 0; i < boardMetadata.colCount; i++) {
        for (let j = 0; j < boardMetadata.rowCount; j++) {
            let hasBomb = Math.random() * maxProbability < bombProbability;
            if (hasBomb) {
                bombCount++;
                board[i][j].hasBomb = true;}
        }
    }

    /*
    *
    * TODO set the state of the board, with all the squares closed
    * and no flagged squares
    *
     */
    openedSquares = [];
    flaggedSquares = [];


    //BELOW THERE ARE SHOWCASED TWO WAYS OF COUNTING THE VICINITY BOMBS

    /*
    *
    * TODO count the bombs around each square
    *
    */
    for (let i = 0; i < boardMetadata.colCount; i++) {
        for (let j = 0; j < boardMetadata.rowCount; j++) {
            board[i][j].bombsAround = countBombsAround(i, j, boardMetadata);
        }
    }

    renderBoard(boardMetadata);
    /*
    *
    * print the board to the console to see the result
    *
    */
    console.log(board);
}

function renderBoard(boardMetadata) {
    const boardContainer = document.getElementById('board');
    boardContainer.innerHTML = ''; //clear board

    //set grid layout based on rowCount and colCount
    boardContainer.style.gridTemplateColumns = `repeat(${boardMetadata.colCount}, 40px)`;
    boardContainer.style.gridTemplateRows = `repeat(${boardMetadata.rowCount}, 40px)`;

    //render each square
    for (let i = 0; i < boardMetadata.rowCount; i++) {
        for (let j = 0; j < boardMetadata.colCount; j++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.dataset.x = i;
            square.dataset.y = j;
            
            square.addEventListener('click', () => handleSquareClick(i, j));
            square.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                handleRightClick(i, j);
            });

            boardContainer.appendChild(square);
        }
    }
}

// TODO create the other required functions such as 'discovering' a tile, and so on (also make sure to handle the win/loss cases)

// Function to handle left click on a square (to reveal it)
function handleSquareClick(x, y) {
    if (openedSquares.includes(`${x},${y}`)) return; 

    const square = board[x][y];
    const squareElement = document.querySelector(`[data-x='${x}'][data-y='${y}']`);

    if (square.hasBomb) {
        squareElement.classList.add('bomb');
        alert('Game Over! You hit a bomb.');
        restartGame();
    } else {
        squareElement.classList.add('opened');
        squareElement.textContent = square.bombsAround > 0 ? square.bombsAround : '';
        openedSquares.push(`${x},${y}`);
        squaresLeft--;

        if (squaresLeft === bombCount) {
            alert('Congratulations! You won the game.');
            restartGame();
        }

        if (square.bombsAround === 0) {
            revealAdjacentSquares(x, y);
        }
    }
}

function restartGame() {
    console.log("Restarting game..."); //debugging

    const gameBoard = document.getElementById('board');
    if (gameBoard) {
        gameBoard.innerHTML = '';
    } else {
        console.error("Game board element not found.");
        return; 
    }

    //reset game variables
    board = [];
    openedSquares = [];
    flaggedSquares = [];
    bombCount = 0;
    squaresLeft = 0;

    //start a new game
    const difficulty = document.getElementById('difficulty').value;
    bombProbability = parseInt(document.getElementById('bombProbability').value, 10);

    let rowCount, colCount;
    if (difficulty === 'easy') {
        rowCount = 9;
        colCount = 9;
    } else if (difficulty === 'medium') {
        rowCount = 16;
        colCount = 16;
    } else if (difficulty === 'expert') {
        rowCount = 16;
        colCount = 30;
    } else {
        rowCount = 9;
        colCount = 9;
    }

    minesweeperGameBootstrapper(rowCount, colCount);
}


// Function to handle right click on a square
function handleRightClick(x, y) {
    const squareElement = document.querySelector(`[data-x='${x}'][data-y='${y}']`);

    if (flaggedSquares.includes(`${x},${y}`)) {
        flaggedSquares = flaggedSquares.filter(item => item !== `${x},${y}`);
        squareElement.classList.remove('flagged');
    } else {
        flaggedSquares.push(`${x},${y}`);
        squareElement.classList.add('flagged');
    }
}

// Function to reveal adjacent squares if the clicked square has no bombs around
function revealAdjacentSquares(x, y) {
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const newX = x + i;
            const newY = y + j;

            if (newX >= 0 && newY >= 0 && newX < board.length && newY < board[0].length) {
                if (!openedSquares.includes(`${newX},${newY}`)) {
                    handleSquareClick(newX, newY);
                }
            }
        }
    }
}

function countBombsAround(x, y, boardMetadata) {
    let bombs = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            let newX = x + i;
            let newY = y + j;

            if (newX >= 0 && newY >= 0 && newX < boardMetadata.colCount && newY < boardMetadata.rowCount) {
                if (board[newX][newY].hasBomb) {
                    bombs++;
                }
            }
        }
    }
    return bombs;
}

/*
*
* simple object to keep the data for each square
* of the board
*
*/
class BoardSquare {
    constructor(hasBomb, bombsAround) {
        this.hasBomb = hasBomb;
        this.bombsAround = bombsAround;
    }
}

class Pair {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}


/*
* call the function that "handles the game"
* called at the end of the file, because if called at the start,
* all the global variables will appear as undefined / out of scope
*
 */
//minesweeperGameBootstrapper(5, 5);

document.getElementById('startGameBtn').addEventListener('click', function () {
    let difficulty = document.getElementById('difficulty').value;
    bombProbability = parseInt(document.getElementById('bombProbability').value);

      //validate bombProbability
    if (bombProbability < 3 || bombProbability > 15) {
        alert('Bomb probability must be between 3 and 15.');
        return; // Exit the function if the value is invalid
    }

    if (difficulty === 'easy') {
        minesweeperGameBootstrapper(9, 9);
    } else if (difficulty === 'medium') {
        minesweeperGameBootstrapper(16, 16);
    } else if (difficulty === 'expert') {
        minesweeperGameBootstrapper(16, 30);
    }  else {
        alert('Please select a difficulty level.');
    }
});


