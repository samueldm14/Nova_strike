const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const pauseBtn = document.getElementById("pauseBtn");

canvas.width = 1000;
canvas.height = 650;

/* =========================
   ÉTAT DU JEU
========================= */

let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;

let lives = 3;

let gamePaused = false;
let gameOver = false;

let difficulty = "medium";

let enemySpeed = 0.3;
let enemyShootRate = 0.002;

let level = 1;

let playerInvincible = false;

/* =========================
   DIFFICULTÉ
========================= */

function setDifficulty(mode) {

    difficulty = mode;

    if (mode === "easy") {

        lives = 5;

        enemySpeed = 0.2;

        enemyShootRate = 0.001;
    }

    if (mode === "medium") {

        lives = 3;

        enemySpeed = 0.3;

        enemyShootRate = 0.002;
    }

    if (mode === "hard") {

        lives = 1;

        enemySpeed = 0.5;

        enemyShootRate = 0.004;
    }
}

setDifficulty("medium");

/* =========================
   JOUEUR
========================= */

const player = {

    x: canvas.width / 2 - 35,

    y: canvas.height - 120,

    width: 70,

    height: 70,

    speed: 8
};

/* =========================
   TABLEAUX
========================= */

const bullets = [];

const enemyBullets = [];

const enemies = [];

const stars = [];

/* =========================
   ÉTOILES
========================= */

for (let i = 0; i < 200; i++) {

    stars.push({

        x: Math.random() * canvas.width,

        y: Math.random() * canvas.height,

        size: Math.random() * 2,

        speed: Math.random() * 2 + 1
    });
}

/* =========================
   BOUTON PAUSE
========================= */

pauseBtn.addEventListener("click", () => {

    if (gameOver) return;

    gamePaused = !gamePaused;

    if (gamePaused) {

        pauseBtn.innerText = "REPRENDRE";

    } else {

        pauseBtn.innerText = "PAUSE";
    }
});

/* =========================
   CLAVIER
========================= */

const keys = {};

document.addEventListener("keydown", (e) => {

    keys[e.key] = true;

    // restart
    if (gameOver && e.key === "Enter") {

        restartGame();
    }

    // difficulté
    if (e.key === "1") {

        setDifficulty("easy");
    }

    if (e.key === "2") {

        setDifficulty("medium");
    }

    if (e.key === "3") {

        setDifficulty("hard");
    }

    // tir
    if (
        e.code === "Space" &&
        !gamePaused &&
        !gameOver
    ) {

        bullets.push({

            x: player.x + player.width / 2 - 3,

            y: player.y,

            width: 6,

            height: 20,

            speed: 12
        });
    }
});

document.addEventListener("keyup", (e) => {

    keys[e.key] = false;
});

/* =========================
   ENNEMIS
========================= */

function createEnemies() {

    enemies.length = 0;

    for (let row = 0; row < 4; row++) {

        for (let col = 0; col < 8; col++) {

            enemies.push({

                x: 40 + col * 140,

                y: 80 + row * 90,

                width: 50,

                height: 50,

                alive: true
            });
        }
    }
}

createEnemies();

/* =========================
   JOUEUR
========================= */

function movePlayer() {

    if (keys["ArrowLeft"] && player.x > 0) {

        player.x -= player.speed;
    }

    if (
        keys["ArrowRight"] &&
        player.x + player.width < canvas.width
    ) {

        player.x += player.speed;
    }
}

