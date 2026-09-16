export default function MovieCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3 font-sans animate-pulse">
      {/* Poster Skeleton with Mixed Corner Radius (Clean, no top-right badge) */}
      <div
        className="relative aspect-[291/386] w-full overflow-hidden bg-neutral-300/80 dark:bg-neutral-800/80 border border-neutral-200/50 dark:border-white/5 rounded-tl-[25px] rounded-br-[25px] rounded-tr-none rounded-bl-none"
        style={{
          borderTopLeftRadius: "25px",
          borderBottomRightRadius: "25px",
          borderTopRightRadius: "0px",
          borderBottomLeftRadius: "0px",
        }}
      />

      {/* Title & Metadata Skeleton */}
      <div className="space-y-1.5 px-0.5 pt-1">
        <div className="h-6 w-3/4 rounded bg-neutral-300 dark:bg-neutral-800" />
        <div className="flex items-center justify-between pt-0.5">
          <div className="h-4.5 w-28 rounded bg-neutral-200 dark:bg-neutral-800/60" />
          <div className="flex items-center gap-2.5">
            <div className="h-4.5 w-10 rounded bg-neutral-200 dark:bg-neutral-800/60" />
            <div className="h-5 w-5 rounded-full bg-neutral-200 dark:bg-neutral-800/60" />
          </div>
        </div>
      </div>
    </div>
  );
}
