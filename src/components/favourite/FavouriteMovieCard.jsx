import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Heart, Trash2, Play } from "lucide-react";
import { removeFromFavourite } from "../../redux/slices/favouriteSlice";
import { useAddFavoriteMutation } from "../../services/api/accountApi";

export default function FavouriteMovieCard({
  id,
  title,
  posterUrl,
  duration,
  year,
  genre,
  description,
  isTV = false,
  isFavourite = true,
  onDelete,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [addFavorite] = useAddFavoriteMutation();

  const streamUrl = `/stream/${id}${isTV ? "?type=tv" : ""}`;

  const handleRemove = async () => {
    if (onDelete) {
      onDelete();
    } else {
      dispatch(removeFromFavourite(id));
    }
    try {
      await addFavorite({
        mediaType: isTV ? "tv" : "movie",
        mediaId: id,
        favorite: false,
      }).unwrap();
    } catch (err) {
      console.warn("Failed to remove favorite from TMDB:", err);
    }
  };

  return (
    <div className="flex w-full gap-5 border border-[var(--border-light-mode)] rounded-2xl bg-[var(--primary-color-5)] dark:bg-[var(--primary-color-30)] dark:border-[var(--border-dark-mode)] p-5">
      <Link
        to={streamUrl}
        className="h-56 w-40 shrink-0 overflow-hidden rounded-xl block cursor-pointer"
        aria-label={`View ${title}`}
      >
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={`${title} poster`}
            className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-black dark:text-white">
            No poster
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link to={streamUrl}>
            <h2 className="text-2xl font-bold text-black dark:text-white hover:text-[#B90101] transition-colors">
              {title}
            </h2>
          </Link>

          <div className="flex shrink-0 items-center gap-3 text-sm ">
            <button
              type="button"
              onClick={handleRemove}
              className="flex flex-col items-center gap-1 hover:text-[var(--color-primary)] border-none cursor-pointer"
              title="Remove from favourite"
            >
              <Heart
                size={20}
                className="fill-[var(--color-primary)] text-[var(--color-primary)] inline-block transition-transform duration-200 hover:scale-110"
              />
              <span className="text-[var(--color-primary)] inline-block transition-transform duration-200 hover:scale-110 text-xs font-semibold">
                Favourite
              </span>
            </button>

            <div className="h-8 w-px bg-neutral-200 dark:bg-white/10" />

            <button
              type="button"
              onClick={handleRemove}
              className="flex flex-col items-center gap-1 text-[var(--color-primary)] hover:text-red-700 transition-transform duration-200 hover:scale-110 cursor-pointer"
              title="Delete from favourite"
            >
              <Trash2 size={20} />
              <span className="text-xs font-semibold">Delete</span>
            </button>
          </div>
        </div>

        <p className="mt-1 text-sm font-medium text-[var(--color-primary)]">
          {duration} · {year}
        </p>

        {genre && (
          <span className="mt-3 w-fit rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-white">
            {genre}
          </span>
        )}

        {description && (
          <p className="mt-3 max-w-[950px] text-[18px] leading-relaxed text-[var(--text-light)] dark:text-white line-clamp-3">
            {description}
          </p>
        )}

        <button
          type="button"
          onClick={() => navigate(streamUrl)}
          className="mt-4 flex w-fit items-center gap-2 rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-transform duration-200 hover:scale-105 cursor-pointer"
        >
          <Play size={16} className="fill-white " />
          {isTV ? "Watch Series" : "Watch Movie"}
        </button>
      </div>
    </div>
  );
}
