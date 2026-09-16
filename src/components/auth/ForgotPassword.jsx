import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import heroImage from "../../assets/others/cinema.png";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase/config";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setIsSubmitting(true);
      await sendPasswordResetEmail(auth, email.trim());
      setIsSuccess(true);
      toast.success("Password reset link sent to your email!");
    } catch (err) {
      // Clean friendly error message
      let message = "Failed to send reset email. Please try again.";
      if (err.code === "auth/user-not-found") {
        message = "No account found with this email address.";
      } else if (err.code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      }
      toast.error(message);
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
              <span className="absolute -bottom-1.5 left-0 h-1 w-20 bg-primary-red rounded-full" />
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
            <span className="h-7 sm:h-8 lg:h-9 w-0.5 bg-primary-red rounded-full" />
            <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary-red tracking-tight">
              Forgot Password
            </span>
          </div>

          {isSuccess ? (
            /* Success Card State */
            <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 text-center space-y-4 animate-in fade-in duration-300">
              <div className="w-14 h-14 mx-auto rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                Check Your Inbox
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs mx-auto">
                We've sent a password reset link to:
                <br />
                <span className="font-bold text-neutral-900 dark:text-white">
                  {email}
                </span>
              </p>
              <p className="text-xs text-neutral-400">
                Didn't receive the email? Check your spam or junk folder.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  className="w-full rounded-full bg-primary-red py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:brightness-110 active:scale-95 transition text-center"
                >
                  Return to Login
                </Link>
                <button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  className="text-xs font-semibold text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition py-1"
                >
                  Try another email
                </button>
              </div>
            </div>
          ) : (
            /* Normal Reset Form */
            <>
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                Reset Your Password
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                Enter your email address and Firebase will send you a real reset
                link.
              </p>

              <form onSubmit={handleSubmit} className="mt-5 sm:mt-6 space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-200"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-primary-red focus:outline-none transition shadow-xs pr-10"
                    />
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-primary-red py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:brightness-110 active:scale-95 transition cursor-pointer mt-1 sm:mt-2 disabled:opacity-60"
                >
                  {isSubmitting ? "Sending Link..." : "Send Reset Link"}
                </button>
              </form>

              <div className="my-4 sm:my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
                <span className="text-xs font-semibold text-neutral-400">
                  Or
                </span>
                <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
              </div>

              <Link
                to="/login"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-primary-red hover:bg-neutral-50 dark:hover:bg-neutral-700 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back To Login</span>
              </Link>
            </>
          )}

          <p className="mt-4 sm:mt-5 text-center text-xs text-neutral-500 dark:text-neutral-400">
            Remember your password?{" "}
            <Link
              to="/login"
              className="font-bold text-primary-red underline hover:opacity-90"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
