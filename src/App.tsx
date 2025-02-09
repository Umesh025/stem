import React, { useState, useEffect, useCallback } from 'react';
import { Cloud } from 'lucide-react';

// Types
import { 
  GameMode, 
  ScreenState, 
  EnglishGameState, 
  MathGameState 
} from './types';

// Components
import { EnglishGame } from './components/games/EnglishGame';
import { MathGame } from './components/games/MathGame';
import { GameHeader } from './components/layout/GameHeader';

// Utils and Hooks
import { generateMathProblem } from './utils/gameLogic';
import { GAME_CONSTANTS, words } from './utils/constants';
import { useWebSocket } from './hooks/useWebSocket';

function App() {
  // Screen Management
  const [screenState, setScreenState] = useState<ScreenState>('intro');
  
  // Ensure we start with intro on mount
  useEffect(() => {
    setScreenState('intro');
    console.log('App mounted, setting initial screen state to intro');
  }, []);
  
  // Game States
  const [englishState, setEnglishState] = useState<EnglishGameState>({
    score: 0,
    lives: GAME_CONSTANTS.MAX_LIVES,
    currentWord: '',
    hiddenIndex: -1,
    userGuess: '',
    isCorrect: null,
    gameMode: 'english',
    isTransitioning: false
  });

  const [mathState, setMathState] = useState<MathGameState>({
    score: 0,
    lives: GAME_CONSTANTS.MAX_LIVES,
    question: '',
    answer: 0,
    userAnswer: '',
    isCorrect: null,
    gameMode: 'math',
    isTransitioning: false
  });

  const [activeMode, setActiveMode] = useState<GameMode>(null);

  // Game Logic
  const pickNewWord = useCallback(() => {
    const word = words[Math.floor(Math.random() * words.length)];
    const index = Math.floor(Math.random() * word.length);
    
    setEnglishState(prev => ({
      ...prev,
      currentWord: word,
      hiddenIndex: index,
      userGuess: '',
      isCorrect: null,
      isTransitioning: false
    }));
  }, []);

  const generateNewMathProblem = useCallback(() => {
    const { question, answer } = generateMathProblem();
    setMathState(prev => ({
      ...prev,
      question,
      answer,
      userAnswer: '',
      isCorrect: null,
      isTransitioning: false
    }));
  }, []);

  const resetGame = useCallback(() => {
    setEnglishState(prev => ({
      ...prev,
      score: 0,
      lives: GAME_CONSTANTS.MAX_LIVES,
      currentWord: '',
      hiddenIndex: -1,
      userGuess: '',
      isCorrect: null,
      isTransitioning: false
    }));

    setMathState(prev => ({
      ...prev,
      score: 0,
      lives: GAME_CONSTANTS.MAX_LIVES,
      question: '',
      answer: 0,
      userAnswer: '',
      isCorrect: null,
      isTransitioning: false
    }));

    setActiveMode(null);
  }, []);

  const handleExit = useCallback(() => {
    setScreenState('selection');
    resetGame();
  }, [resetGame]);

  const processEnglishGuess = useCallback((guess: string) => {
    setEnglishState(prev => {
      const correctLetter = prev.currentWord[prev.hiddenIndex].toUpperCase();
      const isCorrect = guess === correctLetter;

      const newState = {
        ...prev,
        userGuess: guess,
        isCorrect,
        isTransitioning: isCorrect
      };

      if (isCorrect) {
        newState.score = prev.score + 1;
        setTimeout(pickNewWord, GAME_CONSTANTS.TRANSITION_DELAY);
      } else {
        newState.lives = prev.lives - 1;
        if (prev.lives <= 1) {
          setTimeout(() => {
            setScreenState('selection');
            resetGame();
          }, GAME_CONSTANTS.TRANSITION_DELAY);
        }
      }

      return newState;
    });
  }, [pickNewWord, resetGame]);

  const processMathGuess = useCallback((guess: string) => {
    setMathState(prev => {
      const isCorrect = parseInt(guess) === prev.answer;

      const newState = {
        ...prev,
        userAnswer: guess,
        isCorrect,
        isTransitioning: isCorrect
      };

      if (isCorrect) {
        newState.score = prev.score + 1;
        setTimeout(generateNewMathProblem, GAME_CONSTANTS.TRANSITION_DELAY);
      } else {
        newState.lives = prev.lives - 1;
        if (prev.lives <= 1) {
          setTimeout(() => {
            setScreenState('selection');
            resetGame();
          }, GAME_CONSTANTS.TRANSITION_DELAY);
        }
      }

      return newState;
    });
  }, [generateNewMathProblem, resetGame]);

  // WebSocket message handler
  const handleWebSocketMessage = useCallback((event: MessageEvent) => {
    const key = event.data;

    // Screen transitions
    if (key === '*') {
      setScreenState('selection');
      return;
    }

    // Game mode selection - only process if we're not already in a game
    if (screenState !== 'game') {
      if (key === 'Z' || key === 'z') {
        setScreenState('game');
        setActiveMode('english');
        pickNewWord();
        return;
      }

      if (key === '9') {
        setScreenState('game');
        setActiveMode('math');
        generateNewMathProblem();
        return;
      }
    }

    // Handle exit command
    if (key === '!') {
      handleExit();
      return;
    }

    // Game input handling
    const currentState = activeMode === 'english' ? englishState : mathState;
    if (!activeMode || currentState.isTransitioning) {
      return;
    }

    if (activeMode === 'english') {
      const upperKey = key.toUpperCase();
      if (/^[A-Z]$/.test(upperKey)) {
        processEnglishGuess(upperKey);
      }
    } else if (activeMode === 'math') {
      if (/^[0-9]$/.test(key)) {
        processMathGuess(key);
      }
    }
  }, [
    activeMode,
    englishState,
    mathState,
    handleExit,
    pickNewWord,
    generateNewMathProblem,
    processEnglishGuess,
    processMathGuess
  ]);

  // Use custom WebSocket hook
  const { status: wsStatus, addMessageHandler, removeMessageHandler } = useWebSocket();

  // Add message handler on mount
  useEffect(() => {
    addMessageHandler(handleWebSocketMessage);
    return () => removeMessageHandler(handleWebSocketMessage);
  }, [handleWebSocketMessage, addMessageHandler, removeMessageHandler]);

  // Screen transition effects
  useEffect(() => {
    console.log('Current screen state:', screenState);
    if (screenState === 'intro') {
      // Don't automatically transition with timer
      // Let video onEnded handle the transition
      console.log('Playing intro video');
    }
  }, [screenState]);

  // Handle video transitions
  const handleIntroVideoEnd = () => {
    console.log('Intro video ended, transitioning to welcome');
    setScreenState('welcome');
  };

  // Render background elements
  const renderBackground = () => (
    <>
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
    </>
  );

  // Connection status component
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
          key="intro-video"
          autoPlay 
          muted 
          playsInline
          onLoadStart={() => console.log("Logo video loading started")}
          onLoadedData={() => console.log("Logo video loaded")}
          onError={(e) => console.error("Logo video error:", e)}
          onEnded={handleIntroVideoEnd}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/Logo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
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
          {renderBackground()}
          
          <div className="relative z-10 flex flex-col items-center">
            <GameHeader 
              gameState={activeMode === 'english' ? englishState : mathState}
              onExit={handleExit}
            />

            <div className="mt-20">
              {activeMode === 'english' && <EnglishGame gameState={englishState} />}
              {activeMode === 'math' && <MathGame gameState={mathState} />}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;