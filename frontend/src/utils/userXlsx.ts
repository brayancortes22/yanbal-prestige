import type { ParsedUserRow } from './userCsv';
import { parseUserCsv } from './userCsv';

const HEADERS = [
  { header: 'Nombre Completo *', width: 28 },
  { header: 'Correo Electrónico *', width: 34 },
  { header: 'Cédula / Documento *', width: 20 },
  { header: 'Teléfono / WhatsApp *', width: 22 },
  { header: 'Rol en la Red', width: 18 },
  { header: 'Zona / Ciudad', width: 24 },
  { header: 'ID Líder Asignado (opcional)', width: 24 },
];

const SAMPLE_ROWS = [
  [
    'Carlos Mendoza',
    'carlos.mendoza@yanbalprestige.com',
    '1020304050',
    '+57 311 234 5678',
    'CONSULTORA',
    'Zona 12 - Bogotá Norte',
    'usr-3',
  ],
  [
    'Andrea Gómez',
    'andrea.gomez@yanbalprestige.com',
    '52890123',
    '+57 320 888 9900',
    'LIDER_ZONA',
    'Zona 15 - Medellín',
    '',
  ],
  [
    'Alejandro Ramírez',
    'alejandro.ramirez@yanbalprestige.com',
    '1098765432',
    '+57 315 876 5432',
    'CONSULTORA',
    'Zona 12 - Suba',
    'usr-3',
  ],
  [
    'Valentina Castro',
    'valentina.castro@yanbalprestige.com',
    '1033445566',
    '+57 300 111 2233',
    'CONSULTORA',
    'Zona 12 - Usaquén',
    'usr-3',
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
 * Genera una plantilla de Excel real (.xlsx) con estilos y guía de roles.
 */
export const downloadUserExcelWorkbook = async () => {
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Yanbal Prestige';
  workbook.created = new Date();

  // Hoja 1: Integrantes
  const sheet = workbook.addWorksheet('Integrantes de la Red', {
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
    row.height = 26;
    row.eachCell((cell) => {
      cell.alignment = { vertical: 'middle', wrapText: true };
      cell.border = {
        bottom: { style: 'hair', color: { argb: 'FFEFE9E1' } },
        left: { style: 'hair', color: { argb: 'FFEFE9E1' } },
        right: { style: 'hair', color: { argb: 'FFEFE9E1' } },
      };
    });
  });

  // Hoja 2: Guía de Roles
  const guideSheet = workbook.addWorksheet('Guía de Roles & Formato');
  guideSheet.columns = [
    { header: 'Rol Permitido', width: 22 },
    { header: 'Descripción del Cargo', width: 45 },
    { header: 'Nivel de Acceso en Plataforma', width: 35 },
  ];

  const guideHeader = guideSheet.getRow(1);
  guideHeader.height = 28;
  guideHeader.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2A2521' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const rolesGuide = [
    ['CONSULTORA', 'Consultor/a comercial de belleza y venta directa', 'Panel de Consultor/a & CRM de Clientas'],
    ['LIDER_ZONA', 'Líder coordinador/a de grupo o zona territorial', 'Supervisión de equipo & asignación comercial'],
    ['ASISTENTE', 'Apoyo administrativo para la red', 'Gestión de catálogo, pedidos y reportes'],
    ['DIRECTORA', 'Directora ejecutiva o administradora general', 'Acceso total a Gerencia de Red y CMS'],
  ];

  rolesGuide.forEach((rowVals) => {
    const row = guideSheet.addRow(rowVals);
    row.height = 24;
    row.eachCell((cell) => {
      cell.alignment = { vertical: 'middle' };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  downloadBlob(blob, 'plantilla_integrantes_yanbal_prestige.xlsx');
};

/**
 * Lee un archivo .xlsx y lo transforma en registros de usuario verificados.
 */
export const parseUserWorkbook = async (file: File): Promise<ParsedUserRow[]> => {
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());

  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error('El archivo Excel no tiene hojas.');

  const lines: string[] = [];
  sheet.eachRow({ includeEmpty: false }, (row) => {
    const values: string[] = [];
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      values[colNumber - 1] = (cell.text ?? '').replace(/[\r\n]+/g, ' ').trim();
    });
    lines.push(values.map((v) => `"${v.replace(/"/g, '""')}"`).join(','));
  });

  const csvText = lines.join('\n');
  return parseUserCsv(csvText);
};
