import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, max = 5, interactive = false, onRate, size = 'md' }) {
  const [hoverRating, setHoverRating] = useState(0);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  const activeRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = activeRating >= starValue;
        const isHalf = !isFilled && activeRating >= starValue - 0.5;

        return (
          <button
            type="button"
            key={index}
            disabled={!interactive}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            onClick={() => interactive && onRate && onRate(starValue)}
            className={`transition-colors ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
          >
            <Star
              className={`${starSizes[size] || starSizes.md} ${
                isFilled
                  ? 'text-amber-400 fill-amber-400'
                  : isHalf
                  ? 'text-amber-400 fill-amber-400/50'
                  : 'text-slate-600 fill-transparent'
              }`}
            />
          </button>
        );
      })}
      {rating > 0 && !interactive && (
        <span className="text-xs font-semibold text-amber-400 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
