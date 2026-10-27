import { useCallback, useState } from 'react';
import type { MediaItem } from '../types';
import {
  createLocalMedia,
  detectMediaType,
  formatBytes,
  MAX_IMAGE_MB,
  MAX_VIDEO_MB,
  releaseLocalMedia,
} from '../components/media/mediaUtils';

type Accept = 'image' | 'video' | 'any';

interface Options {
  accept?: Accept;
  maxFiles?: number;
}

/**
 * Gestiona una galería de fotos y videos en modo demostración.
 * Los archivos viven en la sesión del navegador (blob URLs) y los
 * enlaces externos sí quedan persistidos en el estado del CMS.
 */
export function useMediaLibrary(
  media: MediaItem[],
  onChange: (next: MediaItem[]) => void,
  { accept = 'any', maxFiles = 10 }: Options = {}
) {
  const [error, setError] = useState<string | null>(null);

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (files.length === 0) return;

      const accepted: MediaItem[] = [];
      const problems: string[] = [];

      files.forEach((file) => {
        const type = detectMediaType(file);

        if (!type) {
          problems.push(`"${file.name}" no es una imagen ni un video compatible.`);
          return;
        }
        if (accept === 'image' && type !== 'image') {
          problems.push(`"${file.name}" es un video y aquí solo se permiten fotos.`);
          return;
        }
        if (accept === 'video' && type !== 'video') {
          problems.push(`"${file.name}" es una imagen y aquí solo se permiten videos.`);
          return;
        }

        const limitMb = type === 'video' ? MAX_VIDEO_MB : MAX_IMAGE_MB;
        if (file.size > limitMb * 1024 * 1024) {
          problems.push(`"${file.name}" pesa ${formatBytes(file.size)} y el máximo es ${limitMb} MB.`);
          return;
        }

        accepted.push(createLocalMedia(file));
      });

      const room = maxFiles - media.length;
      if (accepted.length > room) {
        problems.push(
          room <= 0
            ? `Ya alcanzaste el máximo de ${maxFiles} archivos. Elimina uno para agregar otro.`
            : `Solo caben ${room} archivo(s) más; se ignoraron ${accepted.length - room}.`
        );
      }

      const toAdd = accepted.slice(0, Math.max(room, 0));
      if (toAdd.length > 0) onChange([...media, ...toAdd]);

      setError(problems.length > 0 ? problems.join(' ') : null);
    },
    [accept, maxFiles, media, onChange]
  );

  const addUrl = useCallback(
    (rawUrl: string) => {
      const url = rawUrl.trim();
      if (!url) return;

      try {
        const parsed = new URL(url);
        if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('protocolo');
      } catch {
        setError('El enlace debe empezar por http:// o https://');
        return;
      }

      if (media.some((item) => item.url === url)) {
        setError('Ese enlace ya está en la galería.');
        return;
      }

      if (media.length >= maxFiles) {
        setError(`Ya alcanzaste el máximo de ${maxFiles} archivos.`);
        return;
      }

      const looksLikeVideo =
        /\.(mp4|mov|webm|m4v)(\?.*)?$/i.test(url) ||
        /youtube\.com|youtu\.be|vimeo\.com/i.test(url);

      onChange([
        ...media,
        {
          id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          url,
          type: looksLikeVideo ? 'video' : 'image',
          alt: '',
        },
      ]);
      setError(null);
    },
    [maxFiles, media, onChange]
  );

  const remove = useCallback(
    (id: string) => {
      const target = media.find((item) => item.id === id);
      if (target) releaseLocalMedia(target);
      onChange(media.filter((item) => item.id !== id));
      setError(null);
    },
    [media, onChange]
  );

  const move = useCallback(
    (id: string, direction: -1 | 1) => {
      const index = media.findIndex((item) => item.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= media.length) return;

      const next = [...media];
      [next[index], next[target]] = [next[target], next[index]];
      onChange(next);
    },
    [media, onChange]
  );

  const setCover = useCallback(
    (id: string) => {
      const index = media.findIndex((item) => item.id === id);
      if (index <= 0) return;

      const next = [...media];
      const [item] = next.splice(index, 1);
      onChange([item, ...next]);
    },
    [media, onChange]
  );

  return { addFiles, addUrl, remove, move, setCover, error, clearError: () => setError(null) };
}
