import React from 'react';
import { ACHIEVEMENTS } from '../game/constants';

interface Props {
    unlockedIds: string[];
    onClose: () => void;
}

export const AchievementsModal: React.FC<Props> = ({ unlockedIds, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-900 border border-neon-blue p-6 rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-neon-blue">ACHIEVEMENTS</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                </div>
                
                <div className="space-y-4">
                    {ACHIEVEMENTS.map(ach => {
                        const isUnlocked = unlockedIds.includes(ach.id);
                        return (
                            <div key={ach.id} className={`p-4 rounded border ${isUnlocked ? 'border-green-500 bg-green-900/20' : 'border-gray-700 bg-gray-800/50'}`}>
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className={`font-bold ${isUnlocked ? 'text-green-400' : 'text-gray-500'}`}>{ach.title}</h3>
                                    {isUnlocked && <span className="text-xs bg-green-500 text-black px-2 py-0.5 rounded">UNLOCKED</span>}
                                </div>
                                <p className="text-sm text-gray-400">{ach.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
