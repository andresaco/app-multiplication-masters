
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from 'recharts';
import { GameMode, GameStatus, Result, UserProgress, TableProgress } from './types';
import { TABLES, shuffleArray, calculatePoints, getMedal, loadProgress, saveTableProgress, ALL_MEDALS, resetAllProgress } from './constants';
import { getLocalFeedback } from './feedbackService';

// Extender Window para soporte de SpeechRecognition en TS
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const App: React.FC = () => {
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
  
  // Estados para Voz y Diagnóstico
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceTestResult, setVoiceTestResult] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [isSecureContext, setIsSecureContext] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState('');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  
  // Refs de estado para que el motor de voz siempre vea la info actual sin reiniciarse
  const gameStateRef = useRef({ 
    status, 
    isVoiceEnabled, 
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
      isVoiceEnabled, 
      currentIndex, 
      questions, 
      selectedTable, 
      gameMode,
      startTime, 
      totalScore, 
      results 
    };
  }, [status, isVoiceEnabled, currentIndex, questions, selectedTable, gameMode, startTime, totalScore, results]);

  // Comprobar protocolo al iniciar
  useEffect(() => {
    if (window.location.protocol === 'file:') {
      setIsSecureContext(false);
    }
  }, []);

  // Lógica de respuesta centralizada
  const handleFinalSubmit = useCallback((valueStr: string, isVoice: boolean = false) => {
    const val = parseInt(valueStr);
    if (isNaN(val)) return;

    // Evitar procesar múltiples veces la misma pregunta (race condition)
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
      // Desbloquear para la siguiente pregunta después de un pequeño delay
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
      try { recognitionRef.current?.stop(); } catch(e) {}
    }
  }, []);

  // Inicialización Única del Reconocimiento
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    setSpeechSupported(true);
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setMicError(null);
    };
    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
      // Auto-reinicio solo si seguimos jugando
      if (gameStateRef.current.isVoiceEnabled && 
         (gameStateRef.current.status === GameStatus.PLAYING || gameStateRef.current.status === GameStatus.VOICE_CHECK)) {
        setTimeout(() => {
          try { 
            if (gameStateRef.current.isVoiceEnabled) {
              recognition.start(); 
            }
          } catch (e) {}
        }, 300);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Error de voz:", event.error);
      if (event.error === 'aborted') return; // Ignorar abortos manuales
      
      let errorMsg = "Ocurrió un error con el micrófono.";
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        errorMsg = "Permiso denegado. Haz clic en el candado 🔒 de arriba y permite el micrófono.";
        setIsVoiceEnabled(false);
      } else if (event.error === 'no-speech') {
        // No es un error crítico, solo no detectó nada
        return;
      } else if (event.error === 'network') {
        errorMsg = "Error de red. El reconocimiento de voz necesita internet.";
      }
      setMicError(errorMsg);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (interim) {
        setInterimTranscript(interim);
      }

      const parseToNumber = (text: string): string | null => {
        const lower = text.toLowerCase();
        const digitMatch = lower.match(/\d+/);
        if (digitMatch) return digitMatch[0];

        const numMap: Record<string, number> = {
          'cero': 0, 'uno': 1, 'una': 1, 'dos': 2, 'tres': 3, 'cuatro': 4,
          'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
          'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15,
          'dieciseis': 16, 'dieciséis': 16, 'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19,
          'veinte': 20, 'veintiuno': 21, 'veintidos': 22, 'veintidós': 22, 'veintitres': 23, 'veintitrés': 23,
          'veinticuatro': 24, 'veinticinco': 25, 'veintiseis': 26, 'veintiséis': 26, 'veintisiete': 27,
          'veintiocho': 28, 'veintinueve': 29, 'treinta': 30, 'cuarenta': 40, 'cincuenta': 50,
          'sesenta': 60, 'setenta': 70, 'ochenta': 80, 'noventa': 90, 'cien': 100
        };

        const tens = ['treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
        for (const ten of tens) {
           const regex = new RegExp(`${ten}\\s+y\\s+(\\w+)`);
           const match = lower.match(regex);
           if (match) {
             const unit = match[1];
             if (numMap[unit] !== undefined && numMap[unit] < 10) {
               return (numMap[ten] + numMap[unit]).toString();
             }
           }
        }

        const words = lower.split(/[\s,.!¡¿?]+/);
        for (const word of words) {
          if (numMap[word] !== undefined) {
            return numMap[word].toString();
          }
        }
        return null;
      };
      
      const num = parseToNumber(finalTranscript);
      
      if (num) {
        setInterimTranscript('');
        if (gameStateRef.current.status === GameStatus.VOICE_CHECK) {
          setVoiceTestResult(num);
          setMicError(null);
        } else if (gameStateRef.current.status === GameStatus.PLAYING) {
          setInputValue(num);
          setTimeout(() => handleFinalSubmit(num, true), 300);
        }
      }
    };

    recognitionRef.current = recognition;
    setProgress(loadProgress());

    return () => {
      try { recognition.stop(); } catch(e) {}
    };
  }, [handleFinalSubmit]);

  const toggleVoiceMode = () => {
    const nextState = !isVoiceEnabled;
    setIsVoiceEnabled(nextState);
    if (!nextState) try { recognitionRef.current?.stop(); } catch(e) {}
  };

  const attemptMicStart = async () => {
    setMicError(null);
    try {
      // Forzar solicitud de permiso de hardware antes de iniciar reconocimiento
      await navigator.mediaDevices.getUserMedia({ audio: true });
      recognitionRef.current?.start();
    } catch (e: any) {
      setMicError("No se pudo acceder al micrófono. Revisa los permisos del navegador.");
    }
  };

  const startFlow = (table: number, mode: GameMode) => {
    setSelectedTable(table);
    setGameMode(mode);
    if (isVoiceEnabled) {
      setVoiceTestResult(null);
      setMicError(null);
      setStatus(GameStatus.VOICE_CHECK);
    } else {
      initGame(table, mode);
    }
  };

  const initGame = (table: number, mode: GameMode) => {
    const order = mode === GameMode.SEQUENTIAL ? TABLES : shuffleArray(TABLES);
    setQuestions(order);
    setCurrentIndex(0);
    setResults([]);
    setTotalScore(0);
    setInputValue('');
    setStartTime(Date.now());
    setStatus(GameStatus.PLAYING);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handlePrint = () => {
    window.print();
  };

  const renderIntro = () => {
    const totalMedals = Object.values(progress).reduce((acc: number, table: TableProgress) => {
      let count = 0;
      if (table.sequential) count++;
      if (table.jumping) count++;
      return acc + count;
    }, 0);

    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-4">
        {!isSecureContext && (
          <div className="bg-red-500 text-white p-4 rounded-2xl mb-8 font-bold shadow-lg animate-pulse max-w-lg">
            ⚠️ ATENCIÓN: Estás abriendo el archivo directamente. El modo VOZ y otras funciones no funcionarán. 
            <p className="font-normal text-sm mt-2">Usa un servidor local (Live Server en VS Code o similar).</p>
          </div>
        )}

        <h1 className="text-6xl md:text-8xl font-fredoka text-blue-600 mb-6 drop-shadow-sm">Multiplication Masters</h1>
        
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <div className="bg-yellow-100 text-yellow-700 px-6 py-3 rounded-2xl border-2 border-yellow-200 font-bold flex items-center gap-2">
            <span>🏆</span> {totalMedals} / 20 Medallas
          </div>
          <button 
            onClick={() => setStatus(GameStatus.STUDY)}
            className="bg-indigo-500 text-white font-bold px-6 py-3 rounded-2xl border-2 border-indigo-600 shadow-sm flex items-center gap-2 hover:bg-indigo-600 transition-colors"
          >
            📖 Repasa las tablas
          </button>
          {speechSupported && isSecureContext && (
            <button 
              onClick={toggleVoiceMode}
              className={`font-bold px-6 py-3 rounded-2xl border-2 transition-all flex items-center gap-2 shadow-sm ${
                isVoiceEnabled ? 'bg-green-500 text-white border-green-600' : 'bg-white text-gray-500 border-gray-100'
              }`}
            >
              {isVoiceEnabled ? '🎤 Modo Voz: ACTIVADO' : '🎙️ Usar Micrófono'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-5 gap-3 mb-10 max-w-lg">
          {TABLES.map(t => (
            <button
              key={t}
              onClick={() => setSelectedTable(t)}
              className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl font-bold text-2xl transition-all border-b-4 relative flex items-center justify-center ${
                selectedTable === t 
                  ? 'bg-blue-500 text-white border-blue-700 scale-110 shadow-lg' 
                  : 'bg-white text-blue-500 border-gray-200 hover:bg-blue-50'
              }`}
            >
              {t}
              <div className="absolute -top-2 -right-2 flex flex-col gap-1">
                {progress[t]?.sequential && (
                  <span className="text-xs bg-green-400 rounded-full w-6 h-6 flex items-center justify-center border-2 border-white shadow-sm" title="Ordenado">
                    {progress[t].sequential?.bestMedalEmoji}
                  </span>
                )}
                {progress[t]?.jumping && (
                  <span className="text-xs bg-orange-400 rounded-full w-6 h-6 flex items-center justify-center border-2 border-white shadow-sm" title="Saltando">
                    {progress[t].jumping?.bestMedalEmoji}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <button onClick={() => startFlow(selectedTable, GameMode.SEQUENTIAL)} className="flex-1 bg-green-500 text-white font-bold py-5 rounded-3xl shadow-lg border-b-4 border-green-700 text-xl active:translate-y-1 transition-transform">🔢 Ordenado</button>
          <button onClick={() => startFlow(selectedTable, GameMode.JUMPING)} className="flex-1 bg-orange-500 text-white font-bold py-5 rounded-3xl shadow-lg border-b-4 border-orange-700 text-xl active:translate-y-1 transition-transform">🔀 Saltando</button>
        </div>
        <button 
          onClick={() => setStatus(GameStatus.GALLERY)}
          className="mt-8 text-blue-500 font-bold hover:underline flex items-center gap-2"
        >
          🖼️ Ver mi Galería de Trofeos
        </button>
      </div>
    );
  };

  const renderStudy = () => (
    <div className="flex flex-col items-center py-10 px-4 animate-in fade-in duration-500">
      <div className="max-w-6xl w-full">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 no-print">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <h2 className="text-5xl font-fredoka text-indigo-600 mb-2">Repasa las Tablas</h2>
            <p className="text-gray-500 font-bold">¡Estudia cada tabla para ser el más rápido!</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handlePrint}
              className="bg-green-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg border-b-4 border-green-700 hover:bg-green-600 transition-all flex items-center gap-2"
            >
              🖨️ Imprimir Tablas
            </button>
            <button 
              onClick={() => setStatus(GameStatus.INTRO)}
              className="bg-blue-600 text-white font-bold py-3 px-6 rounded-2xl shadow-lg border-b-4 border-blue-800 hover:bg-blue-700 transition-all"
            >
              🔙 Volver
            </button>
          </div>
        </div>

        <div className="hidden print:block text-center mb-8">
          <h1 className="text-4xl font-fredoka text-blue-600">Multiplication Masters: Mis Tablas</h1>
          <p className="text-gray-500 font-bold italic">¡La práctica hace al maestro!</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 print-grid">
          {TABLES.map(t => (
            <div key={t} className="bg-white p-6 rounded-[32px] shadow-xl border-2 border-gray-50 table-card group hover:scale-105 transition-transform">
              <div className="text-center mb-4">
                <span className="bg-indigo-100 text-indigo-600 font-fredoka text-xl px-4 py-1 rounded-full">Tabla del {t}</span>
              </div>
              <div className="space-y-2 font-bold text-gray-700">
                {TABLES.map(f => (
                  <div key={f} className="flex justify-between border-b border-gray-100 pb-1 text-lg">
                    <span>{t} × {f}</span>
                    <span className="text-indigo-600"> = {t * f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderVoiceCheck = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl border-4 border-blue-100 max-w-xl w-full text-center">
        <h2 className="text-4xl font-fredoka text-blue-600 mb-8">Configurar Micrófono</h2>
        
        <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-8 transition-all duration-500 ${isListening ? 'bg-green-100 ring-8 ring-green-50 scale-110' : 'bg-gray-100'}`}>
          <span className={`text-6xl ${isListening ? 'animate-bounce' : ''}`}>{isListening ? '🎤' : '🎙️'}</span>
        </div>

        {micError && (
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl border-2 border-red-100 mb-6 font-bold flex flex-col items-center gap-2">
             <span className="text-2xl">⚠️</span>
             <p>{micError}</p>
             <button onClick={() => window.location.reload()} className="text-sm underline mt-2">Recargar página</button>
          </div>
        )}

        <div className="mb-8">
          {voiceTestResult ? (
            <div className="animate-in fade-in zoom-in duration-300">
              <p className="text-green-600 text-3xl font-bold mb-2">¡Entendido: {voiceTestResult}!</p>
              <p className="text-gray-500 italic">El micrófono funciona correctamente.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-600 text-lg">
                Di un número en voz alta para probar.
              </p>
              {!isListening && (
                <p className="text-xs text-blue-400">Pulsa el botón de abajo para activar</p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {!isListening && !voiceTestResult && (
            <button
              onClick={attemptMicStart}
              className="w-full bg-blue-600 text-white font-bold py-5 rounded-3xl shadow-lg border-b-4 border-blue-800 text-xl flex items-center justify-center gap-3"
            >
              🚀 Activar Micrófono
            </button>
          )}
          
          {voiceTestResult && (
            <button
              onClick={() => initGame(selectedTable, gameMode)}
              className="w-full bg-green-500 text-white font-bold py-5 rounded-3xl shadow-lg border-b-4 border-green-700 text-2xl animate-pulse"
            >
              ¡EMPEZAR JUEGO!
            </button>
          )}

          <button
            onClick={() => { setIsVoiceEnabled(false); initGame(selectedTable, gameMode); }}
            className="text-gray-400 font-bold hover:text-gray-600 py-2"
          >
            Usar teclado (sin voz)
          </button>
        </div>
      </div>
    </div>
  );

  const renderPlaying = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] sm:min-h-[80vh] p-2 sm:p-4 playing-container">
      <div className="w-full max-w-2xl bg-white rounded-[32px] sm:rounded-[50px] shadow-2xl p-4 sm:p-10 md:p-16 border-4 border-blue-50 relative overflow-hidden playing-card">
        {/* Adorno fondo */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-50 rounded-full opacity-50 hidden sm:block"></div>
        
        <div className="flex justify-between items-start mb-4 sm:mb-12 relative z-10 playing-header">
          <div className="flex items-center gap-3">
             <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${isListening ? 'bg-green-500 animate-ping' : 'bg-gray-300'}`}></div>
             <span className="text-[10px] sm:text-sm font-bold text-gray-400 uppercase tracking-widest">
               {isVoiceEnabled ? (isListening ? 'Escuchando...' : 'Micro Pausado') : 'Teclado'}
             </span>
          </div>
          <div className="text-right relative">
            <motion.div 
              key={totalScore}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.3 }}
              className="text-3xl sm:text-5xl font-fredoka text-blue-600 playing-score"
            >
              {totalScore}
            </motion.div>
            <AnimatePresence>
              {lastPoints.visible && (
                <motion.div 
                  initial={{ opacity: 0, y: 20, scale: 0.5 }}
                  animate={{ opacity: 1, y: -40, scale: 1.5 }}
                  exit={{ opacity: 0, scale: 2, y: -60 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="text-2xl sm:text-4xl font-fredoka text-green-500 absolute right-0 top-0 pointer-events-none z-50"
                >
                  +{lastPoints.points}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="text-center relative z-10">
          <div className="inline-block bg-blue-600 text-white px-4 py-1 sm:px-6 sm:py-2 rounded-xl sm:rounded-2xl text-xs sm:text-base font-bold mb-2 sm:mb-6 shadow-md playing-badge">
            TABLA DEL {selectedTable}
          </div>
          
          <div className="text-5xl sm:text-8xl md:text-[10rem] font-fredoka text-gray-800 leading-none mb-4 sm:mb-12 select-none playing-question">
            {selectedTable} <span className="text-blue-300">×</span> {questions[currentIndex]}
          </div>
          
          <div className="max-w-xs mx-auto relative">
            <AnimatePresence>
              {lastAnswerStatus === 'correct' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: 0 }}
                  animate={{ opacity: 1, scale: 1.2, y: -50 }}
                  exit={{ opacity: 0, scale: 1.5 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                >
                  <span className="text-6xl">✨</span>
                </motion.div>
              )}
              {lastAnswerStatus === 'wrong' && (
                <motion.div
                  initial={{ x: -10 }}
                  animate={{ x: [10, -10, 10, -10, 0] }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                >
                  <span className="text-6xl">❌</span>
                </motion.div>
              )}
            </AnimatePresence>
            <input
              ref={inputRef}
              type="number"
              inputMode="numeric"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFinalSubmit(inputValue, false)}
              className={`w-full text-center text-5xl sm:text-7xl font-fredoka py-2 sm:py-6 bg-gray-50 border-4 rounded-2xl sm:rounded-[32px] focus:outline-none transition-all ${
                isListening ? 'border-green-400 shadow-[0_0_30px_rgba(74,222,128,0.2)]' : 'border-blue-400'
              } text-blue-600 playing-input`}
              placeholder="?"
              autoFocus
            />
            <div className="mt-4 sm:mt-8 flex justify-center gap-1 sm:gap-2 playing-progress">
              {[...Array(10)].map((_, i) => (
                <div key={i} className={`h-2 sm:h-3 rounded-full transition-all duration-500 ${i < currentIndex ? 'bg-blue-500 w-4 sm:w-6' : 'bg-gray-200 w-2 sm:w-3'}`} />
              ))}
            </div>
            {isVoiceEnabled && isListening && (
              <div className="mt-4 flex flex-col items-center">
                <p className="text-green-500 font-bold animate-pulse text-[10px] sm:text-sm">🎤 Di el resultado en voz alta...</p>
                {interimTranscript && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-2 bg-green-50 px-4 py-1 rounded-full border border-green-200 text-green-700 text-xs font-medium"
                  >
                    Escuchando: "{interimTranscript}"
                  </motion.div>
                )}
              </div>
            )}
            {micError && (
              <p className="mt-2 sm:mt-4 text-red-500 font-bold text-[10px] sm:text-xs">{micError}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFinished = () => {
    const totalCorrect = results.filter(r => r.isCorrect).length;
    const avgTime = results.reduce((acc, r) => acc + r.timeTaken, 0) / 10;
    const medal = getMedal(totalScore, totalCorrect);

    // Preparar datos para el gráfico
    const chartData = results.map((r, i) => ({
      name: `${r.factor1}×${r.factor2}`,
      time: parseFloat((r.timeTaken / 1000).toFixed(2)),
      isCorrect: r.isCorrect,
      isVoice: r.isVoice
    }));

    // Función para obtener color según tiempo (Verde < 2s, Amarillo < 4s, Rojo > 6s)
    // Ajustado para voz: si es voz, el umbral es mayor
    const getColor = (time: number, isVoice: boolean) => {
      const threshold = isVoice ? 1.5 : 0;
      if (time < 2 + threshold) return '#22c55e'; // green-500
      if (time < 4 + threshold) return '#eab308'; // yellow-500
      if (time < 6 + threshold) return '#f97316'; // orange-500
      return '#ef4444'; // red-500
    };
    
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 animate-in fade-in duration-1000">
        <div className="text-center mb-10">
           <div className="text-[12rem] drop-shadow-2xl mb-4 animate-bounce-slow">{medal.emoji}</div>
           <h2 className={`text-6xl md:text-8xl font-fredoka ${medal.color} mb-4`}>{medal.label}</h2>
           <p className="text-2xl text-gray-500 font-bold italic">{medal.description}</p>
        </div>

        <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl p-6 md:p-10 border-4 border-blue-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
             {[
               { label: 'Aciertos', val: `${totalCorrect}/10`, color: 'text-blue-600', bg: 'bg-blue-50' },
               { label: 'Tiempo', val: `${(avgTime/1000).toFixed(1)}s`, color: 'text-yellow-600', bg: 'bg-yellow-50' },
               { label: 'Puntos', val: totalScore, color: 'text-green-600', bg: 'bg-green-50' },
               { label: 'Precisión', val: `${totalCorrect*10}%`, color: 'text-purple-600', bg: 'bg-purple-50' }
             ].map((stat, i) => (
               <div key={i} className={`${stat.bg} p-4 md:p-6 rounded-3xl text-center border-b-4 border-black/5`}>
                 <p className="text-[10px] md:text-xs uppercase font-black text-gray-400 mb-2 tracking-widest">{stat.label}</p>
                 <p className="text-2xl md:text-4xl font-fredoka font-medium text-gray-900">{stat.val}</p>
               </div>
             ))}
          </div>
          
          <div className="bg-gray-50 p-6 md:p-8 rounded-3xl italic text-lg md:text-xl text-gray-700 mb-10 border-l-[12px] border-blue-500 leading-relaxed shadow-inner">
            "{feedback}"
          </div>

          {/* Gráfico de Estadísticas */}
          <div className="mb-12">
            <h3 className="text-2xl font-fredoka text-gray-800 mb-6 flex items-center gap-2">
              ⏱️ Velocidad por pregunta
            </h3>
            <div className="h-[300px] w-full bg-gray-50 p-4 rounded-3xl border border-gray-100">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    label={{ value: 'Segundos', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 12 }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="time" radius={[8, 8, 0, 0]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColor(entry.time, entry.isVoice)} />
                    ))}
                    <LabelList dataKey="time" position="top" style={{ fill: '#4b5563', fontSize: 10, fontWeight: 700 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-col items-center gap-2">
              <div className="flex justify-center gap-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> Rápido</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> Normal</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> Lento</div>
              </div>
              <p className="text-[10px] text-gray-400 italic">Nota: El modo voz tiene un margen de tiempo extra de 1.5s</p>
            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-2xl font-fredoka text-gray-800 mb-6 flex items-center gap-2">
              📊 Detalle de tus respuestas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {results.map((r, i) => (
                <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border-2 ${r.isCorrect ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 font-bold text-sm">#{i+1}</span>
                    <span className="text-xl font-bold text-gray-700">{r.factor1} × {r.factor2} = </span>
                    <span className={`text-xl font-fredoka ${r.isCorrect ? 'text-green-600' : 'text-red-600'}`}>{r.userAnswer}</span>
                    {r.isVoice && <span className="text-xs" title="Voz">🎤</span>}
                  </div>
                  {!r.isCorrect && (
                    <div className="text-right">
                      <p className="text-[10px] text-red-400 font-bold uppercase">Correcto era</p>
                      <p className="text-lg font-fredoka text-green-600">{r.correctAnswer}</p>
                    </div>
                  )}
                  {r.isCorrect && (
                    <div className="text-green-500 text-2xl">✓</div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
            <button onClick={() => initGame(selectedTable, gameMode)} className="flex-1 bg-green-500 text-white font-bold py-5 rounded-3xl shadow-xl text-xl hover:scale-105 transition-transform flex items-center justify-center gap-2">🔄 Reintentar</button>
            <button onClick={() => setStatus(GameStatus.INTRO)} className="flex-1 bg-blue-600 text-white font-bold py-5 rounded-3xl shadow-xl text-xl hover:scale-105 transition-transform flex items-center justify-center gap-2">🏠 Menú Inicio</button>
            <button onClick={() => setStatus(GameStatus.GALLERY)} className="flex-1 bg-purple-500 text-white font-bold py-5 rounded-3xl shadow-xl text-xl hover:scale-105 transition-transform flex items-center justify-center gap-2">🖼️ Mi Galería</button>
          </div>
        </div>
      </div>
    );
  };

  const renderGallery = () => (
    <div className="flex flex-col items-center py-10 px-4">
      <h2 className="text-6xl font-fredoka text-blue-600 mb-4">Sala de Trofeos</h2>
      <p className="text-gray-400 font-bold mb-12">¡Consigue medallas de Diamante en todas las tablas!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl w-full mb-16">
        {/* Categoría Ordenado */}
        <div className="bg-green-50/50 p-8 rounded-[40px] border-2 border-green-100">
          <h3 className="text-3xl font-fredoka text-green-600 mb-8 flex items-center gap-3 justify-center">
            🔢 Modo Ordenado
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {TABLES.map(t => {
              const tableData = progress[t]?.sequential;
              const medal = tableData ? ALL_MEDALS[tableData.bestMedalLabel] : null;
              return (
                <div key={t} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center group hover:scale-105 transition-all">
                  <div className="text-[10px] font-black text-gray-300 uppercase mb-2">Tabla {t}</div>
                  <div className={`text-4xl mb-2 transition-all ${medal ? 'drop-shadow-md' : 'grayscale opacity-10 scale-90'}`}>
                    {medal ? medal.emoji : '❓'}
                  </div>
                  <div className={`font-fredoka text-[10px] text-center leading-tight ${medal?.color || 'text-gray-200'}`}>
                    {medal?.label || 'Bloqueado'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Categoría Saltando */}
        <div className="bg-orange-50/50 p-8 rounded-[40px] border-2 border-orange-100">
          <h3 className="text-3xl font-fredoka text-orange-600 mb-8 flex items-center gap-3 justify-center">
            🔀 Modo Saltando
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {TABLES.map(t => {
              const tableData = progress[t]?.jumping;
              const medal = tableData ? ALL_MEDALS[tableData.bestMedalLabel] : null;
              return (
                <div key={t} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center group hover:scale-105 transition-all">
                  <div className="text-[10px] font-black text-gray-300 uppercase mb-2">Tabla {t}</div>
                  <div className={`text-4xl mb-2 transition-all ${medal ? 'drop-shadow-md' : 'grayscale opacity-10 scale-90'}`}>
                    {medal ? medal.emoji : '❓'}
                  </div>
                  <div className={`font-fredoka text-[10px] text-center leading-tight ${medal?.color || 'text-gray-200'}`}>
                    {medal?.label || 'Bloqueado'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <button onClick={() => setStatus(GameStatus.INTRO)} className="bg-blue-600 text-white font-bold py-5 px-16 rounded-3xl shadow-xl text-xl">🔙 Volver a Jugar</button>
    </div>
  );

  const totalMedals = Object.values(progress).reduce((acc: number, table: TableProgress) => {
    let count = 0;
    if (table.sequential) count++;
    if (table.jumping) count++;
    return acc + count;
  }, 0);

  return (
    <div className="min-h-screen bg-[#F8FBFF] pb-20">
      <nav className="p-8 flex justify-between items-center bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-blue-50 shadow-sm no-print">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setStatus(GameStatus.INTRO)}>
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-fredoka text-2xl shadow-lg group-hover:rotate-12 transition-transform">×</div>
          <span className="text-3xl font-fredoka text-blue-600 hidden sm:block">Math Masters</span>
        </div>
        <div className="bg-blue-50 px-6 py-2 rounded-2xl text-blue-600 font-black border-2 border-blue-100 flex items-center gap-2">
           <span className="text-xl">🏆</span> {totalMedals} / 20
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 mt-4 main-content">
        {status === GameStatus.INTRO && renderIntro()}
        {status === GameStatus.STUDY && renderStudy()}
        {status === GameStatus.VOICE_CHECK && renderVoiceCheck()}
        {status === GameStatus.PLAYING && renderPlaying()}
        {status === GameStatus.FINISHED && renderFinished()}
        {status === GameStatus.GALLERY && renderGallery()}
      </main>

      {status === GameStatus.INTRO && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border border-blue-50 shadow-sm text-gray-400 font-bold text-sm no-print">
           Para niños de 8 a 9 años • Aprende jugando 🎮✨
        </div>
      )}
    </div>
  );
};

export default App;