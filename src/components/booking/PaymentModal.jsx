import { useState, useEffect, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  QrCode,
  Store,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import {
  generateKHQRString,
  usdToKhr,
  formatCurrency,
  USD_TO_KHR_RATE,
} from "../../utils/khqrGenerator";

/**
 * PaymentModal
 * Supports:
 * 1. KHQR (Bakong National QR Code - scannable by ABA, Acleda, Wing, Canadia, etc.)
 * 2. ABA PayWay (Direct ABA Mobile & Card Gateway)
 * 3. Pay at Cinema Counter (Cash / POS)
 */
export default function PaymentModal({
  isOpen,
  onClose,
  totalAmountUSD = 0,
  bookingRef = "FZ-1001",
  movieTitle = "Movie Ticket",
  branchName = "Ciniverse SenSok",
  selectedSeats = [],
  onPaymentSuccess,
}) {
  const [selectedMethod, setSelectedMethod] = useState("khqr"); // 'khqr', 'aba_payway', 'counter'
  const [currency, setCurrency] = useState("USD"); // 'USD' or 'KHR'
  const [timeLeft, setTimeLeft] = useState(180); // 3-minute payment countdown
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reset timer on open
  useEffect(() => {
    if (isOpen) {
      setTimeLeft(180);
      setIsPaid(false);
      setIsProcessing(false);
    }
  }, [isOpen]);

  // 3-minute Countdown
  useEffect(() => {
    if (!isOpen || isPaid) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isPaid]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Amounts
  const amountToPay = currency === "USD" ? totalAmountUSD : usdToKhr(totalAmountUSD);

  // Generate authentic KHQR string
  const khqrString = useMemo(() => {
    return generateKHQRString({
      amount: amountToPay,
      currency,
      bakongAccount: "ciniverse@abaa",
      merchantName: "CINIVERSE CINEMA",
      merchantCity: "Phnom Penh",
      bookingRef,
      branchName,
    });
  }, [amountToPay, currency, bookingRef, branchName]);

  const handleCopyKhqr = () => {
    navigator.clipboard.writeText(khqrString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simulate Instant Banking Payment (for Testing, Demos & Presentations)
  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);
      setTimeout(() => {
        if (typeof onPaymentSuccess === "function") {
          onPaymentSuccess({
            paymentMethod: selectedMethod === "khqr" ? "KHQR" : selectedMethod === "aba_payway" ? "ABA_PAYWAY" : "COUNTER",
            paymentStatus: "PAID",
            transactionRef: `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
            amountPaidUSD: totalAmountUSD,
            amountPaidKHR: usdToKhr(totalAmountUSD),
            currency,
            paidAt: new Date().toISOString(),
          });
        }
      }, 1200);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div
        className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-neutral-700 bg-neutral-900 text-white transition-all transform animate-scaleUp max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#B90101]/20 border border-[#B90101]/40 flex items-center justify-center text-[#B90101]">
              <ShieldCheck className="w-4 h-4 text-[#B90101]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white tracking-wide">
                Secure Checkout
              </h3>
              <p className="text-[11px] text-neutral-400">
                Official Cambodian Banking & QR Payment
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Booking Summary Pill */}
          <div className="bg-neutral-800/60 rounded-2xl p-3.5 border border-neutral-700/60 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                {branchName} • Seats ({selectedSeats.join(", ")})
              </span>
              <h4 className="text-sm font-black text-white line-clamp-1">
                {movieTitle}
              </h4>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">
                Total Due
              </span>
              <span className="text-lg font-black text-[#B90101]">
                ${totalAmountUSD.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-neutral-950 rounded-2xl border border-neutral-800">
            <button
              type="button"
              onClick={() => setSelectedMethod("khqr")}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition font-extrabold text-xs gap-1 ${
                selectedMethod === "khqr"
                  ? "bg-[#E1251B] text-white shadow-md shadow-[#E1251B]/30"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>KHQR</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod("aba_payway")}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition font-extrabold text-xs gap-1 ${
                selectedMethod === "aba_payway"
                  ? "bg-[#004F71] text-white shadow-md shadow-[#004F71]/30"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>ABA PayWay</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod("counter")}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition font-extrabold text-xs gap-1 ${
                selectedMethod === "counter"
                  ? "bg-neutral-700 text-white shadow-md"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Counter</span>
            </button>
          </div>

          {/* 1. KHQR Tab Content */}
          {selectedMethod === "khqr" && (
            <div className="space-y-4">
              {/* Currency Toggle ($ / ៛) */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-neutral-400 font-bold">
                  Currency:
                </span>
                <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setCurrency("USD")}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition ${
                      currency === "USD"
                        ? "bg-[#B90101] text-white shadow-xs"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    USD ($)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency("KHR")}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition ${
                      currency === "KHR"
                        ? "bg-[#B90101] text-white shadow-xs"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    KHR (៛)
                  </button>
                </div>
              </div>

              {/* KHQR Card Box */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-neutral-200 text-neutral-900 flex flex-col items-center">
                {/* Official Red KHQR Banner */}
                <div className="w-full bg-[#E1251B] px-4 py-2.5 flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg tracking-wider">KHQR</span>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      Bakong
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-white/90">
                    National Bank of Cambodia
                  </span>
                </div>

                {/* QR Body */}
                <div className="p-5 flex flex-col items-center space-y-3 w-full">
                  <div className="text-center">
                    <h5 className="font-black text-sm text-neutral-800 tracking-tight uppercase">
                      Ciniverse Cinema
                    </h5>
                    <p className="text-xs text-neutral-500 font-bold">
                      {branchName}
                    </p>
                  </div>

                  {/* QR Image Frame */}
                  <div className="relative p-3 bg-white rounded-2xl border-2 border-neutral-200 shadow-inner flex items-center justify-center">
                    {isPaid ? (
                      <div className="w-[190px] h-[190px] flex flex-col items-center justify-center text-emerald-600 gap-2 animate-scaleUp">
                        <CheckCircle2 className="w-14 h-14" />
                        <span className="text-sm font-black uppercase tracking-wider">
                          Payment Approved!
                        </span>
                      </div>
                    ) : (
                      <>
                        <QRCodeSVG
                          value={khqrString}
                          size={190}
                          level="M"
                          includeMargin={false}
                        />
                        {/* Center Bakong Logo Pill */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-9 h-9 rounded-full bg-[#E1251B] border-2 border-white flex items-center justify-center shadow-md">
                            <span className="text-white font-black text-[10px] tracking-tight">
                              KH
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Price Tag in QR Box */}
                  <div className="text-center">
                    <span className="text-2xl font-black text-neutral-900">
                      {formatCurrency(amountToPay, currency)}
                    </span>
                    {currency === "USD" && (
                      <span className="block text-[11px] text-neutral-500 font-bold">
                        ≈ {usdToKhr(totalAmountUSD).toLocaleString()} ៛
                      </span>
                    )}
                  </div>
                </div>

                {/* KHQR Footer Supported Apps */}
                <div className="w-full bg-neutral-100 px-4 py-2 text-center text-[10px] text-neutral-500 font-bold border-t border-neutral-200">
                  Scan with ABA Mobile, Acleda, Wing, or Any Bakong Banking App
                </div>
              </div>

              {/* Timer & Expiry */}
              <div className="flex items-center justify-between text-xs text-neutral-400 font-bold px-1">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Clock className="w-4 h-4" />
                  <span>Expires in: {formatTimer(timeLeft)}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyKhqr}
                  className="flex items-center gap-1 text-neutral-400 hover:text-white transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Payload</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 2. ABA PayWay Tab Content */}
          {selectedMethod === "aba_payway" && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-[#004F71]/15 border border-[#004F71]/40 text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#004F71] text-white text-xs font-black">
                  <span>ABA PayWay Gateway</span>
                </div>
                <h4 className="font-extrabold text-base text-white">
                  ABA Mobile & Credit/Debit Card
                </h4>
                <p className="text-xs text-neutral-300 max-w-sm mx-auto">
                  Instant one-tap checkout with ABA Mobile App, or international Visa / Mastercard.
                </p>

                <div className="pt-2">
                  <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-700 max-w-xs mx-auto text-left space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-400 font-bold">Merchant:</span>
                      <span className="text-white font-extrabold">Ciniverse Cinema</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-400 font-bold">Invoice Ref:</span>
                      <span className="text-white font-mono">{bookingRef}</span>
                    </div>
                    <div className="flex justify-between text-xs pt-1 border-t border-neutral-800">
                      <span className="text-neutral-400 font-bold">Amount:</span>
                      <span className="text-base font-black text-[#00A3E0]">
                        ${totalAmountUSD.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. Counter Cash Tab Content */}
          {selectedMethod === "counter" && (
            <div className="p-5 rounded-2xl bg-neutral-800/60 border border-neutral-700 text-center space-y-3">
              <Store className="w-10 h-10 text-neutral-400 mx-auto" />
              <h4 className="font-extrabold text-base text-white">
                Pay at Cinema Counter
              </h4>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                Your seats will be reserved. Please arrive at least 15 minutes before showtime to complete payment at the counter.
              </p>
              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-700 text-xs text-neutral-300">
                Reservation Reference: <strong className="text-white font-mono">{bookingRef}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-5 bg-neutral-950/90 border-t border-neutral-800 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 py-3 px-4 rounded-full border border-neutral-700 hover:bg-neutral-800 text-neutral-300 font-bold text-xs uppercase tracking-wider transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSimulatePayment}
            disabled={isProcessing || timeLeft === 0 || isPaid}
            className={`flex-1 py-3 px-4 rounded-full font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg ${
              isPaid
                ? "bg-emerald-600 text-white cursor-default"
                : selectedMethod === "khqr"
                  ? "bg-[#E1251B] hover:bg-[#C01F16] text-white shadow-[#E1251B]/30"
                  : selectedMethod === "aba_payway"
                    ? "bg-[#004F71] hover:bg-[#003B55] text-white shadow-[#004F71]/30"
                    : "bg-[#B90101] hover:bg-[#9E0000] text-white"
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verifying Payment...</span>
              </>
            ) : isPaid ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Paid Successfully!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>
                  {selectedMethod === "counter"
                    ? "Confirm Reservation"
                    : "Simulate Scan & Pay"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
