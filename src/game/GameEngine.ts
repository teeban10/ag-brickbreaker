import type { GameState, GameConfig, Vector2D, BrickData, GameStats } from './types';
import { ACHIEVEMENTS } from './constants';

export class GameEngine {
    // private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private animationId: number | null = null;
    private config: GameConfig;
    
    // Game State
    public state: GameState;
    private onStateChange: (state: GameState) => void;
    private stats: GameStats = { bricksBroken: 0, totalScore: 0, maxLevel: 1 };

    // Entities (Simple representation for now)
    private paddle: { pos: Vector2D; width: number; height: number; speed: number; dx: number };
    private ball: { pos: Vector2D; vel: Vector2D; radius: number; speed: number; active: boolean };
    private bricks: BrickData[] = [];
    // private particles: any[] = []; // TODO: Implement Particle system

    public updateConfig(newConfig: Partial<GameConfig>) {
        this.config = { ...this.config, ...newConfig };
        this.draw(); // Redraw with new theme
    }

    constructor(
        canvas: HTMLCanvasElement, 
        config: GameConfig, 
        onStateChange: (state: GameState) => void
    ) {
        // this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.config = config;
        this.onStateChange = onStateChange;

        this.state = {
            score: 0,
            lives: 3,
            level: 1,
            isPlaying: false,
            isGameOver: false,
            isPaused: false,
            achievements: []
        };

        // Load achievements
        const savedAchievements = localStorage.getItem('brickbreaker_achievements');
        if (savedAchievements) {
            this.state.achievements = JSON.parse(savedAchievements);
        }

        // Initialize Entities
        this.paddle = {
            pos: { x: config.canvasWidth / 2 - 50, y: config.canvasHeight - 30 },
            width: 100,
            height: 15,
            speed: 8,
            dx: 0
        };

        this.ball = {
            pos: { x: config.canvasWidth / 2, y: config.canvasHeight - 50 },
            vel: { x: 4, y: -4 },
            radius: 6,
            speed: 5,
            active: false
        };

        this.initLevel(1);
        this.draw(); // Initial draw
    }

    private initLevel(level: number) {
        // Simple brick generation for testing
        this.bricks = [];
        const rows = 3 + level;
        const cols = 8;
        const padding = 10;
        const brickWidth = (this.config.canvasWidth - (cols + 1) * padding) / cols;
        const brickHeight = 20;

        for(let r = 0; r < rows; r++) {
            for(let c = 0; c < cols; c++) {
                this.bricks.push({
                    id: `${r}-${c}`,
                    position: {
                        x: padding + c * (brickWidth + padding),
                        y: padding + 50 + r * (brickHeight + padding)
                    },
                    width: brickWidth,
                    height: brickHeight,
                    type: 'normal',
                    health: 1,
                    color: `hsl(${c * 40 + r * 20}, 70%, 60%)`,
                    value: 100
                });
            }
        }
    }

    public start() {
        if (this.state.isGameOver) {
            this.resetGame();
        }
        if (!this.state.isPlaying) {
            this.state.isPlaying = true;
            this.ball.active = true;
            this.loop();
            this.updateState();
        }
    }

    private resetGame() {
        this.state.score = 0;
        this.state.lives = 3;
        this.state.level = 1;
        this.state.isGameOver = false;
        this.state.isPlaying = false;
        
        // Reset Stats for new run (optional, but keeps 'current run' stats clean)
        this.stats.totalScore = 0; 
        
        this.initLevel(1);
        
        // Reset entities
        this.ball.pos = { x: this.config.canvasWidth / 2, y: this.config.canvasHeight - 50 };
        this.ball.vel = { x: 4, y: -4 };
        this.paddle.pos.x = this.config.canvasWidth / 2 - this.paddle.width / 2;
        
        this.draw();
    }

    public pause() {
        this.state.isPaused = !this.state.isPaused;
        if (!this.state.isPaused) {
            this.loop();
        } else if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.updateState();
    }

    public setPaddleDirection(direction: 'left' | 'right' | 'stop') {
        if (direction === 'left') this.paddle.dx = -this.paddle.speed;
        else if (direction === 'right') this.paddle.dx = this.paddle.speed;
        else this.paddle.dx = 0;
    }

