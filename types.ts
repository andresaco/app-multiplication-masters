
export enum GameMode {
  SEQUENTIAL = 'secuencial',
  JUMPING = 'saltando'
}

export enum GameStatus {
  INTRO = 'intro',
  VOICE_CHECK = 'voice_check',
  PLAYING = 'playing',
  FINISHED = 'finished',
  GALLERY = 'gallery',
  STUDY = 'study'
}

export interface Question {
  factor1: number;
  factor2: number;
  startTime: number;
}

export interface Result {
  factor1: number;
  factor2: number;
  userAnswer: number;
  correctAnswer: number;
  timeTaken: number; // in milliseconds
  isCorrect: boolean;
  points: number;
}

export interface PerformanceRating {
  label: string;
  color: string;
  emoji: string;
}

export interface Medal {
  label: string;
  emoji: string;
  color: string;
  description: string;
}

export interface ModeProgress {
  bestScore: number;
  bestMedalLabel: string;
  bestMedalEmoji: string;
  attempts: number;
}

export interface TableProgress {
  sequential?: ModeProgress;
  jumping?: ModeProgress;
}

export type UserProgress = Record<number, TableProgress>;
