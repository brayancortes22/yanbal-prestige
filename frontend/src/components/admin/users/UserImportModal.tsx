import React, { useMemo, useState } from 'react';
import { X, UploadCloud, Download, CheckCircle2, AlertCircle, Users, FileSpreadsheet, FileText } from 'lucide-react';
import type { AppUser } from '../../../types';
import { parseUserCsv, downloadUserCsvTemplate, type ParsedUserRow } from '../../../utils/userCsv';
import { downloadUserExcelWorkbook, parseUserWorkbook } from '../../../utils/userXlsx';
import { useToast } from '../../ui/ToastProvider';
import { useBodyScrollLock } from '../../../hooks/useBodyScrollLock';

interface UserImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (users: AppUser[]) => void;
}

export const UserImportModal: React.FC<UserImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [rows, setRows] = useState<ParsedUserRow[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { notify } = useToast();

  const validUsers = useMemo(
    () => rows.map((r) => r.user).filter((u): u is AppUser => Boolean(u)),
    [rows]
  );
  const errorCount = rows.length - validUsers.length;

  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  const processFile = async (file: File) => {
    setFileName(file.name);
    setErrorMsg('');
    setRows([]);
    setIsProcessing(true);

    try {
      if (/\.(xlsx|xlsm)$/i.test(file.name)) {
        const parsed = await parseUserWorkbook(file);
        if (parsed.length === 0) {
          setErrorMsg('El archivo Excel no contiene filas de datos o solo tiene encabezados.');
        } else {
          setRows(parsed);
        }
        return;
      }

      if (!/\.(csv|txt)$/i.test(file.name)) {
        setErrorMsg('Por favor selecciona un archivo Excel (.xlsx) o CSV (.csv, .txt).');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = String(e.target?.result || '');
          const parsed = parseUserCsv(text);
          if (parsed.length === 0) {
            setErrorMsg('El archivo no contiene registros o solo contiene encabezados.');
          } else {
            setRows(parsed);
          }
        } catch (err) {
          setErrorMsg(err instanceof Error ? err.message : 'Error al procesar el archivo CSV.');
        }
      };
      reader.onerror = () => setErrorMsg('Error al leer el archivo en disco.');
      reader.readAsText(file, 'UTF-8');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al procesar el archivo Excel.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) void processFile(file);
  };

  const handleConfirm = () => {
    if (validUsers.length === 0) return;
    onImport(validUsers);
    notify(`Se importaron ${validUsers.length} integrantes exitosamente a la red.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
        {/* Cabecera */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-editorial text-lg font-bold text-stone-900">
                Carga Masiva de Integrantes de la Red
              </h3>
              <p className="text-xs text-stone-500">
                Importa consultores/as, líderes o coordinadores/as desde una plantilla Excel (.xlsx) o CSV.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Descarga de plantillas */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-orange-50/50 border border-orange-100">
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-5 h-5 text-orange-600 shrink-0" />
              <div>
                <span className="text-xs text-stone-800 font-bold block">
                  Plantilla Oficial Formateada
                </span>
                <span className="text-[11px] text-stone-500">
                  Descarga el formato con validación de roles y columnas configuradas.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => void downloadUserExcelWorkbook()}
                className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Excel (.xlsx)</span>
              </button>
              <button
                type="button"
                onClick={downloadUserCsvTemplate}
                className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                title="Descargar versión ligera CSV"
              >
                <FileText className="w-3.5 h-3.5 text-stone-500" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          {/* Zona de Drop / Subida */}
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-stone-200 hover:border-orange-400 bg-stone-50/40 hover:bg-orange-50/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
          >
            <UploadCloud className="w-8 h-8 text-stone-400 mb-2" />
            <span className="text-xs font-bold text-stone-800">
              {fileName ? fileName : 'Arrastra tu archivo Excel (.xlsx) o CSV aquí o haz clic para examinar'}
            </span>
            <span className="text-[11px] text-stone-400 mt-1">
              Compatible con Microsoft Excel (.xlsx), Google Sheets y archivos .csv
            </span>
            <input type="file" accept=".xlsx,.xlsm,.csv,.txt" onChange={handleFileUpload} className="hidden" />
          </label>

          {isProcessing && (
            <p className="text-center text-xs text-stone-500 py-2">Procesando archivo...</p>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Vista previa de filas */}
          {rows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                <span>Vista Previa ({rows.length} personas detectadas)</span>
                <span className="flex items-center gap-3">
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {validUsers.length} válidos
                  </span>
                  {errorCount > 0 && (
                    <span className="text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errorCount} con error
                    </span>
                  )}
                </span>
              </div>

              <div className="max-h-52 overflow-y-auto border border-stone-200 rounded-xl divide-y divide-stone-100 text-xs">
                {rows.map((row) => (
                  <div
                    key={row.rowNumber}
                    className={`p-2.5 flex items-center justify-between gap-2 ${
                      row.error ? 'bg-rose-50/50' : 'bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-stone-900 truncate">
                        {row.raw.nombre || <span className="text-stone-400 italic">Sin nombre</span>}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">
                        {row.raw.email} · {row.raw.rol || 'CONSULTORA'} · {row.raw.zona || 'Zona General'}
                      </div>
                    </div>
                    {row.error ? (
                      <span className="text-[11px] text-rose-600 font-medium shrink-0 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {row.error}
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-600 font-medium shrink-0 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Válido
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pie de modal */}
        <div className="p-4 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={validUsers.length === 0}
            onClick={handleConfirm}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirmar Carga ({validUsers.length} integrantes)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
