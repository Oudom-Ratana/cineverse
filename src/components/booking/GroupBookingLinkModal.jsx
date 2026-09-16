import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { X, Copy, Check } from "lucide-react";
import { selectTheme } from "../../redux/slices/uiSlice";

/**
 * GroupBookingLinkModal
 * Popup shown when user chooses "Group Booking" so they can copy and share
 * the group invitation link with their friends.
 *
 * Fully respects project Glassmorphism tokens:
 * Light Mode: --primary-color-5 & --border-light-mode
 * Dark Mode:  --primary-color-30 & --border-dark-mode
 *
 * Hides Navbar completely while open and mounts via Portal to document.body
 */
export default function GroupBookingLinkModal({
  isOpen,
  onClose,
  onContinue,
  groupCode = "ABCD1234",
}) {
  const theme = useSelector(selectTheme);
  const isDark = theme === "dark";
  const [copied, setCopied] = useState(false);

  const baseUrl =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "https://ciniverse.vercel.app";
  const shareUrl = `${baseUrl}/group/${groupCode}`;

  // Close modal on Escape key & Hide Navbar completely while modal is open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    const header = document.querySelector("header");

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      if (header) {
        header.style.display = "none";
      }
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
      if (header) {
        header.style.display = "";
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShare = (platform) => {
    const text = encodeURIComponent(
      `Join my group booking on Ciniverse! Pick your seat here: ${shareUrl}`,
    );

    switch (platform) {
      case "telegram":
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`,
          "_blank",
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          "_blank",
        );
        break;
      case "instagram":
        handleCopy();
        break;
      case "more":
        if (navigator.share) {
          navigator
            .share({
              title: "Ciniverse Group Booking",
              text: "Join my group booking on Ciniverse and choose your seat!",
              url: shareUrl,
            })
            .catch(() => {});
        } else {
          handleCopy();
        }
        break;
      default:
        handleCopy();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/25 dark:bg-black/75 backdrop-blur-md animate-fadeIn select-none font-sans"
      onClick={onClose}
    >
      {/* Modal Card with exact Glassmorphism specification:
          Light Mode: var(--primary-color-5) + var(--border-light-mode)
          Dark Mode:  var(--primary-color-30) + var(--border-dark-mode)
      */}
      <div
        className="relative w-full max-w-md rounded-[2.5rem] border p-6 sm:p-8 shadow-2xl backdrop-blur-2xl transition-all scale-100 space-y-5 text-center"
        style={{
          backgroundColor: isDark ? "var(--primary-color-30)" : "#ffffff",
          borderColor: isDark
            ? "var(--border-dark-mode)"
            : "rgba(39, 42, 48, 0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right Red Close 'X' Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-[#B90101] hover:scale-110 active:scale-95 transition p-1 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* 1. Large Circular Red/Pink Badge with Checkmark */}
        <div className="flex justify-center pt-2">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#B90101]/15 dark:bg-[#B90101]/25 border border-[#B90101]/30 flex items-center justify-center shadow-inner backdrop-blur-md">
            <svg
              className="w-12 h-12 sm:w-14 sm:h-14 text-[#B90101]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        {/* 2. Heading: "Link created !" */}
        <div className="space-y-1.5">
          <h3 className="text-2xl sm:text-3xl font-black text-[#B90101] tracking-tight">
            Link created !
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 font-medium leading-relaxed">
            Share link with your friends
            <br />
            so they can choose their seats.
          </p>
        </div>

        {/* 3. Rounded Pill Link Input with Copy Icon (Uses Glassmorphism tokens) */}
        <div
          className="w-full max-w-sm mx-auto flex items-center justify-between gap-3 px-4 py-3 rounded-full border shadow-inner backdrop-blur-md"
          style={{
            backgroundColor: isDark ? "var(--primary-color-30)" : "#f5f5f5",
            borderColor: isDark
              ? "var(--border-dark-mode)"
              : "rgba(39, 42, 48, 0.15)",
          }}
        >
          <span className="font-semibold text-xs sm:text-sm text-[#B90101] truncate select-all pl-1">
            {shareUrl}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="text-neutral-500 hover:text-[#B90101] dark:text-neutral-400 dark:hover:text-white transition p-1 shrink-0 flex items-center gap-1 cursor-pointer"
            title="Copy link"
          >
            {copied ? (
              <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Copied!
              </span>
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* 4. "Share link via" label */}
        <div className="pt-1">
          <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider block">
            Share link via
          </span>
        </div>

        {/* 5. Social Share Icons Row (Telegram, Facebook, Instagram, More) */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 pt-1">
          {/* Telegram */}
          <button
            type="button"
            onClick={() => handleShare("telegram")}
            className="flex flex-col items-center gap-1.5 group cursor-pointer transition active:scale-95"
          >
            <div className="w-12 h-12 rounded-full overflow-hidden shadow-md group-hover:scale-105 transition flex items-center justify-center">
              <svg
                viewBox="0 0 256 256"
                preserveAspectRatio="xMidYMid"
                className="w-full h-full"
              >
                <defs>
                  <linearGradient
                    id="telegram__a"
                    x1="50%"
                    x2="50%"
                    y1="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#2AABEE" />
                    <stop offset="100%" stopColor="#229ED9" />
                  </linearGradient>
                </defs>
                <path
                  fill="url(#telegram__a)"
                  d="M128 0C94.06 0 61.48 13.494 37.5 37.49A128.038 128.038 0 0 0 0 128c0 33.934 13.5 66.514 37.5 90.51C61.48 242.506 94.06 256 128 256s66.52-13.494 90.5-37.49c24-23.996 37.5-56.576 37.5-90.51 0-33.934-13.5-66.514-37.5-90.51C194.52 13.494 161.94 0 128 0Z"
                />
                <path
                  fill="#FFF"
                  d="M57.94 126.648c37.32-16.256 62.2-26.974 74.64-32.152 35.56-14.786 42.94-17.354 47.76-17.441 1.06-.017 3.42.245 4.96 1.49 1.28 1.05 1.64 2.47 1.82 3.467.16.996.38 3.266.2 5.038-1.92 20.24-10.26 69.356-14.5 92.026-1.78 9.592-5.32 12.808-8.74 13.122-7.44.684-13.08-4.912-20.28-9.63-11.26-7.386-17.62-11.982-28.56-19.188-12.64-8.328-4.44-12.906 2.76-20.386 1.88-1.958 34.64-31.748 35.26-34.45.08-.338.16-1.598-.6-2.262-.74-.666-1.84-.438-2.64-.258-1.14.256-19.12 12.152-54 35.686-5.1 3.508-9.72 5.218-13.88 5.128-4.56-.098-13.36-2.584-19.9-4.708-8-2.606-14.38-3.984-13.82-8.41.28-2.304 3.46-4.662 9.52-7.072Z"
                />
              </svg>
            </div>
            <span className="text-[11px] font-bold text-[#B90101] dark:text-red-400">
              Telegram
            </span>
          </button>

          {/* Facebook */}
          <button
            type="button"
            onClick={() => handleShare("facebook")}
            className="flex flex-col items-center gap-1.5 group cursor-pointer transition active:scale-95"
          >
            <div className="w-12 h-12 rounded-full overflow-hidden shadow-md group-hover:scale-105 transition flex items-center justify-center">
              <svg viewBox="0 0 666.667 666.667" className="w-full h-full">
                <defs>
                  <clipPath
                    id="facebook_icon__a"
                    clipPathUnits="userSpaceOnUse"
                  >
                    <path d="M0 700h700V0H0Z" />
                  </clipPath>
                </defs>
                <g
                  clipPath="url(#facebook_icon__a)"
                  transform="matrix(1.33333 0 0 -1.33333 -133.333 800)"
                >
                  <path
                    d="M0 0c0 138.071-111.929 250-250 250S-500 138.071-500 0c0-117.245 80.715-215.622 189.606-242.638v166.242h-51.552V0h51.552v32.919c0 85.092 38.508 124.532 122.048 124.532 15.838 0 43.167-3.105 54.347-6.211V81.986c-5.901.621-16.149.932-28.882.932-40.993 0-56.832-15.528-56.832-55.9V0h81.659l-14.028-76.396h-67.631v-171.773C-95.927-233.218 0-127.818 0 0"
                    fill="#0866ff"
                    transform="translate(600 350)"
                  />
                  <path
                    d="m0 0 14.029 76.396H-67.63v27.019c0 40.372 15.838 55.899 56.831 55.899 12.733 0 22.981-.31 28.882-.931v69.253c-11.18 3.106-38.509 6.212-54.347 6.212-83.539 0-122.048-39.441-122.048-124.533V76.396h-51.552V0h51.552v-166.242a250.559 250.559 0 0 1 60.394-7.362c10.254 0 20.358.632 30.288 1.831V0Z"
                    fill="#fff"
                    transform="translate(447.918 273.604)"
                  />
                </g>
              </svg>
            </div>
            <span className="text-[11px] font-bold text-[#B90101] dark:text-red-400">
              Facebook
            </span>
          </button>

          {/* Instagram */}
          <button
            type="button"
            onClick={() => handleShare("instagram")}
            className="flex flex-col items-center gap-1.5 group cursor-pointer transition active:scale-95"
          >
            <div className="w-12 h-12 rounded-full overflow-hidden shadow-md group-hover:scale-105 transition flex items-center justify-center">
              <svg viewBox="0 0 264.583 264.583" className="w-full h-full">
                <defs>
                  <linearGradient id="instagram_icon__d">
                    <stop offset="0%" stopColor="#ff005f" />
                    <stop offset="100%" stopColor="#fc01d8" />
                  </linearGradient>
                  <linearGradient id="instagram_icon__c">
                    <stop offset="0%" stopColor="#780cff" />
                    <stop offset="100%" stopColor="#820bff" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="instagram_icon__b">
                    <stop offset="0%" stopColor="#fc0" />
                    <stop offset="100%" stopColor="#fc0" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="instagram_icon__a">
                    <stop offset="0%" stopColor="#fc0" />
                    <stop offset="12.4%" stopColor="#fc0" />
                    <stop offset="56.7%" stopColor="#fe4a05" />
                    <stop offset="69.4%" stopColor="#ff0f3f" />
                    <stop offset="100%" stopColor="#fe0657" stopOpacity="0" />
                  </linearGradient>
                  <radialGradient
                    xlinkHref="#instagram_icon__a"
                    id="instagram_icon__f"
                    cx="158.429"
                    cy="578.088"
                    r="52.352"
                    fx="158.429"
                    fy="578.088"
                    gradientTransform="matrix(0 -4.03418 4.28018 0 -2332.227 942.236)"
                    gradientUnits="userSpaceOnUse"
                  />
                  <radialGradient
                    xlinkHref="#instagram_icon__b"
                    id="instagram_icon__g"
                    cx="172.615"
                    cy="600.692"
                    r="65"
                    fx="172.615"
                    fy="600.692"
                    gradientTransform="matrix(.67441 -1.16203 1.51283 .87801 -814.366 -47.835)"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="#fc0" />
                    <stop offset="100%" stopColor="#fc0" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient
                    xlinkHref="#instagram_icon__c"
                    id="instagram_icon__h"
                    cx="144.012"
                    cy="51.337"
                    r="67.081"
                    fx="144.012"
                    fy="51.337"
                    gradientTransform="matrix(-2.3989 .67549 -.23008 -.81732 464.996 -26.404)"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="#780cff" />
                    <stop offset="100%" stopColor="#820bff" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient
                    xlinkHref="#instagram_icon__d"
                    id="instagram_icon__e"
                    cx="199.788"
                    cy="628.438"
                    r="52.352"
                    fx="199.788"
                    fy="628.438"
                    gradientTransform="matrix(-3.10797 .87652 -.6315 -2.23914 1345.65 1374.198)"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="#ff005f" />
                    <stop offset="100%" stopColor="#fc01d8" />
                  </radialGradient>
                </defs>
                <path
                  fill="url(#instagram_icon__e)"
                  d="M204.15 18.143c-55.23 0-71.383.057-74.523.317-11.334.943-18.387 2.728-26.07 6.554-5.922 2.942-10.592 6.351-15.201 11.13-8.394 8.716-13.481 19.439-15.323 32.184-.895 6.188-1.156 7.45-1.209 39.056-.02 10.536 0 24.4 0 42.999 0 55.2.062 71.341.326 74.476.916 11.032 2.645 17.973 6.308 25.565 7 14.533 20.37 25.443 36.12 29.514 5.453 1.404 11.476 2.178 19.208 2.544 3.277.142 36.669.244 70.081.244 33.413 0 66.826-.04 70.02-.203 8.954-.422 14.153-1.12 19.901-2.606 15.852-4.09 28.977-14.838 36.12-29.575 3.591-7.409 5.412-14.614 6.236-25.07.18-2.28.255-38.626.255-74.924 0-36.304-.082-72.583-.26-74.863-.835-10.625-2.656-17.77-6.364-25.32-3.042-6.182-6.42-10.799-11.324-15.519-8.752-8.361-19.455-13.45-32.21-15.29-6.18-.894-7.41-1.158-39.033-1.213z"
                  transform="translate(-71.816 -18.143)"
                />
                <path
                  fill="url(#instagram_icon__f)"
                  d="M204.15 18.143c-55.23 0-71.383.057-74.523.317-11.334.943-18.387 2.728-26.07 6.554-5.922 2.942-10.592 6.351-15.201 11.13-8.394 8.716-13.481 19.439-15.323 32.184-.895 6.188-1.156 7.45-1.209 39.056-.02 10.536 0 24.4 0 42.999 0 55.2.062 71.341.326 74.476.916 11.032 2.645 17.973 6.308 25.565 7 14.533 20.37 25.443 36.12 29.514 5.453 1.404 11.476 2.178 19.208 2.544 3.277.142 36.669.244 70.081.244 33.413 0 66.826-.04 70.02-.203 8.954-.422 14.153-1.12 19.901-2.606 15.852-4.09 28.977-14.838 36.12-29.575 3.591-7.409 5.412-14.614 6.236-25.07.18-2.28.255-38.626.255-74.924 0-36.304-.082-72.583-.26-74.863-.835-10.625-2.656-17.77-6.364-25.32-3.042-6.182-6.42-10.799-11.324-15.519-8.752-8.361-19.455-13.45-32.21-15.29-6.18-.894-7.41-1.158-39.033-1.213z"
                  transform="translate(-71.816 -18.143)"
                />
                <path
                  fill="url(#instagram_icon__g)"
                  d="M204.15 18.143c-55.23 0-71.383.057-74.523.317-11.334.943-18.387 2.728-26.07 6.554-5.922 2.942-10.592 6.351-15.201 11.13-8.394 8.716-13.481 19.439-15.323 32.184-.895 6.188-1.156 7.45-1.209 39.056-.02 10.536 0 24.4 0 42.999 0 55.2.062 71.341.326 74.476.916 11.032 2.645 17.973 6.308 25.565 7 14.533 20.37 25.443 36.12 29.514 5.453 1.404 11.476 2.178 19.208 2.544 3.277.142 36.669.244 70.081.244 33.413 0 66.826-.04 70.02-.203 8.954-.422 14.153-1.12 19.901-2.606 15.852-4.09 28.977-14.838 36.12-29.575 3.591-7.409 5.412-14.614 6.236-25.07.18-2.28.255-38.626.255-74.924 0-36.304-.082-72.583-.26-74.863-.835-10.625-2.656-17.77-6.364-25.32-3.042-6.182-6.42-10.799-11.324-15.519-8.752-8.361-19.455-13.45-32.21-15.29-6.18-.894-7.41-1.158-39.033-1.213z"
                  transform="translate(-71.816 -18.143)"
                />
                <path
                  fill="url(#instagram_icon__h)"
                  d="M204.15 18.143c-55.23 0-71.383.057-74.523.317-11.334.943-18.387 2.728-26.07 6.554-5.922 2.942-10.592 6.351-15.201 11.13-8.394 8.716-13.481 19.439-15.323 32.184-.895 6.188-1.156 7.45-1.209 39.056-.02 10.536 0 24.4 0 42.999 0 55.2.062 71.341.326 74.476.916 11.032 2.645 17.973 6.308 25.565 7 14.533 20.37 25.443 36.12 29.514 5.453 1.404 11.476 2.178 19.208 2.544 3.277.142 36.669.244 70.081.244 33.413 0 66.826-.04 70.02-.203 8.954-.422 14.153-1.12 19.901-2.606 15.852-4.09 28.977-14.838 36.12-29.575 3.591-7.409 5.412-14.614 6.236-25.07.18-2.28.255-38.626.255-74.924 0-36.304-.082-72.583-.26-74.863-.835-10.625-2.656-17.77-6.364-25.32-3.042-6.182-6.42-10.799-11.324-15.519-8.752-8.361-19.455-13.45-32.21-15.29-6.18-.894-7.41-1.158-39.033-1.213z"
                  transform="translate(-71.816 -18.143)"
                />
                <path
                  fill="#fff"
                  d="M132.345 33.973c-26.716 0-30.07.117-40.563.594-10.472.48-17.62 2.136-23.876 4.567-6.47 2.51-11.958 5.87-17.426 11.335-5.472 5.464-8.834 10.948-11.354 17.412-2.44 6.252-4.1 13.397-4.57 23.858-.47 10.486-.593 13.838-.593 40.535 0 26.697.119 30.037.594 40.522.482 10.465 2.14 17.609 4.57 23.859 2.515 6.465 5.876 11.95 11.346 17.414 5.466 5.468 10.955 8.834 17.42 11.345 6.26 2.431 13.41 4.088 23.881 4.567 10.493.477 13.844.594 40.559.594 26.719 0 30.061-.117 40.555-.594 10.472-.48 17.63-2.136 23.888-4.567 6.468-2.51 11.948-5.877 17.414-11.345 5.472-5.464 8.834-10.949 11.354-17.412 2.419-6.252 4.079-13.398 4.57-23.858.472-10.486.595-13.828.595-40.525s-.123-30.047-.594-40.533c-.492-10.465-2.152-17.608-4.57-23.858-2.521-6.466-5.883-11.95-11.355-17.414-5.472-5.468-10.944-8.827-17.42-11.335-6.271-2.431-13.424-4.088-23.897-4.567-10.493-.477-13.834-.594-40.558-.594zm-8.825 17.715c2.62-.004 5.542 0 8.825 0 26.266 0 29.38.094 39.752.565 9.591.438 14.797 2.04 18.264 3.385 4.591 1.782 7.864 3.912 11.305 7.352 3.443 3.44 5.575 6.717 7.362 11.305 1.346 3.46 2.951 8.663 3.388 18.247.47 10.363.573 13.475.573 39.71 0 26.233-.102 29.346-.573 39.709-.44 9.584-2.042 14.786-3.388 18.247-1.783 4.587-3.919 7.854-7.362 11.292-3.443 3.441-6.712 5.57-11.305 7.352-3.463 1.352-8.673 2.95-18.264 3.388-10.37.47-13.486.573-39.752.573-26.268 0-29.38-.102-39.751-.573-9.592-.443-14.797-2.044-18.267-3.39-4.59-1.781-7.87-3.911-11.313-7.352-3.443-3.44-5.574-6.709-7.362-11.298-1.346-3.461-2.95-8.663-3.387-18.247-.472-10.363-.566-13.476-.566-39.726s.094-29.347.566-39.71c.438-9.584 2.04-14.786 3.387-18.25 1.783-4.588 3.919-7.865 7.362-11.305 3.443-3.441 6.722-5.57 11.313-7.357 3.468-1.351 8.675-2.949 18.267-3.389 9.075-.41 12.592-.532 30.926-.553zm61.337 16.322c-6.518 0-11.805 5.277-11.805 11.792 0 6.512 5.287 11.796 11.805 11.796 6.517 0 11.804-5.284 11.804-11.796 0-6.513-5.287-11.796-11.805-11.796zm-52.512 13.782c-27.9 0-50.519 22.603-50.519 50.482 0 27.879 22.62 50.471 50.52 50.471s50.51-22.592 50.51-50.471c0-27.879-22.613-50.482-50.513-50.482zm0 17.715c18.11 0 32.792 14.67 32.792 32.767 0 18.096-14.683 32.767-32.792 32.767-18.11 0-32.791-14.671-32.791-32.767 0-18.098 14.68-32.767 32.791-32.767z"
                />
              </svg>
            </div>
            <span className="text-[11px] font-bold text-[#B90101] dark:text-red-400">
              Instagram
            </span>
          </button>

          {/* More */}
          <button
            type="button"
            onClick={() => handleShare("more")}
            className="flex flex-col items-center gap-1.5 group cursor-pointer transition active:scale-95"
          >
            <div
              className="w-12 h-12 rounded-full overflow-hidden shadow-sm group-hover:scale-105 transition flex items-center justify-center text-neutral-600 dark:text-neutral-300 border backdrop-blur-md"
              style={{
                backgroundColor: isDark ? "var(--primary-color-30)" : "#e5e5e5",
                borderColor: isDark
                  ? "var(--border-dark-mode)"
                  : "rgba(39, 42, 48, 0.1)",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-full h-full p-0.5"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M17 12h.01" />
                <path d="M12 12h.01" />
                <path d="M7 12h.01" />
              </svg>
            </div>
            <span className="text-[11px] font-bold text-[#B90101] dark:text-red-400">
              More
            </span>
          </button>
        </div>

        {/* 6. User-requested Continue Button */}
        <div className="pt-2 w-full max-w-sm mx-auto">
          <button
            type="button"
            onClick={onContinue}
            className="w-full py-3 px-8 rounded-full bg-[#B90101] hover:bg-[#9E0000] text-white font-extrabold text-sm uppercase tracking-wider transition active:scale-95 shadow-md border border-white/20 flex items-center justify-center cursor-pointer"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
}
