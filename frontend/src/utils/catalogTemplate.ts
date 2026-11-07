const HEADERS = [
  'Código SKU *',
  'Nombre del producto *',
  'Imagen (URL)',
  'Categoría',
  'Precio venta (COP) *',
  'Precio anterior (COP)',
  'Descripción',
  'Etiqueta / badge',
  'Tip para la consultora',
  'Pasos de uso (separar con |)',
];

const SAMPLE_ROWS = [
  [
    'EXT-02',
    'Suero Hidratante Concentrado',
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    'rostro',
    '145000',
    '190000',
    'Hidratación profunda por 72 horas con ácido hialurónico y extractos botánicos.',
    'Nuevo',
    'Aplicar antes de la crema de noche para potenciar la hidratación.',
    'Limpiar el rostro|Aplicar 3 gotas|Masajear hasta absorber',
  ],
  [
    'SOL-03',
    'Protector Solar Facial SPF 50',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    'solar',
    '89000',
    '110000',
    'Protección UVA/UVB de textura ligera, ideal para uso diario bajo el maquillaje.',
    'Best seller',
    'Recomendar reaplicar cada 4 horas si hay exposición directa al sol.',
    'Aplicar como último paso de la rutina|Reaplicar cada 4 horas',
  ],
];

const CATEGORY_GUIDE = [
  ['rostro', 'Tratamiento Facial', 'Sérums, cremas y limpiadores'],
  ['solar', 'Protección Solar', 'Protectores y bloqueadores'],
  ['perfumes', 'Perfumería Fina', 'Fragancias y colonias'],
  ['maquillaje', 'Maquillaje Funcional', 'Bases, labiales y sombras'],
  ['joyeria', 'Joyería Fina', 'Collares, aretes y pulseras'],
];

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const cell = (value: string, style = 'cell', type = 'String'): string =>
  `<Cell ss:StyleID="${style}"><Data ss:Type="${type}">${escapeXml(value)}</Data></Cell>`;

const row = (values: string[], style = 'cell'): string =>
  `<Row>${values.map((value, index) => cell(value, index === 0 && style === 'cell' ? 'code' : style)).join('')}</Row>`;

const buildSpreadsheetXml = (): string => {
  const headerRow = `<Row ss:Height="30">${HEADERS.map((header) => cell(header, 'header')).join('')}</Row>`;
  const sampleRows = SAMPLE_ROWS.map((values) => row(values)).join('');

  const guideRows = [
    `<Row ss:Height="28">${cell('Guía de la plantilla de catálogo', 'title')}</Row>`,
    `<Row>${cell('', 'cell')}</Row>`,
    `<Row>${cell('Columna', 'header')}${cell('Obligatoria', 'header')}${cell('Qué escribir', 'header')}</Row>`,
    ... [
      ['Código SKU', 'Sí', 'Código único de la referencia. No se puede repetir.'],
      ['Nombre del producto', 'Sí', 'Nombre comercial tal como aparece en el catálogo.'],
      [
        'Imagen (URL)',
        'No',
        'Enlace directo a la foto (debe terminar en .jpg, .png o .webp). Si se deja vacío, se usa una imagen genérica.',
      ],
      ['Categoría', 'No', 'rostro, solar, perfumes, maquillaje o joyeria. Si se omite, queda rostro.'],
      ['Precio venta (COP)', 'Sí', 'Solo números. Ej: 145000 o 145.000.'],
      ['Precio anterior', 'No', 'Precio de referencia para mostrar el descuento.'],
      ['Descripción', 'No', 'Texto comercial de la referencia. Puede contener comas.'],
      ['Etiqueta / badge', 'No', 'Ej: Nuevo, Best seller, Top Ventas.'],
      ['Tip para la consultora', 'No', 'Consejo de venta o de uso profesional.'],
      ['Pasos de uso', 'No', 'Separa cada paso con el símbolo | (barra vertical).'],
    ].map((values) => row(values)),
    `<Row>${cell('', 'cell')}</Row>`,
    `<Row>${cell('Categorías válidas', 'header')}${cell('Etiqueta visible', 'header')}${cell('Ejemplos', 'header')}</Row>`,
    ...CATEGORY_GUIDE.map((values) => row(values)),
  ].join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1C1917"/>
    </Style>
    <Style ss:ID="title">
      <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#3B241D"/>
    </Style>
    <Style ss:ID="header">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#E85D36" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#C94A27"/>
      </Borders>
    </Style>
    <Style ss:ID="cell">
      <Alignment ss:Vertical="Top" ss:WrapText="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EFE9E1"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EFE9E1"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EFE9E1"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EFE9E1"/>
      </Borders>
    </Style>
    <Style ss:ID="code">
      <Alignment ss:Vertical="Top"/>
      <Font ss:FontName="Consolas" ss:Size="11" ss:Bold="1" ss:Color="#C94A27"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EFE9E1"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EFE9E1"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EFE9E1"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EFE9E1"/>
      </Borders>
    </Style>
  </Styles>

  <Worksheet ss:Name="Catálogo">
    <Table ss:DefaultRowHeight="24">
      <Column ss:Width="90"/><Column ss:Width="230"/><Column ss:Width="320"/>
      <Column ss:Width="95"/><Column ss:Width="105"/><Column ss:Width="105"/>
      <Column ss:Width="320"/><Column ss:Width="100"/><Column ss:Width="300"/>
      <Column ss:Width="280"/>
      ${headerRow}
      ${sampleRows}
    </Table>
    <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
      <FreezePanes/><FrozenNoSplit/>
      <SplitHorizontal>1</SplitHorizontal>
      <TopRowBottomPane>1</TopRowBottomPane>
      <ProtectObjects>False</ProtectObjects>
      <ProtectScenarios>False</ProtectScenarios>
    </WorksheetOptions>
  </Worksheet>

  <Worksheet ss:Name="Instrucciones">
    <Table ss:DefaultRowHeight="24">
      <Column ss:Width="220"/><Column ss:Width="95"/><Column ss:Width="620"/>
      ${guideRows}
    </Table>
  </Worksheet>
</Workbook>`;
};

const downloadBlob = (content: string, filename: string, mime: string) => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadExcelTemplate = () => {
  downloadBlob(
    buildSpreadsheetXml(),
    'plantilla_catalogo_yanbal.xls',
    'application/vnd.ms-excel;charset=utf-8'
  );
};

export const downloadCsvTemplate = () => {
  const quote = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const lines = [HEADERS, ...SAMPLE_ROWS].map((values) => values.map(quote).join(';'));
  downloadBlob(`\uFEFF${lines.join('\r\n')}`, 'plantilla_catalogo_yanbal.csv', 'text/csv;charset=utf-8');
};
