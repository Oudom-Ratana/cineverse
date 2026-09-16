import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import {
  useGetMovieDetailsQuery,
  useGetTVDetailsQuery,
  useGetTVSeasonDetailsQuery,
} from '../redux/services/tmdbApi';
import { getVidSrcEmbedUrl, formatRuntime } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { addToWatchHistory } from '../services/firestoreService';
import {
  ArrowLeft,
  Tv,
  Film,
  Server,
  Lightbulb,
  Maximize2,
  Sparkles,
  Play,
  ListFilter,
} from 'lucide-react';

const VIDSRC_SERVERS = [
  { label: 'VidSrc Alpha (Primary)', host: 'vidsrc.to' },
  { label: 'VidSrc Cloud (Mirror 1)', host: 'vidsrc.xyz' },
  { label: 'VidSrc Ultra (Mirror 2)', host: 'vidsrc.me' },
  { label: 'VidSrc Fast (Mirror 3)', host: 'vidsrc.cc' },
];

export default function WatchPage() {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();

  const isTV = location.pathname.startsWith('/tv');
  const mediaType = isTV ? 'tv' : 'movie';

  const [selectedServer, setSelectedServer] = useState(VIDSRC_SERVERS[0].host);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [lightsDimmed, setLightsDimmed] = useState(false);

  // Queries
  const { data: movieData } = useGetMovieDetailsQuery(id, { skip: isTV || !id });
  const { data: tvData } = useGetTVDetailsQuery(id, { skip: !isTV || !id });
  const { data: seasonData } = useGetTVSeasonDetailsQuery(
    { id, seasonNumber: selectedSeason },
    { skip: !isTV || !id }
  );

  const media = isTV ? tvData : movieData;
  const title = media?.title || media?.name || 'Streaming';

  // Write to watch history when media loads
  useEffect(() => {
    if (media && user?.uid) {
      addToWatchHistory(user.uid, {
        id: media.id,
        title,
        poster_path: media.poster_path,
        backdrop_path: media.backdrop_path,
        mediaType,
        season: isTV ? selectedSeason : null,
        episode: isTV ? selectedEpisode : null,
      });
    }
  }, [media, user?.uid, isTV, selectedSeason, selectedEpisode, title, mediaType]);

  const embedUrl = getVidSrcEmbedUrl({
    type: mediaType,
    tmdbId: id,
    season: selectedSeason,
    episode: selectedEpisode,
    server: selectedServer,
  });

  const totalSeasons = media?.number_of_seasons || 1;
  const episodes = seasonData?.episodes || [];

  return (
    <div className={`min-h-screen transition-colors duration-500 pb-16 ${lightsDimmed ? 'bg-black' : 'bg-dark-950'}`}>
      <SEO
        title={`Watching ${title} — Ciniverse Stream`}
        description={`Stream full HD movie or TV episodes for ${title} on Ciniverse.`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Navigation & Controls Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
          <Link
            to={`/${isTV ? 'tv' : 'movies'}/${id}`}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Details
          </Link>

          {/* Player controls */}
          <div className="flex items-center gap-3">
            {/* Mirror Selector */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <select
                value={selectedServer}
                onChange={(e) => setSelectedServer(e.target.value)}
                className="bg-dark-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                {VIDSRC_SERVERS.map((srv) => (
                  <option key={srv.host} value={srv.host}>
                    {srv.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Lights dim toggle */}
            <button
              onClick={() => setLightsDimmed(!lightsDimmed)}
              className={`p-1.5 rounded-xl border text-xs transition flex items-center gap-1.5 ${
                lightsDimmed
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-dark-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Dim Lights (Theater Mode)"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lightsDimmed ? 'Lights On' : 'Dim Lights'}</span>
            </button>
          </div>
        </div>

        {/* Video Player Grid */}
        <div className={`grid gap-6 ${isTV ? 'lg:grid-cols-12' : 'grid-cols-1'}`}>
          {/* Main Iframe Player */}
          <div className={isTV ? 'lg:col-span-8' : 'w-full'}>
            <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-black border border-slate-800/80 shadow-2xl">
              <iframe
                key={embedUrl}
                src={embedUrl}
                title={title}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="font-display font-extrabold text-xl text-white">{title}</h1>
                {isTV && (
                  <p className="text-xs text-cyan-400 font-semibold mt-0.5">
                    Season {selectedSeason} • Episode {selectedEpisode}: {episodes[selectedEpisode - 1]?.name || ''}
                  </p>
                )}
              </div>
              <span className="text-[11px] text-slate-500">
                Streamed via {selectedServer} • High Definition 1080p
              </span>
            </div>
          </div>

          {/* TV Season & Episode Selector Sidebar */}
          {isTV && (
            <div className="lg:col-span-4 bg-dark-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col h-[520px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-rose-500" />
                  <h3 className="font-bold text-sm text-white">Episodes</h3>
                </div>

                {/* Season Dropdown */}
                <select
                  value={selectedSeason}
                  onChange={(e) => {
                    setSelectedSeason(Number(e.target.value));
                    setSelectedEpisode(1);
                  }}
                  className="bg-dark-950 border border-slate-800 rounded-xl px-3 py-1 text-xs text-white focus:outline-none"
                >
                  {Array.from({ length: totalSeasons }).map((_, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      Season {idx + 1}
                    </option>
                  ))}
                </select>
              </div>

              {/* Episode Items List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/70 pt-2 space-y-1">
                {episodes.map((ep) => {
                  const isCurrent = ep.episode_number === selectedEpisode;

                  return (
                    <div
                      key={ep.id}
                      onClick={() => setSelectedEpisode(ep.episode_number)}
                      className={`p-2.5 rounded-xl cursor-pointer transition flex items-start gap-3 ${
                        isCurrent
                          ? 'bg-cyan-950/40 border border-cyan-500/50 text-white'
                          : 'hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 text-xs font-bold text-cyan-400">
                        {isCurrent ? <Play className="w-3.5 h-3.5 fill-cyan-400" /> : ep.episode_number}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold truncate">{ep.name}</p>
                          {ep.runtime && (
                            <span className="text-[10px] text-slate-500 ml-1">
                              {ep.runtime}m
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {ep.overview || 'Episode playback'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
