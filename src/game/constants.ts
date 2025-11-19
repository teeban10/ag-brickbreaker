import type { Achievement } from './types';

export const ACHIEVEMENTS: Achievement[] = [
    { id: 'first_blood', title: 'First Blood', description: 'Break your first brick', condition: (s) => s.bricksBroken >= 1 },
    { id: 'novice', title: 'Novice Breaker', description: 'Break 10 bricks', condition: (s) => s.bricksBroken >= 10 },
    { id: 'master', title: 'Brick Master', description: 'Break 100 bricks', condition: (s) => s.bricksBroken >= 100 },
    { id: 'survivor', title: 'Survivor', description: 'Reach Level 3', condition: (s) => s.maxLevel >= 3 },
    { id: 'scorer', title: 'High Scorer', description: 'Score 1000 points', condition: (s) => s.totalScore >= 1000 },
];
