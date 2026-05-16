// UI Elements
const startScreen = document.getElementById('start_screen');
const gameoverScreen = document.getElementById('gameover_screen');
const hud = document.getElementById('hud');
const startBtn = document.getElementById('start_btn');
const restartBtn = document.getElementById('restart_btn');
const loadingStatus = document.getElementById('loading_status');
const scoreVal = document.getElementById('score_val');
const highscoreVal = document.getElementById('highscore_val');
const finalScore = document.getElementById('final_score');
const newHighscoreMsg = document.getElementById('new_highscore_msg');
const comboDisplay = document.getElementById('combo_display');
const comboVal = document.getElementById('combo_val');
const gameContainer = document.querySelector('.game-container');
const backgroundEl = document.querySelector('.background');

// Canvas Setup
const canvas = document.getElementById('output_canvas');
const ctx = canvas.getContext('2d');
canvas.width = 1280;
canvas.height = 720;

const splatterCanvas = document.getElementById('splatter_canvas');
const splatterCtx = splatterCanvas.getContext('2d');

// Asset Images
const assets = {
    watermelon: document.getElementById('img_watermelon'),
    apple: document.getElementById('img_apple'),
    orange: document.getElementById('img_orange'),
    bomb: document.getElementById('img_bomb')
};

// Game State
let gameState = 'START'; // START, PLAYING, GAMEOVER
let score = 0;
let highscore = localStorage.getItem('fn_highscore') || 0;
highscoreVal.innerText = highscore;

// Game Objects
let entities = [];
let particles = [];
let bladeTrail = [];
const BLADE_MAX_LENGTH = 10;
const BLADE_COLOR = '#FFFFFF';
const BLADE_GLOW = '#00E5FF';

// Combo System
let comboCount = 0;
let comboTimer = 0;
const COMBO_TIME_LIMIT = 60; // frames

// Hands Tracking
let fingerX = 0;
let fingerY = 0;
let isHandPresent = false;

// Config
let currentSpawnRate = 60; // frames
const MIN_SPAWN_RATE = 20;
let spawnTimer = 0;
let frameCount = 0;

// Classes
class Entity {
    constructor() {
        this.type = Math.random() > 0.8 ? 'bomb' : ['watermelon', 'apple', 'orange'][Math.floor(Math.random() * 3)];
        this.radius = this.type === 'bomb' ? 40 : 50;
        this.x = Math.random() * (canvas.width - 200) + 100;
        this.y = canvas.height + this.radius;
        
        // Target towards center somewhat
        const centerX = canvas.width / 2;
        const direction = (centerX - this.x) / canvas.width;
        
        
        // Dynamic Difficulty: Increase speeds based on global score
        const diffMultiplier = 1 + (score / 50);

        this.vx = (Math.random() * 4 + 2) * Math.sign(direction) || (Math.random() - 0.5) * 6;
        this.vy = -(Math.random() * 5 + 15) * Math.min(diffMultiplier, 1.4);
        this.gravity = 0.25 * Math.min(diffMultiplier, 1.5);
        this.rotation = Math.random() * Math.PI * 2;
        this.vr = (Math.random() - 0.5) * 0.2;
        this.sliced = false;
        
        // Half piece logic
        this.isHalf = false;
        this.alpha = 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.rotation += this.vr;
        if (this.isHalf) {
            this.alpha -= 0.02;
        }
    }

