
import React from 'react';
import { GameStatus, UserProgress, TableProgress } from '../../types';
import BuildInfo from './BuildInfo';

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
    <div className="min-h-screen bg-[#F8FBFF] flex flex-col">
      <nav className="p-8 flex justify-between items-center bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-blue-50 shadow-sm no-print">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={onHome}>
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-fredoka text-2xl shadow-lg group-hover:rotate-12 transition-transform">×</div>
          <span className="text-3xl font-fredoka text-blue-600 hidden sm:block">Tablamanía</span>
        </div>
        <div className="bg-blue-50 px-6 py-2 rounded-2xl text-blue-600 font-black border-2 border-blue-100 flex items-center gap-2">
           <span className="text-xl">🏆</span> {totalMedals} / 20
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 mt-4 main-content flex-1">
        {children}
      </main>

      <footer className="bg-white/70 backdrop-blur-md border-t border-blue-50 mt-8 no-print">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {status === GameStatus.INTRO && (
            <>
              <span className="text-gray-400 font-bold text-sm">Para niños de 8 a 9 años • Aprende jugando 🎮✨</span>
              <div className="w-px h-4 bg-gray-300 mx-4"></div>
              <BuildInfo />
            </>
          )}
          {status !== GameStatus.INTRO && (
            <div className="ml-auto">
              <BuildInfo />
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default Layout;
