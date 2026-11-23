
(() => {
    const gameLayout = document.querySelector(".game-layout");

    const scoreEl = document.getElementById("score");
    const livesEl = document.getElementById("lives");
    const fruitCountEl = document.getElementById("fruitCount");
    const messageEl = document.getElementById("gameMessage");
    const startButton = document.getElementById("startButton");
    const restartButton = document.getElementById("restartButton");

    const board = document.createElement("div");
    board.className = "game-board";

    board.style.cssText = `
        width: min(90vw, 500px);
        aspect-ratio: 1 / 1;
        display: grid;
        grid-template-columns: repeat(20, 1fr);
        grid-template-rows: repeat(20, 1fr);
        gap: 2px;
        padding: 8px;
        margin: 20px auto;
        background: #f8c9dc;
        border: 4px solid #e99cbd;
        border-radius: 15px;
        box-sizing: border-box;
    `;

    gameLayout.appendChild(board);

    const SIZE = 20;
    const TOTAL = SIZE * SIZE;

    const cells = [];

    for (let i = 0; i < TOTAL; i++) {
        const cell = document.createElement("div");

        cell.style.cssText = `
            background: #fff5fa;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: clamp(10px, 2.5vw, 20px);
            overflow: hidden;
        `;

        board.appendChild(cell);
        cells.push(cell);
    }

    const controls = document.createElement("div");

    controls.style.cssText = `
        display: grid;
        grid-template-columns: repeat(3, 55px);
        justify-content: center;
        gap: 7px;
        margin: 15px auto;
    `;

    controls.innerHTML = `
        <span></span>
        <button data-dir="up">⬆️</button>
        <span></span>
        <button data-dir="left">⬅️</button>
        <button data-dir="down">⬇️</button>
        <button data-dir="right">➡️</button>
    `;

    gameLayout.appendChild(controls);

    controls.querySelectorAll("button").forEach(button => {
        button.style.cssText = `
            border: none;
            border-radius: 10px;
            padding: 12px;
            font-size: 20px;
            background: #f5b5d0;
            cursor: pointer;
        `;

        button.addEventListener("click", () => {
            changeDirection(button.dataset.dir);
        });
    });

    let username = null;

    try {
        const player = window.Store?.currentUser?.();
        username = player?.username || null;
    } catch (error) {
        console.warn("Data pemain tidak ditemukan.");
    }

    let snake = [];
    let fruit = {};
    let direction = "right";
    let nextDirection = "right";
    let score = 0;
    let fruitCount = 0;
    let lives = 3;
    let gameState = "ready";
    let timer = null;

    function randomPosition() {
        let position;

        do {
            position = {
                x: Math.floor(Math.random() * SIZE),
                y: Math.floor(Math.random() * SIZE)
            };
        } while (
            snake.some(part =>
                part.x === position.x &&
                part.y === position.y
            )
        );

        return position;
    }

    function spawnFruit() {
        fruit = randomPosition();
    }

    function updateInfo() {
        scoreEl.textContent = score;
        livesEl.textContent = "❤️".repeat(lives);
        fruitCountEl.textContent = fruitCount;
    }

    function draw() {
        cells.forEach(cell => {
            cell.textContent = "";
            cell.style.background = "#fff5fa";
        });

        const fruitIndex = fruit.y * SIZE + fruit.x;
        cells[fruitIndex].textContent = "🍓";

        snake.forEach((part, index) => {
            const cellIndex = part.y * SIZE + part.x;

            if (index === 0) {
                cells[cellIndex].textContent = "😺";
                cells[cellIndex].style.background = "#bde7f5";
            } else {
                cells[cellIndex].textContent = "🐱";
                cells[cellIndex].style.background = "#d8f1fa";
            }
        });
    }

    function changeDirection(newDirection) {
        if (gameState !== "playing") return;

        const opposite = {
            up: "down",
            down: "up",
            left: "right",
            right: "left"
        };

        if (newDirection !== opposite[direction]) {
            nextDirection = newDirection;
        }
    }

    function moveSnake() {
        direction = nextDirection;

        const head = { ...snake[0] };

        if (direction === "up") head.y--;
        if (direction === "down") head.y++;
        if (direction === "left") head.x--;
        if (direction === "right") head.x++;

        const hitWall =
            head.x < 0 ||
            head.x >= SIZE ||
            head.y < 0 ||
            head.y >= SIZE;

        const eatingFruit =
            head.x === fruit.x &&
            head.y === fruit.y;

        const bodyToCheck = eatingFruit
            ? snake
            : snake.slice(0, -1);

        const hitBody = bodyToCheck.some(part =>
            part.x === head.x && part.y === head.y
        );

        if (hitWall || hitBody) {
            loseLife();
            return;
        }

        snake.unshift(head);

        if (eatingFruit) {
            score += 10;
            fruitCount++;
            spawnFruit();
        } else {
            snake.pop();
        }

        updateInfo();
        draw();
    }

    function loseLife() {
        lives--;
        updateInfo();

        if (lives <= 0) {
            endGame();
            return;
        }

        messageEl.textContent =
            "Aduh! Longcat menabrak. Nyawa tersisa: " + lives;

        snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];

        direction = "right";
        nextDirection = "right";

        draw();
    }

    function saveScore() {
        try {
            if (window.Store && username) {
                window.Store.recordGame(username, score);
            }
        } catch (error) {
            console.warn("Skor belum dapat disimpan.", error);
        }
    }

    function endGame() {
        gameState = "over";

        clearInterval(timer);
        timer = null;

        saveScore();

        messageEl.textContent =
            "Game Over! Skor akhir kamu: " + score;

        startButton.textContent = "▶ Main Lagi";
        startButton.disabled = false;
    }

    function resetGame() {
        clearInterval(timer);
        timer = null;

        score = 0;
        fruitCount = 0;
        lives = 3;

        snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];

        direction = "right";
        nextDirection = "right";
        gameState = "ready";

        spawnFruit();
        updateInfo();
        draw();

        messageEl.textContent =
            "Tekan Mulai Game untuk bermain!";

        startButton.textContent = "▶ Mulai Game";
        startButton.disabled = false;
    }

    function startGame() {
        if (gameState === "playing") return;

        resetGame();

        gameState = "playing";

        messageEl.textContent =
            "Ayo kumpulkan buah sebanyak-banyaknya!";

        startButton.textContent = "Sedang Bermain...";
        startButton.disabled = true;

        timer = setInterval(moveSnake, 150);
    }

    document.addEventListener("keydown", event => {
        const keys = {
            ArrowUp: "up",
            KeyW: "up",
            ArrowDown: "down",
            KeyS: "down",
            ArrowLeft: "left",
            KeyA: "left",
            ArrowRight: "right",
            KeyD: "right"
        };

        if (keys[event.code]) {
            event.preventDefault();
            changeDirection(keys[event.code]);
        }
    });

    startButton.addEventListener("click", startGame);
    restartButton.addEventListener("click", resetGame);

    resetGame();

})();