    draw(ctx) {
        if (this.alpha <= 0) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.alpha;
        
        const img = assets[this.type];
        if (img && img.complete) {
            // Because canvas is flipped via CSS scaleX(-1), drawing normally is fine
            ctx.drawImage(img, -this.radius, -this.radius, this.radius * 2, this.radius * 2);
        } else {
            // Fallback shape
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.type === 'bomb' ? 'black' : 'red';
            ctx.fill();
            ctx.closePath();
        }
        ctx.restore();
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.life = 1.0;
        this.decay = Math.random() * 0.02 + 0.02;
        this.color = color;
        this.size = Math.random() * 8 + 4;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
    }
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Math Utility
function pointToSegmentDistance(px, py, x1, y1, x2, y2) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    if (dx === 0 && dy === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

// Core Logic
function spawnParticles(x, y, type) {
    let color = '#FF0000';
    if (type === 'watermelon') color = '#00FF00';
    else if (type === 'orange') color = '#FFA500';
    else if (type === 'bomb') color = '#555555';

    for (let i = 0; i < 20; i++) {
        particles.push(new Particle(x, y, color));
    }
    
    // Also draw permanent splatters to background canvas
    if (type !== 'bomb') {
        splatterCtx.save();
        splatterCtx.fillStyle = color;
        splatterCtx.globalAlpha = 0.6;
        for(let i=0; i<10; i++) {
            let sx = x + (Math.random() - 0.5) * 120;
            let sy = y + (Math.random() - 0.5) * 120;
            let size = Math.random() * 12 + 3;
            splatterCtx.beginPath();
            splatterCtx.arc(sx, sy, size, 0, Math.PI*2);
            splatterCtx.fill();
        }
        splatterCtx.restore();
    }
}

function sliceEntity(entity, index) {
    if (entity.type === 'bomb') {
        gameOver();
        return;
    }

    // Score & Combo
    comboCount++;
    comboTimer = COMBO_TIME_LIMIT;
    let points = 1 * comboCount;
    score += points;
    scoreVal.innerText = score;
    
    if (comboCount > 1) {
        comboVal.innerText = comboCount;
        comboDisplay.classList.add('active');
        setTimeout(() => comboDisplay.classList.remove('active'), 200);
    }

    spawnParticles(entity.x, entity.y, entity.type);

    // Create halves
    let half1 = new Entity();
    Object.assign(half1, entity);
    half1.isHalf = true;
    half1.vx = entity.vx - 3;
    half1.sliced = true;

    let half2 = new Entity();
    Object.assign(half2, entity);
    half2.isHalf = true;
    half2.vx = entity.vx + 3;
    half2.sliced = true;

    entities.splice(index, 1, half1, half2);
}

function gameOver() {
    gameState = 'GAMEOVER';
    gameContainer.classList.remove('game-active');
    gameoverScreen.classList.remove('hidden');
    hud.style.display = 'none';
    finalScore.innerText = score;
    backgroundEl.style.backgroundImage = "url('assets/gameover_bg.png')";

    if (score > highscore) {
        highscore = score;
        localStorage.setItem('fn_highscore', highscore);
        highscoreVal.innerText = highscore;
        newHighscoreMsg.classList.remove('hidden');
    } else {
        newHighscoreMsg.classList.add('hidden');
    }
}

function startGame() {
    gameState = 'PLAYING';
    score = 0;
    scoreVal.innerText = score;
    comboCount = 0;
    currentSpawnRate = 60;
    spawnTimer = 0;
    entities = [];
    particles = [];
    bladeTrail = [];
    frameCount = 0;

    startScreen.classList.add('hidden');
    gameoverScreen.classList.add('hidden');
    hud.style.display = 'flex';
    gameContainer.classList.add('game-active');
    backgroundEl.style.backgroundImage = "url('assets/game_bg.png')";
    splatterCtx.clearRect(0, 0, splatterCanvas.width, splatterCanvas.height);
}

// MediaPipe Initialization
const videoElement = document.getElementById('input_video');
const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 0, // Set to 0 to reduce lag and improve performance significantly
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

let currentLandmarks = null;

hands.onResults((results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        isHandPresent = true;
        currentLandmarks = results.multiHandLandmarks[0];
        const landmarks = currentLandmarks;
        // Index finger tip is landmark 8
        const indexTip = landmarks[8];
        
        // Robust rotation-invariant gesture check
        const getDist = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
        const isIndexExt = getDist(landmarks[8], landmarks[0]) > getDist(landmarks[6], landmarks[0]);
        const isMiddleFolded = getDist(landmarks[12], landmarks[0]) < getDist(landmarks[10], landmarks[0]);
        const isRingFolded = getDist(landmarks[16], landmarks[0]) < getDist(landmarks[14], landmarks[0]);
        const isPinkyFolded = getDist(landmarks[20], landmarks[0]) < getDist(landmarks[18], landmarks[0]);

        const isPointing = isIndexExt && isMiddleFolded && isRingFolded && isPinkyFolded;
        const isOpenPalm = isIndexExt && !isMiddleFolded && !isRingFolded && !isPinkyFolded;

        // Pause Game with Open Palm
        if (isOpenPalm && gameState === 'PLAYING') {
            gameState = 'PAUSED';
            bladeTrail = [];
        } else if (isPointing && gameState === 'PAUSED') {
            gameState = 'PLAYING';
        }

        if (isPointing && gameState === 'PLAYING') {
            fingerX = indexTip.x * canvas.width;
            fingerY = indexTip.y * canvas.height;
            
            bladeTrail.push({x: fingerX, y: fingerY});
            if (bladeTrail.length > BLADE_MAX_LENGTH) {
                bladeTrail.shift();
            }
        } else {
            // Decay blade if gesture breaks
            if (bladeTrail.length > 0) bladeTrail.shift();
            if (bladeTrail.length > 0) bladeTrail.shift();
        }
    } else {
        isHandPresent = false;
        if (bladeTrail.length > 0) {
            bladeTrail.shift();
        }
    }
});

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({image: videoElement});
    },
    width: 1280,
    height: 720
});

