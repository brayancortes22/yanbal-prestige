import type { Product, LineAccordionItem, EventItem } from '../types';

export const productsData: Product[] = [
  {
    id: 'extracto-divino',
    code: 'EXT-01',
    name: 'Suero Óleo Reparador Extracto Divino',
    category: 'rostro',
    categoryLabel: 'Tratamiento Facial',
    price: 189000,
    originalPrice: 245000,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
    description: 'Fórmula ultra-concentrada con Cáliz de Uvilla. Nutre profundamente, repara la barrera lipídica y devuelve firmeza al rostro.',
    isTop: true,
    badge: 'Top Ventas',
    usageSteps: [
      'Paso 1: Limpia tu rostro en la mañana y en la noche con gel o espuma suave.',
      'Paso 2: Aplica de 2 a 3 gotas en pómulos, frente y cuello.',
      'Paso 3: Realiza masajes ascendentes desde el centro hacia afuera hasta su absorción completa.'
    ],
    consultantTip: 'Aplica antes de tu crema hidratante y nunca olvides tu protector solar de día.'
  },
  {
    id: 'total-block-100',
    code: 'SOL-01',
    name: 'Total Block Ultraprotección SPF 100',
    category: 'solar',
    categoryLabel: 'Protección Solar',
    price: 94000,
    originalPrice: 125000,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
    description: 'Máxima protección clínica contra rayos UVB, UVA, Luz Azul y radiación Infrarroja con Vitamina E antioxidante.',
    isTop: true,
    badge: 'Recomendado Dermatólogos',
    usageSteps: [
      'Paso 1: Aplica generosamente 20 minutos antes de exponerte a la luz solar o pantallas.',
      'Paso 2: Reaplica cada 2 horas o después de nadar, sudar o secarte con toalla.'
    ],
    consultantTip: 'La cantidad ideal para rostro y cuello es la medida de dos dedos extendidos.'
  },
  {
    id: 'ccori-cristal',
    code: 'PERF-01',
    name: 'Ccori Cristal Parfum',
    category: 'perfumes',
    categoryLabel: 'Perfumería Fina',
    price: 165000,
    originalPrice: 210000,
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80',
    description: 'Creación de maestros perfumistas franceses. Notas orientales florales intensas con vainilla de Madagascar y jazmín sambac.',
    isTop: true,
    badge: 'Edición Lujo',
    usageSteps: [
      'Paso 1: Rocía en puntos de pulso: muñecas, cuello y detrás del lóbulo auricular.',
      'Paso 2: Mantén el atomizador a 15 cm de distancia para una dispersión sutil.'
    ],
    consultantTip: 'No frotes las muñecas entre sí; el calor altera la evolución de las notas de corazón.'
  },
  {
    id: 'bb-cream-mattifying',
    code: 'MAQ-01',
    name: 'BB Cream Matificante SPF 25',
    category: 'maquillaje',
    categoryLabel: 'Maquillaje Funcional',
    price: 84000,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    description: 'Unifica el tono, hidrata durante 24 horas y controla el brillo indeseado con acabado mate natural.',
    usageSteps: [
      'Paso 1: Distribuye una pequeña cantidad con las yemas de los dedos o brocha plana.',
      'Paso 2: Difumina hacia afuera en cuello y nacimiento del cabello.'
    ],
    consultantTip: 'Para mayor cobertura localizada, aplica una segunda capa dando suaves toques con los dedos.'
  },
  {
    id: 'aretes-aurelia',
    code: 'JOY-01',
    name: 'Aretes Aurelia Baño Oro 24K',
    category: 'joyeria',
    categoryLabel: 'Joyería Fina',
    price: 109000,
    originalPrice: 140000,
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80',
    description: 'Diseño anatómico hipoalergénico con baño de oro puro de 24 quilates y cristales europeos engastados a mano.',
    badge: 'Oro 24K',
    usageSteps: [
      'Paso 1: Colócalos siempre después de perfumarte o aplicar laca de cabello.',
      'Paso 2: Límpialos periódicamente con un paño suave y seco de microfibra.'
    ],
    consultantTip: 'Guarda cada joya en su empaque individual para evitar rayaduras con otros metales.'
  }
];

export const linesAccordionData: LineAccordionItem[] = [
  {
    id: 'line-solar',
    title: 'Total Block Ultraprotección',
    tagline: 'Defensa Clínica Multirradiación',
    description: 'La línea líder en Latinoamérica contra rayos UVA, UVB, Luz Azul y radicales libres con acabado no graso.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    claims: ['SPF 100 y Protección IR', '100% Sin Residuo Blanco', 'Resistente al Agua y Sudor'],
    categoryFilter: 'solar'
  },
  {
    id: 'line-rostro',
    title: 'Sentiva Extracto Divino',
    tagline: 'Ciencia Botánica de Alta Potencia',
    description: 'Innovación antiedad inspirada en la biodiversidad andina para reactivar la producción natural de colágeno.',
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80',
    claims: ['Cáliz de Uvilla 100% puro', 'Firmeza en 14 días', 'Acción Antiglicación'],
    categoryFilter: 'rostro'
  },
  {
    id: 'line-perfumes',
    title: 'Alta Perfumería Ccori',
    tagline: 'Creaciones Exclusivas de Grasse',
    description: 'Fragancias memorables elaboradas con aceites esenciales de la más alta concentración y fijación prolongada.',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    claims: ['Concentración Parfum', 'Hasta 16 Horas de Fijación', 'Diseño de Botella Joya'],
    categoryFilter: 'perfumes'
  },
  {
    id: 'line-joyeria',
    title: 'Joyería Artesanal Yanbal',
    tagline: 'Baño de Oro Puro & Cristales',
    description: 'Piezas esculpidas por orfebres expertos que combinan tradición artesanal con tendencias internacionales.',
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
    claims: ['Baño de Oro 24K', 'Postes de Titanio Hipoalergénico', 'Garantía de Acabado'],
    categoryFilter: 'joyeria'
  }
];

export const eventsData: EventItem[] = [
  {
    id: 'ev-01',
    title: 'Masterclass Automaquillaje Glow & Piel Madura',
    date: 'Sábado, 14 de Noviembre',
    time: '3:00 PM - 5:30 PM',
    modality: 'Presencial',
    location: 'Sede Yanbal Norte / Salón de Belleza Prestige',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80',
    description: 'Aprende a preparar la piel con la línea Sentiva, técnicas de visagismo y aplicación correcta de sombras y labiales.',
    spots: '12 Cupos Disponibles'
  },
  {
    id: 'ev-02',
    title: 'Oportunidad de Liderazgo: Genera Ingresos con tu Red',
    date: 'Jueves, 19 de Noviembre',
    time: '7:00 PM - 8:15 PM',
    modality: 'Virtual Vía Zoom',
    location: 'Enlace exclusivo enviado por WhatsApp',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
    description: 'Descubre cómo ascender a Directora Independiente, plan de compensación, bonos en auto y viajes internacionales.',
    spots: 'Entrada Libre con Registro Previo'
  }
];
