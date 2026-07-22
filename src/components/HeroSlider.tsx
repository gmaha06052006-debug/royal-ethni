import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface HeroSliderProps {
  onExplore: (category?: string) => void;
}

export default function HeroSlider({ onExplore }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "The Throne of Bridal Majesty",
      subtitle: "THE BESPOKE KAALAM COLLECTIONS",
      description: "Exquisite hand-woven raw silk lehengas and double-warped zari sarees detailed by Lucknow and Jaipur's finest master artisans.",
      image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200",
      cta: "Explore Bridal",
      category: "Women"
    },
    {
      title: "Regal Grooms of Ancient Heritage",
      subtitle: "THE MAHARAJA SHERWANI EDITS",
      description: "Structured Bandhgala necklines stitched with genuine silk-tilla wire embroidery and layered with gold-micron Banarasi silk wrapped stoles.",
      image: "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?q=80&w=1200",
      cta: "View Sherwanis",
      category: "Men"
    },
    {
      title: "Ethereal Harmony in Pastel Threads",
      subtitle: "CHIKANKARI AND GEORGETTE ESSENTIALS",
      description: "Understated luxury featuring pure georgette sarees and fluid chikankari kurtas for magical pre-wedding rituals.",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200",
      cta: "Browse Festive",
      category: "Women"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div id="hero-slider" className="relative h-[550px] sm:h-[650px] w-full overflow-hidden bg-amber-950">
      {/* Slides mapping */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={slide.image}
              alt={slide.title}
              className="h-full w-full object-cover object-center scaling-slow"
              referrerPolicy="no-referrer"
            />
            {/* Dark & Golden gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-950/85 via-amber-950/40 to-transparent"></div>
          </div>

          {/* Slide Content */}
          <div className="absolute inset-x-0 bottom-0 top-0 mx-auto flex max-w-7xl items-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl text-amber-50">
              <span className="text-[10px] tracking-[0.4em] text-amber-400 font-sans font-bold uppercase block mb-3 animate-fade-down">
                {slide.subtitle}
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-wide leading-tight mb-4 drop-shadow">
                {slide.title}
              </h2>
              <p className="text-sm text-amber-100/90 font-sans leading-relaxed mb-8 max-w-lg">
                {slide.description}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => onExplore(slide.category)}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-serif text-xs uppercase tracking-widest py-3 px-6 rounded-sm shadow-lg hover:shadow-amber-900/40 active:scale-95 transition-all"
                >
                  {slide.cta}
                </button>
                <button
                  onClick={() => onExplore(undefined)}
                  className="bg-transparent border border-white hover:bg-white/10 text-white font-serif text-xs uppercase tracking-widest py-3 px-6 rounded-sm active:scale-95 transition-all"
                >
                  View All Collections
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Manual Slide Controls */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-4 bottom-8 sm:top-1/2 sm:-translate-y-1/2 z-20 p-2 border border-white/20 rounded-full hover:bg-white/10 text-white active:scale-95 transition-all"
      >
        <ArrowLeft size={16} />
      </button>
      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute left-16 bottom-8 sm:left-auto sm:right-4 sm:top-1/2 sm:-translate-y-1/2 z-20 p-2 border border-white/20 rounded-full hover:bg-white/10 text-white active:scale-95 transition-all"
      >
        <ArrowRight size={16} />
      </button>

      {/* Sliders active indicator */}
      <div className="absolute right-4 bottom-8 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentSlide ? "bg-amber-500 w-6" : "bg-white/30"
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
}
