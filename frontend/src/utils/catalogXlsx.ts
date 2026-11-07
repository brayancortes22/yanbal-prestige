import type { ParsedProductRow } from './catalogCsv';
import { applyGenericImage, parseCatalogRows } from './catalogCsv';

const HEADERS = [
  { header: 'Código SKU *', width: 16 },
  { header: 'Nombre del producto *', width: 32 },
  { header: 'Imagen (URL o pegada)', width: 30 },
  { header: 'Categoría', width: 16 },
  { header: 'Precio venta (COP) *', width: 18 },
  { header: 'Precio anterior (COP)', width: 18 },
  { header: 'Descripción', width: 45 },
  { header: 'Etiqueta / badge', width: 16 },
  { header: 'Tip para la consultora', width: 40 },
  { header: 'Pasos de uso (separar con |)', width: 40 },
];

const SAMPLE_ROWS = [
  [
    'EXT-02',
    'Suero Hidratante Concentrado',
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    'rostro',
    145000,
    190000,
    'Hidratación profunda por 72 horas con ácido hialurónico y extractos botánicos.',
    'Nuevo',
    'Aplicar antes de la crema de noche para potenciar la hidratación.',
    'Limpiar el rostro|Aplicar 3 gotas|Masajear hasta absorber',
  ],
  [
    'SOL-03',
    'Protector Solar Facial SPF 50',
    '',
    'solar',
    89000,
    110000,
    'Protección UVA/UVB de textura ligera, ideal para uso diario bajo el maquillaje.',
    'Best seller',
    'Recomendar reaplicar cada 4 horas si hay exposición directa al sol.',
    'Aplicar como último paso de la rutina|Reaplicar cada 4 horas',
  ],
];

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Genera un .xlsx real con ExcelJS (no un CSV disfrazado). Incluye una hoja
 * de catálogo con estilos, fila congelada, validación de categorías y una
 * hoja de instrucciones. La columna de imagen acepta URL o imagen pegada.
 */
