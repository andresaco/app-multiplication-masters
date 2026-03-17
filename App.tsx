
import React, { useState, useEffect, useRef } from 'react';
import { GameMode, GameStatus } from './types';
import { useGameLogic } from './src/hooks/useGameLogic';
import { useVoiceRecognition } from './src/hooks/useVoiceRecognition';

// Components
import Layout from './src/components/Layout';
import Intro from './src/components/Intro';
import Study from './src/components/Study';
import VoiceCheck from './src/components/VoiceCheck';
import Playing from './src/components/Playing';
import Finished from './src/components/Finished';
import Gallery from './src/components/Gallery';
import Countdown from './src/components/Countdown';

const App: React.FC = () => {
  const {
    status, setStatus,
    selectedTable, setSelectedTable,
    gameMode, setGameMode,
    questions, currentIndex,
    results, totalScore,
    inputValue, setInputValue,
    feedback, lastPoints, lastAnswerStatus,
    progress, voiceTestResult, setVoiceTestResult,
    handleFinalSubmit, initGame, startGame
  } = useGameLogic();

  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isSecureContext, setIsSecureContext] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const onVoiceResult = React.useCallback((num: string) => {
    if (status === GameStatus.VOICE_CHECK) {
      setVoiceTestResult(num);
    } else if (status === GameStatus.PLAYING) {
      setInputValue(num);
      setTimeout(() => handleFinalSubmit(num, true), 300);
    }
  }, [status, setVoiceTestResult, setInputValue, handleFinalSubmit]);

  const { 
    isListening, 
    speechSupported, 
    micError, 
    interimTranscript, 
    startListening, 
    stopListening 
  } = useVoiceRecognition({ 
    status, 
    isVoiceEnabled, 
    onResult: onVoiceResult 
  });

  useEffect(() => {
    if (window.location.protocol === 'file:') {
      setIsSecureContext(false);
    }
  }, []);

  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [status]);

  useEffect(() => {
    // Stop listening when voice test result is obtained in VOICE_CHECK
    // or when leaving VOICE_CHECK without voice
    if (status === GameStatus.VOICE_CHECK && voiceTestResult) {
      stopListening();
    } else if (status !== GameStatus.VOICE_CHECK && isListening) {
      stopListening();
    }
  }, [status, voiceTestResult, isListening, stopListening]);

  useEffect(() => {
    if (status === GameStatus.PLAYING && isVoiceEnabled && !isListening) {
      startListening();
    }
  }, [status, isVoiceEnabled, currentIndex, isListening, startListening]);

  const toggleVoiceMode = () => {
    const nextState = !isVoiceEnabled;
    setIsVoiceEnabled(nextState);
    if (!nextState) stopListening();
  };

  const startFlow = (table: number, mode: GameMode) => {
    setSelectedTable(table);
    setGameMode(mode);
    if (isVoiceEnabled) {
      setVoiceTestResult(null);
      setStatus(GameStatus.VOICE_CHECK);
    } else {
      initGame(table, mode);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout status={status} progress={progress} onHome={() => setStatus(GameStatus.INTRO)}>
      {status === GameStatus.INTRO && (
        <Intro 
          progress={progress}
          selectedTable={selectedTable}
          setSelectedTable={setSelectedTable}
          isVoiceEnabled={isVoiceEnabled}
          toggleVoiceMode={toggleVoiceMode}
          speechSupported={speechSupported}
          isSecureContext={isSecureContext}
          onStartFlow={startFlow}
          onViewGallery={() => setStatus(GameStatus.GALLERY)}
          onViewStudy={() => setStatus(GameStatus.STUDY)}
        />
      )}
      {status === GameStatus.STUDY && (
        <Study onBack={() => setStatus(GameStatus.INTRO)} handlePrint={handlePrint} />
      )}
      {status === GameStatus.COUNTDOWN && (
        <Countdown onComplete={startGame} />
      )}
      {status === GameStatus.VOICE_CHECK && (
        <VoiceCheck 
          isListening={isListening}
          micError={micError}
          voiceTestResult={voiceTestResult}
          attemptMicStart={startListening}
          onStartGame={() => initGame(selectedTable, gameMode)}
          onSkipVoice={() => { setIsVoiceEnabled(false); initGame(selectedTable, gameMode); }}
        />
      )}
      {status === GameStatus.PLAYING && (
        <Playing 
          isListening={isListening}
          isVoiceEnabled={isVoiceEnabled}
          totalScore={totalScore}
          lastPoints={lastPoints}
          lastAnswerStatus={lastAnswerStatus}
          selectedTable={selectedTable}
          currentFactor={questions[currentIndex]}
          currentIndex={currentIndex}
          inputValue={inputValue}
          setInputValue={setInputValue}
          onFinalSubmit={handleFinalSubmit}
          micError={micError}
          interimTranscript={interimTranscript}
          inputRef={inputRef}
        />
      )}
      {status === GameStatus.FINISHED && (
        <Finished 
          results={results}
          totalScore={totalScore}
          feedback={feedback}
          onRetry={() => initGame(selectedTable, gameMode)}
          onHome={() => setStatus(GameStatus.INTRO)}
          onViewGallery={() => setStatus(GameStatus.GALLERY)}
        />
      )}
      {status === GameStatus.GALLERY && (
        <Gallery progress={progress} onBack={() => setStatus(GameStatus.INTRO)} />
      )}
    </Layout>
  );
};

export default App;
