import React, { useState } from 'react';
import { X, UploadCloud, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Product } from '../../types';

interface CatalogImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (products: Product[]) => void;
}

export const CatalogImportModal: React.FC<CatalogImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  if (!isOpen) return null;

  const [parsedRows, setParsedRows] = useState<Product[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [fileName, setFileName] = useState('');

  const handleDownloadTemplate = () => {
    const headers = 'code,name,category,price,originalPrice,image,description,badge,consultantTip';
    const sample = 'EXT-02,Suero Hidratante Concentrado,rostro,145000,190000,https://images.unsplash.com/photo-1620916566398-39f1143ab7be,Hidratación profunda 72 horas,Nuevo,Aplicar antes de la crema de noche';
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${sample}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'plantilla_catalogo_yanbal.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          setErrorMsg('El archivo CSV debe tener encabezados y al menos una fila.');
          return;
        }

        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
        const expected = ['code', 'name', 'category', 'price'];
        if (!expected.every((exp) => headers.includes(exp))) {
          setErrorMsg('El CSV debe incluir al menos: code, name, category, price');
          return;
        }

        const prods: Product[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.trim());
          if (cols.length < headers.length) continue;
          const row: Record<string, string> = {};
          headers.forEach((h, idx) => {
            row[h] = cols[idx] || '';
          });

          const cat = (row.category || 'rostro').toLowerCase() as Product['category'];
          const catLabels: Record<string, string> = {
            rostro: 'Tratamiento Facial',
            solar: 'Protección Solar',
            perfumes: 'Perfumería Fina',
            maquillaje: 'Maquillaje Funcional',
            joyeria: 'Joyería Fina',
          };

          prods.push({
            id: `prod-${Date.now()}-${i}`,
            code: row.code || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
            name: row.name || 'Producto Yanbal',
            category: ['rostro', 'perfumes', 'maquillaje', 'joyeria', 'solar'].includes(cat) ? cat : 'rostro',
            categoryLabel: catLabels[cat] || 'Tratamiento Facial',
            price: Number(row.price) || 99000,
            originalPrice: row.originalprice ? Number(row.originalprice) : undefined,
            image: row.image || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
            description: row.description || 'Producto original con garantía Yanbal.',
            badge: row.badge || undefined,
            usageSteps: ['Paso 1: Aplicar sobre la piel limpia.', 'Paso 2: Masajear suavemente.'],
            consultantTip: row.consultanttip || 'Uso diario recomendado por consultora experta.',
            active: true,
          });
        }
        setParsedRows(prods);
      } catch {
        setErrorMsg('Error al procesar el archivo CSV. Verifique el formato.');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirm = () => {
    if (parsedRows.length === 0) return;
    onImport(parsedRows);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-stone-200/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-orange-600" />
            <h3 className="font-editorial text-lg font-bold text-stone-900">Importación Masiva de Catálogo</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-stone-200 text-stone-500 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs overflow-y-auto">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-orange-50 border border-orange-200 text-orange-950">
            <div>
              <p className="font-semibold">Plantilla Oficial CSV</p>
              <p className="text-[11px] text-orange-800">Descarga el modelo con las columnas requeridas.</p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Plantilla</span>
            </button>
          </div>

          <label className="border-2 border-dashed border-stone-300 hover:border-orange-500 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-stone-50/50">
            <UploadCloud className="w-8 h-8 text-stone-400" />
            <span className="font-semibold text-stone-700">Arrastra tu archivo .CSV o haz clic para buscar</span>
            <span className="text-[10px] text-stone-400">Codificación UTF-8</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>

          {fileName && <p className="text-center font-medium text-stone-600">Archivo: <strong>{fileName}</strong></p>}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-center font-medium flex items-center justify-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          {parsedRows.length > 0 && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between">
              <span className="font-semibold">{parsedRows.length} productos detectados listos</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          )}
        </div>

        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-semibold hover:bg-stone-100 cursor-pointer">
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={parsedRows.length === 0}
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold shadow-xs cursor-pointer transition-all"
          >
            Importar {parsedRows.length > 0 ? `${parsedRows.length} Referencias` : 'Productos'}
          </button>
        </div>
      </div>
    </div>
  );
};
