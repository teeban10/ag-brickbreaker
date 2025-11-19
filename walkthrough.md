# Brick Breaker Game Walkthrough

I have built a fully functional Brick Breaker game using **Vite + React + TypeScript**. The game features a custom game engine running on an HTML5 Canvas for high performance, wrapped in a modern React UI.

## Features

### 1. Core Gameplay
- **Paddle & Ball Physics**: Smooth movement and collision detection.
- **Brick Breaking**: Bricks break on impact, increasing your score.
- **Level Progression**: Clearing all bricks advances you to the next level, where the ball moves faster.
- **Lives System**: You start with 3 lives. Losing the ball costs a life.

### 2. Modern Retro UI
- **Neon Aesthetic**: The default "Dark Mode" features neon blue/pink glows and a cyberpunk feel.
- **Glassmorphism**: The HUD and overlays use a translucent glass effect.
- **Theme Toggle**: Switch between **Dark (Neon)** and **Light (Pastel)** modes using the toggle button in the HUD.

### 3. Persistence & Achievements
- **High Score**: Your highest score is saved to your browser's local storage and persists across sessions.
- **Achievements**: Unlock achievements by playing!
    - 🩸 **First Blood**: Break 1 brick.
    - 🧱 **Novice Breaker**: Break 10 bricks.
    - 🏗️ **Brick Master**: Break 100 bricks.
    - 🏃 **Survivor**: Reach Level 3.
    - 💯 **High Scorer**: Score 1000 points.
- **Achievement Modal**: Click the 🏆 trophy icon to view your unlocked achievements.

## Controls
- **Left / Right Arrows**: Move Paddle
- **Space**: Start Game / Launch Ball
- **P**: Pause Game

## Tech Stack
- **Vite**: Fast build tool and dev server.
- **React**: UI component management.
- **TypeScript**: Type safety for game logic.
- **TailwindCSS**: Utility-first styling for the UI.
