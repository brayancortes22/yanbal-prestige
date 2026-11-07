import type { Product } from '../types';

export interface ParsedProductRow {
  rowNumber: number;
  product?: Product;
  error?: string;
}

export const GENERIC_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80';

/** Rellena con la imagen genérica solo las filas que siguen sin imagen. */
export const applyGenericImage = (rows: ParsedProductRow[]): ParsedProductRow[] =>
  rows.map((row) =>
    row.product && !row.product.image.trim()
      ? { ...row, product: { ...row.product, image: GENERIC_PRODUCT_IMAGE } }
      : row
  );

const CATEGORY_LABELS: Record<string, string> = {
  rostro: 'Tratamiento Facial',
  solar: 'Protección Solar',
  perfumes: 'Perfumería Fina',
  maquillaje: 'Maquillaje Funcional',
  joyeria: 'Joyería Fina',
};

const normalizeHeader = (value: string): string =>
  value
    .replace(/^\uFEFF/, '')
    .replace(/\([^)]*\)/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    // Deja solo letras y números: "Código SKU *" -> "codigosku".
    .replace(/[^a-z0-9]+/g, '');

const HEADER_ALIASES: Record<string, string[]> = {
  code: ['code', 'codigo', 'codigosku', 'sku', 'referencia'],
  name: ['name', 'nombre', 'nombredelproducto', 'nombreproducto', 'producto'],
  category: ['category', 'categoria', 'linea'],
  price: ['price', 'precio', 'precioventa', 'valor'],
  originalprice: ['originalprice', 'preciooriginal', 'precioanterior', 'precioantes'],
  image: ['image', 'imagen', 'urldeimagen', 'imagenurl', 'foto', 'urlimagen'],
  description: ['description', 'descripcion', 'detalle'],
  badge: ['badge', 'etiqueta', 'etiquetabadge', 'distintivo', 'insignia'],
  consultanttip: [
    'consultanttip',
    'tipparalaconsultora',
    'tipconsultora',
    'consejo',
    'tip',
    'recomendacion',
  ],
  usagesteps: ['usagesteps', 'pasosdeuso', 'modouso', 'pasos', 'mododeuso'],
};

/** Acepta 145000, 145.000, 145,000 y 145,50 (formatos de Excel ES/EN). */
const parseMoney = (raw: string): number => {
  const clean = raw.replace(/[^\d.,-]/g, '');
  if (!clean) return Number.NaN;

  const lastComma = clean.lastIndexOf(',');
  const lastDot = clean.lastIndexOf('.');

  if (lastComma > lastDot) {
    const decimals = clean.length - lastComma - 1;
    // "89,500" en un catálogo en COP son miles, no 89,5.
    if (decimals === 3 && lastDot < 0) {
      return Number(clean.replace(/,/g, ''));
    }
    return Number(clean.replace(/\./g, '').replace(',', '.'));
  }
  if (lastDot >= 0 && clean.length - lastDot - 1 === 3) {
    return Number(clean.replace(/\./g, ''));
  }
  return Number(clean.replace(/,/g, ''));
};

const normalizeCategory = (value: string): Product['category'] => {
  const clean = normalizeHeader(value);
  if (clean.includes('solar') || clean.includes('proteccion')) return 'solar';
  if (clean.includes('perfum') || clean.includes('fragancia')) return 'perfumes';
  if (clean.includes('maquill') || clean.includes('makeup')) return 'maquillaje';
  if (clean.includes('joy') || clean.includes('bisut')) return 'joyeria';
  return 'rostro';
};

/**
 * Parser CSV real: soporta comas o punto y coma (Excel en español),
 * comillas dobles escapadas, saltos de línea dentro de celdas y BOM UTF-8.
 * El parser anterior hacía `split(',')` y rompía descripciones con comas.
 */
