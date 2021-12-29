var keydownPress = false;
var pause = true;

function startGame() {
    pause = false;
    var game = new GameStart();
    game.init();
}

var startButton = document.getElementById('start');
//when clicked on start button
startButton.addEventListener('click', startGame);

function gameOver() {
    var gameContainer = document.querySelector('.game-container');
    gameContainer.innerHTML =
        '<div class="game-over"><h2>CRASHED !!! GAME OVER</h2><p>Use arrow keys or A/D for left and right movement</p><button id="play-again" class="start-button">PLAY AGAIN</button></div>';

    // var gameOverContainer = document.createElement('div');

    // gameOverContainer.classList.add('game-over');
    // gameOverContainer.innerHTML =
    //   '<h2>CRASHED !!! GAME OVER</h2><p>Use arrow keys or A/D for left and right movement</p><button id="play-again" class="start-button">PLAY AGAIN</button>';

    document.getElementById('play-again').addEventListener('click', startGame);
}

/**
 * GameStart Constructor function
 */
function GameStart() {
    this.gameContainerWidth;
    this.gameContainerHeight;
    this.score = 0;
    this.highScore = localStorage.getItem('high-score') || 0;

    this.speed = 1;
    this.speedCounter = 1;
    this.maxSpeed = 500;
    this.trackWrapper;
    this.trackInterval;
    this.playerCar;
    this.enemyCars = [];
    this.enemyCarCounter = 1;
    this.enemySpeed = 4;
    this.maxEnemyCar = 70;
    this.trackWrapperTop = -750;
    this.minTrackWrapperTop = -750;
    this.enemyCarBottom = 700;
    this.gameContainer = document.querySelector('.game-container');
    this.gameInstruction = document.querySelector('.game-instruction');
    this.scoreContainer = document.querySelector('.score-container');
}

/**
 * GAME START
 */
GameStart.prototype.init = function() {
    if (this.gameInstruction) {
        this.gameInstruction.style.display = 'none';
    }

    this.scoreContainer.style.display = 'inline-block';

    //get width height of game container
    this.gameContainerWidth = this.gameContainer.clientWidth;
    this.gameContainerHeight = this.gameContainer.clientHeight;

    //dom selection of score, highscore and speed
    document.getElementById('high-score').innerHTML = this.highScore;
    document.getElementById('my-score').innerHTML = this.score;

    //render road track image
    this.renderRoad();

    //render car
    this.renderCar(true, 125, 40);

    //move car left right
    document.onkeydown = this.moveCar.bind(this);

    //track image move
    this.trackInterval = setInterval(this.cycleTrack.bind(this), 1000 / 90);
};

/**
 * RENDER ROAD TRACK IMAGE
 */
GameStart.prototype.renderRoad = function() {
    this.trackWrapper = document.createElement('div');
    this.trackWrapper.style.position = 'absolute';
    this.trackWrapper.style.width = this.gameContainerWidth + 'px';
    this.trackWrapper.style.height = this.gameContainerHeight + 'px';
    this.trackWrapper.style.background = '#000';

    this.gameContainer.appendChild(this.trackWrapper);
    for (var i = 0; i < 3; i++) {
        var img = document.createElement('img');
        img.setAttribute('src', 'images/road.jpg');
        img.style.width = this.gameContainerWidth + 'px';
        img.style.height = this.gameContainerHeight + 'px';
        img.style.objectFit = 'cover';
        img.style.display = 'block';
        this.trackWrapper.appendChild(img);
    }
};

/**
 * RENDER CAR
 */

GameStart.prototype.renderCar = function(playerCar, posLeft, posBtm) {
    if (playerCar) {
        this.playerCar = new Car(
            this.gameContainer,
            'url(images/userCar.png',
            posLeft,
            posBtm
        );
        this.playerCar.carInit();
    } else {
        var enemyCar = new Car(
            this.gameContainer,
            'url(images/enemyCar.png)',
            posLeft,
            posBtm
        );
        enemyCar.carInit();
        this.enemyCars.push(enemyCar);
    }
};

/**
 * MOVE CAR LEFT RIGHT
 */

GameStart.prototype.moveCar = function() {
    if (event.keyCode === 65 || event.keyCode === 37) {
        if (!keydownPress && !pause) this.playerCar.moveLeft();
    } else if (event.keyCode === 68 || event.keyCode === 39) {
        if (!keydownPress && !pause) this.playerCar.moveRight();
    }
};

/**
 * move track road
 */
