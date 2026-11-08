import type { AppUser, UserRole } from '../types';

export interface ParsedUserRow {
  rowNumber: number;
  user?: AppUser;
  error?: string;
  raw: {
    nombre: string;
    email: string;
    cedula: string;
    telefono: string;
    rol: string;
    zona: string;
    lider_id: string;
  };
}

const VALID_ROLES: Record<string, UserRole> = {
  directora: 'DIRECTORA',
  director: 'DIRECTORA',
  administradora: 'DIRECTORA',
  administrador: 'DIRECTORA',
  admin: 'DIRECTORA',
  asistente: 'ASISTENTE',
  apoyo: 'ASISTENTE',
  lider: 'LIDER_ZONA',
  'lider de zona': 'LIDER_ZONA',
  lider_zona: 'LIDER_ZONA',
  coordinador: 'LIDER_ZONA',
  coordinadora: 'LIDER_ZONA',
  consultora: 'CONSULTORA',
  consultor: 'CONSULTORA',
  asesor: 'CONSULTORA',
  asesora: 'CONSULTORA',
  vendedor: 'CONSULTORA',
  vendedora: 'CONSULTORA',
  super_admin: 'SUPER_ADMIN',
  soporte: 'SUPER_ADMIN',
  desarrollador: 'SUPER_ADMIN',
};

/**
 * Parsea una línea CSV respetando comillas y delimitadores.
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((char === ',' || char === ';') && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function parseUserCsv(csvText: string, existingUsers: AppUser[] = []): ParsedUserRow[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  // Detectar cabeceras en primera fila
  const headers = parseCsvLine(lines[0]).map((h) =>
    h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
  );

  const idxNombre = headers.findIndex((h) => h.includes('nombre') || h.includes('name'));
  const idxEmail = headers.findIndex((h) => h.includes('email') || h.includes('correo'));
  const idxCedula = headers.findIndex((h) => h.includes('cedula') || h.includes('documento') || h.includes('doc'));
  const idxTelefono = headers.findIndex((h) => h.includes('telefono') || h.includes('celular') || h.includes('phone'));
  const idxRol = headers.findIndex((h) => h.includes('rol') || h.includes('cargo'));
  const idxZona = headers.findIndex((h) => h.includes('zona') || h.includes('ciudad') || h.includes('region'));
  const idxLider = headers.findIndex((h) => h.includes('lider') || h.includes('leader'));

  const parsedRows: ParsedUserRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length === 0 || cols.every((c) => !c)) continue;

    const nombre = cols[idxNombre !== -1 ? idxNombre : 0] || '';
    const email = cols[idxEmail !== -1 ? idxEmail : 1] || '';
    const cedula = cols[idxCedula !== -1 ? idxCedula : 2] || '';
    const telefono = cols[idxTelefono !== -1 ? idxTelefono : 3] || '';
    const rolRaw = cols[idxRol !== -1 ? idxRol : 4] || 'CONSULTORA';
    const zona = cols[idxZona !== -1 ? idxZona : 5] || 'Zona General';
    const rawLider = cols[idxLider !== -1 ? idxLider : 6] || '';

    const raw = { nombre, email, cedula, telefono, rol: rolRaw, zona, lider_id: rawLider };

    if (!nombre.trim()) {
      parsedRows.push({ rowNumber: i + 1, raw, error: 'El nombre completo es obligatorio.' });
      continue;
    }
    if (!email.trim() || !email.includes('@')) {
      parsedRows.push({ rowNumber: i + 1, raw, error: 'Correo electrónico inválido o ausente.' });
      continue;
    }

    // Normalización de Rol
    const normalizedRolKey = rolRaw.toLowerCase().trim();
    const role: UserRole = VALID_ROLES[normalizedRolKey] || 'CONSULTORA';

    // Resolución inteligente de Líder de Zona
    let resolvedLeaderId: string | undefined = undefined;
    const cleanLiderInput = rawLider.trim();

    if (
      cleanLiderInput &&
      !cleanLiderInput.toLowerCase().includes('sin lider') &&
      !cleanLiderInput.toLowerCase().includes('ninguno')
    ) {
      // 1. Si viene como "Nombre (usr-3)", extraer el id dentro del paréntesis
      const idMatch = cleanLiderInput.match(/\((usr-[^)]+)\)/i);
      if (idMatch) {
        resolvedLeaderId = idMatch[1];
      } else if (existingUsers.length > 0) {
        // 2. Buscar por coincidencia de ID, nombre o correo en los líderes existentes
        const norm = cleanLiderInput.toLowerCase();
        const candidate = existingUsers.find(
          (u) =>
            (u.role === 'LIDER_ZONA' || u.role === 'DIRECTORA') &&
            (u.id.toLowerCase() === norm ||
              u.name.toLowerCase() === norm ||
              u.name.toLowerCase().includes(norm) ||
              norm.includes(u.name.toLowerCase()) ||
              u.email.toLowerCase() === norm)
        );
        if (candidate) {
          resolvedLeaderId = candidate.id;
        } else if (cleanLiderInput.startsWith('usr-')) {
          resolvedLeaderId = cleanLiderInput;
        }
      } else if (cleanLiderInput.startsWith('usr-')) {
        resolvedLeaderId = cleanLiderInput;
      }
    }

    const user: AppUser = {
      id: `usr-${Date.now()}-${i}`,
      name: nombre.trim(),
      email: email.trim().toLowerCase(),
      documentId: cedula.trim() || `CC-${Date.now().toString().slice(-6)}`,
      phone: telefono.trim() || '+57 300 000 0000',
      role,
      zone: zona.trim(),
      active: true,
      leaderId: resolvedLeaderId,
    };

    parsedRows.push({ rowNumber: i + 1, raw, user });
  }

  return parsedRows;
}

export function downloadUserCsvTemplate(leaders: AppUser[] = []) {
  const headers = ['Nombre Completo', 'Correo Electronico', 'Cedula', 'Telefono', 'Rol', 'Zona', 'Lider Asignado'];
  const sampleLeader = leaders.find((l) => l.role === 'LIDER_ZONA')?.name || 'Andrea Gomez';

  const sampleRows = [
    ['Carlos Mendoza', 'carlos.mendoza@yanbalprestige.com', '1020304050', '+57 311 234 5678', 'CONSULTORA', 'Zona 12 - Bogota Norte', sampleLeader],
    ['Andrea Gomez', 'andrea.gomez@yanbalprestige.com', '52890123', '+57 320 888 9900', 'LIDER_ZONA', 'Zona 15 - Medellin', ''],
    ['Alejandro Ramirez', 'alejandro.ramirez@yanbalprestige.com', '1098765432', '+57 315 876 5432', 'CONSULTORA', 'Zona 12 - Suba', sampleLeader],
    ['Valentina Castro', 'valentina.castro@yanbalprestige.com', '1033445566', '+57 300 111 2233', 'CONSULTORA', 'Zona 12 - Usaquen', sampleLeader],
  ];

  const csvContent = '\uFEFF' + [headers.join(','), ...sampleRows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'plantilla_integrantes_yanbal_prestige.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
