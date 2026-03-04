
import React from 'react';
import { GameMode, GameStatus, UserProgress, TableProgress } from '../../types';
import { TABLES } from '../../constants';

interface IntroProps {
  progress: UserProgress;
  selectedTable: number;
  setSelectedTable: (table: number) => void;
  isVoiceEnabled: boolean;
  toggleVoiceMode: () => void;
  speechSupported: boolean;
  isSecureContext: boolean;
  onStartFlow: (table: number, mode: GameMode) => void;
  onViewGallery: () => void;
  onViewStudy: () => void;
}

const Intro: React.FC<IntroProps> = ({
  progress,
  selectedTable,
  setSelectedTable,
  isVoiceEnabled,
  toggleVoiceMode,
  speechSupported,
  isSecureContext,
  onStartFlow,
  onViewGallery,
  onViewStudy
}) => {
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
          <p className="font-normal text-sm mt-2">Usa un servidor local.</p>
        </div>
      )}

      <h1 className="text-6xl md:text-8xl font-fredoka text-blue-600 mb-2 drop-shadow-sm">Tablamanía</h1>
      <p className="text-xl md:text-2xl font-fredoka text-blue-400 mb-8">Aprende y domina las tablas de multiplicar</p>
      
      <div className="flex flex-wrap justify-center gap-4 mb-10">
        <div className="bg-yellow-100 text-yellow-700 px-6 py-3 rounded-2xl border-2 border-yellow-200 font-bold flex items-center gap-2">
          <span>🏆</span> {totalMedals} / 20 Medallas
        </div>
        <button 
          onClick={onViewStudy}
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
        <button onClick={() => onStartFlow(selectedTable, GameMode.SEQUENTIAL)} className="flex-1 bg-green-500 text-white font-bold py-5 rounded-3xl shadow-lg border-b-4 border-green-700 text-xl active:translate-y-1 transition-transform">🔢 Ordenado</button>
        <button onClick={() => onStartFlow(selectedTable, GameMode.JUMPING)} className="flex-1 bg-orange-500 text-white font-bold py-5 rounded-3xl shadow-lg border-b-4 border-orange-700 text-xl active:translate-y-1 transition-transform">🔀 Saltando</button>
      </div>
      <button 
        onClick={onViewGallery}
        className="mt-8 text-blue-500 font-bold hover:underline flex items-center gap-2"
      >
        🖼️ Ver mi Galería de Trofeos
      </button>
    </div>
  );
};

export default Intro;
