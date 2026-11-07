import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
}

interface ToastContextValue {
  notify: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const kindStyles: Record<ToastKind, { shell: string; Icon: typeof CheckCircle2 }> = {
  success: { shell: 'border-emerald-200 bg-emerald-50 text-emerald-900', Icon: CheckCircle2 },
  error: { shell: 'border-rose-200 bg-rose-50 text-rose-900', Icon: AlertCircle },
  info: { shell: 'border-stone-200 bg-white text-stone-800', Icon: Info },
};

/**
 * Avisos flotantes para confirmar que una acción se ejecutó.
 * Antes varias acciones (guardar, pagar, eliminar) ocurrían en silencio.
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<number, number>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const notify = useCallback(
    (message: string, kind: ToastKind = 'success') => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev.slice(-3), { id, message, kind }]);
      const timer = window.setTimeout(() => dismiss(id), 4500);
      timers.current.set(id, timer);
    },
    [dismiss]
  );

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
    },
    []
  );

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[120] flex w-[min(92vw,380px)] flex-col gap-2">
        {toasts.map((toast) => {
          const { shell, Icon } = kindStyles[toast.kind];
          return (
            <div
              key={toast.id}
              role="status"
              className={`toast-in pointer-events-auto flex items-start gap-2.5 rounded-2xl border p-3 shadow-xl backdrop-blur ${shell}`}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="flex-1 text-[11px] font-medium leading-relaxed">{toast.message}</p>
              <button
                onClick={() => dismiss(toast.id)}
                className="cursor-pointer rounded-full p-0.5 opacity-50 hover:opacity-100"
                aria-label="Cerrar aviso"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast debe usarse dentro de ToastProvider');
  return context;
};
