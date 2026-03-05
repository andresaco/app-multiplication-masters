
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from 'recharts';
import { Result } from '../../types';
import { getMedal } from '../../constants';

interface FinishedProps {
  results: Result[];
  totalScore: number;
  feedback: string;
  onRetry: () => void;
  onHome: () => void;
  onViewGallery: () => void;
}

const Finished: React.FC<FinishedProps> = ({
  results,
  totalScore,
  feedback,
  onRetry,
  onHome,
  onViewGallery
}) => {
  const totalCorrect = results.filter(r => r.isCorrect).length;
  const avgTime = results.reduce((acc, r) => acc + r.timeTaken, 0) / 10;
  const medal = getMedal(totalScore, totalCorrect);

  const chartData = results.map((r, i) => ({
    name: `${r.factor1}×${r.factor2}`,
    time: parseFloat((r.timeTaken / 1000).toFixed(2)),
    isCorrect: r.isCorrect,
    isVoice: r.isVoice
  }));

  const getColor = (time: number, isVoice: boolean) => {
    const threshold = isVoice ? 1.5 : 0;
    if (time < 2 + threshold) return '#22c55e';
    if (time < 4 + threshold) return '#eab308';
    if (time < 6 + threshold) return '#f97316';
    return '#ef4444';
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
          <button onClick={onRetry} className="flex-1 bg-green-500 text-white font-bold py-5 rounded-3xl shadow-xl text-xl hover:scale-105 transition-transform flex items-center justify-center gap-2">🔄 Reintentar</button>
          <button onClick={onHome} className="flex-1 bg-blue-600 text-white font-bold py-5 rounded-3xl shadow-xl text-xl hover:scale-105 transition-transform flex items-center justify-center gap-2">🏠 Menú Inicio</button>
          <button onClick={onViewGallery} className="flex-1 bg-purple-500 text-white font-bold py-5 rounded-3xl shadow-xl text-xl hover:scale-105 transition-transform flex items-center justify-center gap-2">🖼️ Mi Galería</button>
        </div>
      </div>
    </div>
  );
};

export default Finished;
