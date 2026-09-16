import { Link, ScrollRestoration } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectTheme } from "../redux/slices/uiSlice";
import { Home } from "lucide-react";

// Cinema SVG Assets (light on left, lightRight on right, people in center)
import peopleSvg from "../assets/others/NotFound/people.svg";
import lightSvg from "../assets/others/NotFound/light.svg";
import lightRightSvg from "../assets/others/NotFound/lightRight.svg";

export default function NotFoundPage() {
  const theme = useSelector(selectTheme);
  const isDark = theme === "dark";

  return (
    <div
      className={`h-screen max-h-screen w-full flex flex-col items-center justify-center overflow-hidden py-4 sm:py-6 px-4 sm:px-6 lg:px-8 font-sans select-none relative transition-colors duration-300 ${
        isDark ? "text-white" : "text-neutral-900"
      }`}
      style={{
        backgroundColor: isDark ? "transparent" : "#F6F7F9",
        background: isDark ? "var(--bg-dark-mode)" : "#F6F7F9",
        backgroundAttachment: isDark ? "fixed" : "scroll",
        height: "100vh",
        maxHeight: "100vh",
      }}
    >
      {/* ── 1. CEILING CINEMA SPOTLIGHTS ── */}
      {/* Top-Left Spotlight: Using light.svg */}
      <div
        className="absolute -top-4 -left-4 sm:-top-2 sm:left-2 md:left-4 w-28 sm:w-40 md:w-52 lg:w-60 pointer-events-none select-none z-10 opacity-90 animate-cinema-spotlight"
        style={{ transformOrigin: "top left" }}
      >
        <img
          src={lightSvg}
          alt="Cinema Spotlight Left"
          className="w-full h-auto"
          draggable="false"
        />
      </div>

      {/* Top-Right Spotlight: Using lightRight.svg (opposite side) */}
      <div
        className="absolute -top-4 -right-4 sm:-top-2 sm:right-2 md:right-4 w-28 sm:w-40 md:w-52 lg:w-60 pointer-events-none select-none z-10 opacity-90 animate-cinema-spotlight"
        style={{ transformOrigin: "top right" }}
      >
        <img
          src={lightRightSvg}
          alt="Cinema Spotlight Right"
          className="w-full h-auto"
          draggable="false"
        />
      </div>

      {/* ── 2. CENTER CINEMA STAGE (Compact to fit in one frame without scrolling) ── */}
      <div className="relative z-20 flex flex-col items-center justify-center w-full max-w-lg text-center px-2 my-auto">
        {/* 404 with Cinema Vibe (Film Reel in '0' and Film Sprocket Accents) */}
        <div className="relative flex items-center justify-center select-none mb-1.5 sm:mb-2">
          {/* Film Strip Sprocket Left */}
          <div className="hidden sm:flex flex-col gap-1 mr-2.5 opacity-30">
            <span className="w-2 h-2.5 rounded-xs bg-[#B90101]" />
            <span className="w-2 h-2.5 rounded-xs bg-[#B90101]" />
            <span className="w-2 h-2.5 rounded-xs bg-[#B90101]" />
          </div>

          {/* First '4' */}
          <span className="text-6xl sm:text-7xl md:text-8xl lg:text-[100px] font-black text-[#B90101] tracking-tight leading-none">
            4
          </span>

          {/* Center '0' with Cinema Film Reel Motif */}
          <div className="relative flex items-center justify-center mx-1 sm:mx-1.5">
            <span className="text-6xl sm:text-7xl md:text-8xl lg:text-[100px] font-black text-[#B90101] tracking-tight leading-none">
              0
            </span>
            {/* Spinning Film Reel Spokes inside the '0' */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="w-6 h-6 sm:w-8 sm:h-8 md:w-11 md:h-11 rounded-full border-2 sm:border-3 border-[#B90101]/50 flex items-center justify-center animate-spin"
                style={{ animationDuration: "14s" }}
              >
                {/* Film Reel Center Hub & Holes */}
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#B90101]" />
                <div className="absolute w-full h-0.5 bg-[#B90101]/40" />
                <div className="absolute w-0.5 h-full bg-[#B90101]/40" />
              </div>
            </div>
          </div>

          {/* Last '4' */}
          <span className="text-6xl sm:text-7xl md:text-8xl lg:text-[100px] font-black text-[#B90101] tracking-tight leading-none">
            4
          </span>

          {/* Film Strip Sprocket Right */}
          <div className="hidden sm:flex flex-col gap-1 ml-2.5 opacity-30">
            <span className="w-2 h-2.5 rounded-xs bg-[#B90101]" />
            <span className="w-2 h-2.5 rounded-xs bg-[#B90101]" />
            <span className="w-2 h-2.5 rounded-xs bg-[#B90101]" />
          </div>
        </div>

        {/* Cinema-themed "Lost" Words */}
        <div className="mb-2 sm:mb-3 max-w-sm">
          <h2
            className={`text-lg sm:text-xl md:text-2xl font-bold mb-0.5 ${
              isDark ? "text-white" : "text-neutral-900"
            }`}
          >
            Lost in the Ciniverse?
          </h2>
          <p
            className={`text-xs sm:text-sm leading-relaxed ${
              isDark ? "text-neutral-300" : "text-neutral-600"
            }`}
          >
            You&apos;ve wandered into the wrong theater. This scene was cut from
            the reel!
          </p>
        </div>

        {/* Audience Container with 3 Floating Question Marks (Boy, Man, Girl) */}
        <div className="relative w-full max-w-[240px] sm:max-w-[300px] md:max-w-[360px] lg:max-w-[400px] pt-4 sm:pt-5 animate-cinema-audience">
          {/* Question mark 1: Floating over the BOY's head (left) */}
          <div className="absolute left-[29%] -top-1 sm:-top-2 -translate-x-1/2 animate-cinema-float z-30 pointer-events-none">
            <span className="inline-block text-xl sm:text-2xl md:text-3xl font-black text-[#B90101] select-none transform -rotate-12 drop-shadow-sm">
              ?
            </span>
          </div>

          {/* Question mark 2: Floating over the MAN's head (center) */}
          <div className="absolute left-[49%] -top-2.5 sm:-top-4 -translate-x-1/2 animate-cinema-float-delayed z-30 pointer-events-none">
            <span className="inline-block text-2xl sm:text-3xl md:text-4xl font-black text-[#B90101] select-none transform rotate-6 drop-shadow-sm">
              ?
            </span>
          </div>

          {/* Question mark 3: Floating over the GIRL's head (right) */}
          <div className="absolute left-[71%] -top-1 sm:-top-2 -translate-x-1/2 animate-cinema-float-slow z-30 pointer-events-none">
            <span className="inline-block text-xl sm:text-2xl md:text-3xl font-black text-[#B90101] select-none transform rotate-12 drop-shadow-sm">
              ?
            </span>
          </div>

          {/* People SVG */}
          <img
            src={peopleSvg}
            alt="Confused Cinema Audience"
            className="w-full h-auto max-h-[28vh] object-contain pointer-events-none select-none drop-shadow-md"
            draggable="false"
          />
        </div>

        {/* ── 3. BACK TO HOME BUTTON (Fully visible in the frame) ── */}
        <Link
          to="/"
          className="mt-3 sm:mt-4 md:mt-5 inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-[#B90101] hover:bg-[#8B0101] text-white font-semibold text-xs sm:text-sm md:text-base shadow-lg shadow-red-900/25 hover:shadow-red-900/40 hover:scale-105 active:scale-95 transition-all z-30"
        >
          <Home className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          <span>Back to Home</span>
        </Link>
      </div>
      <ScrollRestoration />
    </div>
  );
}