GameStart.prototype.cycleTrack = function() {
    this.speed < 5 ?
        (this.speedCounter = (this.speedCounter + 1) % this.maxSpeed) :
        (this.speedCounter = 1);

    if (this.speedCounter == 0) {
        this.speed += 1;
        this.enemySpeed += 1;
        this.maxEnemyCar -= 10;
    }

    this.trackWrapperTop < 0 ?
        (this.trackWrapperTop += this.enemySpeed) :
        (this.trackWrapperTop = this.minTrackWrapperTop);

    this.trackWrapper.style.top = this.trackWrapperTop + 'px';

    //collison between enemy car and move enemy car
    for (var i = 0; i < this.enemyCars.length; i++) {
        //move enemy car
        this.enemyCars[i].posBtm -= this.enemySpeed;
        this.enemyCars[i].draw();

        //2D COLLISON DETECTION
        if (
            this.playerCar.posLeft + 20 <
            this.enemyCars[i].posLeft + this.enemyCars[i].carWidth &&
            this.playerCar.posLeft + 80 > this.enemyCars[i].posLeft
        ) {
            // console.log('left collison');

            if (
                this.playerCar.posBtm + 40 <
                this.enemyCars[i].posBtm + this.enemyCars[i].carHeight &&
                this.playerCar.posBtm + 160 > this.enemyCars[i].posBtm
            ) {
                // console.log('bottom collison');
                pause = true;
                if (this.score > this.highScore) {
                    document.getElementById('high-score').innerHTML = this.score;
                    localStorage.setItem('high-score', this.score);
                }
                clearInterval(this.trackInterval);
                gameOver();
            }
        }

        //remove gone car from array and increase score after car passed without collison;
        if (this.enemyCars[i].posBtm < -this.enemyCars[i].carHeight) {
            this.enemyCars.splice(i, 1);
            this.score += 1;
            document.getElementById('my-score').innerHTML = this.score;
        }
    }

    // ADD ENEMY CARS
    this.enemyCarCounter = (this.enemyCarCounter + 1) % this.maxEnemyCar;

    if (this.enemyCarCounter == 0) {
        var carLeft = getCarFromLeftLane(getRandomLane());
        this.renderCar(false, carLeft, this.enemyCarBottom);
    }
};

/**
 * REMOVE PASSED CAR FROM DOM
 */
Car.prototype.domRemove = function() {
    this.gameContainer.removeChild(this.carElement);
};

function getCarFromLeftLane(lane) {
    var leftY;
    if (lane == 1) {
        leftY = 125;
    } else if (lane == 2) {
        leftY = 310;
    } else {
        leftY = 490;
    }
    return leftY;
}

function getRandomLane() {
    return Math.round(Math.random() * (3 - 1) + 1);
}

/**
 * CAR CONSTRUCTOR FUNCTION
 */

function Car(gameContainer, imageUrl, posLeft, posBtm) {
    this.gameContainer = gameContainer;
    this.posBtm = posBtm;
    this.posLeft = posLeft;
    this.imageUrl = imageUrl;
    this.carWidth = 90;
    this.carHeight = 169;
    this.carElement;
    this.laneWidth = 185;
    this.leftPosLane = 125;
    this.rightPosLane = 490;
}

/**
 * CAR INIT WITH STYLE
 */

Car.prototype.carInit = function() {
    this.carElement = document.createElement('div');
    this.carElement.style.position = 'absolute';
    this.carElement.style.backgroundImage = this.imageUrl;
    this.carElement.style.width = this.carWidth + 'px';
    this.carElement.style.height = this.carHeight + 'px';
    this.carElement.style.left = this.posLeft + 'px';

    this.draw();

    this.gameContainer.appendChild(this.carElement);
};

/**
 * CAR POSITION
 */

Car.prototype.draw = function() {
    this.carElement.style.bottom = this.posBtm + 'px';
};

/**
 * MOVE LEFT CAR
 */

Car.prototype.moveLeft = function() {
    if (this.posLeft > this.leftPosLane) {
        keydownPress = true;
        var leftInterval = setInterval(shiftLeft.bind(this), 1000 / 90);

        var nextPosleft = this.posLeft - this.laneWidth;

        function shiftLeft() {
            if (this.posLeft >= nextPosleft) {
                this.posLeft = nextPosleft;
                this.carElement.style.left = this.posLeft + 'px';
                keydownPress = false;
                clearInterval(leftInterval);
            }
        }
    }
};

/**
 * MOVE CAR RIGHT
 */
Car.prototype.moveRight = function() {
    if (this.posLeft < this.rightPosLane) {
        keydownPress = true;
        var rightInterval = setInterval(shiftRight.bind(this), 1000 / 90);

        var nextPosleft = this.posLeft + this.laneWidth;

        function shiftRight() {
            if (this.posLeft <= nextPosleft) {
                this.posLeft = nextPosleft;
                this.carElement.style.left = this.posLeft + 'px';
                keydownPress = false;
                clearInterval(rightInterval);
            }
        }
    }
};