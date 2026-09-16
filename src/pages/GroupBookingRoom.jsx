import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import SEO from '../components/common/SEO';
import SeatMap from '../components/booking/SeatMap';
import GroupChatPanel from '../components/group/GroupChatPanel';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { listenGroupSession } from '../services/firestoreService';
import {
  setGroupSession,
  setGroupMembers,
} from '../redux/slices/groupSessionSlice';
import {
  setSelectedShowtime,
  setBookingMovie,
  setStep,
  setGroupMode,
} from '../redux/slices/bookingSlice';
import { Users, Sparkles, Copy, Check, Share2, Shield, QrCode, ArrowLeft } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatCurrency } from '../utils/formatters';

export default function GroupBookingRoom() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { joinGroup, leaveGroup, proceedCheckout } = useWebSocket();

  const groupState = useSelector((state) => state.groupSession);
  const isCheckoutTriggered = useSelector((state) => state.groupSession.isCheckoutTriggered);
  const groupSelectedSeats = useSelector((state) => state.groupSession.groupSelectedSeats);

  const [sessionData, setSessionData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Listen to group session data in Firestore
  useEffect(() => {
    if (!groupId) return;
    const unsub = listenGroupSession(groupId, (data) => {
      setSessionData(data);
      if (data.members) dispatch(setGroupMembers(data.members));
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [groupId, dispatch]);

  // Connect to WebSocket / BroadcastChannel
  useEffect(() => {
    if (groupId) {
      joinGroup(groupId, {
        uid: user?.uid || `usr_${Math.random().toString(36).substring(2, 7)}`,
        displayName: user?.displayName || 'Cinephile Guest',
        photoURL: user?.photoURL || null,
      });
    }
    return () => {
      leaveGroup();
    };
  }, [groupId, user, joinGroup, leaveGroup]);

  // Synchronized Checkout listener
  useEffect(() => {
    if (isCheckoutTriggered && sessionData) {
      dispatch(setBookingMovie(sessionData.movie));
      dispatch(setSelectedShowtime(sessionData.showtime));
      dispatch(setGroupMode({ isGroup: true, groupId }));
      dispatch(setStep(4)); // Direct to payment
      navigate(`/movies/${sessionData.movie.id}/book`);
    }
  }, [isCheckoutTriggered, sessionData, dispatch, groupId, navigate]);

  const isLeader = Boolean(sessionData && user && sessionData.leaderId === user.uid);
  const shareableUrl = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSeat = (seat) => {
    setSelectedSeats((prev) => {
      const exists = prev.some((s) => s.id === seat.id);
      if (exists) return prev.filter((s) => s.id !== seat.id);
      return [...prev, seat];
    });
  };

  const handleLeaderProceed = () => {
    proceedCheckout({
      seats: selectedSeats,
      showtime: sessionData?.showtime,
    });
  };

  if (!sessionData) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-400">Connecting to Multiplayer Room...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <SEO
        title={`Group Booking Room — ${sessionData.movie?.title}`}
        description="Collaborate in real-time with friends to select cinema seats."
      />

      {/* Room Header */}
      <div className="p-6 rounded-3xl bg-dark-900 border border-slate-800 shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
              <Users className="w-3.5 h-3.5" />
              Live Multiplayer Room
            </span>
            <span className="text-xs font-mono text-slate-400">Room: {groupId}</span>
          </div>
          <h1 className="font-display font-black text-2xl text-white">
            {sessionData.movie?.title}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {sessionData.showtime?.date} at {sessionData.showtime?.time} • {sessionData.showtime?.hallName}
          </p>
        </div>

        {/* Share & QR Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowQrModal(true)}
            className="p-2.5 rounded-xl bg-dark-950 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="Show Room QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-950 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Link Copied' : 'Invite Friends'}
          </button>
        </div>
      </div>

      {/* Grid: SeatMap + Group Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Seat Map */}
        <div className="lg:col-span-8 space-y-4">
          <SeatMap
            showtime={sessionData.showtime}
            selectedSeats={selectedSeats}
            onToggleSeat={handleToggleSeat}
            isGroupMode={true}
            groupId={groupId}
          />

          {/* Group Seats Status Bar */}
          <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-400 font-medium">Your Selected Seats:</span>
              <div className="flex gap-1.5 mt-1">
                {selectedSeats.length > 0 ? (
                  selectedSeats.map((s) => (
                    <span
                      key={s.id}
                      className="px-2 py-0.5 rounded bg-rose-600/20 text-rose-400 font-bold border border-rose-500/30"
                    >
                      {s.id}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 italic">Click seats on map to reserve</span>
                )}
              </div>
            </div>

            {isLeader && (
              <button
                onClick={handleLeaderProceed}
                disabled={selectedSeats.length === 0}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-bold shadow-lg shadow-rose-950 transition disabled:opacity-40"
              >
                <Shield className="w-4 h-4" />
                Proceed Room to Checkout
              </button>
            )}
          </div>
        </div>

        {/* Live Chat & Member Lounge */}
        <div className="lg:col-span-4">
          <GroupChatPanel
            groupId={groupId}
            isLeader={isLeader}
            members={groupState.members.length > 0 ? groupState.members : sessionData.members || []}
            onLeaderProceed={handleLeaderProceed}
            selectedSeatsCount={selectedSeats.length}
          />
        </div>
      </div>

      {/* QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-dark-900 border border-slate-800 rounded-3xl p-6 max-w-xs w-full text-center space-y-4">
            <h3 className="font-bold text-base text-white">Scan to Join Room</h3>
            <div className="p-3 rounded-2xl bg-white inline-block mx-auto">
              <QRCodeSVG value={shareableUrl} size={160} />
            </div>
            <p className="text-xs text-slate-400">
              Have friends scan with their phone camera to pick cinema seats together live!
            </p>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
