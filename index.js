const circles = document.querySelectorAll(".circle");
const glowLogos = document.querySelectorAll(".logo");
const boom = document.getElementById("boom");

let isGlowing = false;
let isRandomMode = false;
let target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let randomInterval = null;
let smoothingFactor = 0.9;
let locked = true;
const pathToImgFolder = "images/"
const score = document.getElementById("score");
const startButton = document.getElementById("start-button");
const freeButton = document.getElementById("free-button");
const startContainer = document.getElementById("start-popup");
const yourScore = document.getElementById("your-score");
const exit = document.getElementById("exit");
let started = false;
let freeMode = false;
let circleCooSave = [];

// Définir les chemins pour les logos
const pathToWin = pathToImgFolder + "windows.svg";
const pathToMac = pathToImgFolder + "cmd.svg";
const timer = document.getElementById("time");

// Définir le logo en fonction de l'OS
setLogo(window.navigator.userAgent.includes("Mac") ? pathToMac : pathToWin);

function setLogo(path) {
    glowLogos.forEach((logo) => {
        logo.src = path;
    });
}

// Créer un tableau pour stocker les positions des cercles
let positions = Array.from({ length: circles.length }, () => ({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
}));

// Suivre la souris ou activer le mode aléatoire
function followMouse(event) {
    if (isRandomMode) {
        if (!randomInterval) {
            smoothingFactor = 0.7;
            randomInterval = setInterval(() => {
            target.x = Math.max(0, Math.min(window.innerWidth, getRandomNumber(target.x - 50, target.x + 50)));
            target.y = Math.max(0, Math.min(window.innerHeight, getRandomNumber(target.y - 50, target.y + 50)));
                circles.forEach((circle) => {
                    circle.style.transition = "all 0.4s";
                })
            }, 100);
        }
    } else {
        if (locked) return;
        circles.forEach((circle) => {
            circle.style.transition = "none";
        })
        clearInterval(randomInterval);
        randomInterval = null;
        smoothingFactor = 0.9;
        target.x = event.clientX;
        target.y = event.clientY;
    }
}

// Animer les cercles pour suivre la souris ou un chemin aléatoire
function animateSnake() {
    if (!locked) {
        // Mettre à jour la position du premier cercle pour suivre la cible
        positions[0].x += (target.x - positions[0].x) * smoothingFactor;
        positions[0].y += (target.y - positions[0].y) * smoothingFactor;

        // Mettre à jour les positions des cercles suivants pour suivre le précédent
        for (let i = 1; i < positions.length; i++) {
            positions[i].x += (positions[i - 1].x - positions[i].x) * smoothingFactor;
            positions[i].y += (positions[i - 1].y - positions[i].y) * smoothingFactor;
        }

        // Appliquer les positions aux cercles HTML
        circles.forEach((circle, index) => {
            circle.style.left = `${positions[index].x}px`;
            circle.style.top = `${positions[index].y}px`;
        });
    }

    requestAnimationFrame(animateSnake);
}

// Gérer les raccourcis clavier
document.addEventListener("keydown", (event) => {
    // Glow state toggle
    if (event.key === "g") {
        isGlowing = !isGlowing;
        console.log("Change glow state");
    }

    // Random mode toggle
    if (event.key === "o") {
        if(locked) return;
        isRandomMode = !isRandomMode;
        if (!isRandomMode) clearInterval(randomInterval);
        followMouse();
    }

    // "Boom" effect
if (event.key === "b") {
    explodWorm();
}

        if (event.key === "ArrowUp") {
            circles.forEach((circle) => {
                const width = parseInt(circle.style.width || window.getComputedStyle(circle).width);
                const height = parseInt(circle.style.height || window.getComputedStyle(circle).height);
                if (width < 100) { // Limite maximale
                    circle.style.width = `${width + 10}px`;
                    circle.style.height = `${height + 10}px`;
                }
            });
        }

        if (event.key === "ArrowDown") {
            circles.forEach((circle) => {
                const width = parseInt(circle.style.width || window.getComputedStyle(circle).width);
                const height = parseInt(circle.style.height || window.getComputedStyle(circle).height);
                if (width > 10) { // Limite minimale
                    circle.style.width = `${width - 10}px`;
                    circle.style.height = `${height - 10}px`;
                }
            });
        }
});


