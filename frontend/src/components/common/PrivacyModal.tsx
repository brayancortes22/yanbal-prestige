import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-stone-200/80 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-editorial text-lg font-bold text-stone-900">
              Tratamiento de Datos Personales
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-stone-200 text-stone-500 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs text-stone-600 leading-relaxed">
          <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 text-emerald-950 font-medium">
            Cumplimiento estricto de la Ley Estatutaria 1581 de 2012 y el Decreto 1377 de 2013 de la República de Colombia.
          </div>

          <h4 className="font-bold text-stone-900 text-sm">1. Finalidad del Tratamiento</h4>
          <p>
            Los datos personales suministrados (nombre, teléfono, ciudad y dirección) serán utilizados exclusivamente por <strong>Yanbal Prestige</strong> y su red autorizada de directoras y consultoras independientes para:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Coordinar el despacho, entrega y cobro de productos cosméticos solicitados.</li>
            <li>Brindar asesoría personalizada sobre cuidados cutáneos y aplicación de rutinas.</li>
            <li>Gestionar el soporte de garantías oficiales Yanbal y seguimiento post-venta.</li>
          </ul>

          <h4 className="font-bold text-stone-900 text-sm">2. Derechos del Titular</h4>
          <p>
            En cualquier momento, la titular podrá ejercer sus derechos de conocer, actualizar, rectificar o solicitar la supresión de sus datos mediante mensaje directo a su Consultora o a la Dirección General.
          </p>

          <h4 className="font-bold text-stone-900 text-sm">3. Seguridad y Confidencialidad</h4>
          <p>
            Yanbal Prestige garantiza la confidencialidad de la información y prohíbe la comercialización, venta o cesión de datos a terceros con fines publicitarios no autorizados.
          </p>
        </div>

        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Entendido y Acepto
          </button>
        </div>
      </div>
    </div>
  );
};
