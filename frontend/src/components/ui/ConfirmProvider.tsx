import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AlertTriangle, HelpCircle, X } from 'lucide-react';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  tone?: 'danger' | 'primary';
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | undefined>(undefined);

interface ConfirmState {
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
}

/**
 * Diálogo de confirmación con promesa. Se usa antes de acciones delicadas
 * (eliminar, registrar un pago, cambiar estados) para que nada ocurra
 * "por accidente" y en silencio.
 */
export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback<ConfirmFn>(
    (options) =>
      new Promise<boolean>((resolve) => {
        setState({ options, resolve });
      }),
    []
  );

  const close = useCallback(
    (value: boolean) => {
      setState((current) => {
        current?.resolve(value);
        return null;
      });
    },
    []
  );

  useEffect(() => {
    if (!state) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close(false);
      if (event.key === 'Enter') close(true);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [state, close]);

  useBodyScrollLock(Boolean(state));

  const tone = state?.options.tone ?? 'primary';
  const isDanger = tone === 'danger';

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm"
          onClick={() => close(false)}
          role="presentation"
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-sm overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl"
          >
            <div className="flex items-start gap-3 p-5">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                  isDanger ? 'bg-rose-50 text-rose-600' : 'bg-brand-apricot-soft text-brand-apricot'
                }`}
              >
                {isDanger ? <AlertTriangle className="h-5 w-5" /> : <HelpCircle className="h-5 w-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <h3 id="confirm-title" className="font-editorial text-lg font-bold text-stone-900">
                  {state.options.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-stone-600">{state.options.message}</p>
              </div>
              <button
                onClick={() => close(false)}
                className="cursor-pointer rounded-full p-1 text-stone-400 hover:bg-stone-100"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex justify-end gap-2 border-t border-stone-100 bg-stone-50 p-4">
              <button
                onClick={() => close(false)}
                className="cursor-pointer rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                {state.options.cancelText || 'Cancelar'}
              </button>
              <button
                onClick={() => close(true)}
                className={`cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-sm ${
                  isDanger
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-brand-apricot hover:bg-brand-apricot-dark'
                }`}
              >
                {state.options.confirmText || 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = (): ConfirmFn => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm debe usarse dentro de ConfirmProvider');
  return context;
};
