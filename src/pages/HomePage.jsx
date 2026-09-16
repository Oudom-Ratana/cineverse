import HomeHero from "../components/home/HomeHero";
import TrendingSection from "../components/home/TrendingSection";
import FeaturedSeriesSection from "../components/home/FeaturedSeriesSection";
import ComingSoonSection from "../components/home/ComingSoonSection";

export default function HomePage() {
  return (
    <div className="w-full font-sans">
      {/* 1. Full-Width Trending Hero Slider */}
      <HomeHero />

      {/* 2. Grid Sections (Constrained to max-w-7xl) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 mt-12 sm:mt-16 pb-20">
        {/* 2. TRENDING NOW Section (8 Cards Grid + Button) */}
        <TrendingSection />

        {/* 3. FEATURED SERIES Section (8 Cards Grid) */}
        <FeaturedSeriesSection />

        {/* 4. COMING SOON Section (3 Landscape Banners) */}
        <ComingSoonSection />
      </div>
    </div>
  );
}
