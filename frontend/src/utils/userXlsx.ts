import type { AppUser } from '../types';
import type { ParsedUserRow } from './userCsv';
import { parseUserCsv } from './userCsv';

const HEADERS = [
  { header: 'Nombre Completo *', width: 28 },
  { header: 'Correo Electrónico *', width: 34 },
  { header: 'Cédula / Documento *', width: 20 },
  { header: 'Teléfono / WhatsApp *', width: 22 },
  { header: 'Rol en la Red', width: 18 },
  { header: 'Zona / Ciudad', width: 24 },
  { header: 'Líder Asignado (opcional)', width: 30 },
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
 * Genera una plantilla Excel (.xlsx) con listas desplegables (Data Validation)
 * para Roles y Líderes de Zona reales, evitando errores de digitación manual.
 */
export const downloadUserExcelWorkbook = async (availableLeaders: AppUser[] = []) => {
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Yanbal Prestige';
  workbook.created = new Date();

  // Filtrar solo líderes y directores activos
  const leadersList = availableLeaders.filter(
    (u) => (u.role === 'LIDER_ZONA' || u.role === 'DIRECTORA') && u.active
  );

  const leaderLabelSample =
    leadersList.length > 0
      ? `${leadersList[0].name} (${leadersList[0].id})`
      : 'Andrea Gómez (usr-3)';

  const SAMPLE_ROWS = [
    [
      'Carlos Mendoza',
      'carlos.mendoza@yanbalprestige.com',
      '1020304050',
      '+57 311 234 5678',
      'CONSULTORA',
      'Zona 12 - Bogotá Norte',
      leaderLabelSample,
    ],
    [
      'Andrea Gómez',
      'andrea.gomez@yanbalprestige.com',
      '52890123',
      '+57 320 888 9900',
      'LIDER_ZONA',
      'Zona 15 - Medellín',
      'Sin Líder Asignado',
    ],
    [
      'Alejandro Ramírez',
      'alejandro.ramirez@yanbalprestige.com',
      '1098765432',
      '+57 315 876 5432',
      'CONSULTORA',
      'Zona 12 - Suba',
      leaderLabelSample,
    ],
    [
      'Valentina Castro',
      'valentina.castro@yanbalprestige.com',
      '1033445566',
      '+57 300 111 2233',
      'CONSULTORA',
      'Zona 12 - Usaquén',
      leaderLabelSample,
    ],
  ];

  // Hoja 1: Integrantes de la Red
  const sheet = workbook.addWorksheet('Integrantes de la Red', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  sheet.columns = HEADERS.map((column) => ({ header: column.header, width: column.width }));

  const headerRow = sheet.getRow(1);
  headerRow.height = 32;
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

  // Opciones de líderes para la lista desplegable
  const leaderDropdownOptions = [
    'Sin Líder Asignado',
    ...(leadersList.length > 0
      ? leadersList.map((l) => `${l.name} (${l.id})`)
      : ['Andrea Gómez (usr-3)', 'Yulieth Ospina (usr-1)']),
  ];
  const leaderFormulaString = `"${leaderDropdownOptions.slice(0, 15).join(',')}"`;

  // Validación de datos desplegable para las filas de datos (2 a 500)
  for (let r = 2; r <= 500; r++) {
    // Columna E: Roles
    sheet.getCell(`E${r}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"CONSULTORA,LIDER_ZONA,ASISTENTE,DIRECTORA"'],
      showErrorMessage: true,
      errorTitle: 'Rol no válido',
      error: 'Selecciona una opción de la lista: CONSULTORA, LIDER_ZONA, ASISTENTE o DIRECTORA.',
    };

    // Columna G: Líder Asignado
    sheet.getCell(`G${r}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [leaderFormulaString],
      showErrorMessage: true,
      errorTitle: 'Líder no válido',
      error: 'Selecciona un líder de la lista desplegable o escribe "Sin Líder Asignado".',
    };
  }

  // Hoja 2: Directorio de Líderes Oficiales
  const leadersSheet = workbook.addWorksheet('Líderes Disponibles');
  leadersSheet.columns = [
    { header: 'ID del Líder', width: 16 },
    { header: 'Nombre Completo', width: 28 },
    { header: 'Zona / Territorio', width: 26 },
    { header: 'Correo Electrónico', width: 34 },
  ];

  const leadersHeader = leadersSheet.getRow(1);
  leadersHeader.height = 28;
  leadersHeader.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8A6D12' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const leadersData =
    leadersList.length > 0
      ? leadersList.map((l) => [l.id, l.name, l.zone || 'Zona General', l.email])
      : [
          ['usr-3', 'Andrea Gómez', 'Zona 15 - Medellín', 'andrea.lider@yanbalprestige.com'],
          ['usr-1', 'Yulieth Ospina', 'Zona 12 - Bogotá Norte', 'yulieth.directora@yanbalprestige.com'],
        ];

  leadersData.forEach((rowVals) => {
    const row = leadersSheet.addRow(rowVals);
    row.height = 24;
    row.eachCell((cell) => {
      cell.alignment = { vertical: 'middle' };
    });
  });

  // Hoja 3: Guía de Roles & Formato
  const guideSheet = workbook.addWorksheet('Guía de Roles');
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
export const parseUserWorkbook = async (
  file: File,
  existingUsers: AppUser[] = []
): Promise<ParsedUserRow[]> => {
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
  return parseUserCsv(csvText, existingUsers);
};
