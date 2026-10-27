import type { MediaItem, MediaType } from '../../types';

export const MAX_IMAGE_MB = 8;
export const MAX_VIDEO_MB = 150;
export const MAX_FILES_PER_ITEM = 10;

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'bmp'];
const VIDEO_EXTENSIONS = ['mp4', 'mov', 'webm', 'm4v'];

/** Detecta el tipo real por MIME y, si el navegador no lo informa, por extensión. */
export function detectMediaType(file: File): MediaType | null {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';

  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (IMAGE_EXTENSIONS.includes(ext)) return 'image';
  if (VIDEO_EXTENSIONS.includes(ext)) return 'video';

  return null;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Crea el recurso de vista previa en memoria.
 * No se sube ni se guarda en localStorage: es intencional para la demo,
 * porque un video no cabe en la cuota del navegador.
 */
export function createLocalMedia(file: File): MediaItem {
  const type = detectMediaType(file);
  return {
    id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    url: URL.createObjectURL(file),
    type: type ?? 'image',
    alt: file.name.replace(/\.[^.]+$/, ''),
    demo: true,
    fileName: file.name,
  };
}

/** Libera la memoria del blob cuando el archivo se quita de la galería. */
export function releaseLocalMedia(item: MediaItem): void {
  if (item.url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(item.url);
    } catch {
      /* el navegador ya lo liberó */
    }
  }
}

/** Devuelve la URL embebible si es YouTube o Vimeo; null si es un archivo directo. */
export function getVideoEmbedUrl(url: string): string | null {
  if (!url) return null;

  const youtube =
    url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i);
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`;

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;

  return null;
}

/** Normaliza la galería: si no hay media, usa la imagen de portada heredada. */
export function resolveMediaList(media: MediaItem[] | undefined, fallback: string): MediaItem[] {
  if (media && media.length > 0) return media;
  if (!fallback) return [];
  return [{ id: 'legacy-cover', url: fallback, type: 'image' }];
}

/** Portada: primera imagen de la galería o, si solo hay video, la imagen heredada. */
export function resolveCover(media: MediaItem[] | undefined, fallback: string): string {
  const items = resolveMediaList(media, fallback);
  return items.find((item) => item.type === 'image')?.url ?? fallback;
}

export function countMedia(media: MediaItem[]): { images: number; videos: number } {
  return media.reduce(
    (acc, item) => {
      if (item.type === 'video') acc.videos += 1;
      else acc.images += 1;
      return acc;
    },
    { images: 0, videos: 0 }
  );
}
