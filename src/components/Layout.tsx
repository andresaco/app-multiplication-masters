
import React from 'react';
import { GameStatus, UserProgress, TableProgress } from '../../types';

interface LayoutProps {
  children: React.ReactNode;
  status: GameStatus;
  progress: UserProgress;
  onHome: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, status, progress, onHome }) => {
  const totalMedals = Object.values(progress).reduce((acc: number, table: TableProgress) => {
    let count = 0;
    if (table.sequential) count++;
    if (table.jumping) count++;
    return acc + count;
  }, 0);

  return (
    <div className="min-h-screen bg-[#F8FBFF] pb-20">
      <nav className="p-8 flex justify-between items-center bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-blue-50 shadow-sm no-print">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={onHome}>
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-fredoka text-2xl shadow-lg group-hover:rotate-12 transition-transform">×</div>
          <span className="text-3xl font-fredoka text-blue-600 hidden sm:block">Tablamanía</span>
        </div>
        <div className="bg-blue-50 px-6 py-2 rounded-2xl text-blue-600 font-black border-2 border-blue-100 flex items-center gap-2">
           <span className="text-xl">🏆</span> {totalMedals} / 20
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 mt-4 main-content">
        {children}
      </main>

      {status === GameStatus.INTRO && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border border-blue-50 shadow-sm text-gray-400 font-bold text-sm no-print">
           Para niños de 8 a 9 años • Aprende jugando 🎮✨
        </div>
      )}
    </div>
  );
};

export default Layout;
