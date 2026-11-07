import React, { useMemo, useState } from 'react';
import {
  X,
  UploadCloud,
  Download,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  FileText,
  Table2,
} from 'lucide-react';
import type { Product } from '../../types';
import { parseCatalogCsv, type ParsedProductRow } from '../../utils/catalogCsv';
import { downloadCsvTemplate } from '../../utils/catalogTemplate';
import { downloadExcelWorkbook, parseCatalogWorkbook } from '../../utils/catalogXlsx';
import { useToast } from '../ui/ToastProvider';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface CatalogImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (products: Product[]) => void;
}

/**
 * Importación de catálogo con plantilla Excel real (dos hojas, encabezados
 * con color y guía de uso), parser CSV robusto y vista previa con errores
 * por fila. Antes se partía por comas y una descripción con comas rompía
 * toda la importación.
 */
export const CatalogImportModal: React.FC<CatalogImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [rows, setRows] = useState<ParsedProductRow[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [fileName, setFileName] = useState('');
  const { notify } = useToast();

  const validProducts = useMemo(
    () => rows.map((row) => row.product).filter((product): product is Product => Boolean(product)),
    [rows]
  );
  const errorCount = rows.length - validProducts.length;

  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  const processFile = async (file: File) => {
    setFileName(file.name);
    setErrorMsg('');
    setRows([]);

    if (/\.(xlsx|xlsm)$/i.test(file.name)) {
      try {
        setRows(await parseCatalogWorkbook(file));
      } catch (error) {
        setErrorMsg(
          error instanceof Error
            ? error.message
            : 'No se pudo leer el Excel. Verifica que sea un .xlsx válido.'
        );
      }
      return;
    }

    if (!/\.(csv|txt)$/i.test(file.name)) {
      setErrorMsg('Usa un archivo .xlsx, .csv o .txt. También puedes descargar la plantilla oficial.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = String(event.target?.result || '');
        setRows(parseCatalogCsv(text));
      } catch (error) {
        setErrorMsg(error instanceof Error ? error.message : 'No se pudo leer el archivo.');
      }
    };
    reader.onerror = () => setErrorMsg('No se pudo leer el archivo. Inténtalo de nuevo.');
    reader.readAsText(file, 'UTF-8');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleConfirm = () => {
    if (validProducts.length === 0) return;
    onImport(validProducts);
    notify(`${validProducts.length} referencias se importaron al catálogo.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 p-4">
          <div className="flex items-center gap-2">
            <UploadCloud className="h-4 w-4 text-brand-apricot" />
            <div>
              <h3 className="font-editorial text-lg font-bold text-stone-900">
                Importación masiva de catálogo
              </h3>
              <p className="text-[10px] text-stone-500">
                Descarga la plantilla, complétala y súbela en .xlsx o .csv.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-xl p-1.5 text-stone-500 hover:bg-stone-200"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="scrollbar-slim space-y-4 overflow-y-auto p-5 text-xs">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-brand-apricot/25 bg-brand-apricot-soft/50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-brand-apricot" />
                <strong className="text-stone-900">Plantilla Excel oficial</strong>
              </div>
              <p className="mb-3 text-[11px] text-stone-600">
                .xlsx real con dos hojas: catálogo, columna de imagen y guía. Acepta una URL o una
                imagen pegada con Insertar → Imagen; el sistema detecta cuál usaste.
              </p>
              <button
                onClick={() => void downloadExcelWorkbook()}
                className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-brand-apricot px-3 py-2 font-semibold text-white shadow-xs hover:bg-brand-apricot-dark"
              >
                <Download className="h-3.5 w-3.5" /> Descargar Excel (.xlsx)
              </button>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5 text-stone-600" />
                <strong className="text-stone-900">Versión CSV UTF-8</strong>
              </div>
              <p className="mb-3 text-[11px] text-stone-600">
                Para Google Sheets o Excel en español. Usa punto y coma como separador y
                conserva las tildes.
              </p>
              <button
                onClick={downloadCsvTemplate}
                className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-2 font-semibold text-stone-700 hover:bg-stone-100"
              >
                <Download className="h-3.5 w-3.5" /> Descargar CSV
              </button>
            </div>
          </div>

          <label
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50/50 p-6 transition-colors hover:border-brand-apricot"
          >
            <UploadCloud className="h-8 w-8 text-stone-400" />
            <span className="font-semibold text-stone-700">
              Arrastra tu Excel o CSV, o haz clic para buscarlo
            </span>
            <span className="text-[10px] text-stone-400">
              .xlsx con imágenes pegadas o URL · .csv con comas o punto y coma · máximo 500 filas
            </span>
            <input
              type="file"
              accept=".xlsx,.xlsm,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {fileName && (
            <p className="text-center text-[11px] text-stone-600">
              Archivo: <strong>{fileName}</strong>
            </p>
          )}

          {errorMsg && (
            <div
              role="alert"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 p-3 font-medium text-rose-700"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {rows.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4" /> {validProducts.length} listos para importar
                </span>
                {errorCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 font-semibold text-rose-700">
                    <AlertCircle className="h-4 w-4" /> {errorCount} filas con error
                  </span>
                )}
              </div>

              <div className="overflow-hidden rounded-2xl border border-stone-200">
                <div className="flex items-center gap-1.5 border-b border-stone-200 bg-stone-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-stone-500">
                  <Table2 className="h-3.5 w-3.5" /> Vista previa
                </div>
                <div className="max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="sticky top-0 bg-white text-[10px] font-semibold uppercase text-stone-400">
                      <tr>
                        <th className="px-3 py-2">Fila</th>
                        <th className="px-3 py-2">SKU</th>
                        <th className="px-3 py-2">Imagen</th>
                        <th className="px-3 py-2">Producto</th>
                        <th className="px-3 py-2">Categoría</th>
                        <th className="px-3 py-2 text-right">Precio</th>
                        <th className="px-3 py-2">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {rows.slice(0, 50).map((row) => (
                        <tr key={row.rowNumber} className={row.error ? 'bg-rose-50/40' : ''}>
                          <td className="px-3 py-1.5 text-stone-400">{row.rowNumber}</td>
                          <td className="px-3 py-1.5 font-mono text-stone-700">
                            {row.product?.code || '—'}
                          </td>
                          <td className="px-3 py-1.5">
                            {row.product?.image ? (
                              <img
                                src={row.product.image}
                                alt=""
                                className="h-8 w-8 rounded-md border border-stone-200 object-cover"
                                onError={(event) => {
                                  event.currentTarget.style.visibility = 'hidden';
                                }}
                              />
                            ) : (
                              <span className="text-stone-300">—</span>
                            )}
                          </td>
                          <td className="max-w-[220px] truncate px-3 py-1.5 text-stone-800">
                            {row.product?.name || '—'}
                          </td>
                          <td className="px-3 py-1.5 text-stone-500">
                            {row.product?.categoryLabel || '—'}
                          </td>
                          <td className="px-3 py-1.5 text-right text-stone-700">
                            {row.product ? `$${row.product.price.toLocaleString('es-CO')}` : '—'}
                          </td>
                          <td className="px-3 py-1.5">
                            {row.product ? (
                              <span className="font-semibold text-emerald-700">OK</span>
                            ) : (
                              <span className="font-semibold text-rose-600">{row.error}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-stone-200 bg-stone-50 p-4">
          <button
            onClick={onClose}
            className="cursor-pointer rounded-xl border border-stone-200 px-4 py-2 font-semibold text-stone-600 hover:bg-stone-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={validProducts.length === 0}
            className="cursor-pointer rounded-xl bg-brand-espresso px-4 py-2 font-semibold text-white shadow-xs transition-all hover:bg-stone-800 disabled:opacity-50"
          >
            Importar {validProducts.length > 0 ? `${validProducts.length} referencias` : 'productos'}
          </button>
        </div>
      </div>
    </div>
  );
};
