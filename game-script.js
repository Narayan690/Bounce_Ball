// --- Game Setup ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const WINNING_SCORE = 5;
let gameInterval;
let gamePaused = true;
let gameStarted = false; 

// --- Audio Elements ---
const winSound = document.getElementById('winSound');

// --- Settings ---
let musicEnabled = false;
let vibrationEnabled = false;

// --- Game State Variables ---
let score1 = 0;
let score2 = 0;

// Ball properties
let ballX;
let ballY;
let ballSpeedX = 5;
let ballSpeedY = 5;
const ballRadius = 8;

// Paddle properties
const paddleHeight = 80;
const paddleWidth = 10;
let paddle1Y;
let paddle2Y;
const paddleSpeed = 8;

// Input tracking (Keyboard)
let up1 = false;
let down1 = false;
let up2 = false;
let down2 = false;

// --- Touch Tracking Variables (Used for Mobile/Touchscreens) ---
let touchPaddle1Y = null; 
let touchPaddle2Y = null; 
let isTouching = false; 

// --- DOM Elements ---
const startOverlay = document.getElementById('startOverlay');
const startButton = document.getElementById('startButton');
const pauseOverlay = document.getElementById('pauseOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const winnerSlogan = document.getElementById('winnerSlogan');

const pauseButton = document.getElementById('pauseButton');
const resumeButton = document.getElementById('resumeButton');
const restartButtonPause = document.getElementById('restartButtonPause'); 
const exitButtonPause = document.getElementById('exitButtonPause');
const playAgainButton = document.getElementById('playAgainButton');
const exitButton = document.getElementById('exitButton');

// --- Game Logic ---

/** Helper function to play sound */
function playSound(audioElement) {
    if (musicEnabled) { 
        audioElement.currentTime = 0;
        audioElement.play().catch(e => console.log("Audio playback failed:", e));
    }
}

/** Helper function to vibrate (Used only for winning) */
function doVibrateWin() {
    if (vibrationEnabled && 'vibrate' in navigator) {
        // navigator.vibrate() works on mobile and some modern browsers on PC/Laptop
        navigator.vibrate(500); 
    }
}

/** Resets ball to center and sets initial speed */
function resetBall(servingPlayer = 1) {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = (servingPlayer === 1 ? 5 : -5); 
    ballSpeedY = Math.random() * 6 - 3; 
}

/** Draws the current game state */
function drawEverything() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); 

    // Draw center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.setLineDash([10, 10]);
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Paddles
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, paddle1Y, paddleWidth, paddleHeight); 
    ctx.fillRect(canvas.width - paddleWidth, paddle2Y, paddleWidth, paddleHeight); 

    // Draw Ball
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2, true);
    ctx.fill();
}

/** Moves paddles based on active input (Touch or Keyboard) */
function movePaddles() {
    
    // --- Paddle 1 Movement (Left) ---
    if (isTouching) {
        // Touch control takes priority if touch is active
        if (touchPaddle1Y !== null) {
            let targetY = touchPaddle1Y - paddleHeight / 2;
            let currentY = paddle1Y;
            
            if (targetY < currentY - paddleSpeed) {
                paddle1Y = Math.max(0, currentY - paddleSpeed);
            } else if (targetY > currentY + paddleSpeed) {
                paddle1Y = Math.min(canvas.height - paddleHeight, currentY + paddleSpeed);
            } else {
                paddle1Y = targetY;
            }
            paddle1Y = Math.max(0, Math.min(canvas.height - paddleHeight, paddle1Y));
        }
    } else {
        // Keyboard control if no touch is active
        if (up1) paddle1Y = Math.max(0, paddle1Y - paddleSpeed);
        if (down1) paddle1Y = Math.min(canvas.height - paddleHeight, paddle1Y + paddleSpeed);
    }


    // --- Paddle 2 Movement (Right) ---
    if (isTouching) {
        // Touch control takes priority if touch is active
        if (touchPaddle2Y !== null) {
            let targetY = touchPaddle2Y - paddleHeight / 2;
            let currentY = paddle2Y;

            if (targetY < currentY - paddleSpeed) {
                paddle2Y = Math.max(0, currentY - paddleSpeed);
            } else if (targetY > currentY + paddleSpeed) {
                paddle2Y = Math.min(canvas.height - paddleHeight, currentY + paddleSpeed);
            } else {
                paddle2Y = targetY;
            }
            paddle2Y = Math.max(0, Math.min(canvas.height - paddleHeight, paddle2Y));
        }
    } else {
        // Keyboard control if no touch is active
        if (up2) paddle2Y = Math.max(0, paddle2Y - paddleSpeed);
        if (down2) paddle2Y = Math.min(canvas.height - paddleHeight, paddle2Y + paddleSpeed);
    }
}

