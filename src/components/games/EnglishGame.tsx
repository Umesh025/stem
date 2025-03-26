import React, { useEffect, useState } from 'react';
import type { EnglishGameState } from '../../types';
import { soundManager } from '../../sounds/sound';

interface EnglishGameProps {
  gameState: EnglishGameState;
}

export const EnglishGame: React.FC<EnglishGameProps> = ({ gameState }) => {
  const { currentWord, hiddenIndex, userGuess, isCorrect } = gameState;
  const [images, setImages] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const loadImages = async () => {
      const imagePromises = currentWord.split('').map(async (letter) => {
        const image = await import(`../../letters/${letter}.png`);
        return { [letter]: image.default }; // Use image.default for default export
      });
      const loadedImages = await Promise.all(imagePromises);
      const imagesObject = Object.assign({}, ...loadedImages);
      setImages(imagesObject);
    };

    loadImages();
  }, [currentWord]);

  useEffect(() => {
    if (isCorrect !== null) {
      soundManager.play(isCorrect ? 'correct' : 'wrong');
    }
  }, [isCorrect]);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex gap-4 mb-8">
        {currentWord.split('').map((letter, index) => (
          <div key={index} className="letter-box">
            {index === hiddenIndex ? (
              isCorrect === null ? (
                <img src={images['?']} alt="?" className="letter-image" />
              ) : (
                <img src={images[userGuess]} alt={userGuess} className="letter-image" />
              )
            ) : (
              <img src={images[letter]} alt={letter} className="letter-image" />
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