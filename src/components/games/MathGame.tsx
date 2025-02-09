import React from 'react';
import type { MathGameState } from '../../types';

interface MathGameProps {
  gameState: MathGameState;
}

export const MathGame: React.FC<MathGameProps> = ({ gameState }) => {
  const { question, userAnswer, isCorrect } = gameState;
  const parts = question.split(' ');
  return (
    <div className="flex flex-col items-center gap-8">
    <div className="flex gap-4 mb-8 items-center">
      {/* First number */}
      <div className="letter-box">
        <span className="animate-bounce-subtle">{parts[0]}</span>
      </div>

      {/* Operator */}
      <div className="letter-box bg-blue-100">
        <span className="animate-bounce-subtle">{parts[1]}</span>
      </div>

      {/* Second number */}
      <div className="letter-box">
        <span className="animate-bounce-subtle">{parts[2]}</span>
      </div>

      {/* Equals sign */}
      <div className="letter-box bg-blue-100">
        <span className="animate-bounce-subtle">=</span>
      </div>

      {/* Answer box */}
      <div 
        className={`letter-box missing-letter ${
          isCorrect !== null
            ? isCorrect
              ? 'correct-guess'
              : 'wrong-guess'
            : ''
        }`}
      >
        {userAnswer || '?'}
      </div>
    </div>
    
    <div className="bg-white/30 backdrop-blur-sm p-4 rounded-xl text-center">
      <p className="text-lg font-semibold text-blue-900">
        Type a number to solve the math problem!
      </p>
      {isCorrect === false && (
        <p className="text-red-700 mt-2">Try again!</p>
      )}
    </div>
  </div>
  );
};
export default MathGame;