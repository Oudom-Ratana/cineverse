export default function ComingSoonCardSkeleton() {
  return (
    <div className="space-y-3 font-sans animate-pulse">
      {/* Landscape Banner Skeleton */}
      <div className="aspect-[16/10] w-full rounded-[22px] bg-neutral-300/80 dark:bg-neutral-800/80 border border-neutral-200/50 dark:border-white/5" />

      {/* Title & Date Skeleton */}
      <div className="space-y-2 pt-1">
        <div className="h-6 w-3/4 rounded bg-neutral-300 dark:bg-neutral-800" />
        <div className="h-4 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800/60" />
      </div>
    </div>
  );
}
