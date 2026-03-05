
import { useState, useEffect, useRef } from 'react';
import { GameStatus } from '../../types';

// Extender Window para soporte de SpeechRecognition en TS
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceRecognitionProps {
  status: GameStatus;
  isVoiceEnabled: boolean;
  onResult: (num: string) => void;
}

export const useVoiceRecognition = ({ status, isVoiceEnabled, onResult }: VoiceRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const statusRef = useRef(status);
  const isVoiceEnabledRef = useRef(isVoiceEnabled);

  useEffect(() => {
    statusRef.current = status;
    isVoiceEnabledRef.current = isVoiceEnabled;
  }, [status, isVoiceEnabled]);

  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    setSpeechSupported(true);
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setMicError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
      if (isVoiceEnabledRef.current && (statusRef.current === GameStatus.PLAYING || statusRef.current === GameStatus.VOICE_CHECK)) {
        setTimeout(() => {
          try {
            if (isVoiceEnabledRef.current) {
              recognition.start();
            }
          } catch (e) {}
        }, 300);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'aborted') return;
      let errorMsg = "Ocurrió un error con el micrófono.";
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        errorMsg = "Permiso denegado. Revisa los permisos del navegador.";
      } else if (event.error === 'no-speech') {
        return;
      } else if (event.error === 'network') {
        errorMsg = "Error de red. El reconocimiento de voz necesita internet.";
      }
      setMicError(errorMsg);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (interim) {
        setInterimTranscript(interim);
      }

      const parseToNumber = (text: string): string | null => {
        const lower = text.trim().toLowerCase();
        if (!lower) return null;

        const digitMatch = lower.match(/\d+/);
        if (digitMatch) return digitMatch[0];

        const numMap: Record<string, number> = {
          'cero': 0, 'uno': 1, 'una': 1, 'dos': 2, 'tres': 3, 'cuatro': 4,
          'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
          'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15,
          'dieciseis': 16, 'dieciséis': 16, 'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19,
          'veinte': 20, 'veintiuno': 21, 'veintidos': 22, 'veintidós': 22, 'veintitres': 23, 'veintitrés': 23,
          'veinticuatro': 24, 'veinticinco': 25, 'veintiseis': 26, 'veintiséis': 26, 'veintisiete': 27,
          'veintiocho': 28, 'veintinueve': 29, 'treinta': 30, 'cuarenta': 40, 'cincuenta': 50,
          'sesenta': 60, 'setenta': 70, 'ochenta': 80, 'noventa': 90, 'cien': 100
        };

        const tens = ['veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
        for (const ten of tens) {
           const regex = new RegExp(`${ten}\\s+y\\s+(\\w+)`);
           const match = lower.match(regex);
           if (match) {
             const unit = match[1];
             if (numMap[unit] !== undefined && numMap[unit] < 10) {
               return (numMap[ten] + numMap[unit]).toString();
             }
           }
        }

        const words = lower.split(/[\s,.!¡¿?]+/);
        for (const word of words) {
          if (numMap[word] !== undefined) {
            return numMap[word].toString();
          }
        }
        return null;
      };

      const num = parseToNumber(finalTranscript);
      if (num) {
        setInterimTranscript('');
        onResultRef.current(num);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try { recognition.stop(); } catch(e) {}
    };
  }, []);

  const startListening = async () => {
    setMicError(null);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      recognitionRef.current?.start();
    } catch (e: any) {
      setMicError("No se pudo acceder al micrófono.");
    }
  };

  const stopListening = () => {
    try { recognitionRef.current?.stop(); } catch(e) {}
  };

  return { isListening, speechSupported, micError, interimTranscript, startListening, stopListening };
};
