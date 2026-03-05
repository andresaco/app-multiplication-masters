
import React from 'react';
import { UserProgress, TableProgress } from '../../types';
import { TABLES, ALL_MEDALS } from '../../constants';

interface GalleryProps {
  progress: UserProgress;
  onBack: () => void;
}

const Gallery: React.FC<GalleryProps> = ({ progress, onBack }) => (
  <div className="flex flex-col items-center py-10 px-4">
    <h2 className="text-6xl font-fredoka text-blue-600 mb-4">Sala de Trofeos</h2>
    <p className="text-gray-400 font-bold mb-12">¡Consigue medallas de Diamante en todas las tablas!</p>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl w-full mb-16">
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
    
    <button onClick={onBack} className="bg-blue-600 text-white font-bold py-5 px-16 rounded-3xl shadow-xl text-xl">🔙 Volver a Jugar</button>
  </div>
);

export default Gallery;
