
import React from 'react';
import { TABLES } from '../../constants';

interface StudyProps {
  onBack: () => void;
  handlePrint: () => void;
}

const Study: React.FC<StudyProps> = ({ onBack, handlePrint }) => (
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
            onClick={onBack}
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

export default Study;
