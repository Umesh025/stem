import React, { useEffect, useState } from 'react';
import type { MathGameState } from '../../types';
import { soundManager } from '../../sounds/sound';
import Confetti from 'react-confetti';

const importNumeral = (numeral: string) => {
  try {
    return new URL(`../../media/numbers/${numeral}.svg`, import.meta.url).href;
  } catch {
    return null;
  }
};

const importQues = () =>{
  try {
    return new URL(`../../media/placeholder/ques.svg`, import.meta.url).href;
  }
  catch{
    return null;
  }
}
interface MathGameProps {
  gameState: MathGameState;
}

export const MathGame: React.FC<MathGameProps> = ({ gameState }) => {
  const { question, userAnswer, isCorrect } = gameState;
  const parts = question.split(' ');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isCorrect !== null) {
      soundManager.play(isCorrect ? 'correct' : 'wrong');
      if (isCorrect) {
        setShowConfetti(false);
        setTimeout(() => setShowConfetti(true), 0);
        const timer = setTimeout(() => setShowConfetti(false), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [isCorrect]);

  return (
    <div className="flex flex-col items-center gap-8 relative">
      {showConfetti && (
        <Confetti
          width={600}
          height={600}
          recycle={false}
          numberOfPieces={500}
          style={{
            position: 'absolute',
            top: '-300px',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none'
          }}
          gravity={0.3}
          tweenDuration={1000}
          initialVelocityY={10}
          confettiSource={{
            x: 300,
            y: 100,
            w: 0,
            h: 0
          }}
        />
      )}
      <div className="flex gap-4 mb-8 items-center">
        {/* First number */}
        <div>
          <img 
            src={importNumeral(parts[0]) || undefined}
            alt={parts[0]}
            className="w-60 h-60 animate-bounce-subtle"
          />
        </div>

        {/* Operator */}
        <div className="bg-blue-300 w-20 h-20 flex items-center justify-center">
          <span className="animate-bounce-subtle">{parts[1]}</span>
        </div>

        {/* Second number */}
        <div>
          <img 
            src={importNumeral(parts[2]) || undefined}
            alt={parts[2]}
            className="w-60 h-60 animate-bounce-subtle"
          />
        </div>

        {/* Equals sign */}
        <div className="bg-blue-300 w-20 h-20 flex items-center justify-center">
          <span className="animate-bounce-subtle">=</span>
        </div>

        {/* Answer box */}
        <div 
          className={`missing-letter ${
            isCorrect !== null
              ? isCorrect
                ? 'correct-guess'
                : 'wrong-guess'
              : ''
          }`}
        >
          {isCorrect === null ? <img 
              src={importQues() || undefined} 
              // alt={numeral}
              className="w-60 h-60 animate-bounce-subtle"
            /> : (
            <img 
              src={importNumeral(userAnswer) || undefined}
              alt={userAnswer}
              className="w-60 h-60 animate-bounce"
            />
          )}
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