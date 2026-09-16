import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDispatch } from 'react-redux';
import { openAuthModal } from '../../redux/slices/uiSlice';

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const dispatch = useDispatch();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    // Open auth modal and redirect to home
    dispatch(openAuthModal({ mode: 'login' }));
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Enforce profile setup if displayName is missing and not already on /profile/setup
  if (!user.displayName && location.pathname !== '/profile/setup') {
    return <Navigate to="/profile/setup" state={{ from: location }} replace />;
  }

  return children;
}
