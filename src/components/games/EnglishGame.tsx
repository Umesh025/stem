import React, { useEffect, useState } from 'react';
import type { EnglishGameState } from '../../types';
import { soundManager } from '../../sounds/sound';
import Confetti from 'react-confetti';

const importLetter = (letter: string) => {
  try {
    return new URL(`../../media/letters/${letter.toUpperCase()}.svg`, import.meta.url).href;
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
interface EnglishGameProps {
  gameState: EnglishGameState;
}

export const EnglishGame: React.FC<EnglishGameProps> = ({ gameState }) => {
  const { currentWord, hiddenIndex, userGuess, isCorrect } = gameState;
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
      <div className="flex gap-4 mb-8">
        {currentWord.split('').map((letter, index) => (
          <div
            key={index}
            className={`${index === hiddenIndex ? 'missing-letter' : ''} ${
              index === hiddenIndex && isCorrect !== null
                ? isCorrect
                  ? 'correct-guess'
                  : 'wrong-guess'
                : ''
            }`}
          >
            {index === hiddenIndex ? (
              isCorrect === null ? <img 
              src={importQues() || undefined} 
              alt={letter}
              className="w-60 h-60 animate-bounce-subtle"
            /> : (
                <img 
                  src={importLetter(userGuess) || undefined} 
                  alt={userGuess}
                  className="w-60 h-60 animate-bounce"
                />
              )
            ) : (
              <img 
                src={importLetter(letter) || undefined} 
                alt={letter}
                className="w-60 h-60 animate-bounce-subtle"
              />
            )}
          </div>
        ))}
      </div>
      
      <div className="bg-white/30 backdrop-blur-sm p-4 rounded-xl text-center">
        <p className="text-lg font-semibold text-blue-900">
          Jump on any letter to guess the missing character!
        </p>
        {isCorrect === false && (
          <p className="text-red-700 mt-2">Try again!</p>
        )}
      </div>
    </div>
  );
};

export default EnglishGame;
