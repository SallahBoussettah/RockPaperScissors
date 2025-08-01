
import React from 'react';
import { GameLogEntry, Winner } from '../types';
import { GESTURE_EMOJIS } from '../constants';

interface GameLogProps {
  log: GameLogEntry[];
}

const getWinnerInfo = (winner: Winner): { text: string; color: string } => {
  switch (winner) {
    case Winner.User:
      return { text: 'You Won', color: 'text-green-400' };
    case Winner.Computer:
      return { text: 'You Lost', color: 'text-red-400' };
    case Winner.Tie:
      return { text: 'Tie', color: 'text-yellow-400' };
    default:
        return { text: '', color: ''};
  }
};

const GameLog: React.FC<GameLogProps> = ({ log }) => {
  return (
    <div className="w-full bg-gray-800 rounded-lg p-4 shadow-inner">
      <h2 className="text-xl font-bold text-white mb-4 text-center border-b border-gray-700 pb-2">Game Log</h2>
      <div className="h-48 overflow-y-auto space-y-3 pr-2">
        {log.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Play a game to see the log!</p>
          </div>
        ) : (
          [...log].reverse().map((entry) => {
            const winnerInfo = getWinnerInfo(entry.winner);
            return (
              <div key={entry.id} className="bg-gray-700/50 rounded-md p-3 flex justify-between items-center animate-fade-in">
                <div className="flex items-center space-x-4">
                  <span className="text-2xl" title={`You chose ${entry.userChoice}`}>{GESTURE_EMOJIS[entry.userChoice]}</span>
                  <span className="text-gray-400 text-sm">vs</span>
                  <span className="text-2xl" title={`Computer chose ${entry.computerChoice}`}>{GESTURE_EMOJIS[entry.computerChoice]}</span>
                </div>
                <p className={`font-semibold text-sm ${winnerInfo.color}`}>{winnerInfo.text}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GameLog;
