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
  const [showWelcome, setShowWelcome] = useState(false);
  const [showSelection, setShowSelection] = useState(false);
  const [gameMode, setGameMode] = useState<'math' | 'english' | null>(null);

  const pickNewWord = () => {
    const word = words[Math.floor(Math.random() * words.length)];
    const index = Math.floor(Math.random() * word.length);
    setCurrentWord(word);
    setHiddenIndex(index);
    setUserGuess('');
    setIsCorrect(null);
  };

  useEffect(() => {
    if (!showIntro) return; // Only run timer if we're showing the intro

    console.log("Logo timeout started");
    const timer = setTimeout(() => {
      console.log("Logo timeout finished - transitioning to Welcome");
      setShowIntro(false);
      setShowWelcome(true);
    }, 14000);
    return () => {
      console.log("Logo timeout cleanup");
      clearTimeout(timer);
    }
  }, [showIntro]); // Add showIntro to dependencies

  useEffect(() => {
    console.log("State changed:", {
      showIntro,
      showWelcome,
      showSelection
    });
  }, [showIntro, showWelcome, showSelection]);

  useEffect(() => {
    const handleWelcomeKey = (event: KeyboardEvent) => {
      if (!showWelcome) return;
      
      if (event.key.toUpperCase() === 'S' && !showSelection) {
        setShowWelcome(false);
        setShowSelection(true);
      }
    };

    window.addEventListener('keydown', handleWelcomeKey);
    return () => window.removeEventListener('keydown', handleWelcomeKey);
  }, [showWelcome, showSelection]);

  useEffect(() => {
    const handleSelection = (event: KeyboardEvent) => {
      if (!showSelection) return;
      
      const key = event.key.toUpperCase();
      if (key === '9') {
        return; // Math mode is disabled for now
      }
      if (key === 'Z' || key === 'z') {
        setGameMode('english');
        setShowSelection(false);
        pickNewWord();
      }
    };

    window.addEventListener('keydown', handleSelection);
    return () => window.removeEventListener('keydown', handleSelection);
  }, [showSelection]);

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

  return (
    <div className="min-h-screen overflow-hidden relative bg-gradient-to-b from-sky-300 to-sky-500">
      {showIntro ? (
        <video 
          autoPlay 
          muted 
          onEnded={() => {
            console.log("Logo video ended");
            setShowIntro(false);
            setShowWelcome(true);
          }}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/Logo.mp4" type="video/mp4" />
        </video>
      ) : showWelcome ? (
        <video 
          key={Date.now()}
          autoPlay 
          muted 
          playsInline
          onLoadStart={() => console.log("Welcome video loading started")}
          onLoadedData={() => console.log("Welcome video loaded")}
          onError={(e) => console.error("Welcome video error:", e)}
          onEnded={() => console.log("Welcome video ended")}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/Welcome.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : showSelection ? (
        <video autoPlay muted className="absolute inset-0 w-full h-full object-cover">
          <source src="/Select.mp4" type="video/mp4" />
        </video>
      ) : (
        <>
          {/* Sunburst Background */}
          <div className="sunburst absolute inset-0" />
          
          {/* Moving Clouds */}
          <div className="clouds-container absolute inset-0">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className={`cloud absolute ${i % 2 === 0 ? 'cloud-slow' : 'cloud-fast'}`}
                style={{ 
                  top: `${(i * 15) + 5}%`, 
                  left: `${i * 20}%`,
                  transform: `scale(${0.5 + (i % 3) * 0.5})`
                }}
              >
                <Cloud size={64} className="text-white filter drop-shadow-lg" />
              </div>
            ))}
          </div>

          {/* Game Content */}
          <div className="relative z-10 flex flex-col items-center pt-8">
            {/* Score */}
            <div className="score-box bg-yellow-300 px-6 py-3 rounded-xl shadow-lg mb-8 transform hover:scale-110 transition-transform">
              <span className="text-2xl font-bold">Score: {score}</span>
            </div>

            {/* Word Display */}
            {currentWord && (
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
                      isCorrect === null ? '?' : userGuess
                    ) : (
                      <span className="animate-bounce-subtle">{letter}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Instructions */}
            <div className="bg-white/30 backdrop-blur-sm p-4 rounded-xl text-center">
              <p className="text-lg font-semibold text-blue-900">
                Type any letter to guess the missing character!
              </p>
              {isCorrect === false && (
                <p className="text-red-700 mt-2">
                  Try again!
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;