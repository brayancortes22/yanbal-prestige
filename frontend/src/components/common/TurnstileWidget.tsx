import React, { useEffect, useRef } from 'react';
import { TURNSTILE_SITE_KEY } from '../../config/turnstile';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        params: {
          sitekey: string;
          callback?: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact' | 'flexible';
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  siteKey?: string;
}

const SCRIPT_ID = 'cf-turnstile-script';

export const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  onSuccess,
  siteKey = TURNSTILE_SITE_KEY
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  // El callback del padre cambia de identidad en cada render. Guardarlo en un
  // ref evita reiniciar el widget (que lo dejaba atascado en "Verificando...").
  const onSuccessRef = useRef(onSuccess);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    if (!siteKey) return;

    const renderWidget = () => {
      if (!window.turnstile || !containerRef.current || widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: 'light',
        size: 'flexible',
        callback: (token: string) => onSuccessRef.current(token)
      });
    };

    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    if (!existingScript) {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = renderWidget;
      document.head.appendChild(script);
    } else if (window.turnstile) {
      renderWidget();
    } else {
      existingScript.addEventListener('load', renderWidget, { once: true });
    }

    return () => {
      existingScript?.removeEventListener('load', renderWidget);
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey]);

  if (!siteKey) return null;

  return (
    <div className="my-2 flex flex-col items-center justify-center">
      <div ref={containerRef} className="cf-turnstile min-h-[45px] w-full max-w-[300px]" />
      <span className="text-[10px] text-stone-400 mt-1 flex items-center gap-1">
        Blindaje perimetral activo contra robots y bots
      </span>
    </div>
  );
};
