import React, { useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Download, Printer, Home, User, Sparkles, Film, Calendar, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { resetBooking } from '../../redux/slices/bookingSlice';
import { clearConcessions } from '../../redux/slices/concessionsSlice';
import { formatCurrency } from '../../utils/formatters';

export default function TicketConfirmation({ booking }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Launch celebratory confetti burst
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#06b6d4', '#f59e0b', '#10b981'],
      });
    } catch {
      // Ignored if canvas unsupported
    }
  }, []);

  if (!booking) return null;

  const {
    bookingId,
    movie,
    showtime,
    seats = [],
    concessions = [],
    pricing,
    createdAt,
    userName,
  } = booking;

  const qrValue = JSON.stringify({
    bookingId,
    movieTitle: movie?.title,
    seats: seats.map((s) => s.id),
    showtime: `${showtime?.date} ${showtime?.time}`,
    verification: 'VALID_Ciniverse_TICKET',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in print:m-0 print:p-0">
      {/* Animated Header */}
      <div className="text-center space-y-3 print:hidden">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-950/50">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h2 className="font-display font-extrabold text-3xl text-white">Booking Confirmed!</h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Your reservation is confirmed and registered with Ciniverse admissions.
        </p>
      </div>

      {/* Cinema Ticket Card */}
      <div className="relative bg-dark-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Ticket Top Header */}
        <div className="bg-gradient-to-r from-rose-700 to-rose-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Film className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Cinema Admission</span>
              <h3 className="font-display font-black text-xl leading-tight">{movie?.title}</h3>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Auditorium</span>
            <p className="font-bold text-sm">{showtime?.hallName}</p>
          </div>
        </div>

        {/* Ticket Perforation Visual Notch */}
        <div className="relative flex items-center justify-between px-4 -my-3 z-10 print:hidden">
          <div className="w-6 h-6 rounded-full bg-dark-950 -ml-7 border-r border-slate-800" />
          <div className="flex-1 border-t-2 border-dashed border-slate-800 mx-2" />
          <div className="w-6 h-6 rounded-full bg-dark-950 -mr-7 border-l border-slate-800" />
        </div>

        {/* Ticket Body & QR Code */}
        <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          {/* Details */}
          <div className="sm:col-span-2 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-500 font-medium">Date</span>
                <p className="font-bold text-slate-200 text-sm flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-rose-400" />
                  {showtime?.date}
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Screening Time</span>
                <p className="font-bold text-slate-200 text-sm flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  {showtime?.time}
                </p>
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-medium">Reserved Seats</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {seats.map((s) => (
                  <span
                    key={s.id}
                    className="px-2.5 py-1 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30 font-bold"
                  >
                    {s.id} ({s.type})
                  </span>
                ))}
              </div>
            </div>

            {concessions.length > 0 && (
              <div>
                <span className="text-slate-500 font-medium">Concessions Voucher</span>
                <p className="text-slate-300 mt-0.5">
                  {concessions.map((c) => `${c.quantity}x ${c.name}`).join(', ')}
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-slate-500">Booking Ref:</span>
                <span className="font-mono font-bold text-slate-300 ml-1.5">{bookingId}</span>
              </div>
              <div>
                <span className="text-slate-500">Total:</span>
                <span className="font-extrabold text-emerald-400 text-sm ml-1.5">
                  {formatCurrency(pricing?.total)}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white text-dark-950 shadow-inner">
            <QRCodeSVG value={qrValue} size={130} level="H" includeMargin={false} />
            <span className="text-[10px] font-mono font-bold text-slate-600 tracking-wider mt-2 uppercase">
              Scan At Turnstile
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 print:hidden">
        <button
          onClick={() => {
            dispatch(resetBooking());
            dispatch(clearConcessions());
            navigate('/movies');
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-rose-950"
        >
          <Film className="w-4 h-4" />
          Book Another Movie
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs sm:text-sm transition"
        >
          <Printer className="w-4 h-4" />
          Print / Save PDF
        </button>

        <button
          onClick={() => {
            dispatch(resetBooking());
            dispatch(clearConcessions());
            navigate('/profile');
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-dark-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold text-xs sm:text-sm transition"
        >
          <User className="w-4 h-4" />
          View In My Tickets
        </button>

        <button
          onClick={() => {
            dispatch(resetBooking());
            dispatch(clearConcessions());
            navigate('/');
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-dark-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs sm:text-sm transition"
        >
          <Home className="w-4 h-4" />
          Return Home
        </button>
      </div>
    </div>
  );
}