// Start camera and enable play button
camera.start().then(() => {
    loadingStatus.innerText = "AI Model Loaded! Ready to play.";
    startBtn.disabled = false;
});

// Event Listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Game Loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw faint video feed so players can see themselves and their hand position
    if (videoElement.readyState >= 2) {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        ctx.restore();
    }

    if (gameState === 'PLAYING' || gameState === 'PAUSED') {
        if (gameState === 'PLAYING') {
            frameCount++;

            // Combo timeout
            if (comboTimer > 0) {
                comboTimer--;
                if (comboTimer === 0) {
                    comboCount = 0;
                    comboDisplay.classList.remove('active');
                }
            }

            // Spawn logic
            spawnTimer++;
            if (spawnTimer >= currentSpawnRate) {
                spawnTimer = 0;
                let count = Math.floor(Math.random() * 3) + 1;
                // Increase difficulty: Reduce spawn delay as score goes up
                currentSpawnRate = Math.max(MIN_SPAWN_RATE, 60 - Math.floor(score / 10) * 5);
                
                for(let i=0; i<count; i++) {
                    entities.push(new Entity());
                }
            }
        }

        // Update and Draw Entities
        for (let i = entities.length - 1; i >= 0; i--) {
            let e = entities[i];
            if (gameState === 'PLAYING') e.update();
            e.draw(ctx);

            // Out of bounds remove
            if (e.y > canvas.height + 100 && e.vy > 0) {
                entities.splice(i, 1);
                continue;
            }

            // Slicing logic
            if (gameState === 'PLAYING' && !e.sliced && bladeTrail.length > 1) {
                const pt1 = bladeTrail[bladeTrail.length - 1];
                const pt2 = bladeTrail[bladeTrail.length - 2];
                const dist = pointToSegmentDistance(e.x, e.y, pt1.x, pt1.y, pt2.x, pt2.y);
                
                if (dist < e.radius) {
                    sliceEntity(e, i);
                }
            }
        }

        // Update and Draw Particles
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            if (gameState === 'PLAYING') p.update();
            p.draw(ctx);
            if (p.life <= 0) {
                particles.splice(i, 1);
            }
        }

        // Draw Full Hand Skeleton for "Attention Seeking" visual
        if (isHandPresent && currentLandmarks) {
            ctx.save();
            ctx.fillStyle = '#FF3366'; // Removed expensive shadowBlur for performance
            
            // Draw neon dots at each joint
            for (let i = 0; i < currentLandmarks.length; i++) {
                const lm = currentLandmarks[i];
                const x = lm.x * canvas.width;
                const y = lm.y * canvas.height;
                ctx.beginPath();
                ctx.arc(x, y, i === 8 ? 8 : 4, 0, 2 * Math.PI); // Larger dot for index finger tip
                ctx.fill();
            }
            ctx.restore();
        }

        // Draw Blade
        if (bladeTrail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(bladeTrail[0].x, bladeTrail[0].y);
            for (let i = 1; i < bladeTrail.length; i++) {
                ctx.lineTo(bladeTrail[i].x, bladeTrail[i].y);
            }
            ctx.strokeStyle = BLADE_COLOR;
            ctx.lineWidth = 8;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.shadowColor = BLADE_GLOW;
            ctx.shadowBlur = 20;
            ctx.stroke();
            ctx.shadowBlur = 0; // reset
        }
        
        // Draw Pause Overlay
        if (gameState === 'PAUSED') {
            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '900 80px Outfit';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#000';
            ctx.shadowBlur = 10;
            ctx.fillText('PAUSED', canvas.width/2, canvas.height/2);
            ctx.font = '400 30px Outfit';
            ctx.fillStyle = '#00E5FF';
            ctx.fillText('Make Pointing Gesture to Resume', canvas.width/2, canvas.height/2 + 50);
            ctx.restore();
        }
    } else {
        // Draw Full Hand Skeleton
        if (isHandPresent && currentLandmarks) {
            ctx.save();
            ctx.fillStyle = '#FF3366'; // Removed expensive shadowBlur for performance
            for (let i = 0; i < currentLandmarks.length; i++) {
                const lm = currentLandmarks[i];
                const x = lm.x * canvas.width;
                const y = lm.y * canvas.height;
                ctx.beginPath();
                ctx.arc(x, y, i === 8 ? 8 : 4, 0, 2 * Math.PI);
                ctx.fill();
            }
            ctx.restore();
        }

        // Just draw blade on start/gameover screens for fun interaction
        if (bladeTrail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(bladeTrail[0].x, bladeTrail[0].y);
            for (let i = 1; i < bladeTrail.length; i++) {
                ctx.lineTo(bladeTrail[i].x, bladeTrail[i].y);
            }
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.stroke();
        }
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();
