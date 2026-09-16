import React from 'react';
import { Film, Heart, Github, Twitter, Shield, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-dark-950 border-t border-slate-900 pt-16 pb-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-extrabold text-xl text-white">
                Film<span className="text-rose-500">Zone</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              Next-generation cinema ticketing, live multiplayer seat reservations, and seamless streaming powered by the TMDB API and modern web standards.
            </p>
            <div className="flex items-center gap-3 text-slate-400">
              <span className="text-xs flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Systems Online
              </span>
            </div>
          </div>

          {/* Navigation Col */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Explore</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-rose-400 transition">Featured Premiere</Link></li>
              <li><Link to="/movies" className="hover:text-rose-400 transition">Cinema Now Playing</Link></li>
              <li><Link to="/tv" className="hover:text-rose-400 transition">Binge TV Series</Link></li>
              <li><Link to="/profile" className="hover:text-rose-400 transition">My Reserved Tickets</Link></li>
            </ul>
          </div>

          {/* Tech & Data Col */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Powered By</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  The Movie Database (TMDB API)
                </a>
              </li>
              <li>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Firebase Realtime Firestore
                </span>
              </li>
              <li>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  WebSocket Multiplayer Room Sync
                </span>
              </li>
              <li>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  VidSrc Streaming Engine
                </span>
              </li>
            </ul>
          </div>

          {/* Legal / TMDB Disclaimer */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Attribution</h4>
            <p className="text-[11px] leading-relaxed text-slate-500 mb-3">
              This product uses the TMDB API but is not endorsed or certified by TMDB. All movie metadata and images are properties of their respective copyright owners.
            </p>
            <div className="flex gap-2">
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">PWA Ready</span>
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">Vite 5</span>
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">React 18</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Ciniverse Entertainment, Inc. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>for cinema enthusiasts worldwide.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
