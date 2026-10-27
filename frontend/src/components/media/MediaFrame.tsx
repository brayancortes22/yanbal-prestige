import React from 'react';
import type { MediaItem } from '../../types';
import { getVideoEmbedUrl } from './mediaUtils';

interface Props {
  item: MediaItem;
  alt: string;
  controls?: boolean;
  className?: string;
}

/** Renderiza una foto o un video (archivo directo, YouTube o Vimeo). */
export const MediaFrame: React.FC<Props> = ({ item, alt, controls = true, className = '' }) => {
  if (item.type === 'video') {
    const embed = getVideoEmbedUrl(item.url);

    if (embed) {
      return (
        <iframe
          src={embed}
          title={item.alt || alt}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className={`w-full h-full ${className}`}
        />
      );
    }

    return (
      <video
        src={item.url}
        poster={item.poster}
        controls={controls}
        playsInline
        preload="metadata"
        className={`w-full h-full object-contain bg-stone-900 ${className}`}
      />
    );
  }

  return (
    <img
      src={item.url}
      alt={item.alt || alt}
      loading="lazy"
      className={`w-full h-full object-cover ${className}`}
    />
  );
};
