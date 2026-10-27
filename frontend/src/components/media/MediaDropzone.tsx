import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Video, Link2 } from 'lucide-react';

interface Props {
  accept: 'image' | 'video' | 'any';
  onFiles: (files: FileList) => void;
  compact?: boolean;
}

const COPY: Record<Props['accept'], { title: string; hint: string }> = {
  image: { title: 'Arrastra tus fotos aquí', hint: 'JPG, PNG, WebP o AVIF · hasta 8 MB' },
  video: { title: 'Arrastra tu video aquí', hint: 'MP4, MOV o WebM · hasta 150 MB' },
  any: { title: 'Arrastra fotos o videos aquí', hint: 'Imágenes hasta 8 MB · videos hasta 150 MB' },
};

export const MediaDropzone: React.FC<Props> = ({ accept, onFiles, compact = false }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOver, setIsOver] = useState(false);
  const copy = COPY[accept];

  const acceptAttr =
    accept === 'image' ? 'image/*' : accept === 'video' ? 'video/*' : 'image/*,video/*';

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsOver(false);
    if (event.dataTransfer.files?.length) onFiles(event.dataTransfer.files);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(event) => {
        event.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click();
      }}
      className={`group relative w-full rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center ${
        compact ? 'px-4 py-5' : 'px-6 py-9'
      } ${
        isOver
          ? 'border-orange-500 bg-orange-50/80'
          : 'border-stone-300 bg-stone-50/60 hover:border-orange-400 hover:bg-orange-50/40'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={acceptAttr}
        multiple={accept === 'any'}
        className="hidden"
        onChange={(event) => {
          if (event.target.files?.length) onFiles(event.target.files);
          event.target.value = '';
        }}
      />

      <div className="flex flex-col items-center gap-2">
        <span
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
            isOver ? 'bg-orange-600 text-white' : 'bg-white text-orange-600 border border-orange-100'
          }`}
        >
          <UploadCloud className="w-5 h-5" />
        </span>

        <p className="text-xs font-bold text-stone-800">{copy.title}</p>
        <p className="text-[11px] text-stone-500">{copy.hint}</p>

        <div className="flex items-center gap-3 pt-1 text-[10px] text-stone-400">
          {accept !== 'video' && (
            <span className="flex items-center gap-1">
              <ImageIcon className="w-3 h-3" /> Fotos
            </span>
          )}
          {accept !== 'image' && (
            <span className="flex items-center gap-1">
              <Video className="w-3 h-3" /> Videos
            </span>
          )}
          <span className="flex items-center gap-1">
            <Link2 className="w-3 h-3" /> o pega un enlace abajo
          </span>
        </div>
      </div>
    </div>
  );
};
