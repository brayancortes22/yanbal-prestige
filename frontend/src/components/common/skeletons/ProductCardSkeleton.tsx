import React from 'react';

interface Props {
  count?: number;
}

export const ProductCardSkeleton: React.FC<Props> = ({ count = 6 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="card-luxury rounded-3xl overflow-hidden flex flex-col justify-between border border-stone-200/60 bg-white animate-pulse"
        >
          {/* Imagen aspect-square shimmer */}
          <div className="relative aspect-square bg-stone-200/70" />

          {/* Info Shimmer */}
          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="h-2.5 bg-stone-200 rounded-full w-24" />
              <div className="h-4 bg-stone-200 rounded-full w-4/5" />
              <div className="h-3 bg-stone-100 rounded-full w-full" />
              <div className="h-3 bg-stone-100 rounded-full w-2/3" />
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <div className="h-5 bg-stone-200 rounded-md w-28" />
              <div className="h-8 bg-stone-200 rounded-xl w-20" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};
