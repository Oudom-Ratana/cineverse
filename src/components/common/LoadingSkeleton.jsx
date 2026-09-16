import React from 'react';

export function MovieCardSkeleton() {
  return (
    <div className="flex-none w-44 sm:w-52 rounded-2xl bg-dark-900 border border-slate-800/80 overflow-hidden animate-pulse">
      <div className="aspect-[2/3] w-full bg-slate-800" />
      <div className="p-3.5 space-y-2">
        <div className="h-4 bg-slate-800 rounded w-3/4" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-3 bg-slate-800 rounded w-1/4" />
          <div className="h-3 bg-slate-800 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

export function MovieRowSkeleton({ count = 6 }) {
  return (
    <div className="space-y-3 my-8">
      <div className="h-6 w-48 bg-slate-800 rounded-md animate-pulse" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function HeroCarouselSkeleton() {
  return (
    <div className="w-full h-[60vh] sm:h-[75vh] bg-dark-900 animate-pulse relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent" />
      <div className="absolute bottom-12 left-6 sm:left-12 max-w-2xl space-y-4">
        <div className="h-6 w-32 bg-slate-800 rounded-full" />
        <div className="h-10 sm:h-14 w-3/4 bg-slate-800 rounded-lg" />
        <div className="h-4 w-full bg-slate-800 rounded" />
        <div className="h-4 w-5/6 bg-slate-800 rounded" />
        <div className="flex gap-3 pt-3">
          <div className="h-12 w-36 bg-slate-800 rounded-xl" />
          <div className="h-12 w-36 bg-slate-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-8 pb-16">
      <div className="h-[50vh] bg-slate-800 w-full" />
      <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-10 flex flex-col md:flex-row gap-8">
        <div className="w-64 h-96 bg-slate-700 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-4 pt-12 md:pt-0">
          <div className="h-10 w-2/3 bg-slate-800 rounded-lg" />
          <div className="h-5 w-1/3 bg-slate-800 rounded" />
          <div className="h-24 w-full bg-slate-800 rounded-xl" />
          <div className="flex gap-4">
            <div className="h-12 w-40 bg-slate-800 rounded-xl" />
            <div className="h-12 w-40 bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
