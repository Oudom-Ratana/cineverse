import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import TrailerModal from '../components/common/TrailerModal';
import AuthModal from '../components/auth/AuthModal';
import OGInspector from '../components/common/OGInspector';

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-dark-950 text-slate-100 selection:bg-rose-600 selection:text-white">
      {/* Primary Sticky Translucent Header */}
      <Navbar />

      {/* Main Routed Page Content */}
      <main className="flex-1 w-full pt-16">
        <Outlet />
      </main>

      {/* Global Modals & Utilities */}
      <TrailerModal />
      <AuthModal />
      <OGInspector />

      {/* Footer */}
      <Footer />
    </div>
  );
}
