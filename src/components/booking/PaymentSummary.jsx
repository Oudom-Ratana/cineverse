import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Ticket, Popcorn, Lock, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { createBooking } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { setBookingConfirmation, nextStep } from '../../redux/slices/bookingSlice';

export default function PaymentSummary({ movie, showtime, seats, isGroupMode, groupId }) {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const concessions = useSelector((state) => state.concessions.selectedItems);

  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [cardName, setCardName] = useState(user?.displayName || 'Cinephile Member');

  // Calculations
  const seatsSubtotal = seats.reduce((sum, s) => sum + s.price, 0);
  const concessionsList = Object.values(concessions);
  const concessionsSubtotal = concessionsList.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const bookingFee = seats.length * 1.5; // $1.50 per ticket
  const tax = (seatsSubtotal + concessionsSubtotal) * 0.08; // 8% tax
  const grandTotal = seatsSubtotal + concessionsSubtotal + bookingFee + tax;

  const handlePayNow = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate rapid payment gateway processing
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const bookingRecord = {
        userId: user?.uid || 'guest_user',
        userEmail: user?.email || 'guest@Ciniverse.app',
        userName: cardName,
        movie: {
          id: movie.id,
          title: movie.title || movie.name,
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          runtime: movie.runtime,
        },
        showtimeId: showtime.id,
        showtime: {
          date: showtime.date,
          time: showtime.time,
          hallName: showtime.hallName,
          format: showtime.format,
        },
        seats: seats.map((s) => ({
          id: s.id,
          row: s.row,
          col: s.col,
          type: s.type,
          price: s.price,
        })),
        concessions: concessionsList.map((c) => ({
          id: c.id,
          name: c.name,
          quantity: c.quantity,
          price: c.price,
        })),
        pricing: {
          seatsSubtotal,
          concessionsSubtotal,
          bookingFee,
          tax,
          total: grandTotal,
        },
        isGroupBooking: Boolean(isGroupMode),
        groupId: groupId || null,
        paymentMethod: 'Credit Card (•••• 4242)',
      };

      const result = await createBooking(bookingRecord);
      dispatch(setBookingConfirmation(result));
    } catch (err) {
      console.error('Payment booking error:', err);
      alert('Payment processing failed. Please retry.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left: Itemized Summary */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-dark-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-rose-500" />
            Order & Screening Details
          </h3>

          <div className="flex gap-4 p-4 rounded-2xl bg-dark-950 border border-slate-800/80">
            <img
              src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
              alt={movie.title || movie.name}
              className="w-16 h-24 object-cover rounded-xl flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-base text-white truncate">{movie.title || movie.name}</h4>
              <p className="text-xs text-rose-400 font-semibold mt-0.5">{showtime.format} • {showtime.hallName}</p>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                <span>📅 {showtime.date}</span>
                <span>⏰ {showtime.time}</span>
              </div>
            </div>
          </div>

          {/* Reserved Seats List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Reserved Seats ({seats.length})
            </h4>
            <div className="divide-y divide-slate-800/70">
              {seats.map((seat) => (
                <div key={seat.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold">
                      {seat.id}
                    </span>
                    <span className="text-slate-300">
                      Row {seat.row}, Seat {seat.col} ({seat.type})
                    </span>
                  </div>
                  <span className="font-semibold text-white">{formatCurrency(seat.price)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Concessions List */}
          {concessionsList.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Popcorn className="w-3.5 h-3.5 text-amber-400" />
                Concessions ({concessionsList.reduce((acc, c) => acc + c.quantity, 0)} items)
              </h4>
              <div className="divide-y divide-slate-800/70">
                {concessionsList.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="text-slate-300">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-semibold text-white">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Payment Simulation & Grand Total */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-dark-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            Payment Checkout
          </h3>

          {/* Price Breakdown */}
          <div className="space-y-2.5 text-xs text-slate-300 pb-4 border-b border-slate-800">
            <div className="flex justify-between">
              <span>Tickets Subtotal</span>
              <span className="font-medium text-white">{formatCurrency(seatsSubtotal)}</span>
            </div>
            {concessionsSubtotal > 0 && (
              <div className="flex justify-between">
                <span>Concessions Subtotal</span>
                <span className="font-medium text-white">{formatCurrency(concessionsSubtotal)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Convenience Fee</span>
              <span className="font-medium text-white">{formatCurrency(bookingFee)}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Taxes (8%)</span>
              <span className="font-medium text-white">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-800 text-base font-bold text-white">
              <span>Total Amount</span>
              <span className="text-emerald-400 font-extrabold">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {/* Mock Credit Card Form */}
          <form onSubmit={handlePayNow} className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Cardholder Name</label>
              <input
                type="text"
                required
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-dark-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Card Number</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-dark-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
                />
                <CreditCard className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Exp Date</label>
                <input
                  type="text"
                  required
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-dark-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">CVC / CVV</label>
                <input
                  type="text"
                  required
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-dark-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-sm shadow-xl shadow-emerald-950/60 transition hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Confirming Reservation...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Pay {formatCurrency(grandTotal)} Now
                  </>
                )}
              </button>
            </div>

            <p className="text-[10px] text-center text-slate-500 flex items-center justify-center gap-1 mt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              256-Bit Encrypted Simulated Checkout
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
