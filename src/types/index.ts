export type GameMode = 'math' | 'english' | null;
export type ScreenState = 'intro' | 'welcome' | 'selection' | 'game';
export type WSStatus = 'connecting' | 'connected' | 'disconnected';

export interface GameState {
  score: number;
  lives: number;
  gameMode: GameMode;
  isTransitioning: boolean;
}

export interface EnglishGameState extends GameState {
  currentWord: string;
  hiddenIndex: number;
  userGuess: string;
  isCorrect: boolean | null;
}

export interface MathGameState extends GameState {
  question: string;
  answer: number;
  userAnswer: string;
  isCorrect: boolean | null;
}