import React, { useState, useEffect } from 'react';
import { Cloud } from 'lucide-react';
import { words } from './words';

function App() {
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [hiddenIndex, setHiddenIndex] = useState(-1);
  const [userGuess, setUserGuess] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showIntro, setShowIntro] = useState(true);

  const pickNewWord = () => {
    const word = words[Math.floor(Math.random() * words.length)];
    const index = Math.floor(Math.random() * word.length);
    setCurrentWord(word);
    setHiddenIndex(index);
    setUserGuess('');
    setIsCorrect(null);
  };

  useEffect(() => {
    pickNewWord();
  }, []);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      if (!/^[A-Z]$/.test(key) || !currentWord) return;
      console.log("pressed key:", key);
      setUserGuess(key);
      const correct = key === currentWord[hiddenIndex];
      setIsCorrect(correct);

      if (correct) {
        setScore(prev => prev + 1);
        setTimeout(pickNewWord, 1500);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentWord, hiddenIndex]);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 5000); // 5 seconds for the intro
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden relative bg-gradient-to-b from-sky-300 to-sky-500">
      {showIntro ? (
        <video autoPlay muted className="absolute inset-0 w-full h-full object-cover">
          <source src="/path/to/company-logo.mp4" type="video/mp4" />
        </video>
      ) : (
        <>
          {/* Sunburst Background */}
          <div className="sunburst absolute inset-0" />
          {/* Rest of the game code */}
        </>
      )}
    </div>
  );
}

export default App;