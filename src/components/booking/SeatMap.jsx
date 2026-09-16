import React, { useState, useEffect, useMemo } from 'react';
import { HALLS } from '../../utils/cinemaData';
import { listenSeatLocks, lockSeat, unlockSeat, listenAdminHalls } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebSocketContext';
import { useSelector } from 'react-redux';
import { Clock, Users, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function SeatMap({
  showtime,
  selectedSeats = [],
  onToggleSeat,
  isGroupMode = false,
  groupId = null,
}) {
  const { user } = useAuth();
  const { sendSeatHover, sendSeatSelect } = useWebSocket();
  const remoteCursors = useSelector((state) => state.groupSession.remoteCursors);
  const groupSelectedSeats = useSelector((state) => state.groupSession.groupSelectedSeats);

  const [adminHalls, setAdminHalls] = useState(HALLS);
  const [activeLocks, setActiveLocks] = useState({});
  const [lockTimeLeft, setLockTimeLeft] = useState(180); // 3 minutes in seconds
  const [hoveredSeat, setHoveredSeat] = useState(null);

  // Listen to dynamic Admin hall configurations and pricing from Firestore
  useEffect(() => {
    const unsub = listenAdminHalls(HALLS, (list) => {
      if (list && list.length > 0) setAdminHalls(list);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  // Match hall definition dynamically
  const hall = useMemo(() => {
    return adminHalls.find((h) => h.id === showtime?.hallId) || adminHalls[0];
  }, [adminHalls, showtime?.hallId]);

  // Listen to real-time seat locks for this showtime from Firestore
  useEffect(() => {
    if (!showtime?.id) return;
    const unsubscribe = listenSeatLocks(showtime.id, (locks) => {
      setActiveLocks(locks);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [showtime?.id]);

  // 3-Minute countdown timer for locked seats
  useEffect(() => {
    if (selectedSeats.length === 0) {
      setLockTimeLeft(180);
      return;
    }

    const timer = setInterval(() => {
      setLockTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer expired: release locks
          selectedSeats.forEach((seat) => {
            unlockSeat({ showtimeId: showtime.id, seatId: seat.id, userId: user?.uid });
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedSeats, showtime?.id, user?.uid]);

  // Pre-booked / confirmed mock seats for theater realism
  const confirmedSeats = useMemo(() => {
    return new Set(['C-5', 'C-6', 'D-7', 'D-8', 'E-5', 'E-6']);
  }, []);

  const handleSeatClick = async (seat) => {
    const isBooked = confirmedSeats.has(seat.id);
    if (isBooked) return;

    const lock = activeLocks[seat.id];
    const isLockedByOther = lock && lock.userId !== user?.uid && lock.expiresAt > Date.now();
    if (isLockedByOther) return;

    const isSelectedByCurrent = selectedSeats.some((s) => s.id === seat.id);

    if (isSelectedByCurrent) {
      // Deselect & unlock
      onToggleSeat(seat);
      await unlockSeat({ showtimeId: showtime.id, seatId: seat.id, userId: user?.uid });
      if (isGroupMode) {
        sendSeatSelect(seat.id, 'deselect');
      }
    } else {
      // Select & lock in Firestore with 3-minute expiry
      onToggleSeat(seat);
      await lockSeat({
        showtimeId: showtime.id,
        seatId: seat.id,
        userId: user?.uid || 'guest',
        userName: user?.displayName || 'Guest',
      });
      if (isGroupMode) {
        sendSeatSelect(seat.id, 'select');
      }
    }
  };

  const handleSeatMouseEnter = (seat, e) => {
    setHoveredSeat(seat);
    if (isGroupMode) {
      const rect = e.currentTarget.getBoundingClientRect();
      sendSeatHover(seat.id, rect.left, rect.top);
    }
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Dimensions for SVG Map
  const svgWidth = 760;
  const svgHeight = 420;
  const startX = 75;
  const startY = 100;
  const seatWidth = 32;
  const seatHeight = 30;
  const gapX = 18;
  const gapY = 14;

  return (
    <div className="bg-dark-900 border border-slate-800 rounded-3xl p-4 sm:p-8 shadow-2xl">
      {/* Header with Auditory Info & Lock Countdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
            {hall.name}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{hall.screenType} • Standard: {formatCurrency(showtime?.basePrice)} | VIP: {formatCurrency(showtime?.vipPrice)}</p>
        </div>

        {selectedSeats.length > 0 && (
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 animate-pulse">
            <Clock className="w-4 h-4 text-amber-400" />
            <div className="text-xs">
              <span className="font-bold">{formatTimer(lockTimeLeft)}</span>
              <span className="text-amber-400/80 ml-1.5 hidden sm:inline">Seats Held in Realtime</span>
            </div>
          </div>
        )}
      </div>

      {/* SVG Cinema Interactive Seat Map */}
      <div className="relative overflow-x-auto py-8 flex justify-center no-scrollbar">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full max-w-3xl select-none"
        >
          {/* Curved Cinema Screen */}
          <defs>
            <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Screen Light Projection */}
          <path
            d={`M 110 55 L 40 ${svgHeight - 60} L ${svgWidth - 40} ${svgHeight - 60} L ${svgWidth - 110} 55 Z`}
            fill="url(#screenGrad)"
            opacity="0.04"
          />

          {/* Curved Screen Line */}
          <path
            d="M 120 45 Q 380 20 640 45"
            stroke="#06b6d4"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
            filter="url(#glow)"
          />
          <text
            x={svgWidth / 2}
            y="32"
            fill="#06b6d4"
            textAnchor="middle"
            fontSize="11"
            fontWeight="bold"
            letterSpacing="5"
            className="uppercase opacity-80"
          >
            Curved Cinema Screen
          </text>

          {/* Render Seat Grid */}
          {hall.rows.map((rowLetter, rowIndex) => {
            const isVipRow = hall.vipRows.includes(rowLetter);
            const y = startY + rowIndex * (seatHeight + gapY);

            return (
              <g key={rowLetter}>
                {/* Row Label (Left) */}
                <text
                  x={startX - 30}
                  y={y + seatHeight / 2 + 4}
                  fill="#94a3b8"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {rowLetter}
                </text>

                {/* Seats 1 to 12 */}
                {Array.from({ length: hall.seatsPerRow }).map((_, colIndex) => {
                  const seatNum = colIndex + 1;
                  const seatId = `${rowLetter}-${seatNum}`;
                  const isAisle = colIndex === 2 || colIndex === 9; // subtle theater walkway space
                  const extraAisleGap = colIndex >= 10 ? 24 : colIndex >= 3 ? 12 : 0;
                  const x = startX + colIndex * (seatWidth + gapX) + extraAisleGap;

                  const isBooked = confirmedSeats.has(seatId);
                  const isSelected = selectedSeats.some((s) => s.id === seatId);
                  const lock = activeLocks[seatId];
                  const isLockedByOther = lock && lock.userId !== user?.uid && lock.expiresAt > Date.now();
                  const isLockedByMe = lock && lock.userId === user?.uid && lock.expiresAt > Date.now();
                  const groupMemberSelect = groupSelectedSeats[seatId];

                  // Seat Color State Determination
                  let fillColor = '#334155'; // Standard available
                  let strokeColor = '#475569';
                  let cursor = 'pointer';

                  if (isBooked) {
                    fillColor = '#1e293b';
                    strokeColor = '#0f172a';
                    cursor = 'not-allowed';
                  } else if (isSelected) {
                    fillColor = '#e11d48'; // Rose primary
                    strokeColor = '#f43f5e';
                  } else if (groupMemberSelect) {
                    fillColor = groupMemberSelect.color || '#06b6d4';
                    strokeColor = '#ffffff';
                  } else if (isLockedByOther) {
                    fillColor = '#eab308'; // Warning amber
                    strokeColor = '#f59e0b';
                    cursor = 'not-allowed';
                  } else if (isVipRow) {
                    fillColor = '#7e22ce'; // VIP Purple
                    strokeColor = '#a855f7';
                  }

                  const seatObj = {
                    id: seatId,
                    row: rowLetter,
                    col: seatNum,
                    type: isVipRow ? 'VIP' : 'STANDARD',
                    price: isVipRow ? (hall.vipPrice || showtime.vipPrice) : (hall.basePrice || showtime.basePrice),
                  };

                  return (
                    <g
                      key={seatId}
                      className="transition-transform duration-200 hover:scale-110"
                      style={{ cursor, transformOrigin: `${x + seatWidth / 2}px ${y + seatHeight / 2}px` }}
                      onClick={() => handleSeatClick(seatObj)}
                      onMouseEnter={(e) => handleSeatMouseEnter(seatObj, e)}
                    >
                      {/* Seat Backrest & Base */}
                      <rect
                        x={x}
                        y={y}
                        width={seatWidth}
                        height={seatHeight - 6}
                        rx="6"
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={isSelected ? '2' : '1'}
                      />
                      {/* Seat Cushion Front */}
                      <rect
                        x={x + 3}
                        y={y + seatHeight - 9}
                        width={seatWidth - 6}
                        height={8}
                        rx="3"
                        fill={fillColor}
                        filter="brightness(1.15)"
                      />
                      {/* Seat Number */}
                      <text
                        x={x + seatWidth / 2}
                        y={y + seatHeight / 2 - 1}
                        fill={isBooked ? '#475569' : '#ffffff'}
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {seatNum}
                      </text>
                    </g>
                  );
                })}

                {/* Row Label (Right) */}
                <text
                  x={startX + hall.seatsPerRow * (seatWidth + gapX) + 50}
                  y={y + seatHeight / 2 + 4}
                  fill="#94a3b8"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {rowLetter}
                </text>
              </g>
            );
          })}

          {/* Multiplayer Live Remote Cursors Overlay */}
          {Object.entries(remoteCursors).map(([clientId, cursor]) => {
            if (!cursor?.seatId) return null;
            const [row, numStr] = cursor.seatId.split('-');
            const rIndex = hall.rows.indexOf(row);
            const cIndex = parseInt(numStr, 10) - 1;
            if (rIndex === -1 || isNaN(cIndex)) return null;

            const extraGap = cIndex >= 10 ? 24 : cIndex >= 3 ? 12 : 0;
            const cx = startX + cIndex * (seatWidth + gapX) + extraGap + seatWidth / 2;
            const cy = startY + rIndex * (seatHeight + gapY) - 8;

            return (
              <g key={clientId} className="animate-bounce-subtle pointer-events-none">
                {/* Pointer Tag */}
                <rect
                  x={cx - 36}
                  y={cy - 20}
                  width="72"
                  height="18"
                  rx="6"
                  fill={cursor.color || '#06b6d4'}
                  opacity="0.95"
                />
                <text
                  x={cx}
                  y={cy - 8}
                  fill="#ffffff"
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {cursor.user?.displayName?.split(' ')[0] || 'Peer'}
                </text>
                <polygon
                  points={`${cx - 4},${cy - 2} ${cx + 4},${cy - 2} ${cx},${cy + 4}`}
                  fill={cursor.color || '#06b6d4'}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend & Seat Color States Guide */}
      <div className="pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <div className="w-4 h-4 rounded bg-slate-700 border border-slate-600" />
          <span>Available ($ {showtime?.basePrice?.toFixed(2)})</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <div className="w-4 h-4 rounded bg-purple-700 border border-purple-500" />
          <span>VIP Recliner ($ {showtime?.vipPrice?.toFixed(2)})</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <div className="w-4 h-4 rounded bg-rose-600 border border-rose-400 ring-2 ring-rose-500/40" />
          <span className="font-semibold text-rose-400">Selected By You</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <div className="w-4 h-4 rounded bg-amber-500 border border-amber-400" />
          <span>Locked (3 min)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <div className="w-4 h-4 rounded bg-slate-800 border border-slate-900 opacity-60" />
          <span>Sold / Confirmed</span>
        </div>
      </div>
    </div>
  );
}
