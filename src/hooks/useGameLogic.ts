
import { useState, useCallback, useRef, useEffect } from 'react';
import { GameMode, GameStatus, Result, UserProgress } from '../../types';
import { TABLES, shuffleArray, calculatePoints, getMedal, loadProgress, saveTableProgress } from '../../constants';
import { getLocalFeedback } from '../../feedbackService';

export const useGameLogic = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.INTRO);
  const [selectedTable, setSelectedTable] = useState<number>(2);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.SEQUENTIAL);
  const [questions, setQuestions] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [feedback, setFeedback] = useState<string>('');
  const [totalScore, setTotalScore] = useState(0);
  const [lastPoints, setLastPoints] = useState<{points: number, visible: boolean}>({points: 0, visible: false});
  const [lastAnswerStatus, setLastAnswerStatus] = useState<'correct' | 'wrong' | null>(null);
  const [progress, setProgress] = useState<UserProgress>({});
  const [voiceTestResult, setVoiceTestResult] = useState<string | null>(null);

  const gameStateRef = useRef({ 
    status, 
    currentIndex, 
    questions, 
    selectedTable, 
    gameMode,
    startTime, 
    totalScore, 
    results,
    isProcessing: false
  });

  useEffect(() => {
    gameStateRef.current = { 
      ...gameStateRef.current,
      status, 
      currentIndex, 
      questions, 
      selectedTable, 
      gameMode,
      startTime, 
      totalScore, 
      results 
    };
  }, [status, currentIndex, questions, selectedTable, gameMode, startTime, totalScore, results]);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const handleFinalSubmit = useCallback((valueStr: string, isVoice: boolean = false) => {
    const val = parseInt(valueStr);
    if (isNaN(val)) return;

    if (gameStateRef.current.isProcessing) return;
    gameStateRef.current.isProcessing = true;

    const { selectedTable, questions, currentIndex, startTime, totalScore, results, gameMode } = gameStateRef.current;
    
    const currentFactor = questions[currentIndex];
    const correctAnswer = selectedTable * currentFactor;
    const isCorrect = val === correctAnswer;
    const timeTaken = Date.now() - startTime;
    const points = calculatePoints(timeTaken, isCorrect, isVoice);

    const newResult: Result = {
      factor1: selectedTable,
      factor2: currentFactor,
      userAnswer: val,
      correctAnswer,
      timeTaken,
      isCorrect,
      isVoice,
      points
    };

    const updatedResults = [...results, newResult];
    const newTotalScore = totalScore + points;
    
    setTotalScore(newTotalScore);
    setResults(updatedResults);
    setInputValue('');
    
    if (isCorrect) {
      setLastPoints({ points, visible: true });
      setLastAnswerStatus('correct');
      setTimeout(() => {
        setLastPoints(p => ({ ...p, visible: false }));
        setLastAnswerStatus(null);
      }, 800);
    } else {
      setLastAnswerStatus('wrong');
      setTimeout(() => setLastAnswerStatus(null), 800);
    }

    if (currentIndex < 9) {
      setCurrentIndex(c => c + 1);
      setStartTime(Date.now());
      setTimeout(() => {
        gameStateRef.current.isProcessing = false;
      }, 100);
    } else {
      const totalCorrect = updatedResults.filter(r => r.isCorrect).length;
      const medal = getMedal(newTotalScore, totalCorrect);
      const newProgress = saveTableProgress(selectedTable, newTotalScore, medal, gameMode);
      
      setProgress(newProgress);
      setFeedback(getLocalFeedback(updatedResults, selectedTable, newTotalScore));
      setStatus(GameStatus.FINISHED);
      gameStateRef.current.isProcessing = false;
    }
  }, []);

  const initGame = (table: number, mode: GameMode) => {
    const order = mode === GameMode.SEQUENTIAL ? TABLES : shuffleArray(TABLES);
    setQuestions(order);
    setCurrentIndex(0);
    setResults([]);
    setTotalScore(0);
    setInputValue('');
    setStatus(GameStatus.COUNTDOWN);
  };

  const startGame = () => {
    setStartTime(Date.now());
    setStatus(GameStatus.PLAYING);
  };

  return {
    status, setStatus,
    selectedTable, setSelectedTable,
    gameMode, setGameMode,
    questions, currentIndex,
    results, totalScore,
    inputValue, setInputValue,
    feedback, lastPoints, lastAnswerStatus,
    progress, voiceTestResult, setVoiceTestResult,
    handleFinalSubmit, initGame, startGame
  };
};
