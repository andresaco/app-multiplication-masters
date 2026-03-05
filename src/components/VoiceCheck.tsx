
import React from 'react';

interface VoiceCheckProps {
  isListening: boolean;
  micError: string | null;
  voiceTestResult: string | null;
  attemptMicStart: () => void;
  onStartGame: () => void;
  onSkipVoice: () => void;
}

const VoiceCheck: React.FC<VoiceCheckProps> = ({
  isListening,
  micError,
  voiceTestResult,
  attemptMicStart,
  onStartGame,
  onSkipVoice
}) => (
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
            onClick={onStartGame}
            className="w-full bg-green-500 text-white font-bold py-5 rounded-3xl shadow-lg border-b-4 border-green-700 text-2xl animate-pulse"
          >
            ¡EMPEZAR JUEGO!
          </button>
        )}

        <button
          onClick={onSkipVoice}
          className="text-gray-400 font-bold hover:text-gray-600 py-2"
        >
          Usar teclado (sin voz)
        </button>
      </div>
    </div>
  </div>
);

export default VoiceCheck;