/** Updates ball and paddle positions */
function moveEverything() {
    if (gamePaused) return;

    movePaddles(); 

    // --- Ball Movement ---
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Ball Wall Bounce (Top/Bottom)
    if (ballY < ballRadius || ballY > canvas.height - ballRadius) {
        ballSpeedY = -ballSpeedY;
    }

    // Ball Scoring (Left/Right Wall)
    if (ballX < 0) {
        score2++;
        updateScores();
        checkWinCondition();
        if (!gameOverOverlay.classList.contains('hidden')) return; 
        resetBall(2);
    } else if (ballX > canvas.width) {
        score1++;
        updateScores();
        checkWinCondition();
        if (!gameOverOverlay.classList.contains('hidden')) return; 
        resetBall(1);
    }

    // --- Paddle Collision ---
    // Collision with Player 1 (Left Paddle)
    if (ballX - ballRadius < paddleWidth && ballY > paddle1Y && ballY < paddle1Y + paddleHeight && ballSpeedX < 0) {
        ballSpeedX = -ballSpeedX;
        const deltaY = ballY - (paddle1Y + paddleHeight / 2);
        ballSpeedY = deltaY * 0.35;
    }

    // Collision with Player 2 (Right Paddle)
    if (ballX + ballRadius > canvas.width - paddleWidth && ballY > paddle2Y && ballY < paddle2Y + paddleHeight && ballSpeedX > 0) {
        ballSpeedX = -ballSpeedX;
        const deltaY = ballY - (paddle2Y + paddleHeight / 2);
        ballSpeedY = deltaY * 0.35;
    }
}

/** Main game loop */
function startGameLoop() {
    if (gameInterval) clearInterval(gameInterval);
    
    gameInterval = setInterval(() => {
        resizeCanvas();
        moveEverything();
        drawEverything();
    }, 1000 / 60);
}

/** Updates the score text on the screen */
function updateScores() {
    document.getElementById('player1Score').innerText = `Player 1: ${score1}`;
    document.getElementById('player2Score').innerText = `Player 2: ${score2}`;
}

/** Checks if either player reached the winning score (5 points) */
function checkWinCondition() {
    if (score1 >= WINNING_SCORE || score2 >= WINNING_SCORE) {
        gamePaused = true;
        
        let winner = score1 >= WINNING_SCORE ? 'Player 1' : 'Player 2';
        
        winnerSlogan.innerText = `${winner} is the Winner!!!`;
        gameOverOverlay.classList.remove('hidden');
        
        clearInterval(gameInterval);
        
        // --- Win Effects ---
        playSound(winSound); 
        doVibrateWin();
    }
}

/** Initializes all game variables (resets everything) */
function initGame() {
    // Read the settings from localStorage
    musicEnabled = localStorage.getItem('music') !== 'false';
    vibrationEnabled = localStorage.getItem('vibration') !== 'false';
    
    score1 = 0;
    score2 = 0;
    updateScores();
    
    // Position paddles to center
    paddle1Y = (canvas.height - paddleHeight) / 2;
    paddle2Y = (canvas.height - paddleHeight) / 2;
    
    resetBall(1);
    
    gameOverOverlay.classList.add('hidden');
    pauseOverlay.classList.add('hidden');
    startOverlay.classList.remove('hidden'); 
    
    gameStarted = false;
    gamePaused = true;
    drawEverything(); 
    
    clearInterval(gameInterval);
}


