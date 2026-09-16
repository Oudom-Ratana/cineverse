import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Users, Copy, Check, Share2, X, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createGroupSession } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';

export default function GroupBookingModal({ isOpen, onClose, movie, showtime }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [createdSession, setCreatedSession] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleStartSession = async () => {
    setIsLoading(true);
    try {
      const session = await createGroupSession({
        leaderId: user?.uid || 'guest_leader',
        leaderName: user?.displayName || 'Group Host',
        leaderPhoto: user?.photoURL || null,
        movie: {
          id: movie.id,
          title: movie.title || movie.name,
          poster_path: movie.poster_path,
        },
        showtime: {
          id: showtime?.id,
          date: showtime?.date,
          time: showtime?.time,
          hallName: showtime?.hallName,
        },
        members: [
          {
            uid: user?.uid || 'leader',
            displayName: user?.displayName || 'Group Host',
            isReady: false,
            color: '#f43f5e',
          },
        ],
      });
      setCreatedSession(session);
    } catch (e) {
      console.error('Error starting group session:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const inviteUrl = createdSession
    ? `${window.location.origin}/booking/group/${createdSession.groupId}`
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnterRoom = () => {
    if (createdSession) {
      navigate(`/booking/group/${createdSession.groupId}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-dark-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {!createdSession ? (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-xl shadow-cyan-950/40">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="font-display font-bold text-2xl text-white">Start Multiplayer Booking</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Invite friends to a shared interactive room. Pick seats together in real-time with live colored cursors and synchronize checkout!
            </p>

            <div className="p-3 rounded-2xl bg-dark-950 border border-slate-800 text-left text-xs text-slate-300">
              <span className="text-slate-400 font-medium">Selected Screening:</span>
              <p className="font-bold text-white mt-0.5">{movie?.title || movie?.name}</p>
              <p className="text-slate-400 mt-0.5">{showtime?.date} at {showtime?.time} • {showtime?.hallName}</p>
            </div>

            <button
              onClick={handleStartSession}
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-600 text-white font-bold text-sm shadow-xl shadow-cyan-950/50 transition hover:scale-[1.01] flex items-center justify-center gap-2"
            >
              {isLoading ? 'Creating Room...' : 'Create Multiplayer Room'}
            </button>
          </div>
        ) : (
          <div className="text-center space-y-4 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-white">Room Created!</h3>
            <p className="text-xs text-slate-400">
              Share this link or QR code with your friends to join your live seat selection session.
            </p>

            {/* QR Code */}
            <div className="inline-block p-3 rounded-2xl bg-white shadow-inner mx-auto my-1">
              <QRCodeSVG value={inviteUrl} size={130} />
            </div>

            {/* Link Box */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-dark-950 border border-slate-800">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="flex-1 bg-transparent text-xs text-slate-300 px-2 outline-none truncate font-mono"
              />
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow transition"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <button
              onClick={handleEnterRoom}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-950 transition flex items-center justify-center gap-2"
            >
              Enter Live Room Now
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
