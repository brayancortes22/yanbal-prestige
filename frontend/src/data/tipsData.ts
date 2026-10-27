import type { TipItem } from '../types';

/**
 * Consejos iniciales del módulo Tips & Consejos.
 * `content` admite párrafos separados por línea en blanco y listas
 * con viñetas cuando cada línea empieza por "- ".
 */
export const tipsData: TipItem[] = [
  {
    id: 'tip-aplicar-suero',
    title: 'Cómo aplicar el suero sin desperdiciar producto',
    summary:
      'Tres gotas bien aplicadas rinden más que diez derramadas en la mano. Te explico la técnica que uso con mis clientas.',
    content: `El error más común que veo en las asesorías es echar el suero directamente en la palma y frotarlo como si fuera crema corporal. Así se pierde hasta la mitad del producto entre los dedos y la absorción es despareja.

La cantidad correcta son de dos a tres gotas para rostro, cuello y escote. Si tu suero viene con gotero, deposítalo en las yemas de los dedos índice y medio, nunca en el centro de la mano.

- Con la piel limpia y ligeramente húmeda, reparte el producto con toques suaves.
- Trabaja desde el centro del rostro hacia afuera, sin arrastrar la piel.
- Termina con un masaje ascendente en cuello durante 20 segundos.

Espera entre 30 y 60 segundos antes de la crema hidratante. Ese minuto es el que permite que el activo penetre y no se diluya con el siguiente producto.

Si sientes que el suero "se queda encima", probablemente estás aplicando demasiado o tu piel no está bien limpia. Reduce la cantidad antes de cambiar de producto.`,
    category: 'Rutina',
    image:
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80',
    author: 'Yuli Cortés',
    featured: true,
    order: 1,
    active: true,
    createdAt: '2026-09-12T15:00:00.000Z',
    updatedAt: '2026-09-12T15:00:00.000Z',
  },
  {
    id: 'tip-rutina-noche',
    title: 'El orden correcto de tu rutina de noche',
    summary:
      'De lo más ligero a lo más denso. Si inviertes el orden, el producto caro se queda en la superficie.',
    content: `La regla es simple: primero lo acuoso, después lo oleoso. Cuando aplicas una crema densa antes de un sérum, creas una barrera que impide que el activo llegue a la piel.

Mi secuencia de noche, probada con clientas de piel mixta y madura:

- Desmaquillante o agua micelar para retirar maquillaje y protector solar.
- Limpiador suave, con agua tibia, nunca caliente.
- Sérum o concentrado según tu necesidad (firmeza, manchas, hidratación).
- Contorno de ojos con el dedo anular, sin frotar.
- Crema de noche para sellar todo.
- Bálsamo labial.

Un detalle que casi nadie hace: esperar un minuto entre capas. No necesitas una rutina de diez pasos, necesitas respetar el tiempo de absorción de cada uno.

Si tu piel es grasa, no saltes la crema de noche. La deshidratación produce más sebo, no menos.`,
    category: 'Cuidado',
    image:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80',
    author: 'Yuli Cortés',
    featured: false,
    order: 2,
    active: true,
    createdAt: '2026-09-20T15:00:00.000Z',
    updatedAt: '2026-09-20T15:00:00.000Z',
  },
  {
    id: 'tip-automaquillaje-trabajo',
    title: 'Automaquillaje en 7 minutos para el trabajo',
    summary:
      'Un rostro luminoso y natural con cuatro productos. Sin brochas profesionales ni técnicas complicadas.',
    content: `No necesitas un maletín completo para verte arreglada de lunes a viernes. Con cuatro productos y siete minutos tienes un look de oficina que aguanta el día entero.

- Minuto 1: BB cream o base ligera con los dedos, del centro hacia afuera.
- Minutos 2 y 3: corrector solo donde hace falta, y una pizca de rubor cremoso en pómulos.
- Minutos 4 y 5: cejas peinadas hacia arriba con máscara transparente y un toque de sombra clara.
- Minutos 6 y 7: máscara de pestañas y labial o bálsamo con color.

El secreto no está en cubrir más, sino en unificar el tono. Si tu piel está bien preparada con hidratante y protector solar, necesitas mucho menos maquillaje encima.

Para la tarde, guarda en tu cartera un labial y un polvo compacto. Con eso retocas y pareces recién maquillada.`,
    category: 'Maquillaje',
    image:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    author: 'Carolina Mejía',
    featured: false,
    order: 3,
    active: true,
    createdAt: '2026-10-02T15:00:00.000Z',
    updatedAt: '2026-10-02T15:00:00.000Z',
  },
  {
    id: 'tip-primera-red-clientas',
    title: 'Cómo construir tu primera red de cinco clientas',
    summary:
      'Sin spam ni cadenas de mensajes. Un método de cercanía que funciona para consultoras que empiezan.',
    content: `Cuando arrancas como consultora, la tentación es enviar el catálogo a todos tus contactos el mismo día. Eso quema tu red antes de empezar.

Mi recomendación es trabajar en tres círculos:

- Círculo uno: cinco personas que ya confían en ti. No les vendas, pregúntales qué necesitan para su piel.
- Círculo dos: personas que te preguntaron por un producto en los últimos tres meses. Escríbeles con una recomendación concreta.
- Círculo tres: contactos nuevos que llegan por recomendación de los dos anteriores.

La meta de la primera semana no es vender, es conseguir cinco conversaciones reales de diagnóstico. De esas cinco, tres compran algo pequeño y una se vuelve clienta frecuente.

Lleva un registro simple: nombre, tipo de piel, producto que usa y fecha del último contacto. Ese registro vale más que cualquier publicidad pagada.

Y algo importante: nunca prometas resultados clínicos ni cures. Recomiendas cosmética, y cuando hay una condición de piel, derivas a dermatología.`,
    category: 'Negocio',
    image:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    author: 'Yuli Cortés',
    featured: false,
    order: 4,
    active: true,
    createdAt: '2026-10-10T15:00:00.000Z',
    updatedAt: '2026-10-10T15:00:00.000Z',
  },
];
