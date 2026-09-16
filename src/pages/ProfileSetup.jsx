import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { useAuth } from '../context/AuthContext';
import { storage, ref, uploadBytes, getDownloadURL } from '../services/firebase';
import { User, Camera, Sparkles, Check, ArrowRight } from 'lucide-react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
];

export default function ProfileSetup() {
  const { user, updateCurrentProfile } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || AVATAR_PRESETS[0]);
  const [bio, setBio] = useState(user?.bio || 'Cinema enthusiast & popcorn aficionado.');
  const [favGenre, setFavGenre] = useState(user?.favGenre || 'Sci-Fi');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      if (storage) {
        const storageRef = ref(storage, `avatars/${user?.uid || 'temp'}_${Date.now()}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        setPhotoURL(downloadUrl);
      } else {
        // Local FileReader preview
        const reader = new FileReader();
        reader.onload = (evt) => {
          setPhotoURL(evt.target.result);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.warn('Storage upload notice (using preview):', err.message);
      const reader = new FileReader();
      reader.onload = (evt) => {
        setPhotoURL(evt.target.result);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      alert('Please provide a display name to continue.');
      return;
    }

    setIsSaving(true);
    try {
      await updateCurrentProfile({
        displayName: displayName.trim(),
        photoURL,
        bio: bio.trim(),
        favGenre,
        isProfileComplete: true,
      });
      navigate('/profile');
    } catch (err) {
      console.error('Profile setup error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 animate-fade-in">
      <SEO
        title="Complete Profile Setup — Ciniverse"
        description="Set up your Ciniverse cinema profile, avatar, and preferences."
      />

      <div className="bg-dark-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-600/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="font-display font-black text-2xl text-white">Complete Your Cinephile Profile</h1>
          <p className="text-xs text-slate-400">
            Customize your avatar and username so friends can identify you in multiplayer seat reservations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar Preview & Upload */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <img
                src={photoURL}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover ring-4 ring-rose-500/40 shadow-xl bg-slate-800"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition"
              >
                <Camera className="w-6 h-6" />
                <span className="text-[10px] font-bold mt-1">Upload</span>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            {isUploading && <p className="text-xs text-rose-400 animate-pulse">Uploading avatar to Firebase Storage...</p>}

            {/* Presets */}
            <div>
              <p className="text-[11px] text-slate-500 text-center mb-1.5 font-medium">Or choose a preset</p>
              <div className="flex gap-2">
                {AVATAR_PRESETS.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Preset ${i + 1}`}
                    onClick={() => setPhotoURL(url)}
                    className={`w-9 h-9 rounded-full object-cover cursor-pointer transition ${
                      photoURL === url ? 'ring-2 ring-rose-500 scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Display Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Christopher Nolan Fan"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dark-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Favorite Genre */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Favorite Cinema Genre</label>
            <select
              value={favGenre}
              onChange={(e) => setFavGenre(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dark-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-rose-500"
            >
              <option value="Sci-Fi">Sci-Fi & Cyberpunk</option>
              <option value="Action">Action & Blockbusters</option>
              <option value="Drama">Drama & Award Winners</option>
              <option value="Thriller">Psychological Thrillers</option>
              <option value="Animation">Animation & Anime</option>
              <option value="Horror">Horror & Suspense</option>
            </select>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Bio / Status</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A few words about your movie tastes..."
              className="w-full px-4 py-2 rounded-xl bg-dark-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving || isUploading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-sm shadow-xl shadow-rose-950 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? 'Saving Profile...' : 'Complete Profile & Enter'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
