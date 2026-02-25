
import { PerformanceRating, Medal, UserProgress, TableProgress, GameMode } from './types';

export const TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const STORAGE_KEY = 'math_masters_v2_progress';

export const calculatePoints = (timeMs: number, isCorrect: boolean, isVoice: boolean): number => {
  if (!isCorrect) return 0;
  let points = 100; // Base
  const threshold = isVoice ? 1800 : 0; // Grace period for voice recognition
  
  if (timeMs < 2000 + threshold) points += 150;
  else if (timeMs < 4000 + threshold) points += 75;
  else if (timeMs < 6000 + threshold) points += 25;
  return points;
};

export const getRating = (timeMs: number, isCorrect: boolean, isVoice: boolean): PerformanceRating => {
  if (!isCorrect) return { label: 'Incorrecto', color: 'bg-red-500', emoji: '❌' };
  const threshold = isVoice ? 1500 : 0;
  
  if (timeMs < 2000 + threshold) return { label: 'Experto Relámpago', color: 'bg-yellow-400', emoji: '⚡' };
  if (timeMs < 4000 + threshold) return { label: 'Muy Rápido', color: 'bg-green-500', emoji: '🚀' };
  if (timeMs < 6000 + threshold) return { label: 'Bien Hecho', color: 'bg-blue-500', emoji: '⭐' };
  return { label: 'Sigue Practicando', color: 'bg-purple-400', emoji: '🐢' };
};

export const ALL_MEDALS: Record<string, Medal> = {
  'Diamante': { label: 'Diamante', emoji: '💎', color: 'text-cyan-400', description: '¡Leyenda de las matemáticas!' },
  'Oro': { label: 'Oro', emoji: '🥇', color: 'text-yellow-500', description: '¡Velocidad pura!' },
  'Plata': { label: 'Plata', emoji: '🥈', color: 'text-gray-400', description: '¡Muy buen trabajo!' },
  'Bronce': { label: 'Bronce', emoji: '🥉', color: 'text-amber-700', description: '¡Sigue practicando!' }
};

export const getMedal = (totalScore: number, correctCount: number): Medal => {
  if (correctCount === 10 && totalScore >= 2200) return ALL_MEDALS['Diamante'];
  if (totalScore >= 1800) return ALL_MEDALS['Oro'];
  if (totalScore >= 1200) return ALL_MEDALS['Plata'];
  return ALL_MEDALS['Bronce'];
};

export const loadProgress = (): UserProgress => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : {};
};

export const saveTableProgress = (table: number, score: number, medal: Medal, mode: GameMode): UserProgress => {
  const progress = loadProgress();
  if (!progress[table]) progress[table] = {};
  
  const modeKey = mode === GameMode.SEQUENTIAL ? 'sequential' : 'jumping';
  const currentModeProgress = progress[table][modeKey];
  
  if (!currentModeProgress || score > currentModeProgress.bestScore) {
    progress[table][modeKey] = {
      bestScore: score,
      bestMedalLabel: medal.label,
      bestMedalEmoji: medal.emoji,
      attempts: (currentModeProgress?.attempts || 0) + 1
    };
  } else {
    const existing = progress[table][modeKey];
    if (existing) {
      existing.attempts += 1;
    }
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  return progress;
};

export const resetAllProgress = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const shuffleArray = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};
