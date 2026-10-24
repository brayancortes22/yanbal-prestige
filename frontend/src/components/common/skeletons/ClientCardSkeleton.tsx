import React from 'react';

interface Props {
  count?: number;
}

export const ClientCardSkeleton: React.FC<Props> = ({ count = 2 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-3 animate-pulse"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <div className="h-4 bg-stone-200 rounded-md w-36" />
              <div className="h-3 bg-stone-100 rounded-md w-24" />
            </div>
            <div className="h-5 bg-stone-100 rounded-full w-12" />
          </div>

          <div className="flex items-center gap-2">
            <div className="h-4 bg-amber-100/60 rounded-full w-20" />
            <div className="h-4 bg-stone-100 rounded-full w-28" />
          </div>

          <div className="h-10 bg-stone-100 rounded-xl w-full" />

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <div className="h-3 bg-stone-100 rounded-md w-32" />
            <div className="h-7 bg-emerald-100/70 rounded-xl w-36" />
          </div>
        </div>
      ))}
    </>
  );
};
