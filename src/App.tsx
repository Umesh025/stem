import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Cloud } from 'lucide-react';
import { words } from './words';

// Types for better organization
type GameMode = 'math' | 'english' | null;
type ScreenState = 'intro' | 'welcome' | 'selection' | 'game';
type WSStatus = 'connecting' | 'connected' | 'disconnected';

type GameState = {
  score: number;
  lives: number;
  currentWord: string;
  hiddenIndex: number;
  userGuess: string;
  isCorrect: boolean | null;
  gameMode: GameMode;
  isTransitioning: boolean;
};

function App() {
  // Screen Management
  const [screenState, setScreenState] = useState<ScreenState>('intro');
  
  // Game State
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    lives: 3,
    currentWord: '',
    hiddenIndex: -1,
    userGuess: '',
    isCorrect: null,
    gameMode: null,
    isTransitioning: false
  });

  // WebSocket State
  const [wsStatus, setWsStatus] = useState<WSStatus>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const gameStateRef = useRef<GameState>(gameState);

  // Keep gameStateRef current
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const pickNewWord = useCallback(() => {
    const word = words[Math.floor(Math.random() * words.length)];
    const index = Math.floor(Math.random() * word.length);
    
    setGameState(prev => ({
      ...prev,
      currentWord: word,
      hiddenIndex: index,
      userGuess: '',
      isCorrect: null,
      isTransitioning: false
    }));
  }, []);

  const processGuess = useCallback((guess: string) => {
    const currentGameState = gameStateRef.current;
    const correctLetter = currentGameState.currentWord[currentGameState.hiddenIndex].toUpperCase();
    const isCorrect = guess === correctLetter;

    setGameState(prev => {
      const newState = {
        ...prev,
        userGuess: guess,
        isCorrect,
        isTransitioning: isCorrect
      };

      if (isCorrect) {
        newState.score = prev.score + 1;
        setTimeout(pickNewWord, 1500);
      } else {
        newState.lives = prev.lives - 1;
        if (prev.lives <= 1) {
          setTimeout(() => {
            setScreenState('selection');
            resetGame();
          }, 1500);
        }
      }

      return newState;
    });
  }, [pickNewWord]);

  // Initialize WebSocket connection once
  useEffect(() => {
    const handleWebSocketMessage = (event: MessageEvent) => {
      const key = event.data;
      const currentState = gameStateRef.current;

      console.log('WebSocket message received:', {
        key,
        gameMode: currentState.gameMode,
        currentWord: currentState.currentWord,
        isTransitioning: currentState.isTransitioning
      });

      // Screen transitions
      if (key === '*') {
        setScreenState('selection');
        return;
      }

      if (key === 'Z' || key === 'z') {
        setScreenState('game');
        setGameState(prev => ({
          ...prev,
          gameMode: 'english'
        }));
        pickNewWord();
        return;
      }

      // Game input handling
      if (currentState.gameMode === 'english' && 
          currentState.currentWord && 
          !currentState.isTransitioning) {
        const upperKey = key.toUpperCase();

        // Handle exit command
        if (key === '!') {
          handleExit();
          return;
        }

        // Handle letter inputs
        if (/^[A-Z]$/.test(upperKey) && currentState.lives > 0) {
          processGuess(upperKey);
        }
      }
    };

    const connectWebSocket = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) return;

      const ws = new WebSocket('ws://localhost:8090');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket Connected');
        setWsStatus('connected');
      };

      ws.onclose = () => {
        console.log('WebSocket Disconnected');
        setWsStatus('disconnected');
      };

      ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
        setWsStatus('disconnected');
      };

      ws.onmessage = handleWebSocketMessage;
    };

    connectWebSocket();

    return () => {
      wsRef.current?.close();
    };
  }, [pickNewWord, processGuess]); 

  const resetGame = useCallback(() => {
    setGameState({
      score: 0,
      lives: 3,
      currentWord: '',
      hiddenIndex: -1,
      userGuess: '',
      isCorrect: null,
      gameMode: null,
      isTransitioning: false
    });
  }, []);

  const handleExit = useCallback(() => {
    setScreenState('selection');
    resetGame();
  }, [resetGame]);

  // Screen transition effect
  useEffect(() => {
    if (screenState === 'intro') {
      const timer = setTimeout(() => {
        setScreenState('welcome');
      }, 14000);
      return () => clearTimeout(timer);
    }
  }, [screenState]);

  // Game initialization effect
  useEffect(() => {
    if (gameState.gameMode === 'english' && !gameState.currentWord) {
      pickNewWord();
    }
  }, [gameState.gameMode, gameState.currentWord, pickNewWord]);

  // Render helpers
  const ConnectionStatus = () => (
    <div className={`
      fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-20
      ${wsStatus === 'connected' ? 'bg-green-500' : 
        wsStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'}
      text-white
    `}>
      {wsStatus}
    </div>
  );

  return (
    <div className="min-h-screen overflow-hidden relative bg-gradient-to-b from-sky-300 to-sky-500">
      <ConnectionStatus />
      
      {screenState === 'intro' && (
        <video 
          autoPlay 
          muted 
          onEnded={() => setScreenState('welcome')}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/Logo.mp4" type="video/mp4" />
        </video>
      )}

      {screenState === 'welcome' && (
        <video 
          autoPlay 
          muted 
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/Welcome.mp4" type="video/mp4" />
        </video>
      )}

      {screenState === 'selection' && (
        <video 
          autoPlay 
          muted 
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/Select.mp4" type="video/mp4" />
        </video>
      )}

      {screenState === 'game' && (
        <>
          <button
            onClick={handleExit}
            className="absolute top-4 left-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-20"
          >
            Finish
          </button>

          <div className="sunburst absolute inset-0" />
          
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

          <div className="relative z-10 flex flex-col items-center pt-8 mt-20">
            <div className="flex gap-4 mb-8">
              <div className="score-box bg-yellow-300 px-6 py-3 rounded-xl shadow-lg transform hover:scale-110 transition-transform">
                <span className="text-2xl font-bold">Score: {gameState.score}</span>
              </div>
              <div className="lives-box bg-red-400 px-6 py-3 rounded-xl shadow-lg">
                <span className="text-2xl font-bold">
                  {[...Array(Math.max(0, gameState.lives))].map((_, i) => (
                    <span key={i} role="img" aria-label="heart">❤️</span>
                  ))}
                </span>
              </div>
            </div>

            {gameState.currentWord && (
              <div className="flex gap-4 mb-8">
                {gameState.currentWord.split('').map((letter, index) => (
                  <div
                    key={index}
                    className={`letter-box ${index === gameState.hiddenIndex ? 'missing-letter' : ''} ${
                      index === gameState.hiddenIndex && gameState.isCorrect !== null
                        ? gameState.isCorrect
                          ? 'correct-guess'
                          : 'wrong-guess'
                        : ''
                    }`}
                  >
                    {index === gameState.hiddenIndex ? (
                      gameState.isCorrect === null ? '?' : gameState.userGuess
                    ) : (
                      <span className="animate-bounce-subtle">{letter}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="bg-white/30 backdrop-blur-sm p-4 rounded-xl text-center">
              <p className="text-lg font-semibold text-blue-900">
                Type any letter to guess the missing character!
              </p>
              {gameState.isCorrect === false && (
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