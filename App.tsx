
import React, { useState, useEffect, useRef } from 'react';
import { GameMode, GameStatus } from './types';
import { useGameLogic } from './src/hooks/useGameLogic';

// Components
import Layout from './src/components/Layout';
import Intro from './src/components/Intro';
import Study from './src/components/Study';
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
    progress,
    handleFinalSubmit, initGame, startGame
  } = useGameLogic();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [status]);

  const startFlow = (table: number, mode: GameMode) => {
    setSelectedTable(table);
    setGameMode(mode);
    initGame(table, mode);
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
      {status === GameStatus.PLAYING && (
        <Playing 
          totalScore={totalScore}
          lastPoints={lastPoints}
          lastAnswerStatus={lastAnswerStatus}
          selectedTable={selectedTable}
          currentFactor={questions[currentIndex]}
          currentIndex={currentIndex}
          inputValue={inputValue}
          setInputValue={setInputValue}
          onFinalSubmit={handleFinalSubmit}
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