export const downloadExcelWorkbook = async () => {
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Yanbal Prestige';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Catálogo', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  sheet.columns = HEADERS.map((column) => ({ header: column.header, width: column.width }));

  const headerRow = sheet.getRow(1);
  headerRow.height = 30;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE85D36' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FFC94A27' } },
    };
  });

  SAMPLE_ROWS.forEach((values) => {
    const row = sheet.addRow(values);
    row.height = 28;
    row.eachCell((cell, col) => {
      cell.alignment = { vertical: 'top', wrapText: true };
      cell.border = {
        bottom: { style: 'hair', color: { argb: 'FFEFE9E1' } },
        left: { style: 'hair', color: { argb: 'FFEFE9E1' } },
        right: { style: 'hair', color: { argb: 'FFEFE9E1' } },
        top: { style: 'hair', color: { argb: 'FFEFE9E1' } },
      };
      if (col === 1) cell.font = { name: 'Consolas', bold: true, color: { argb: 'FFC94A27' } };
      if (col === 5 || col === 6) cell.numFmt = '"$"#,##0';
    });
  });

  // Validación de categorías para evitar errores de digitación.
  for (let row = 2; row <= 500; row += 1) {
    sheet.getCell(`D${row}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"rostro,solar,perfumes,maquillaje,joyeria"'],
      showErrorMessage: true,
      errorTitle: 'Categoría no válida',
      error: 'Usa: rostro, solar, perfumes, maquillaje o joyeria.',
    };
  }
  sheet.autoFilter = { from: 'A1', to: 'J1' };

  const guide = workbook.addWorksheet('Instrucciones');
  guide.columns = [{ width: 26 }, { width: 14 }, { width: 85 }];
  guide.addRow(['Guía de la plantilla de catálogo']).font = {
    bold: true,
    size: 16,
    color: { argb: 'FF3B241D' },
  };
  guide.addRow([]);
  const guideRows = [
    ['Columna', 'Obligatoria', 'Qué escribir'],
    ['Código SKU', 'Sí', 'Código único de la referencia. No se puede repetir.'],
    ['Nombre del producto', 'Sí', 'Nombre comercial tal como aparece en el catálogo.'],
    [
      'Imagen (URL o pegada)',
      'No',
      'Escribe una URL (http...) o pega una imagen con Insertar > Imagen. Si pegas la imagen sobre la fila, se detecta automáticamente.',
    ],
    ['Categoría', 'No', 'rostro, solar, perfumes, maquillaje o joyeria.'],
    ['Precio venta (COP)', 'Sí', 'Solo números. Ej: 145000.'],
    ['Precio anterior', 'No', 'Precio de referencia para mostrar el descuento.'],
    ['Descripción', 'No', 'Texto comercial. Puede contener comas.'],
    ['Etiqueta / badge', 'No', 'Ej: Nuevo, Best seller, Top Ventas.'],
    ['Tip para la consultora', 'No', 'Consejo de venta o de uso profesional.'],
    ['Pasos de uso', 'No', 'Separa cada paso con el símbolo |.'],
  ];
  guideRows.forEach((values, index) => {
    const row = guide.addRow(values);
    if (index === 0) {
      row.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B241D' } };
      });
    } else {
      row.eachCell((cell) => {
        cell.alignment = { vertical: 'top', wrapText: true };
      });
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    'plantilla_catalogo_yanbal.xlsx'
  );
};

const blobToCompressedDataUrl = async (buffer: ArrayBuffer, extension: string): Promise<string> => {
  const mime =
    extension === 'png' ? 'image/png' : extension === 'gif' ? 'image/gif' : 'image/jpeg';
  const blob = new Blob([buffer], { type: mime });
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
    reader.readAsDataURL(blob);
  });

  // Reduce el peso antes de guardarlo en el catálogo local.
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const maxSize = 900;
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      if (scale >= 1 && dataUrl.length < 250_000) {
        resolve(dataUrl);
        return;
      }
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      const context = canvas.getContext('2d');
      if (!context) {
        resolve(dataUrl);
        return;
      }
      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    image.onerror = () => resolve(dataUrl);
    image.src = dataUrl;
  });
};

/**
 * Lee un .xlsx con ExcelJS, convierte las celdas a una matriz y asocia las
 * imágenes pegadas a su fila. Prioridad: URL en la celda > imagen pegada >
 * imagen genérica.
 */
export const parseCatalogWorkbook = async (file: File): Promise<ParsedProductRow[]> => {
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());

  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error('El archivo no tiene hojas.');

  const matrix: string[][] = [];
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    const values: string[] = [];
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      values[colNumber - 1] = cell.text ?? '';
    });
    matrix[rowNumber - 1] = values;
  });

  // Rellena huecos para que los índices coincidan con las filas de Excel.
  for (let index = 0; index < matrix.length; index += 1) {
    if (!matrix[index]) matrix[index] = [];
    for (let col = 0; col < 10; col += 1) {
      if (matrix[index][col] === undefined) matrix[index][col] = '';
    }
  }

  const imagesByRow = new Map<number, string>();
  const images = sheet.getImages();
  for (const image of images.slice(0, 60)) {
    const nativeRow = image.range.tl.nativeRow ?? -1;
    if (nativeRow < 0 || imagesByRow.has(nativeRow)) continue;
    try {
      const media = workbook.getImage(Number(image.imageId));
      if (!media?.buffer || media.buffer.byteLength > 6_000_000) continue;
      const dataUrl = await blobToCompressedDataUrl(media.buffer as ArrayBuffer, media.extension);
      imagesByRow.set(nativeRow, dataUrl);
    } catch {
      // Una imagen ilegible no debe tumbar toda la importación.
    }
  }

  const parsed = parseCatalogRows(matrix);

  const withEmbedded = parsed.map((row) => {
    if (!row.product) return row;
    const cellImage = row.product.image.trim();
    // Prioridad 1: URL escrita en la celda.
    const isUrl =
      /^https?:\/\//i.test(cellImage) ||
      cellImage.startsWith('data:image') ||
      cellImage.startsWith('/uploads/');
    if (isUrl) return row;

    // Prioridad 2: imagen pegada sobre la fila.
    const embedded = imagesByRow.get(row.rowNumber - 1);
    if (!embedded) return row;
    return {
      ...row,
      product: { ...row.product, image: embedded },
    };
  });

  // Prioridad 3: imagen genérica si no hubo ni URL ni imagen pegada.
  return applyGenericImage(withEmbedded);
};
