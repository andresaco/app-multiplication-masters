import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface CountdownProps {
  onComplete: () => void;
}

const Countdown: React.FC<CountdownProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const messages = ["Preparados", "Listos", "¡Ya!"];

  useEffect(() => {
    const playSound = (isLast: boolean) => {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create multiple oscillators for a richer "bell" sound
        const createOsc = (freq: number, type: OscillatorType, volume: number, duration: number) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          
          osc.type = type;
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
          
          gain.gain.setValueAtTime(volume, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
          
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          
          osc.start();
          osc.stop(audioCtx.currentTime + duration);
        };

        if (isLast) {
          // Higher, bright, longer sound for "¡Ya!"
          createOsc(1760, 'sine', 0.3, 1.5);
          createOsc(3520, 'sine', 0.1, 1.5);
        } else {
          // Mid-range, shorter sound for "Preparados" and "Listos"
          createOsc(440, 'sine', 0.3, 0.4);
          createOsc(880, 'sine', 0.1, 0.4);
        }
      } catch (e) {
        console.error("Audio error", e);
      }
    };

    // Play first sound immediately
    playSound(false);

    const timer = setInterval(() => {
      setStep((prev) => {
        const next = prev + 1;
        
        if (next < messages.length) {
          playSound(next === messages.length - 1);
        }

        if (next === messages.length) {
          clearInterval(timer);
          setTimeout(onComplete, 800);
          return prev;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete, messages.length]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ scale: 0.5, opacity: 0, y: 20 }}
          animate={{ scale: 1.2, opacity: 1, y: 0 }}
          exit={{ scale: 2, opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "backOut" }}
          className={`text-6xl md:text-9xl font-fredoka uppercase tracking-tighter ${
            step === 2 ? 'text-emerald-500' : 'text-indigo-600'
          }`}
        >
          {messages[step]}
        </motion.div>
      </AnimatePresence>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-12 flex gap-2"
      >
        {messages.map((_, i) => (
          <div 
            key={i} 
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              i <= step ? 'bg-indigo-600' : 'bg-indigo-100'
            }`} 
          />
        ))}
      </motion.div>
    </div>
  );
};

export default Countdown;