    private update() {
        if (this.state.isPaused || !this.state.isPlaying) return;

        // Paddle Movement
        this.paddle.pos.x += this.paddle.dx;
        // Clamp paddle
        if (this.paddle.pos.x < 0) this.paddle.pos.x = 0;
        if (this.paddle.pos.x + this.paddle.width > this.config.canvasWidth) {
            this.paddle.pos.x = this.config.canvasWidth - this.paddle.width;
        }

        // Ball Movement
        if (this.ball.active) {
            this.ball.pos.x += this.ball.vel.x;
            this.ball.pos.y += this.ball.vel.y;

            // Wall Collisions
            if (this.ball.pos.x - this.ball.radius < 0 || this.ball.pos.x + this.ball.radius > this.config.canvasWidth) {
                this.ball.vel.x *= -1;
            }
            if (this.ball.pos.y - this.ball.radius < 0) {
                this.ball.vel.y *= -1;
            }

            // Paddle Collision
            if (
                this.ball.pos.y + this.ball.radius >= this.paddle.pos.y &&
                this.ball.pos.y - this.ball.radius <= this.paddle.pos.y + this.paddle.height &&
                this.ball.pos.x >= this.paddle.pos.x &&
                this.ball.pos.x <= this.paddle.pos.x + this.paddle.width
            ) {
                // Simple bounce
                this.ball.vel.y = -Math.abs(this.ball.vel.y);
                
                // Add some English based on where it hit the paddle
                const hitPoint = this.ball.pos.x - (this.paddle.pos.x + this.paddle.width / 2);
                this.ball.vel.x = hitPoint * 0.15; 
            }

            // Brick Collision
            for (let i = this.bricks.length - 1; i >= 0; i--) {
                const b = this.bricks[i];
                if (
                    this.ball.pos.x > b.position.x &&
                    this.ball.pos.x < b.position.x + b.width &&
                    this.ball.pos.y > b.position.y &&
                    this.ball.pos.y < b.position.y + b.height
                ) {
                    this.ball.vel.y *= -1;
                    this.bricks.splice(i, 1);
                    this.state.score += b.value;
                    
                    // Update Stats
                    this.stats.bricksBroken++;
                    this.stats.totalScore = this.state.score; // Current run score for now
                    this.checkAchievements();

                    this.updateState();
                    break;  
                }
            }

            // Floor Collision (Death)
            if (this.ball.pos.y + this.ball.radius > this.config.canvasHeight) {
                this.handleDeath();
            }
        }
        
        // Check Level Clear
        if (this.bricks.length === 0) {
            this.nextLevel();
        }
    }

    private handleDeath() {
        this.state.lives--;
        if (this.state.lives <= 0) {
            this.state.isGameOver = true;
            this.state.isPlaying = false;
        } else {
            // Reset ball
            this.ball.pos = { x: this.config.canvasWidth / 2, y: this.config.canvasHeight - 50 };
            this.ball.vel = { x: 4, y: -4 };
            this.paddle.pos.x = this.config.canvasWidth / 2 - this.paddle.width / 2;
        }
        this.updateState();
    }

    private nextLevel() {
        this.state.level++;
        this.stats.maxLevel = Math.max(this.stats.maxLevel, this.state.level);
        this.checkAchievements();
        this.initLevel(this.state.level);
        // Reset ball
        this.ball.pos = { x: this.config.canvasWidth / 2, y: this.config.canvasHeight - 50 };
        this.ball.vel = { x: 4 + this.state.level, y: -(4 + this.state.level) }; // Increase speed
        this.updateState();
    }

    private draw() {
        // Clear
        this.ctx.clearRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);

        // Draw Paddle
        this.ctx.fillStyle = this.config.theme === 'dark' ? '#00f3ff' : '#333';
        if (this.config.theme === 'dark') {
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#00f3ff';
        }
        this.ctx.fillRect(this.paddle.pos.x, this.paddle.pos.y, this.paddle.width, this.paddle.height);
        this.ctx.shadowBlur = 0;

        // Draw Ball
        this.ctx.beginPath();
        this.ctx.arc(this.ball.pos.x, this.ball.pos.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#fff';
        this.ctx.fill();
        this.ctx.closePath();

        // Draw Bricks
        this.bricks.forEach(b => {
            this.ctx.fillStyle = b.color;
            if (this.config.theme === 'dark') {
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = b.color;
            }
            this.ctx.fillRect(b.position.x, b.position.y, b.width, b.height);
            this.ctx.shadowBlur = 0;
        });
    }

    private loop = () => {
        if (!this.state.isPlaying && !this.state.isPaused) return;

        this.update();
        this.draw();

        if (this.state.isPlaying && !this.state.isPaused) {
            this.animationId = requestAnimationFrame(this.loop);
        }
    };

    private checkAchievements() {
        let newUnlock = false;
        ACHIEVEMENTS.forEach(ach => {
            if (!this.state.achievements.includes(ach.id) && ach.condition(this.stats)) {
                this.state.achievements.push(ach.id);
                newUnlock = true;
                // Save immediately
                localStorage.setItem('brickbreaker_achievements', JSON.stringify(this.state.achievements));
            }
        });
        if (newUnlock) {
            // Could trigger a toast here via state
        }
    }

    private updateState() {
        this.onStateChange({ ...this.state });
    }

    public destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}
