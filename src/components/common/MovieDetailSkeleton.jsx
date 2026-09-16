import React from "react";

/**
 * MovieDetailSkeleton
 * Smooth, shimmer loading skeleton for Movie and Stream detail pages
 */
export default function MovieDetailSkeleton() {
  return (
    <div className="relative w-full pb-24 font-sans select-none space-y-12 animate-pulse">
      {/* 1. Back button skeleton */}
      <div className="flex items-center pt-2">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-neutral-200 dark:bg-neutral-800" />
      </div>

      {/* 2. Main Detail Grid (Poster on Left + Metadata on Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Poster Skeleton */}
        <div className="md:col-span-5 lg:col-span-4 flex justify-center md:justify-start">
          <div className="aspect-[2/3] w-full max-w-[340px] rounded-[25px] bg-neutral-200 dark:bg-neutral-800 border border-neutral-300/40 dark:border-white/5 shadow-2xl" />
        </div>

        {/* Right: Info & Controls Skeleton */}
        <div className="md:col-span-7 lg:col-span-8 space-y-6">
          {/* Title bar skeleton */}
          <div className="space-y-3">
            <div className="h-9 sm:h-12 w-3/4 max-w-lg rounded-xl bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-5 sm:h-6 w-1/3 max-w-xs rounded-lg bg-neutral-200 dark:bg-neutral-800/60" />
          </div>

          {/* Metadata rows */}
          <div className="space-y-4 pt-2">
            {[240, 180, 210, 150].map((width, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-md bg-neutral-200 dark:bg-neutral-800 shrink-0" />
                <div
                  className="h-5 rounded-md bg-neutral-200 dark:bg-neutral-800"
                  style={{ width: `${width}px` }}
                />
              </div>
            ))}
          </div>

          {/* Action buttons skeleton */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <div className="h-11 w-36 sm:w-40 rounded-full bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-11 w-36 sm:w-40 rounded-full bg-neutral-200 dark:bg-neutral-800" />
          </div>

          {/* Sub-section skeleton (e.g. Episode list / Seat tier bars) */}
          <div className="pt-4 space-y-3">
            <div className="h-4 w-44 rounded bg-neutral-200 dark:bg-neutral-800/60" />
            <div className="flex items-center gap-2 overflow-hidden py-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-10 w-16 rounded-xl bg-neutral-200 dark:bg-neutral-800 shrink-0"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: Cast & Crew Cards Skeleton */}
      <div className="pt-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-neutral-300/40 dark:border-white/5 bg-neutral-100 dark:bg-neutral-900/60 p-5 text-center flex flex-col items-center justify-center gap-3 shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800" />
              <div className="space-y-1.5 w-full flex flex-col items-center">
                <div className="h-4 w-20 rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-3 w-14 rounded bg-neutral-200 dark:bg-neutral-800/60" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
