import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import { MovieRowSkeleton } from '../common/LoadingSkeleton';

export default function MovieRow({ title, items = [], isLoading = false, mediaType = 'movie', subtitle }) {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (isLoading) {
    return <MovieRowSkeleton count={6} />;
  }

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="relative my-8 sm:my-10 group/row">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
            {title}
          </h2>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>

        {/* Scroll Buttons */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-xl bg-dark-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-xl bg-dark-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroller */}
      <div
        ref={rowRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => (
          <MovieCard key={item.id} item={item} mediaType={mediaType} />
        ))}
      </div>
    </section>
  );
}