function drawPlayer() {

    // effet invincibilité
    if (playerInvincible) {

        ctx.globalAlpha = 0.4;

    } else {

        ctx.globalAlpha = 1;
    }

    // ailes
    ctx.fillStyle = "#64748b";

    ctx.fillRect(
        player.x + 5,
        player.y + 40,
        15,
        20
    );

    ctx.fillRect(
        player.x + 50,
        player.y + 40,
        15,
        20
    );

    // corps
    ctx.fillStyle = "#94a3b8";

    ctx.beginPath();

    ctx.moveTo(
        player.x + player.width / 2,
        player.y
    );

    ctx.lineTo(
        player.x,
        player.y + player.height
    );

    ctx.lineTo(
        player.x + player.width,
        player.y + player.height
    );

    ctx.closePath();

    ctx.fill();

    // cockpit
    ctx.fillStyle = "#3b82f6";

    ctx.beginPath();

    ctx.arc(
        player.x + player.width / 2,
        player.y + 28,
        10,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // flammes
    ctx.fillStyle = "#38bdf8";

    ctx.fillRect(
        player.x + 18,
        player.y + player.height,
        8,
        18
    );

    ctx.fillRect(
        player.x + 44,
        player.y + player.height,
        8,
        18
    );

    ctx.globalAlpha = 1;
}

/* =========================
   ÉTOILES
========================= */

function drawStars() {

    for (let star of stars) {

        ctx.fillStyle = "white";

        ctx.fillRect(
            star.x,
            star.y,
            star.size,
            star.size
        );

        star.y += star.speed;

        if (star.y > canvas.height) {

            star.y = 0;

            star.x = Math.random() * canvas.width;
        }
    }
}

/* =========================
   BALLES JOUEUR
========================= */

function updateBullets() {

    for (let i = 0; i < bullets.length; i++) {

        const bullet = bullets[i];

        bullet.y -= bullet.speed;

        ctx.shadowColor = "#00f7ff";

        ctx.shadowBlur = 10;

        ctx.fillStyle = "#00f7ff";

        ctx.fillRect(
            bullet.x,
            bullet.y,
            bullet.width,
            bullet.height
        );

        ctx.shadowBlur = 0;

        if (bullet.y < 0) {

            bullets.splice(i, 1);

            i--;
        }
    }
}

/* =========================
   ENNEMIS
========================= */

function drawEnemies() {

    for (let enemy of enemies) {

        if (enemy.alive) {

            enemy.y += enemySpeed;

            if (enemy.y + enemy.height >= player.y) {

                gameOver = true;
            }

            // tirs ennemis
            if (Math.random() < enemyShootRate) {

                enemyBullets.push({

                    x: enemy.x + enemy.width / 2,

                    y: enemy.y + enemy.height,

                    width: 5,

                    height: 15,

                    speed: 5
                });
            }

            // corps
            ctx.fillStyle = "#0fa03a";

            ctx.fillRect(
                enemy.x,
                enemy.y,
                enemy.width,
                enemy.height
            );

            // yeux
            ctx.fillStyle = "black";

            ctx.fillRect(
                enemy.x + 10,
                enemy.y + 12,
                8,
                8
            );

            ctx.fillRect(
                enemy.x + 32,
                enemy.y + 12,
                8,
                8
            );

            // bouche
            ctx.fillStyle = "#000000";

            ctx.fillRect(
                enemy.x + 15,
                enemy.y + 32,
                20,
                6
            );
        }
    }
}

/* =========================
   BALLES ENNEMIS
========================= */

function updateEnemyBullets() {

    for (let i = 0; i < enemyBullets.length; i++) {

        const bullet = enemyBullets[i];

        bullet.y += bullet.speed;

        ctx.fillStyle = "#ff3b3b";

        ctx.fillRect(
            bullet.x,
            bullet.y,
            bullet.width,
            bullet.height
        );

        /* =========================
           COLLISION JOUEUR
        ========================= */

        if (

            !playerInvincible &&

            bullet.x < player.x + player.width &&

            bullet.x + bullet.width > player.x &&

            bullet.y < player.y + player.height &&

            bullet.y + bullet.height > player.y
        ) {

            enemyBullets.splice(i, 1);

            lives--;

            playerInvincible = true;

            setTimeout(() => {

                playerInvincible = false;

            }, 1000);

            if (lives <= 0) {

                gameOver = true;
            }

            i--;

            continue;
        }

        /* =========================
           HORS ÉCRAN
        ========================= */

        if (bullet.y > canvas.height) {

            enemyBullets.splice(i, 1);

            i--;
        }
    }
}

/* =========================
   COLLISIONS
========================= */

function checkCollisions() {

    for (let i = 0; i < bullets.length; i++) {

        const bullet = bullets[i];

        for (let enemy of enemies) {

            if (

                enemy.alive &&

                bullet.x < enemy.x + enemy.width &&

                bullet.x + bullet.width > enemy.x &&

                bullet.y < enemy.y + enemy.height &&

                bullet.y + bullet.height > enemy.y
            ) {

                enemy.alive = false;

                bullets.splice(i, 1);

                score += 100;

                break;
            }
        }
    }
}

/* =========================
   VICTOIRE
========================= */

function checkVictory() {

    const remaining = enemies.filter(
        enemy => enemy.alive
    );

    if (remaining.length === 0) {

        level++;

        enemySpeed += 0.05;

        createEnemies();
    }
}


/* =========================
   PAUSE
========================= */

function drawPause() {

    ctx.fillStyle = "yellow";

    ctx.font = "80px Arial";

    ctx.textAlign = "center";

    ctx.fillText(
        "PAUSE",
        canvas.width / 2,
        canvas.height / 2
    );

    ctx.textAlign = "left";
}

/* =========================
   GAME OVER
========================= */

function drawGameOver() {

    ctx.fillStyle = "red";

    ctx.font = "90px Arial";

    ctx.textAlign = "center";

    ctx.fillText(
        "GAME OVER",
        canvas.width / 2,
        canvas.height / 2
    );

    ctx.font = "35px Arial";

    ctx.fillStyle = "white";

    ctx.fillText(
        "Appuie sur ENTRÉE pour rejouer",
        canvas.width / 2,
        canvas.height / 2 + 70
    );

    ctx.textAlign = "left";
}

/* =========================
   RESTART
========================= */

function restartGame() {

    score = 0;

    level = 1;

    gameOver = false;

    gamePaused = false;

    playerInvincible = false;

    bullets.length = 0;

    enemyBullets.length = 0;

    enemies.length = 0;

    player.x = canvas.width / 2 - 35;

    setDifficulty(difficulty);

    createEnemies();

    pauseBtn.innerText = "PAUSE";
}

function updateSidebar() {

    // meilleur score
    if (score > bestScore) {

        bestScore = score;

        localStorage.setItem(
            "bestScore",
            bestScore
        );
    }

    document.getElementById("scoreText").innerText =
        "Score : " + score;

    document.getElementById("bestScoreText").innerText =
        "Meilleur Score : " + bestScore;

    document.getElementById("livesText").innerText =
        "Vies : " + lives;

    document.getElementById("levelText").innerText =
        "Niveau : " + level;

    document.getElementById("difficultyText").innerText =
        "Difficulté : " + difficulty;
}



/* =========================
   GAME LOOP
========================= */

function gameLoop() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawStars();

    updateSidebar();

    if (gameOver) {
        drawGameOver();
        requestAnimationFrame(gameLoop);
        return;
    }

    if (gamePaused) {
        drawPause();
        requestAnimationFrame(gameLoop);
        return;
    }

    movePlayer();
    drawPlayer();
    updateBullets();
    drawEnemies();
    updateEnemyBullets();
    checkCollisions();
    checkVictory();
    requestAnimationFrame(gameLoop);
}

gameLoop();