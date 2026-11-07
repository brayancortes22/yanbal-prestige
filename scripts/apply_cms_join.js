const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

// 1. UPDATE types/index.ts
const typesPath = path.join(root, 'frontend/src/types/index.ts');
let typesContent = fs.readFileSync(typesPath, 'utf8');

const joinConfigType = `
export interface JoinContentConfig {
  tag: string;
  title: string;
  subtitle: string;
  consultantBadge: string;
  consultantTitle: string;
  consultantDesc: string;
  consultantBenefits: string[];
  consultantButtonText: string;
  directorBadge: string;
  directorTitle: string;
  directorDesc: string;
  directorBenefits: string[];
  directorButtonText: string;
  updatedAt: string;
}
`;

if (!typesContent.includes('JoinContentConfig')) {
  typesContent = typesContent.replace('export interface HeroSlide', joinConfigType.trim() + '\n\nexport interface HeroSlide');
  fs.writeFileSync(typesPath, typesContent, 'utf8');
  console.log('1. types/index.ts updated with JoinContentConfig');
}

// 2. UPDATE context/ConfigContext.tsx
const contextPath = path.join(root, 'frontend/src/context/ConfigContext.tsx');
let contextContent = fs.readFileSync(contextPath, 'utf8');

if (!contextContent.includes('JoinContentConfig')) {
  // add to imports
  contextContent = contextContent.replace(
    'AboutContentConfig,',
    'AboutContentConfig,\n  JoinContentConfig,'
  );

  const defaultJoinSnippet = `
const defaultJoinContent: JoinContentConfig = {
  tag: 'Carrera de Emprendimiento & Liderazgo',
  title: 'Sé Parte de Nuestro Equipo',
  subtitle: 'Elige la modalidad que mejor se adapte a tus metas: vende de forma libre con rentabilidad inmediata o construye una carrera corporativa liderando tu propio grupo de consultoras.',
  consultantBadge: 'Emprendimiento Directo',
  consultantTitle: 'Consultora de Belleza Independiente',
  consultantDesc: 'Vende los productos emblemáticos de Yanbal con catálogo digital y físico. Administra tu tiempo y gana comisiones inmediatas.',
  consultantBenefits: [
    'Ganancias del 25% al 35% sobre cada referencia vendida.',
    'Kit de inicio bonificado con productos de alta rotación.',
    'Talleres gratuitos de automaquillaje y cuidado de la piel.',
    'Tienda virtual propia y pedidos directos a tu WhatsApp.'
  ],
  consultantButtonText: 'Quiero ser Consultora de Belleza',
  directorBadge: 'Carrera de Liderazgo',
  directorTitle: 'Directora Independiente & Líder',
  directorDesc: 'Forma, guía y empodera a tu propio equipo de consultoras. Escala a la cima corporativa con bonos de red e ingresos residuales.',
  directorBenefits: [
    'Bonificaciones por ventas grupales de toda tu red.',
    'Viajes de convención nacionales e internacionales.',
    'Auto 0 km en comodato y reconocimientos de prestigio.',
    'Mentoría ejecutiva personalizada con la Directora Yuli Cortés.'
  ],
  directorButtonText: 'Postularme para Líder / Directora',
  updatedAt: new Date().toISOString(),
};
`;

  contextContent = contextContent.replace(
    'const defaultAbout: AboutContentConfig = {',
    defaultJoinSnippet.trim() + '\n\nconst defaultAbout: AboutContentConfig = {'
  );

  // Add to ConfigContextType interface
  contextContent = contextContent.replace(
    'aboutContent: AboutContentConfig;\n  setAboutContent: (config: AboutContentConfig) => void;',
    'aboutContent: AboutContentConfig;\n  setAboutContent: (config: AboutContentConfig) => void;\n  joinContent: JoinContentConfig;\n  setJoinContent: (config: JoinContentConfig) => void;'
  );

  // Add state hook inside ConfigProvider
  contextContent = contextContent.replace(
    'const [aboutContent, setAboutContent] = useCacheSync<AboutContentConfig>(\n    \'yanbal_about_content_v1\',\n    defaultAbout\n  );',
    'const [aboutContent, setAboutContent] = useCacheSync<AboutContentConfig>(\n    \'yanbal_about_content_v1\',\n    defaultAbout\n  );\n  const [joinContent, setJoinContent] = useCacheSync<JoinContentConfig>(\n    \'yanbal_join_content_v1\',\n    defaultJoinContent\n  );'
  );

  // Add to Provider value
  contextContent = contextContent.replace(
    'aboutContent,\n        setAboutContent,',
    'aboutContent,\n        setAboutContent,\n        joinContent,\n        setJoinContent,'
  );

  fs.writeFileSync(contextPath, contextContent, 'utf8');
  console.log('2. ConfigContext.tsx updated with joinContent state & sync');
}