/** Resizes the canvas to match its CSS dimensions. */
function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        // Maintain a 2:1 aspect ratio based on the current width for consistency (800x400)
        canvas.height = rect.width / 2; 
        
        // Adjust paddle positions to fit new height, preventing them from falling off screen
        if (gameStarted && !gamePaused) {
             paddle1Y = Math.max(0, Math.min(canvas.height - paddleHeight, paddle1Y));
             paddle2Y = Math.max(0, Math.min(canvas.height - paddleHeight, paddle2Y));
        }
        // Redraw immediately after resize
        drawEverything();
    }
}


/** Toggles the game pause state */
function togglePause() {
    if (!gameStarted) return; 

    gamePaused = !gamePaused;
    if (gamePaused) {
        pauseOverlay.classList.remove('hidden');
        clearInterval(gameInterval);
    } else {
        pauseOverlay.classList.add('hidden');
        startGameLoop();
    }
}


// --- Touch Event Handlers ---

function handleTouchMove(e) {
    if (gamePaused || !gameStarted) return;
    e.preventDefault(); 
    isTouching = true; // Flag touch as active

    const rect = canvas.getBoundingClientRect();

    for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        
        // Calculate touch X and Y relative to the canvas
        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;

        // Player 1 controls the left half of the screen
        if (touchX < rect.width / 2) {
            touchPaddle1Y = touchY;
        } 
        // Player 2 controls the right half of the screen
        else {
            touchPaddle2Y = touchY;
        }
    }
}

function handleTouchEnd(e) {
    if (gamePaused || !gameStarted) return;
    
    // If all touches have ended, disable touch flags
    if (e.touches.length === 0) {
        touchPaddle1Y = null;
        touchPaddle2Y = null;
        isTouching = false;
    }
}

// Add touch listeners to the canvas
canvas.addEventListener('touchmove', handleTouchMove);
canvas.addEventListener('touchstart', handleTouchMove);
canvas.addEventListener('touchend', handleTouchEnd);
canvas.addEventListener('touchcancel', handleTouchEnd);


// --- Event Listeners (Keyboard and UI) ---

// Keyboard Input (W/S and Arrows - for PC/Laptop)
document.addEventListener('keydown', (e) => {
    if (gamePaused) return; 
    // Ignore keyboard if touch is active to prevent conflicts
    if (isTouching) return; 
    
    switch (e.key.toLowerCase()) {
        case 'w': up1 = true; break;
        case 's': down1 = true; break;
        case 'arrowup': up2 = true; break;
        case 'arrowdown': down2 = true; break;
    }
});

document.addEventListener('keyup', (e) => {
    // We only process keyup if touch is not the main input method
    if (isTouching && e.key.toLowerCase() !== 'p') return;

    switch (e.key.toLowerCase()) {
        case 'w': up1 = false; break;
        case 's': down1 = false; break;
        case 'arrowup': up2 = false; break;
        case 'arrowdown': down2 = false; break;
        case 'p': togglePause(); break; 
    }
});

// Window resize listener
window.addEventListener('resize', resizeCanvas);


// Start Button Handler
startButton.addEventListener('click', () => {
    startOverlay.classList.add('hidden');
    resizeCanvas(); 
    gameStarted = true;
    gamePaused = false;
    startGameLoop();
});

// Pause Menu Handlers
pauseButton.addEventListener('click', togglePause);
resumeButton.addEventListener('click', togglePause);
restartButtonPause.addEventListener('click', () => {
    initGame(); 
});
exitButtonPause.addEventListener('click', () => {
    window.location.href = 'index.html'; 
});

// Game Over Handlers
playAgainButton.addEventListener('click', initGame);
exitButton.addEventListener('click', () => {
    window.location.href = 'index.html'; 
});

// Start initialization when the page loads
window.onload = () => {
    resizeCanvas();
    initGame();
};