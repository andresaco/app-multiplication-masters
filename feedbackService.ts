
import { Result } from "./types";

export const getLocalFeedback = (results: Result[], table: number, totalScore: number): string => {
  const correctCount = results.filter(r => r.isCorrect).length;
  const avgTime = results.reduce((acc, r) => acc + r.timeTaken, 0) / results.length;
  const avgTimeSec = avgTime / 1000;

  // 1. Mensaje base según aciertos
  let message = "";
  if (correctCount === 10) {
    message = "¡PERFECTO! Eres un auténtico Maestro de las Matemáticas. 🏆";
  } else if (correctCount >= 8) {
    message = "¡Casi perfecto! Lo has hecho genial, solo te han faltado un par. 🌟";
  } else if (correctCount >= 5) {
    message = "¡Buen esfuerzo! Vas por muy buen camino, ¡sigue practicando! 🚀";
  } else {
    message = "¡No te rindas! La práctica hace al maestro. ¡Vuelve a intentarlo! 🐢";
  }

  // 2. Comentario sobre velocidad
  if (correctCount >= 8) {
    if (avgTimeSec < 2.5) {
      message += " ¡Tus dedos vuelan sobre el teclado! ⚡";
    } else if (avgTimeSec < 5) {
      message += " Tienes muy buen ritmo. ⏱️";
    }
  }

  // 3. Trucos específicos por tabla
  const tableTips: Record<number, string> = {
    2: "Recuerda: multiplicar por 2 es simplemente sumar el número consigo mismo. ¡Es el doble!",
    5: "Un secreto: los resultados de la tabla del 5 siempre terminan en 0 o en 5. 🖐️",
    9: "¡El truco de los dedos! Si bajas el dedo que corresponde al número que multiplicas, verás el resultado.",
    10: "¡Esta es mágica! Solo tienes que añadir un 0 al final del número y... ¡listo! ✨",
    4: "Truco: la tabla del 4 es el doble del doble. ¡Piénsalo así!",
    1: "Cualquier número multiplicado por 1 se queda exactamente igual. ¡Fácil! 😉"
  };

  if (tableTips[table]) {
    message += ` Además, un truco para la tabla del ${table}: ${tableTips[table]}`;
  }

  return message;
};
