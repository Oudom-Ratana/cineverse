import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, Film } from 'lucide-react';
import { closeTrailerModal } from '../../redux/slices/uiSlice';
import { getYouTubeEmbedUrl } from '../../utils/formatters';

export default function TrailerModal() {
  const dispatch = useDispatch();
  const { isOpen, videoKey, title } = useSelector((state) => state.ui.trailerModal);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-dark-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-dark-950/80">
          <div className="flex items-center gap-2 text-rose-500">
            <Film className="w-5 h-5" />
            <h3 className="font-semibold text-white truncate max-w-md">{title}</h3>
          </div>
          <button
            onClick={() => dispatch(closeTrailerModal())}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close trailer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 16:9 Responsive Video Frame */}
        <div className="relative aspect-video w-full bg-black">
          {videoKey ? (
            <iframe
              src={getYouTubeEmbedUrl(videoKey, true)}
              title={title}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <p>No official video trailer available for this title.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
