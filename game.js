class QuantumGame {
    constructor() {
        this.player = document.getElementById('player');
        this.gameArea = document.getElementById('game-area');
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
        this.levelElement = document.getElementById('level');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.shareBtn = document.getElementById('share-btn');
        this.shareModal = document.getElementById('share-modal');
        this.shareLevel = document.getElementById('share-level');
        this.shareScore = document.getElementById('share-score');
        this.downloadBtn = document.getElementById('download-btn');
        this.downloadModal = document.getElementById('download-modal');
        
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameLoop = null;
        this.isGameRunning = false;
        this.isPaused = false;
        this.playerX = this.gameArea.offsetWidth / 2;
        this.playerY = this.gameArea.offsetHeight - 50;
        this.speed = 5;
        this.obstacles = [];
        this.particles = [];
        this.keys = {};
        this.teleportCooldown = false;
        
        // Create pause overlay
        this.pauseOverlay = document.createElement('div');
        this.pauseOverlay.className = 'pause-overlay';
        this.pauseOverlay.textContent = 'PAUSED';
        this.gameArea.appendChild(this.pauseOverlay);
        
        // Level configuration
        this.levelConfig = {
            maxLevel: 30,
            scoreThresholds: Array.from({length: 30}, (_, i) => 60 + (i * 10)), // 60, 70, 80, ...
            obstacleSpeeds: Array.from({length: 30}, (_, i) => 2 + (i * 0.2)), // 2, 2.2, 2.4, ...
            particleSpeeds: Array.from({length: 30}, (_, i) => 3 + (i * 0.2)), // 3, 3.2, 3.4, ...
            obstacleSpawnRates: Array.from({length: 30}, (_, i) => 2000 - (i * 50)), // 2000, 1950, 1900, ...
            particleSpawnRates: Array.from({length: 30}, (_, i) => 3000 - (i * 50)), // 3000, 2950, 2900, ...
        };
        
        this.init();
    }
    
    init() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.shareBtn.addEventListener('click', () => this.showShareModal());
        this.downloadBtn.addEventListener('click', () => this.showDownloadModal());
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === 'p' || e.key === 'P') {
                this.togglePause();
            }
        });
        document.addEventListener('keyup', (e) => this.keys[e.key] = false);
    }
    
    togglePause() {
        if (!this.isGameRunning) return;
        
        this.isPaused = !this.isPaused;
        this.pauseOverlay.classList.toggle('active');
        this.pauseBtn.textContent = this.isPaused ? 'Resume Game' : 'Pause Game';
        
        if (this.isPaused) {
            clearInterval(this.gameLoop);
        } else {
            this.gameLoop = setInterval(() => this.update(), 20);
        }
    }
    
    startGame() {
        if (this.isGameRunning) return;
        
        this.isGameRunning = true;
        this.isPaused = false;
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.updateScore();
        this.updateLives();
        this.updateLevel();
        this.gameLoop = setInterval(() => this.update(), 20);
        this.startBtn.textContent = 'Game Running';
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.shareBtn.style.display = 'none';
        this.shareModal.classList.remove('active');
        this.pauseOverlay.classList.remove('active');
        
        // Start spawning obstacles and particles
        this.spawnObstacles();
        this.spawnParticles();
    }
    
    update() {
        if (this.isPaused) return;
        
        this.movePlayer();
        this.checkCollisions();
        this.updateObstacles();
        this.updateParticles();
        this.checkLevelProgress();
    }
    
    checkLevelProgress() {
        if (this.level < this.levelConfig.maxLevel && 
            this.score >= this.levelConfig.scoreThresholds[this.level - 1]) {
            this.levelUp();
        }
    }
    
    levelUp() {
        this.level++;
        this.updateLevel();
        
        // Create level up effect
        const levelUpEffect = document.createElement('div');
        levelUpEffect.style.position = 'absolute';
        levelUpEffect.style.top = '50%';
        levelUpEffect.style.left = '50%';
        levelUpEffect.style.transform = 'translate(-50%, -50%)';
        levelUpEffect.style.color = '#00ffff';
        levelUpEffect.style.fontSize = '48px';
        levelUpEffect.style.textShadow = '0 0 20px rgba(0, 255, 255, 0.8)';
        levelUpEffect.style.zIndex = '1000';
        levelUpEffect.textContent = `Level ${this.level}!`;
        this.gameArea.appendChild(levelUpEffect);
        
        // Remove effect after animation
        setTimeout(() => {
            levelUpEffect.remove();
        }, 2000);
    }
    
    updateLevel() {
        this.levelElement.textContent = this.level;
    }
    
    movePlayer() {
        if (this.keys['ArrowLeft'] && this.playerX > 0) {
            this.playerX -= this.speed;
        }
        if (this.keys['ArrowRight'] && this.playerX < this.gameArea.offsetWidth - 30) {
            this.playerX += this.speed;
        }
        if (this.keys['ArrowUp'] && this.playerY > 0) {
            this.playerY -= this.speed;
        }
        if (this.keys['ArrowDown'] && this.playerY < this.gameArea.offsetHeight - 30) {
            this.playerY += this.speed;
        }
        
        // Quantum teleportation
        if (this.keys[' '] && !this.teleportCooldown) {
            this.teleport();
        }
        
        this.player.style.left = this.playerX + 'px';
        this.player.style.top = this.playerY + 'px';
    }
    
    teleport() {
        this.teleportCooldown = true;
        const teleportDistance = 100;
        const direction = Math.random() > 0.5 ? 1 : -1;
        
        // Create teleport effect
        const teleportEffect = document.createElement('div');
        teleportEffect.style.position = 'absolute';
        teleportEffect.style.left = this.playerX + 'px';
        teleportEffect.style.top = this.playerY + 'px';
        teleportEffect.style.width = '30px';
        teleportEffect.style.height = '30px';
        teleportEffect.style.borderRadius = '50%';
        teleportEffect.style.background = 'rgba(0, 255, 255, 0.3)';
        teleportEffect.style.animation = 'pulse 0.5s forwards';
        this.gameArea.appendChild(teleportEffect);
        
        // Move player (now in both X and Y directions)
        this.playerX += teleportDistance * direction;
        this.playerY += teleportDistance * (Math.random() > 0.5 ? 1 : -1);
        
        // Keep player within bounds
        if (this.playerX < 0) this.playerX = 0;
        if (this.playerX > this.gameArea.offsetWidth - 30) {
            this.playerX = this.gameArea.offsetWidth - 30;
        }
        if (this.playerY < 0) this.playerY = 0;
        if (this.playerY > this.gameArea.offsetHeight - 30) {
            this.playerY = this.gameArea.offsetHeight - 30;
        }
        
        // Remove effect after animation
        setTimeout(() => {
            teleportEffect.remove();
            this.teleportCooldown = false;
        }, 500);
    }
    
    spawnObstacles() {
        setInterval(() => {
            if (!this.isGameRunning) return;
            
            const obstacle = document.createElement('div');
            obstacle.className = 'obstacle';
            obstacle.style.left = Math.random() * (this.gameArea.offsetWidth - 40) + 'px';
            obstacle.style.top = '-40px';
            this.gameArea.appendChild(obstacle);
            this.obstacles.push(obstacle);
        }, this.levelConfig.obstacleSpawnRates[this.level - 1]);
    }
    
    spawnParticles() {
        setInterval(() => {
            if (!this.isGameRunning) return;
            
            const particle = document.createElement('div');
            particle.className = 'quantum-particle';
            particle.style.left = Math.random() * (this.gameArea.offsetWidth - 20) + 'px';
            particle.style.top = '-20px';
            this.gameArea.appendChild(particle);
            this.particles.push(particle);
        }, this.levelConfig.particleSpawnRates[this.level - 1]);
    }
    
    updateObstacles() {
        this.obstacles.forEach((obstacle, index) => {
            const top = parseInt(obstacle.style.top) + this.levelConfig.obstacleSpeeds[this.level - 1];
            obstacle.style.top = top + 'px';
            
            if (top > this.gameArea.offsetHeight) {
                obstacle.remove();
                this.obstacles.splice(index, 1);
            }
        });
    }
    
    updateParticles() {
        this.particles.forEach((particle, index) => {
            const top = parseInt(particle.style.top) + this.levelConfig.particleSpeeds[this.level - 1];
            particle.style.top = top + 'px';
            
            if (top > this.gameArea.offsetHeight) {
                particle.remove();
                this.particles.splice(index, 1);
            }
        });
    }
    
    checkCollisions() {
        const playerRect = this.player.getBoundingClientRect();
        
        // Check obstacle collisions
        this.obstacles.forEach((obstacle, index) => {
            const obstacleRect = obstacle.getBoundingClientRect();
            if (this.isColliding(playerRect, obstacleRect)) {
                this.lives--;
                this.updateLives();
                obstacle.remove();
                this.obstacles.splice(index, 1);
                
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        });
        
        // Check particle collisions
        this.particles.forEach((particle, index) => {
            const particleRect = particle.getBoundingClientRect();
            if (this.isColliding(playerRect, particleRect)) {
                this.score += 10;
                this.updateScore();
                particle.remove();
                this.particles.splice(index, 1);
            }
        });
    }
    
    isColliding(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
    }
    
    updateLives() {
        this.livesElement.textContent = this.lives;
    }
    
    showShareModal() {
        this.shareLevel.textContent = this.level;
        this.shareScore.textContent = this.score;
        this.shareModal.classList.add('active');
    }
    
    showDownloadModal() {
        this.downloadModal.classList.add('active');
    }
    
    gameOver() {
        this.isGameRunning = false;
        this.isPaused = false;
        clearInterval(this.gameLoop);
        this.startBtn.textContent = `Game Over - Level ${this.level} - Click to Restart`;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.shareBtn.style.display = 'inline-block';
        this.pauseOverlay.classList.remove('active');
        
        // Clear all obstacles and particles
        this.obstacles.forEach(obstacle => obstacle.remove());
        this.particles.forEach(particle => particle.remove());
        this.obstacles = [];
        this.particles = [];
    }
}