function explodWorm() {
    if (locked) return;
    circleCooSave = Array.from(circles).map((circle) => {
        return {x: circle.style.left, y: circle.style.top};
    });
    locked = true;
    console.log("boom");
    boom.style.transition = "all 0.5s";
    boom.style.backgroundColor = "red";
    setTimeout(() => {
        boom.style.backgroundColor = "transparent";
    }, 200);

    circles.forEach((circle, index) => {
        const angle = Math.random() * Math.PI * 2;

        // Générer une distance aléatoire depuis le centre (éparpillement)
        const distance = Math.random() * 600 + 300; // Minimum 300px, maximum 900px


        // Calculer les nouvelles coordonnées en fonction de l'angle et de la distance
        const randomX = positions[index].x + Math.cos(angle) * distance;
        const randomY = positions[index].y + Math.sin(angle) * distance;

        console.log(`Cercle ${index + 1}: x: ${randomX}, y: ${randomY}`);

        // Appliquer la transition CSS
        circle.style.transition = "all 4.6s ease";
        circle.style.left = `${randomX}px`;
        circle.style.top = `${randomY}px`;

        circle.style.transform = "scale(0.1)";
    });

    // Déverrouiller les cercles après 3 secondes
    setTimeout(() => {
        if (!started) return;
        reformWorm();

    }, 3000);
}

function reformWorm() {
    console.log(circleCooSave);
    circles.forEach((circle, index) => {
        circle.style.transition = "all 4.6s ease";
        circle.style.left = `${circleCooSave[index].x}`;
        circle.style.top = `${circleCooSave[index].y}`;
        circle.style.transform = "scale(1)";

        setTimeout(() => {
            circle.style.transition = "none";
            locked = false;
        }, 4600);
    });
}

// Changer la couleur des cercles périodiquement
setInterval(changeColor, 2000);

function changeColor() {
    const color = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;

    circles.forEach((circle, index) => {
        setTimeout(() => {
            circle.style.backgroundColor = color;
            if (isGlowing) {
                circle.style.boxShadow = `0px 0px 14px rgba(${color.match(/\d+/g).join(", ")}, 0.9)`;
            } else {
                circle.style.boxShadow = "none";
            }
        }, 1 + index * 30);
    });
}



//Generate apple
function generateApple() {
    if(locked) return;
    if (freeMode) return;
    const apple = document.createElement("img");
    apple.src = pathToImgFolder + "apple.svg";
    apple.classList.add("apple");
    apple.style.position = "absolute";
    apple.style.left = `${Math.random() * window.innerWidth}px`;
    apple.style.top = `${Math.random() * window.innerHeight}px`;
    apple.style.width = "50px";
    document.body.appendChild(apple);

    setTimeout(() => {
        apple.remove();
    }, 2000);
}

