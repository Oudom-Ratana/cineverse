
import { Link } from "react-router-dom";
import { ArrowRight } from 'lucide-react';
import cinemaImage from '../../assets/others/imageAboutUs.png';

export default function AboutHero() {
  return (
    <section className="relative w-full py-8 md:py-12 overflow-hidden font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Mission & Explore CTA */}
        <div className="lg:col-span-7 space-y-6">
          <h1 className="text-h1 text-neutral-900 dark:text-white font-bold tracking-tight leading-tight">
            About{' '}
            <span className="text-primary-red drop-shadow-sm">
              Ciniverse
            </span>
          </h1>

          <h2 className="text-h2 text-neutral-900 dark:text-white font-bold leading-snug">
            Bringing movie lovers closer to the world of cinema.
          </h2>

          <p className="text-card-description text-[#828282] dark:text-[rgba(255,255,255,0.7)] leading-relaxed max-w-xl">
            DigiFilm is a digital cinema platform designed to make discovering movies, exploring showtimes, and connecting with the cinema experience easier and more enjoyable.
          </p>

          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-primary-red text-white font-bold text-btn hover:bg-primary-dark active:scale-95 transition-all "
            >
              <span>Explore movies</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Right Column: 3D Cinema Composition */}
        <div className="lg:col-span-5 flex items-center justify-center relative">
          <div className="absolute w-72 h-72 rounded-full bg-primary-red/20 blur-3xl -z-10 pointer-events-none" />

          <div className="relative w-full max-w-md aspect-square rounded-3xl p-4 flex flex-col items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={cinemaImage}
                alt="Cinema 3D Popcorn & Experience"
                className="w-full h-full object-contain filter drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
