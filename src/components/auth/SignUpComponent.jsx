import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import heroImage from "../../assets/others/cinema.png";
import { setCredentials } from "../../redux/slices/authSlice";
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile,
  doc,
  setDoc,
  getDoc,
} from "../../firebase/config";
import { registerUser as mockRegisterUser } from "../../services/mockAuthService";

const SignUpComponent = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setErrorMsg("");
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.fullName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      let authUser = null;
      let userToken = null;

      // 1. Try real Firebase Auth & Firestore write
      if (auth && db) {
        try {
          const cred = await createUserWithEmailAndPassword(
            auth,
            formData.email.trim(),
            formData.password
          );
          const fbUser = cred.user;

          if (formData.fullName.trim()) {
            await updateProfile(fbUser, {
              displayName: formData.fullName.trim(),
            });
          }

          const userProfileData = {
            id: fbUser.uid,
            uid: fbUser.uid,
            name: formData.fullName.trim(),
            displayName: formData.fullName.trim(),
            email: fbUser.email,
            password: formData.password, // Saved directly to Firestore document
            role: fbUser.email?.toLowerCase().includes("admin") ? "admin" : "user",
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
              formData.fullName.trim()
            )}`,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          };

          // Save to Firestore 'users' collection with merge
          const userDocRef = doc(db, "users", fbUser.uid);
          await setDoc(userDocRef, userProfileData, { merge: true });

          userToken = await fbUser.getIdToken();
          authUser = userProfileData;
        } catch (firebaseErr) {
          // If email is already in use or real auth error, handle or fallback
          if (firebaseErr.code === "auth/email-already-in-use") {
            throw new Error("This email is already registered. Please log in.");
          } else if (firebaseErr.code === "auth/weak-password") {
            throw new Error("Password is too weak. Please use at least 6 characters.");
          } else if (
            firebaseErr.code === "auth/api-key-not-valid" ||
            firebaseErr.code === "auth/invalid-api-key"
          ) {
            console.warn("Using local auth storage fallback:", firebaseErr.message);
          } else {
            console.warn("Firebase sign up error, attempting fallback:", firebaseErr);
          }
        }
      }

      // 2. Fallback if offline / development key
      if (!authUser) {
        const result = mockRegisterUser({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        });
        authUser = {
          ...result.user,
          password: formData.password,
        };
        userToken = result.token;
      }

      dispatch(setCredentials({ user: authUser, token: userToken }));
      toast.success(`Account created! Welcome, ${authUser.name}!`);
      navigate("/");
    } catch (err) {
      const message = err.message || "Failed to create account.";
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsSubmitting(true);
      const userCredential = await signInWithPopup(auth, googleProvider);
      const fbUser = userCredential.user;

      const userProfileData = {
        id: fbUser.uid,
        uid: fbUser.uid,
        name: fbUser.displayName || "Google User",
        displayName: fbUser.displayName || "Google User",
        email: fbUser.email,
        role: fbUser.email?.toLowerCase().includes("admin") ? "admin" : "user",
        avatar:
          fbUser.photoURL ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
            fbUser.displayName || "User"
          )}`,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      if (db) {
        try {
          const userDocRef = doc(db, "users", fbUser.uid);
          await setDoc(userDocRef, userProfileData, { merge: true });
        } catch (dbErr) {
          console.warn("Firestore sync warning on Google Sign up:", dbErr);
        }
      }

      const authData = {
        user: userProfileData,
        token: await fbUser.getIdToken(),
      };

      dispatch(setCredentials(authData));
      toast.success(`Welcome to Ciniverse, ${authData.user.name}!`);
      navigate("/");
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        toast.error(err.message || "Google sign up failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full w-full">
      {/* Left Hero Section */}
      <div className="relative hidden w-1/2 md:block h-full">
        <img
          src={heroImage}
          alt="Cinema Experience"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="relative flex h-full flex-col justify-end px-10 pb-12">
          <h2 className="text-2xl lg:text-3xl font-bold leading-snug text-white">
            Your next
            <br />
            movie experience
            <br />
            <span className="relative inline-block mt-1">
              starts here.
              <span className="absolute -bottom-1.5 left-0 h-1 w-20 bg-[#B90101] rounded-full" />
            </span>
          </h2>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-4 sm:px-6 lg:px-8 py-2 sm:py-4 h-full overflow-y-auto">
        <div className="w-full max-w-md sm:max-w-lg my-auto py-1 sm:py-2">
          {/* Tabs */}
          <div className="mb-5 sm:mb-6 flex items-center gap-3 sm:gap-4">
            <Link
              to="/login"
              className="text-2xl sm:text-3xl lg:text-4xl font-medium text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-200 tracking-tight"
            >
              Log In
            </Link>
            <span className="h-7 sm:h-8 lg:h-9 w-0.5 bg-[#B90101] rounded-full" />
            <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#B90101] tracking-tight">
              Sign Up
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
            Create an Account
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            Sign up to get started with Ciniverse.
          </p>

          {errorMsg && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-[#B90101]/30 text-[#B90101] text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-5 sm:mt-6 space-y-4 sm:space-y-4.5"
          >
            <div>
              <label
                htmlFor="fullName"
                className="mb-1.5 block text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-200"
              >
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-[#B90101] focus:outline-none transition shadow-xs"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-200"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-[#B90101] focus:outline-none transition shadow-xs"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-200"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password (min 6 chars)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 sm:py-3 pr-11 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-[#B90101] focus:outline-none transition shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-[#B90101] py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:brightness-110 active:scale-95 transition cursor-pointer mt-1 disabled:opacity-60"
            >
              {isSubmitting ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="my-4 sm:my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
            <span className="text-xs font-semibold text-[#B90101]">Or</span>
            <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 transition cursor-pointer"
          >
            <GoogleIcon />
            <span>Sign Up with Google</span>
          </button>

          <p className="mt-4 sm:mt-5 text-center text-xs text-neutral-500 dark:text-neutral-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-[#B90101] underline hover:opacity-90"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M19.6 10.23c0-.68-.06-1.36-.18-2.02H10v3.83h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.33 2.98-7.33Z"
      fill="#4285F4"
    />
    <path
      d="M10 20c2.7 0 4.96-.9 6.62-2.44l-3.24-2.5c-.9.6-2.06.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H1.06v2.58A10 10 0 0 0 10 20Z"
      fill="#34A853"
    />
    <path
      d="M4.41 11.9a6 6 0 0 1 0-3.8V5.52H1.06a10 10 0 0 0 0 8.96l3.35-2.58Z"
      fill="#FBBC05"
    />
    <path
      d="M10 3.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.96 9.96 0 0 0 10 0 10 10 0 0 0 1.06 5.52L4.41 8.1C5.2 5.74 7.4 3.98 10 3.98Z"
      fill="#EA4335"
    />
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M10 4c-4.5 0-8.3 3-9.6 6 1.3 3 5.1 6 9.6 6s8.3-3 9.6-6c-1.3-3-5.1-6-9.6-6Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M2.5 2.5l15 15M8.3 8.5a2.5 2.5 0 0 0 3.4 3.4M6.2 6.3C3.9 7.4 2.1 9.2 1 10c1.3 3 5.1 6 9.6 6 1.4 0 2.7-.3 3.9-.8M15.6 15.7C17.5 14.4 18.9 12.6 19.6 10c-1.1-2.6-4.1-5.2-8-5.9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export default SignUpComponent;