export const parseCsv = (text: string): string[][] => {
  const clean = text.replace(/^\uFEFF/, '');
  const firstLine = clean.split(/\r?\n/)[0] || '';
  const delimiter =
    (firstLine.match(/;/g)?.length || 0) > (firstLine.match(/,/g)?.length || 0) ? ';' : ',';

  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < clean.length; index += 1) {
    const char = clean[index];

    if (inQuotes) {
      if (char === '"') {
        if (clean[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char !== '\r') {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows
    .map((cells) => cells.map((cell) => cell.trim()))
    .filter((cells) => cells.some((cell) => cell.length > 0));
};

const resolveHeaders = (headers: string[]): Record<string, number> => {
  const normalized = headers.map(normalizeHeader);
  const map: Record<string, number> = {};
  Object.entries(HEADER_ALIASES).forEach(([key, aliases]) => {
    const index = normalized.findIndex((header) => aliases.includes(header));
    if (index >= 0) map[key] = index;
  });
  return map;
};

export const parseCatalogCsv = (text: string): ParsedProductRow[] =>
  applyGenericImage(parseCatalogRows(parseCsv(text)));

/**
 * Procesa una matriz de filas (CSV o Excel). La comparten el parser CSV y
 * el lector de .xlsx, de modo que ambas rutas validan exactamente igual.
 */
export const parseCatalogRows = (rows: string[][]): ParsedProductRow[] => {
  if (rows.length < 2) {
    throw new Error('El archivo debe tener encabezados y al menos una fila de productos.');
  }

  const headerMap = resolveHeaders(rows[0]);
  if (headerMap.code === undefined || headerMap.name === undefined || headerMap.price === undefined) {
    throw new Error(
      'Faltan columnas obligatorias: Código SKU, Nombre y Precio. Descarga la plantilla oficial.'
    );
  }

  const seenCodes = new Set<string>();
  const parsed: ParsedProductRow[] = [];

  for (let i = 1; i < rows.length; i += 1) {
    const cells = rows[i];
    const get = (key: string): string => {
      const index = headerMap[key];
      return index === undefined ? '' : (cells[index] || '').trim();
    };

    const code = get('code').toUpperCase();
    const name = get('name');
    const price = parseMoney(get('price'));
    const originalPriceRaw = get('originalprice');
    const originalPrice = originalPriceRaw ? parseMoney(originalPriceRaw) : undefined;

    const rowNumber = i + 1;
    if (!code) {
      parsed.push({ rowNumber, error: 'Falta el código SKU.' });
      continue;
    }
    if (seenCodes.has(code)) {
      parsed.push({ rowNumber, error: `El SKU ${code} está repetido en el archivo.` });
      continue;
    }
    if (!name) {
      parsed.push({ rowNumber, error: 'Falta el nombre del producto.' });
      continue;
    }
    if (!Number.isFinite(price) || price <= 0) {
      parsed.push({ rowNumber, error: 'El precio debe ser un número mayor a cero.' });
      continue;
    }

    seenCodes.add(code);
    const category = normalizeCategory(get('category'));
    const usageSteps = get('usagesteps')
      .split('|')
      .map((step) => step.trim())
      .filter(Boolean);

    parsed.push({
      rowNumber,
      product: {
        id: `prod-${code.toLowerCase()}-${Date.now()}`,
        code,
        name,
        category,
        categoryLabel: CATEGORY_LABELS[category],
        price,
        originalPrice:
          originalPrice && Number.isFinite(originalPrice) && originalPrice > price
            ? originalPrice
            : undefined,
        // Se deja vacío si la celda no trae URL: el lector de Excel puede
        // rellenarlo con una imagen pegada antes de aplicar el genérico.
        image: get('image'),
        description: get('description') || 'Producto original con garantía Yanbal.',
        badge: get('badge') || undefined,
        usageSteps:
          usageSteps.length > 0
            ? usageSteps
            : ['Paso 1: Aplicar sobre la piel limpia.', 'Paso 2: Masajear suavemente.'],
        consultantTip:
          get('consultanttip') || 'Uso diario recomendado por consultora experta.',
        active: true,
      },
    });
  }

  return parsed;
};
