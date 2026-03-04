
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface PlayingProps {
  isListening: boolean;
  isVoiceEnabled: boolean;
  totalScore: number;
  lastPoints: { points: number; visible: boolean };
  lastAnswerStatus: 'correct' | 'wrong' | null;
  selectedTable: number;
  currentFactor: number;
  currentIndex: number;
  inputValue: string;
  setInputValue: (val: string) => void;
  onFinalSubmit: (val: string, isVoice: boolean) => void;
  micError: string | null;
  interimTranscript: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

const Playing: React.FC<PlayingProps> = ({
  isListening,
  isVoiceEnabled,
  totalScore,
  lastPoints,
  lastAnswerStatus,
  selectedTable,
  currentFactor,
  currentIndex,
  inputValue,
  setInputValue,
  onFinalSubmit,
  micError,
  interimTranscript,
  inputRef
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] sm:min-h-[80vh] p-2 sm:p-4 playing-container">
      <div className="w-full max-w-2xl bg-white rounded-[32px] sm:rounded-[50px] shadow-2xl p-4 sm:p-10 md:p-16 border-4 border-blue-50 relative overflow-hidden playing-card">
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
            {selectedTable} <span className="text-blue-300">×</span> {currentFactor}
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
              onKeyDown={(e) => e.key === 'Enter' && onFinalSubmit(inputValue, false)}
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
};

export default Playing;
