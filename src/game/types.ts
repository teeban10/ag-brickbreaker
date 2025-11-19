export interface Vector2D {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

export interface GameConfig {
    canvasWidth: number;
    canvasHeight: number;
    theme: 'light' | 'dark';
}

export interface GameState {
    score: number;
    lives: number;
    level: number;
    isPlaying: boolean;
    isGameOver: boolean;
    isPaused: boolean;
    achievements: string[]; // IDs of unlocked achievements
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    condition: (stats: GameStats) => boolean;
}

export interface GameStats {
    bricksBroken: number;
    totalScore: number;
    maxLevel: number;
}

export type BrickType = 'normal' | 'hard' | 'unbreakable' | 'explosive';

export interface BrickData {
    id: string;
    position: Vector2D;
    width: number;
    height: number;
    type: BrickType;
    health: number;
    color: string;
    value: number;
}
