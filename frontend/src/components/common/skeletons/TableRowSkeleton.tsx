import React from 'react';

interface Props {
  columns?: number;
  rows?: number;
}

export const TableRowSkeleton: React.FC<Props> = ({ columns = 6, rows = 5 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className="animate-pulse">
          {Array.from({ length: columns }).map((_, cIdx) => (
            <td key={cIdx} className="p-4">
              <div className="h-4 bg-stone-200/70 rounded-md w-4/5" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};
