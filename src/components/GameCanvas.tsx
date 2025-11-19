import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import type { GameState } from '../game/types';
import { AchievementsModal } from './AchievementsModal';

const GameCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<GameEngine | null>(null);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [highScore, setHighScore] = useState(0);
    const [showAchievements, setShowAchievements] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('brickbreaker_highscore');
        if (stored) setHighScore(parseInt(stored));
    }, []);

    useEffect(() => {
        if (gameState?.score && gameState.score > highScore) {
            setHighScore(gameState.score);
            localStorage.setItem('brickbreaker_highscore', gameState.score.toString());
        }
    }, [gameState?.score, highScore]);

    useEffect(() => {
        if (engineRef.current) {
            engineRef.current.updateConfig({ theme });
        }
    }, [theme]);

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        // Set canvas size to window size or fixed aspect ratio
        canvas.width = 800;
        canvas.height = 600;

        const engine = new GameEngine(
            canvas, 
            { canvasWidth: canvas.width, canvasHeight: canvas.height, theme },
            (newState) => setGameState(newState)
        );
        
        engineRef.current = engine;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') engine.setPaddleDirection('left');
            if (e.key === 'ArrowRight') engine.setPaddleDirection('right');
            if (e.key === ' ') engine.start();
            if (e.key === 'p') engine.pause();
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') engine.setPaddleDirection('stop');
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            engine.destroy();
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
            {/* HUD */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-[800px] flex justify-between items-center px-6 py-3 glass-panel z-10">
                <div className="text-neon-blue font-bold text-xl">SCORE: {gameState?.score || 0}</div>
                <div className="text-yellow-400 font-bold text-xl">HIGH: {highScore}</div>
                <div className="text-white font-bold text-2xl tracking-widest">LEVEL {gameState?.level || 1}</div>
                <div className="text-neon-pink font-bold text-xl">LIVES: {gameState?.lives || 3}</div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setShowAchievements(true)}
                        className="px-3 py-1 bg-white/20 rounded hover:bg-white/30 text-sm font-bold"
                        title="Achievements"
                    >
                        🏆
                    </button>
                    <button 
                        onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
                        className="px-3 py-1 bg-white/20 rounded hover:bg-white/30 text-sm font-bold"
                        title="Toggle Theme"
                    >
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                </div>
            </div>

            {/* Achievements Modal */}
            {showAchievements && (
                <AchievementsModal 
                    unlockedIds={gameState?.achievements || []} 
                    onClose={() => setShowAchievements(false)} 
                />
            )}

            {/* Game Over / Start Overlay */}
            {(!gameState?.isPlaying && !gameState?.isPaused) && (
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <div className="glass-panel p-8 text-center pointer-events-auto">
                        <h1 className="text-5xl font-bold text-neon-blue mb-4">NEON BREAKER</h1>
                        <p className="text-gray-300 mb-6">Press SPACE to Start</p>
                        {gameState?.isGameOver && <p className="text-red-500 text-xl font-bold mb-4">GAME OVER</p>}
                    </div>
                </div>
            )}

             {/* Pause Overlay */}
             {gameState?.isPaused && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/50 backdrop-blur-sm">
                    <h2 className="text-4xl font-bold text-white tracking-widest">PAUSED</h2>
                </div>
            )}

            <canvas 
                ref={canvasRef} 
                className="border-4 border-gray-800 rounded-lg shadow-2xl box-neon-blue bg-gray-950"
            />
            
            <div className="mt-4 text-gray-500 text-sm">
                Use <span className="text-white font-bold">← →</span> to move, <span className="text-white font-bold">SPACE</span> to launch/start, <span className="text-white font-bold">P</span> to pause
            </div>
        </div>
    );
};

export default GameCanvas;
