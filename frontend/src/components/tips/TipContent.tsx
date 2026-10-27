import React from 'react';

interface Props {
  content: string;
}

/**
 * Renderiza el cuerpo del tip sin librerías externas.
 * Bloques separados por línea en blanco; líneas que empiezan por "- "
 * se convierten en lista con viñetas.
 */
export const TipContent: React.FC<Props> = ({ content }) => {
  const blocks = content.split(/\n{2,}/).filter((block) => block.trim().length > 0);

  return (
    <div className="space-y-5">
      {blocks.map((block, blockIndex) => {
        const lines = block
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean);

        const isList = lines.length > 0 && lines.every((line) => line.startsWith('- '));

        if (isList) {
          return (
            <ul key={blockIndex} className="space-y-2 pl-1">
              {lines.map((line, lineIndex) => (
                <li key={lineIndex} className="flex items-start gap-2.5 text-sm text-stone-600 leading-relaxed">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                  <span>{line.slice(2)}</span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={blockIndex} className="text-sm sm:text-[15px] text-stone-600 leading-relaxed">
            {lines.join(' ')}
          </p>
        );
      })}
    </div>
  );
};
