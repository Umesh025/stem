import React, { useEffect } from 'react';
import type { EnglishGameState } from '../../types';
import { soundManager } from '../../sounds/sound';

const importLetter = (letter: string) => {
  try {
    return new URL(`../../media/${letter.toUpperCase()}.svg`, import.meta.url).href;
  } catch {
    return null;
  }
};

interface EnglishGameProps {
  gameState: EnglishGameState;
}

export const EnglishGame: React.FC<EnglishGameProps> = ({ gameState }) => {
  const { currentWord, hiddenIndex, userGuess, isCorrect } = gameState;

  useEffect(() => {
    if (isCorrect !== null) {
      soundManager.play(isCorrect ? 'correct' : 'wrong');
    }
  }, [isCorrect]);


  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex gap-4 mb-8">
        {currentWord.split('').map((letter, index) => (
          <div
            key={index}
            className={`letter-box ${index === hiddenIndex ? 'missing-letter' : ''} ${
              index === hiddenIndex && isCorrect !== null
                ? isCorrect
                  ? 'correct-guess'
                  : 'wrong-guess'
                : ''
            }`}
          >
            {index === hiddenIndex ? (
              isCorrect === null ? '?' : (
                <img 
                  src={importLetter(userGuess) || undefined} 
                  alt={userGuess}
                  className="w-40 h-40 animate-bounce"
                />
              )
            ) : (
              <img 
                src={importLetter(letter) || undefined} 
                alt={letter}
                className="w-40 h-40 animate-bounce-subtle"
              />
            )}
          </div>
        ))}
      </div>
      
      <div className="bg-white/30 backdrop-blur-sm p-4 rounded-xl text-center">
        <p className="text-lg font-semibold text-blue-900">
          Type any letter to guess the missing character!
        </p>
        {isCorrect === false && (
          <p className="text-red-700 mt-2">Try again!</p>
        )}
      </div>
    </div>
  );
};

export default EnglishGame;