//Detect mouse collision with apple
function detectCollision() {
    const apples = document.querySelectorAll(".apple");
    const bombs = document.querySelectorAll(".bomb");

    apples.forEach((apple) => {
        const appleRect = apple.getBoundingClientRect();


            const circleRect = circles[0].getBoundingClientRect();

            // Vérification de la collision
            if (
                circleRect.left < appleRect.right &&
                circleRect.right > appleRect.left &&
                circleRect.top < appleRect.bottom &&
                circleRect.bottom > appleRect.top
            ) {
                console.log("Collision détectée avec une pomme !");
                score.innerText = parseInt(score.innerText) + 1;
                // Animation d'explosion
                const particlesArray = Array.from({ length: 10 }, () => ({
                    x: appleRect.x + appleRect.width / 2,
                    y: appleRect.y + appleRect.height / 2,
                }));

                particlesArray.forEach((particle) => {
                    const angle = Math.random() * Math.PI * 2;
                    const distance = Math.random() * 600 + 300;

                    const div = document.createElement("div");
                    div.style.position = "absolute";
                    div.style.width = "10px";
                    div.style.height = "10px";
                    div.style.borderRadius = "50%";
                    div.style.backgroundColor = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;

                    // Calcul des positions initiales
                    div.style.left = `${particle.x}px`;
                    div.style.top = `${particle.y}px`;

                    document.body.appendChild(div);

                    // Calcul des nouvelles positions
                    const randomX = particle.x + Math.cos(angle) * distance;
                    const randomY = particle.y + Math.sin(angle) * distance;

                    // Appliquer la transition
                    setTimeout(() => {
                        div.style.transition = "all 2s ease";
                        div.style.left = `${randomX}px`;
                        div.style.top = `${randomY}px`;
                        div.style.transform = "scale(0.1)";
                    }, 10);

                    // Retirer après l'animation
                    setTimeout(() => {
                        div.remove();
                    }, 2000);
                });

                // Supprimer la pomme détectée
                apple.remove();
            }

    });

    bombs.forEach((bomb) => {
        const bombRect = bomb.getBoundingClientRect();


        const circleRect = circles[0].getBoundingClientRect();

        // Vérification de la collision
        if (
            circleRect.left < bombRect.right &&
            circleRect.right > bombRect.left &&
            circleRect.top < bombRect.bottom &&
            circleRect.bottom > bombRect.top
        ) {
            console.log("Collision détectée avec une pomme !");
            score.innerText = parseInt(score.innerText) + 1;
            // Animation d'explosion
            const particlesArray = Array.from({ length: 20 }, () => ({
                x: bombRect.x + bombRect.width / 2,
                y: bombRect.y + bombRect.height / 2,
            }));

            particlesArray.forEach((particle) => {
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 600 + 300;

                const div = document.createElement("div");
                div.style.position = "absolute";
                div.style.width = "10px";
                div.style.height = "10px";
                div.style.borderRadius = "50%";
                div.style.backgroundColor = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;

                // Calcul des positions initiales
                div.style.left = `${particle.x}px`;
                div.style.top = `${particle.y}px`;

                document.body.appendChild(div);

                // Calcul des nouvelles positions
                const randomX = particle.x + Math.cos(angle) * distance;
                const randomY = particle.y + Math.sin(angle) * distance;

                // Appliquer la transition
                setTimeout(() => {
                    div.style.transition = "all 2s ease";
                    div.style.left = `${randomX}px`;
                    div.style.top = `${randomY}px`;
                    div.style.transform = "scale(0.1)";
                }, 10);

                // Retirer après l'animation
                setTimeout(() => {
                    div.remove();
                }, 2000);
            });

            // Supprimer la pomme détectée
            explodWorm();
            bomb.remove();
        }

    });
}

// Génération des mines
function generateMine() {
    if (freeMode) return;
    const mine = document.createElement("img");
    mine.src = pathToImgFolder + "bomb.svg";
    mine.classList.add("bomb");
    mine.style.position = "absolute";
    mine.style.left = `${Math.random() * window.innerWidth}px`;
    mine.style.top = `${Math.random() * window.innerHeight}px`;
    mine.style.width = "50px";
    document.body.appendChild(mine);

    setTimeout(() => {
        mine.remove();
    }, 10000);
}

setInterval(generateMine, 8000);


// Start la game
function start() {

    startContainer.style.display = "none";
    locked = false;
    started = true;
    timer.innerText = "30";
    score.innerText = "0";
    let inter = setInterval(() => {
        if (parseInt(timer.innerText) === 0) {
            locked = true;
            clearInterval(inter);
            startContainer.style.display = "flex";
            yourScore.innerText = "Your score: " + score.innerText;
            let bombs = document.querySelectorAll(".bomb");
            bombs.forEach(bomb => {
                bomb.remove();
            });
            return;
        }
        timer.innerText = parseInt(timer.innerText) - 1;
    }, 1000);
}

function startFreeMode() {
    startContainer.style.display = "none";
    locked = false;
    started = true;
    freeMode = true;
    timer.innerText = "∞";
    exit.style.display = "block";
    score.innerText = "0"
}

function exitFreeMode() {
    startContainer.style.display = "flex";
    locked = true;
    started = false;
    freeMode = false;
    timer.innerText = "";
    yourScore.innerText = score.innerText;
    exit.style.display = "none";
    let bombs = document.querySelectorAll(".bomb");
    bombs.forEach(bomb => {
        bomb.remove();
    });
}

startButton.addEventListener("click", start);
freeButton.addEventListener("click", startFreeMode);
exit.addEventListener("click", exitFreeMode);
// Gérer la collision avec la souris
window.addEventListener("mousemove", detectCollision);

// Générer une pomme toutes les 5 secondes
setInterval(generateApple, 200);


// Attacher l'événement de suivi de la souris
window.addEventListener("mousemove", followMouse);

// Lancer l'animation des cercles
animateSnake();

const getRandomNumber = (min, max) => {
    return Math.random() * (max - min) + min
}