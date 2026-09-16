import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  googleProvider,
  facebookProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  isMockFirebase,
} from '../services/firebase';
import { getUserProfile, updateUserProfile } from '../services/firestoreService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local fallback user first if mock mode
    const storedUser = localStorage.getItem('Ciniverse_auth_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (e) {
        console.error('Error parsing stored auth user:', e);
      }
    }

    if (!isMockFirebase && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const profile = await getUserProfile(firebaseUser.uid);
          const enrichedUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || profile?.displayName || '',
            photoURL: firebaseUser.photoURL || profile?.photoURL || '',
            role: profile?.role || (firebaseUser.email?.includes('admin') ? 'admin' : 'user'),
            isProfileComplete: Boolean(firebaseUser.displayName || profile?.displayName),
            ...profile,
          };
          setUser(enrichedUser);
          localStorage.setItem('Ciniverse_auth_user', JSON.stringify(enrichedUser));
        } else {
          setUser(null);
          localStorage.removeItem('Ciniverse_auth_user');
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      setLoading(false);
    }
  }, []);

  const loginWithEmail = async (email, password) => {
    // If live Firebase auth is enabled
    if (!isMockFirebase && auth) {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const profile = await getUserProfile(cred.user.uid);
      const enriched = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName || profile?.displayName || email.split('@')[0],
        photoURL: cred.user.photoURL || profile?.photoURL || '',
        role: profile?.role || (email.toLowerCase().includes('admin') ? 'admin' : 'user'),
        authProvider: 'password',
        isProfileComplete: Boolean(cred.user.displayName || profile?.displayName),
        lastLoginAt: new Date().toISOString(),
      };
      await updateUserProfile(cred.user.uid, enriched);
      setUser(enriched);
      localStorage.setItem('Ciniverse_auth_user', JSON.stringify(enriched));
      return enriched;
    }

    // Attempt real Firebase first if auth instance is available
    if (auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const profile = await getUserProfile(cred.user.uid);
        const enriched = {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName || profile?.displayName || email.split('@')[0],
          photoURL: cred.user.photoURL || profile?.photoURL || '',
          role: profile?.role || (email.toLowerCase().includes('admin') ? 'admin' : 'user'),
          authProvider: 'password',
          isProfileComplete: Boolean(cred.user.displayName || profile?.displayName),
          lastLoginAt: new Date().toISOString(),
        };
        await updateUserProfile(cred.user.uid, enriched);
        setUser(enriched);
        localStorage.setItem('Ciniverse_auth_user', JSON.stringify(enriched));
        return enriched;
      } catch (err) {
        // If it's a genuine auth error (wrong password, user not found, etc.), throw it to show in UI
        if (err.code !== 'auth/api-key-not-valid' && err.code !== 'auth/invalid-api-key') {
          throw err;
        }
      }
    }

    // Mock Login for seamless development when placeholder keys are present
    const mockUid = `usr_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const profile = await getUserProfile(mockUid);
    const mockUser = {
      uid: mockUid,
      email,
      displayName: profile?.displayName || email.split('@')[0],
      photoURL: profile?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      role: email.toLowerCase().includes('admin') ? 'admin' : 'user',
      isProfileComplete: Boolean(profile?.displayName),
      authProvider: 'password',
      lastLoginAt: new Date().toISOString(),
    };
    await updateUserProfile(mockUid, mockUser);
    setUser(mockUser);
    localStorage.setItem('Ciniverse_auth_user', JSON.stringify(mockUser));
    return mockUser;
  };

  const registerWithEmail = async (email, password, displayName) => {
    // If live Firebase auth is enabled
    if (!isMockFirebase && auth) {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
      const initialProfile = {
        uid: cred.user.uid,
        email,
        displayName: displayName || '',
        password, // Persisted to Firestore document
        photoURL: '',
        role: email.toLowerCase().includes('admin') ? 'admin' : 'user',
        authProvider: 'password',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      await updateUserProfile(cred.user.uid, initialProfile);
      const enriched = {
        ...initialProfile,
        isProfileComplete: Boolean(displayName),
      };
      setUser(enriched);
      localStorage.setItem('Ciniverse_auth_user', JSON.stringify(enriched));
      return enriched;
    }

    // Attempt real Firebase first if auth instance is available
    if (auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
          await updateProfile(cred.user, { displayName });
        }
        const initialProfile = {
          uid: cred.user.uid,
          email,
          displayName: displayName || '',
          password,
          photoURL: '',
          role: email.toLowerCase().includes('admin') ? 'admin' : 'user',
          authProvider: 'password',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        await updateUserProfile(cred.user.uid, initialProfile);
        const enriched = {
          ...initialProfile,
          isProfileComplete: Boolean(displayName),
        };
        setUser(enriched);
        localStorage.setItem('Ciniverse_auth_user', JSON.stringify(enriched));
        return enriched;
      } catch (err) {
        if (err.code !== 'auth/api-key-not-valid' && err.code !== 'auth/invalid-api-key') {
          throw err;
        }
      }
    }

    // Mock Registration for seamless development when placeholder keys are present
    const mockUid = `usr_${Date.now()}`;
    const mockUser = {
      uid: mockUid,
      email,
      displayName: displayName || '',
      password,
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      role: email.toLowerCase().includes('admin') ? 'admin' : 'user',
      isProfileComplete: Boolean(displayName),
      authProvider: 'password',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    await updateUserProfile(mockUid, mockUser);
    setUser(mockUser);
    localStorage.setItem('Ciniverse_auth_user', JSON.stringify(mockUser));
    return mockUser;
  };

  const loginWithGoogle = async () => {
    // Attempt real Firebase Google Popup Authentication
    if (auth) {
      try {
        const cred = await signInWithPopup(auth, googleProvider);
        const { user: firebaseUser } = cred;
        const profile = await getUserProfile(firebaseUser.uid);
        const enriched = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || profile?.displayName || 'Google Member',
          photoURL: firebaseUser.photoURL || profile?.photoURL || '',
          role: profile?.role || (firebaseUser.email?.toLowerCase().includes('admin') ? 'admin' : 'user'),
          authProvider: 'google.com',
          isProfileComplete: Boolean(firebaseUser.displayName || profile?.displayName),
          lastLoginAt: new Date().toISOString(),
          createdAt: profile?.createdAt || new Date().toISOString(),
        };
        // Persist real user profile into Firestore collection 'users'
        await updateUserProfile(firebaseUser.uid, enriched);
        setUser(enriched);
        localStorage.setItem('Ciniverse_auth_user', JSON.stringify(enriched));
        return enriched;
      } catch (error) {
        // If popup was cancelled by user, or blocked, or live error, rethrow to inform user
        if (
          error.code === 'auth/popup-closed-by-user' ||
          error.code === 'auth/cancelled-popup-request' ||
          error.code === 'auth/popup-blocked' ||
          error.code === 'auth/unauthorized-domain'
        ) {
          throw error;
        }
        // If Firebase API key in .env is invalid/placeholder, notify or fallback
        if (error.code === 'auth/api-key-not-valid' || error.code === 'auth/invalid-api-key') {
          console.warn('Real Firebase API Key not yet set in .env. Using developer simulated Google Sign-in.');
        } else {
          throw error;
        }
      }
    }

    // Developer fallback if no real keys are provided yet
    const mockUid = `usr_google_${Date.now()}`;
    const mockUser = {
      uid: mockUid,
      email: 'alex.cinema@gmail.com',
      displayName: 'Alex Cinema',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      role: 'user',
      isProfileComplete: true,
      authProvider: 'google.com',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    await updateUserProfile(mockUid, mockUser);
    setUser(mockUser);
    localStorage.setItem('Ciniverse_auth_user', JSON.stringify(mockUser));
    return mockUser;
  };

  const loginWithFacebook = async () => {
    // Attempt real Firebase Facebook Popup Authentication
    if (auth) {
      try {
        const cred = await signInWithPopup(auth, facebookProvider);
        const { user: firebaseUser } = cred;
        const profile = await getUserProfile(firebaseUser.uid);
        const enriched = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || profile?.displayName || 'Facebook Member',
          photoURL: firebaseUser.photoURL || profile?.photoURL || '',
          role: profile?.role || (firebaseUser.email?.toLowerCase().includes('admin') ? 'admin' : 'user'),
          authProvider: 'facebook.com',
          isProfileComplete: Boolean(firebaseUser.displayName || profile?.displayName),
          lastLoginAt: new Date().toISOString(),
          createdAt: profile?.createdAt || new Date().toISOString(),
        };
        // Persist real user profile into Firestore collection 'users'
        await updateUserProfile(firebaseUser.uid, enriched);
        setUser(enriched);
        localStorage.setItem('Ciniverse_auth_user', JSON.stringify(enriched));
        return enriched;
      } catch (error) {
        if (
          error.code === 'auth/popup-closed-by-user' ||
          error.code === 'auth/cancelled-popup-request' ||
          error.code === 'auth/popup-blocked' ||
          error.code === 'auth/unauthorized-domain'
        ) {
          throw error;
        }
        if (error.code === 'auth/api-key-not-valid' || error.code === 'auth/invalid-api-key') {
          console.warn('Real Firebase API Key not yet set in .env. Using developer simulated Facebook Sign-in.');
        } else {
          throw error;
        }
      }
    }

    // Developer fallback if no real keys are provided yet
    const mockUid = `usr_fb_${Date.now()}`;
    const mockUser = {
      uid: mockUid,
      email: 'sarah.movies@facebook.com',
      displayName: 'Sarah Jenkins',
      photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      role: 'user',
      isProfileComplete: true,
      authProvider: 'facebook.com',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    await updateUserProfile(mockUid, mockUser);
    setUser(mockUser);
    localStorage.setItem('Ciniverse_auth_user', JSON.stringify(mockUser));
    return mockUser;
  };

  const updateCurrentProfile = async (updates) => {
    if (!user) return;
    const updated = { ...user, ...updates, isProfileComplete: Boolean(updates.displayName || user.displayName) };
    await updateUserProfile(user.uid, updated);
    setUser(updated);
    localStorage.setItem('Ciniverse_auth_user', JSON.stringify(updated));
    return updated;
  };

  const logout = async () => {
    if (!isMockFirebase && auth) {
      await signOut(auth);
    }
    setUser(null);
    localStorage.removeItem('Ciniverse_auth_user');
  };

  const value = {
    user,
    loading,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    loginWithFacebook,
    updateCurrentProfile,
    logout,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
