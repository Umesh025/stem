import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Cloud } from 'lucide-react';
import { words } from './words';

function App() {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [currentWord, setCurrentWord] = useState('');
  const [hiddenIndex, setHiddenIndex] = useState(-1);
  const [userGuess, setUserGuess] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showSelection, setShowSelection] = useState(false);
  const [gameMode, setGameMode] = useState<'math' | 'english' | null>(null);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000;
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Add a ref to track the current game mode
  const gameModeRef = useRef(gameMode);
  
  // Update ref when gameMode changes
  useEffect(() => {
    gameModeRef.current = gameMode;
    console.log('Game mode updated:', gameMode);
  }, [gameMode]);

  const pickNewWord = useCallback(() => {
    if (gameMode !== 'english') {
      console.log('Warning: Attempting to pick word without game mode set');
      return;
    }
    // setGameMode('english');
    const word = words[Math.floor(Math.random() * words.length)];
    const index = Math.floor(Math.random() * word.length);
    console.log('Picking new word:', { 
      word, 
      hiddenIndex: index,
      currentGameMode: gameMode
    });
    
    setCurrentWord(word);
    setHiddenIndex(index);
    setUserGuess('');
    setIsCorrect(null);
    setIsTransitioning(false);
  }, [gameMode]);

  const resetGame = useCallback(() => {
    setScore(0);
    setLives(3);
    setCurrentWord('');
    setHiddenIndex(-1);
    setUserGuess('');
    setIsCorrect(null);
  }, []);

  const handleExit = useCallback(() => {
    setShowSelection(true);
    setGameMode(null);
    resetGame();
  }, [resetGame]);

  useEffect(() => {
    if (!showIntro) return;

    const timer = setTimeout(() => {
      setShowIntro(false);
      setShowWelcome(true);
    }, 14000);
    return () => clearTimeout(timer);
  }, [showIntro]);

  useEffect(() => {
    let ws: WebSocket | null = null;

    const connectWebSocket = () => {
      ws = new WebSocket('ws://localhost:8090');

      ws.onopen = () => {
        console.log('WebSocket Connected');
        setWsStatus('connected');
      };

      ws.onmessage = (event) => {
        const key = event.data;
        console.log('WebSocket received:', {
          data: key,
          type: typeof key,
          currentScreen: {
            showWelcome,
            showSelection,
            showIntro,
            gameMode: gameModeRef.current
          }
        });

        // Handle '*' for screen transition
        if (key === '*') {
          console.log('Received * - Transitioning to selection screen');
          setShowIntro(false);
          setShowWelcome(false);
          setShowSelection(true);
          return;
        }

        // Handle 'Z' for starting English game
        if (key === 'Z' || key === 'z') {
          console.log('Starting English game');
          setShowIntro(false);
          setShowWelcome(false);
          setShowSelection(false);
          setGameMode('english');
          return;
        }

        // Handle game inputs
        if (gameModeRef.current === 'english' && currentWord && !isTransitioning) {
          console.log('Processing game input with current state:', {
            gameMode: gameModeRef.current,
            currentWord,
            hiddenIndex,
            lives
          });
          const upperKey = key.toUpperCase();
          
          // Handle exit command
          if (key === '!') {
            handleExit();
            return;
          }

          // Handle letter inputs
          if (/^[A-Z]$/.test(upperKey) && lives > 0) {
            console.log('=== Debug Info ===');
            console.log('Current word:', currentWord);
            console.log('Hidden index:', hiddenIndex);
            console.log('Hidden letter:', currentWord[hiddenIndex]);
            console.log('User input:', upperKey);
            console.log('Current game mode:', gameModeRef.current);
            
            const correctLetter = currentWord[hiddenIndex].toUpperCase();
            const correct = upperKey === correctLetter;
            
            setUserGuess(upperKey);
            setIsCorrect(correct);

            if (correct) {
              console.log('✅ CORRECT GUESS!');
              setScore(prev => prev + 1);
              setIsTransitioning(true);
              setTimeout(pickNewWord, 1500);
            } else {
              console.log('❌ WRONG GUESS!');
              setLives(prev => {
                const newLives = prev - 1;
                if (newLives <= 0) {
                  console.log('Game Over - Transitioning to selection screen');
                  setTimeout(() => {
                    setShowSelection(true);
                    setGameMode(null);
                    resetGame();
                  }, 1500);
                }
                return newLives;
              });
            }
          }
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
        setWsStatus('disconnected');
      };
  
      ws.onclose = () => {
        console.log('WebSocket Disconnected');
        setWsStatus('disconnected');
      };
    };

    connectWebSocket();
  
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [currentWord, lives, isTransitioning, handleExit, pickNewWord]); // Add necessary dependencies

  // Modify the game mode effect to be more robust
  useEffect(() => {
    if (gameMode === 'english') {
      console.log('Game mode changed to English - initializing game');
      Promise.all([
        // Update all states in parallel
        setShowIntro(false),
        setShowWelcome(false),
        setShowSelection(false)
      ]).then(() => {
        console.log('Screen states updated, initializing game with mode:', gameMode);
        resetGame();
        pickNewWord();
      });
    }
  }, [gameMode, resetGame, pickNewWord]);

  // Connection status display component
  const ConnectionStatus = () => (
    <div className={`
      fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-20
      ${wsStatus === 'connected' ? 'bg-green-500' : 
        wsStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'}
      text-white
    `}>
      {wsStatus === 'connected' ? 'Connected' :
       wsStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
    </div>
  );

  return (
   

  
    <div className="min-h-screen overflow-hidden relative bg-gradient-to-b from-sky-300 to-sky-500">
       <ConnectionStatus />
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
          <button
            onClick={handleExit}
            className="absolute top-4 left-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-20"
          >
            Finish
          </button>

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
          <div className="relative z-10 flex flex-col items-center pt-8 mt-20">
            {/* Score and Lives */}
            <div className="flex gap-4 mb-8">
              <div className="score-box bg-yellow-300 px-6 py-3 rounded-xl shadow-lg transform hover:scale-110 transition-transform">
                <span className="text-2xl font-bold">Score: {score}</span>
              </div>
              <div className="lives-box bg-red-400 px-6 py-3 rounded-xl shadow-lg">
                <span className="text-2xl font-bold">
                  {[...Array(Math.max(0, lives))].map((_, i) => (
                    <span key={i} role="img" aria-label="heart">❤️</span>
                  ))}
                </span>
              </div>
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