import { useEffect, useRef } from 'react';

interface UseIdleTimerOptions {
  timeoutMs?: number; // Tiempo límite de inactividad (por defecto 15 minutos)
  onIdle: () => void;
  enabled?: boolean;
}

/**
 * Hook modular para detección de inactividad de sesión (Inspirado en autogestion-sena).
 * Monitorea eventos de usuario (ratón, teclado, touch, scroll) para cerrar sesión automáticamente
 * en caso de abandono de puesto o terminal desatendida.
 */
export const useIdleTimer = ({
  timeoutMs = 15 * 60 * 1000,
  onIdle,
  enabled = true,
}: UseIdleTimerOptions): void => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const resetTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        console.warn(`[Seguridad] Sesión cerrada por inactividad (${timeoutMs / 1000 / 60} min)`);
        onIdle();
      }, timeoutMs);
    };

    const userEvents: Array<keyof WindowEventMap> = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
    ];

    userEvents.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    // Iniciar temporizador
    resetTimer();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      userEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [timeoutMs, onIdle, enabled]);
};
