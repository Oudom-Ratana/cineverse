import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, Mail, Lock, User, Sparkles, Shield, AlertCircle } from 'lucide-react';
import { closeAuthModal, setAuthModalMode } from '../../redux/slices/uiSlice';
import { useAuth } from '../../context/AuthContext';
import { getFirebaseErrorMessage } from '../../utils/authErrors';

export default function AuthModal() {
  const dispatch = useDispatch();
  const { isOpen, mode } = useSelector((state) => state.ui.authModal);
  const { loginWithEmail, registerWithEmail, loginWithGoogle, loginWithFacebook } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'register') {
        if (!displayName.trim()) {
          setError('Please enter a display name');
          setIsLoading(false);
          return;
        }
        await registerWithEmail(email, password, displayName);
      } else {
        await loginWithEmail(email, password);
      }
      dispatch(closeAuthModal());
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo Logins for instant evaluation
  const handleQuickDemo = async (role = 'user') => {
    setIsLoading(true);
    setError('');
    try {
      if (role === 'admin') {
        await loginWithEmail('admin.Ciniverse@gmail.com', 'AdminPass123!');
      } else {
        await loginWithEmail('cinephile.alex@gmail.com', 'UserPass123!');
      }
      dispatch(closeAuthModal());
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setIsLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      dispatch(closeAuthModal());
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebook = async () => {
    setIsLoading(true);
    setError('');
    try {
      await loginWithFacebook();
      dispatch(closeAuthModal());
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-dark-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={() => dispatch(closeAuthModal())}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-600/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-2xl text-white">
            {mode === 'register' ? 'Join Ciniverse' : 'Welcome Back'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'register'
              ? 'Create an account to book cinema tickets and sync with friends'
              : 'Sign in to access your bookings, watchlist, and streams'}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-dark-950 p-1 rounded-xl border border-slate-800 mb-5 text-xs font-semibold">
          <button
            onClick={() => {
              dispatch(setAuthModalMode('login'));
              setError('');
            }}
            className={`flex-1 py-2 rounded-lg transition ${
              mode === 'login' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              dispatch(setAuthModalMode('register'));
              setError('');
            }}
            className={`flex-1 py-2 rounded-lg transition ${
              mode === 'register' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Display Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Rostova"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-semibold text-sm shadow-lg shadow-rose-950 transition hover:scale-[1.01] disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : mode === 'register' ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        {/* Social Logins */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <p className="text-[11px] text-center text-slate-500 mb-3">Or continue with</p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleGoogle}
              type="button"
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-dark-950 border border-slate-800 hover:bg-slate-800 text-xs font-medium text-slate-300 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3 0-.9.1-1.7.4-2.4L1.6 7.1C.6 9.1 0 11.5 0 14s.6 4.9 1.6 6.9l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5.1L1.6 16.1C3.5 19.9 7.4 23 12 23z"
                />
              </svg>
              Google
            </button>

            <button
              onClick={handleFacebook}
              type="button"
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-dark-950 border border-slate-800 hover:bg-slate-800 text-xs font-medium text-slate-300 transition"
            >
              <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </button>
          </div>
        </div>

        {/* Evaluator Quick Demo Bar */}
        <div className="mt-5 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
            One-Click Evaluator Accounts
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleQuickDemo('user')}
              type="button"
              className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
            >
              Demo User
            </button>
            <button
              onClick={() => handleQuickDemo('admin')}
              type="button"
              className="flex-1 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-medium transition flex items-center justify-center gap-1"
            >
              <Shield className="w-3 h-3" />
              Demo Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
