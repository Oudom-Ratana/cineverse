import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDispatch } from 'react-redux';
import { openAuthModal } from '../../redux/slices/uiSlice';

export default function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();
  const dispatch = useDispatch();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    dispatch(openAuthModal({ mode: 'login' }));
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 text-white">
        <div className="max-w-md w-full bg-dark-900 border border-slate-800 rounded-2xl p-6 text-center">
          <h2 className="text-xl font-bold text-rose-500 mb-2">Access Denied</h2>
          <p className="text-sm text-slate-400 mb-4">
            You must be an administrator with role="admin" to access the Ciniverse management dashboard.
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
          >
            Return to Homepage
          </a>
        </div>
      </div>
    );
  }

  return children;
}