// Share functionality
function shareToTwitter() {
    const text = `I scored ${game.score} points and reached level ${game.level} in Quantum Particle Race! Can you beat my score?`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

function shareToFacebook() {
    const text = `I scored ${game.score} points and reached level ${game.level} in Quantum Particle Race! Can you beat my score?`;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

function copyShareLink() {
    const text = `I scored ${game.score} points and reached level ${game.level} in Quantum Particle Race! Can you beat my score?`;
    const shareText = `${text}\n\nPlay here: ${window.location.href}`;
    
    navigator.clipboard.writeText(shareText).then(() => {
        alert('Share text copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

function closeShareModal() {
    document.getElementById('share-modal').classList.remove('active');
}

// Download functionality
function downloadGame() {
    // Create a ZIP file containing all game files
    const zip = new JSZip();
    
    // Add HTML file
    zip.file("index.html", document.documentElement.outerHTML);
    
    // Add CSS file
    const styleSheet = document.styleSheets[0];
    let cssContent = "";
    for (let i = 0; i < styleSheet.cssRules.length; i++) {
        cssContent += styleSheet.cssRules[i].cssText + "\n";
    }
    zip.file("style.css", cssContent);
    
    // Add JavaScript file
    const scriptContent = document.querySelector('script').textContent;
    zip.file("game.js", scriptContent);
    
    // Add README file
    const readmeContent = `Quantum Particle Race

A fun quantum-themed game where you control a particle through various levels.

How to Play:
1. Use arrow keys (← → ↑ ↓) to move
2. Press SPACE to teleport
3. Press P to pause/resume
4. Collect quantum particles and avoid obstacles
5. Reach higher levels by scoring points

Enjoy the game!`;
    zip.file("README.txt", readmeContent);
    
    // Generate and download the ZIP file
    zip.generateAsync({type: "blob"})
        .then(function(content) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = "quantum-particle-race.zip";
            link.click();
        });
}

function closeDownloadModal() {
    document.getElementById('download-modal').classList.remove('active');
}

// Initialize the game
const game = new QuantumGame(); 